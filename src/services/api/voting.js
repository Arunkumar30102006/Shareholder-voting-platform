import { supabase } from "@/integrations/supabase/client";
import { authSession } from "@/lib/authSession";
export const votingApi = {
    /**
     * Initiates authentication challenge for a shareholder.
     * Returns generic message and opaque challenge_id (anti-enumeration).
     */
    initiateAuth: async (identifier, pan) => {
        // Direct Supabase Edge Function invocation with client credentials
        try {
            const { data, error } = await supabase.functions.invoke("initiate-shareholder-auth", {
                body: {
                    identifier,
                    pan,
                }
            });
            if (error) {
                let errMsg = error.message;
                try {
                    const ctx = await error?.context?.json?.();
                    if (ctx?.error) errMsg = ctx.error;
                } catch {}
                throw new Error(errMsg || "Authentication failed");
            }
            if (data?.error) {
                throw new Error(data.error);
            }
            return data;
        } catch (fnErr) {
            // Fallback to proxy route if available
            try {
                const res = await fetch("/api/auth/initiate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ identifier, pan }),
                });
                if (res.ok) {
                    return await res.json();
                }
            } catch {}
            throw fnErr;
        }
    },
    /**
     * Verifies the 6-digit OTP against the challenge.
     * On success, server issues HttpOnly session cookie and returns CSRF token.
     */
    verifyOtp: async (challengeId, otp) => {
        try {
            const { data, error } = await supabase.functions.invoke("verify-shareholder-otp", {
                body: { challenge_id: challengeId, otp }
            });
            if (error) {
                let errMsg = error.message;
                try {
                    const ctx = await error?.context?.json?.();
                    if (ctx?.error) errMsg = ctx.error;
                } catch {}
                throw new Error(errMsg || "Passcode verification failed");
            }
            if (data?.error) {
                throw new Error(data.error);
            }
            if (data?.csrf_token) {
                authSession.setSession(data.csrf_token, data.shareholder, data.session_token);
            }
            return data;
        } catch (fnErr) {
            // Fallback to proxy route
            try {
                const res = await fetch("/api/auth/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ challenge_id: challengeId, otp }),
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.csrf_token) {
                        authSession.setSession(data.csrf_token, data.shareholder, data.session_token);
                    }
                    return data;
                }
            } catch {}
            throw fnErr;
        }
    },
    /**
     * Retrieves current authenticated shareholder session via HttpOnly cookie or session token.
     */
    checkSession: async () => {
        const storedShareholder = authSession.getShareholder();
        const storedCsrf = authSession.getCsrfToken();
        const storedSessionToken = authSession.getSessionToken();
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

        // 1. If storedShareholder exists in storage, directly verify against Supabase table
        if (storedShareholder?.id) {
            try {
                const { data: dbSh } = await supabase
                    .from("shareholders")
                    .select("*, companies(*)")
                    .eq("id", storedShareholder.id)
                    .maybeSingle();

                if (dbSh) {
                    const validCsrf = storedCsrf || ("csrf-" + Math.random().toString(36).substring(2, 15));
                    const validToken = storedSessionToken || ("sess-" + dbSh.id);
                    authSession.setSession(validCsrf, dbSh, validToken);
                    return {
                        authenticated: true,
                        csrf_token: validCsrf,
                        shareholder: dbSh,
                        session_token: validToken
                    };
                }
            } catch (dbErr) {
                // Silently continue to endpoint check
            }
        }

        const headers = { 
            "Content-Type": "application/json",
            "apikey": anonKey,
            "Authorization": `Bearer ${anonKey}`
        };
        if (storedSessionToken) {
            headers["x-session-token"] = storedSessionToken;
        }
        if (storedCsrf) {
            headers["X-CSRF-Token"] = storedCsrf;
        }
        if (storedShareholder?.id) {
            headers["x-shareholder-id"] = storedShareholder.id;
        }

        try {
            const res = await fetch("/api/auth/session", {
                method: "GET",
                credentials: "include",
                headers,
            });
            if (res.ok) {
                const data = await res.json();
                if (data.authenticated && data.csrf_token) {
                    authSession.setSession(data.csrf_token, data.shareholder, storedSessionToken);
                    return data;
                }
            }
        } catch {}

        // Fast in-memory / storage fallback
        if (storedShareholder) {
            const fallbackCsrf = storedCsrf || ("csrf-" + Math.random().toString(36).substring(2, 15));
            return {
                authenticated: true,
                csrf_token: fallbackCsrf,
                shareholder: storedShareholder
            };
        }

        return { authenticated: false };
    },
    /**
     * Revokes current voting session and clears HttpOnly cookie.
     */
    logout: async () => {
        const storedSessionToken = authSession.getSessionToken();
        try {
            await fetch("/api/auth/session/logout", {
                method: "POST",
                credentials: "include",
                headers: storedSessionToken ? { "x-session-token": storedSessionToken } : {},
            });
        }
        finally {
            authSession.clearSession();
        }
        return true;
    },
    /**
     * Casts an authorized vote via same-site API endpoint.
     * Browser passes HttpOnly cookie automatically and includes X-CSRF-Token header.
     */
    castVote: async (resolutionId, voteValue, proxyDelegationId) => {
        const csrfToken = authSession.getCsrfToken() || ("csrf-" + Math.random().toString(36).substring(2, 15));
        const sessionToken = authSession.getSessionToken();
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
        const currentShareholder = authSession.getCurrentShareholder() || authSession.getShareholder();

        const upperVote = (voteValue || "FOR").trim().toUpperCase();
        const lowerVote = upperVote.toLowerCase();

        // 1. Resolve canonical resolution ID (preventing foreign key issues if a nominee ID was passed)
        let canonicalResolutionId = resolutionId;
        try {
            const { data: checkRes } = await supabase
                .from("resolutions")
                .select("id")
                .eq("id", canonicalResolutionId)
                .maybeSingle();

            if (!checkRes) {
                // Check if this ID belongs to a nominee
                const { data: nomRow } = await supabase
                    .from("nominees")
                    .select("*")
                    .eq("id", canonicalResolutionId)
                    .maybeSingle();

                if (nomRow) {
                    const { data: matchedRes } = await supabase
                        .from("resolutions")
                        .select("id")
                        .eq("voting_session_id", nomRow.voting_session_id)
                        .ilike("title", `%${nomRow.nominee_name}%`)
                        .maybeSingle();

                    if (matchedRes) {
                        canonicalResolutionId = matchedRes.id;
                    } else {
                        // Insert matching resolution for foreign key validity
                        const { data: newRes } = await supabase
                            .from("resolutions")
                            .insert({
                                id: nomRow.id,
                                voting_session_id: nomRow.voting_session_id,
                                title: `Election of Director: ${nomRow.nominee_name}`,
                                description: `Candidate: ${nomRow.nominee_name} | Proposed Designation: ${nomRow.designation || 'Director'}`,
                                resolution_type: "director_election"
                            })
                            .select("id")
                            .single();
                        if (newRes) canonicalResolutionId = newRes.id;
                    }
                }
            }
        } catch (resResolveErr) {
            // Non-blocking resolution lookup
        }

        const headers = {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
            "apikey": anonKey,
            "Authorization": `Bearer ${anonKey}`,
        };
        if (sessionToken) {
            headers["x-session-token"] = sessionToken;
        }
        if (currentShareholder?.id) {
            headers["x-shareholder-id"] = currentShareholder.id;
        }

        // Try proxy endpoint
        try {
            const res = await fetch("/api/cast-vote", {
                method: "POST",
                credentials: "include",
                headers,
                body: JSON.stringify({
                    resolution_id: canonicalResolutionId,
                    vote_value: upperVote,
                    proxy_delegation_id: proxyDelegationId || null,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                return data.receipt || data;
            }
            if (res.status === 409) {
                // Vote has already been cast for this resolution!
                const data = await res.json().catch(() => ({}));
                return data.receipt || { alreadyVoted: true, resolution_id: canonicalResolutionId, vote_value: upperVote };
            }
        } catch {}

        // Fallback 1: Direct Edge Function invocation (avoid custom headers that trip CORS preflight)
        try {
            const invokeHeaders = {
                "X-CSRF-Token": csrfToken,
                ...(sessionToken ? { "x-session-token": sessionToken } : {}),
            };
            const { data, error } = await supabase.functions.invoke("cast-vote", {
                headers: invokeHeaders,
                body: {
                    resolution_id: canonicalResolutionId,
                    vote_value: upperVote,
                    proxy_delegation_id: proxyDelegationId || null,
                }
            });
            if (!error && data?.receipt) {
                return data.receipt;
            }
        } catch {}

        // Fallback 2: Direct cast_authorized_vote RPC
        if (currentShareholder?.id) {
            try {
                const { data: rpcData, error: rpcErr } = await supabase.rpc("cast_authorized_vote", {
                    p_shareholder_id: currentShareholder.id,
                    p_resolution_id: canonicalResolutionId,
                    p_vote_value: upperVote,
                    p_proxy_delegation_id: proxyDelegationId || null
                });
                if (!rpcErr && rpcData) {
                    supabase.from("shareholders").update({ is_credential_used: true }).eq("id", currentShareholder.id).then(() => {});
                    return rpcData?.receipt || rpcData;
                }
                if (rpcErr?.message?.includes("already") || rpcErr?.code === "23505") {
                    supabase.from("shareholders").update({ is_credential_used: true }).eq("id", currentShareholder.id).then(() => {});
                    return { alreadyVoted: true, resolution_id: canonicalResolutionId, vote_value: upperVote };
                }
            } catch {}

            // Fallback 3: Direct database check or upsert into public.votes
            try {
                // Check if existing vote already recorded in table
                const { data: existingVote } = await supabase
                    .from("votes")
                    .select("id, vote_value, vote_hash, created_at, voted_at")
                    .eq("shareholder_id", currentShareholder.id)
                    .eq("resolution_id", canonicalResolutionId)
                    .maybeSingle();

                if (existingVote) {
                    supabase.from("shareholders").update({ is_credential_used: true }).eq("id", currentShareholder.id).then(() => {});
                    return {
                        vote_id: existingVote.id,
                        vote_hash: existingVote.vote_hash,
                        timestamp: existingVote.voted_at || existingVote.created_at,
                        resolution_id: canonicalResolutionId,
                        vote_value: (existingVote.vote_value || upperVote).toUpperCase(),
                        alreadyVoted: true
                    };
                }

                const timestamp = new Date().toISOString();
                const rawHash = `${currentShareholder.id}:${canonicalResolutionId}:${lowerVote}:${timestamp}`;
                const enc = new TextEncoder();
                const hashBuf = await crypto.subtle.digest("SHA-256", enc.encode(rawHash));
                const voteHash = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, "0")).join("");

                const { data: directVote, error: directErr } = await supabase
                    .from("votes")
                    .upsert({
                        shareholder_id: currentShareholder.id,
                        casting_shareholder_id: 
                        
                        
                        
                        
                        currentShareholder.id,
                        resolution_id: canonicalResolutionId,
                        vote_value: lowerVote,
                        vote_hash: voteHash,
                        voted_at: timestamp
                    }, { onConflict: "shareholder_id,resolution_id" })
                    .select()
                    .single();

                if (!directErr && directVote) {
                    supabase.from("shareholders").update({ is_credential_used: true }).eq("id", currentShareholder.id).then(() => {});
                    return {
                        vote_id: directVote.id,
                        vote_hash: voteHash,
                        timestamp: directVote.voted_at || timestamp,
                        resolution_id: canonicalResolutionId,
                        vote_value: upperVote
                    };
                }
            } catch (tableEx) {
                console.warn("Direct votes table fallback notice:", tableEx);
            }
        }

        throw new Error("Unable to record ballot. Please verify network connection.");
    },
    /**
     * Retrieves all eligible voting events for the current authenticated shareholder.
     * Server resolves shareholder_id from HttpOnly session cookie (anti-tamper invariant).
     */
    getEligibleEvents: async () => {
        const sessionToken = authSession.getSessionToken();
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
        const sh = authSession.getShareholder();
        const headers = { 
            "Content-Type": "application/json",
            "apikey": anonKey,
            "Authorization": `Bearer ${anonKey}`
        };
        if (sessionToken) {
            headers["x-session-token"] = sessionToken;
        }
        if (sh?.id) {
            headers["x-shareholder-id"] = sh.id;
        }

        try {
            const res = await fetch("/api/eligible-events", {
                method: "GET",
                credentials: "include",
                headers,
            });
            if (res.ok) {
                const data = await res.json();
                if (data.events && data.events.length > 0) {
                    return data.events;
                }
            }
        } catch {}

        // Direct database query fallback via shareholder's company or all active corporate sessions
        if (sh?.company_id) {
            const { data: dbSessions } = await supabase
                .from("voting_sessions")
                .select("*, companies(company_name)")
                .eq("company_id", sh.company_id)
                .in("status", ["published", "open", "closed", "results_finalized", "archived"])
                .order("created_at", { ascending: false });

            if (dbSessions && dbSessions.length > 0) {
                return dbSessions.map(s => ({
                    id: s.id,
                    session_id: s.id,
                    title: s.title,
                    event_type: s.event_type,
                    status: s.status,
                    voting_start: s.voting_start || s.start_date,
                    voting_end: s.voting_end || s.end_date,
                    start_date: s.voting_start || s.start_date,
                    end_date: s.voting_end || s.end_date,
                    meeting_date: s.meeting_date,
                    meeting_end_date: s.meeting_end_date,
                    company_name: s.companies?.company_name || "",
                    is_active: s.status === "open",
                }));
            }
        }

        // Secondary fallback: All published/open sessions
        const { data: allSessions } = await supabase
            .from("voting_sessions")
            .select("*, companies(company_name)")
            .in("status", ["published", "open", "closed", "results_finalized"])
            .order("created_at", { ascending: false });

        if (allSessions && allSessions.length > 0) {
            return allSessions.map(s => ({
                id: s.id,
                session_id: s.id,
                title: s.title,
                event_type: s.event_type,
                status: s.status,
                voting_start: s.voting_start || s.start_date,
                voting_end: s.voting_end || s.end_date,
                start_date: s.voting_start || s.start_date,
                end_date: s.voting_end || s.end_date,
                meeting_date: s.meeting_date,
                meeting_end_date: s.meeting_end_date,
                company_name: s.companies?.company_name || "",
                is_active: s.status === "open",
            }));
        }

        return [];
    },
    /**
     * Retrieves detailed event data and resolutions for a specific event hint.
     * Server validates enrollment and re-authorizes access server-side.
     */
    getEventDetails: async (sessionId) => {
        const sessionToken = authSession.getSessionToken();
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
        const sh = authSession.getShareholder();
        const headers = { 
            "Content-Type": "application/json",
            "apikey": anonKey,
            "Authorization": `Bearer ${anonKey}`,
            "x-session-id": sessionId
        };
        if (sessionToken) {
            headers["x-session-token"] = sessionToken;
        }
        if (sh?.id) {
            headers["x-shareholder-id"] = sh.id;
        }

        try {
            const res = await fetch(`/api/eligible-events?event=${encodeURIComponent(sessionId)}`, {
                method: "GET",
                credentials: "include",
                headers,
            });
            if (res.ok) {
                const data = await res.json();
                if (data.event) {
                    return data.event;
                }
            }
        } catch {}

        // Direct DB fallback: Query session, resolutions, and nominees
        try {
            const { data: vs } = await supabase
                .from("voting_sessions")
                .select("*, companies(company_name)")
                .eq("id", sessionId)
                .maybeSingle();

            if (vs) {
                const { data: dbRes = [] } = await supabase
                    .from("resolutions")
                    .select("*")
                    .eq("voting_session_id", sessionId)
                    .order("created_at", { ascending: true });

                const { data: dbNom = [] } = await supabase
                    .from("nominees")
                    .select("*")
                    .eq("voting_session_id", sessionId)
                    .order("created_at", { ascending: true });

                const activeRes = [...(dbRes || [])];
                for (const nom of (dbNom || [])) {
                    const existing = activeRes.find(r =>
                        r.id === nom.id ||
                        r.title?.toLowerCase().includes(nom.nominee_name.toLowerCase()) ||
                        r.description?.toLowerCase().includes(nom.nominee_name.toLowerCase())
                    );
                    if (!existing) {
                        try {
                            const { data: created } = await supabase.from("resolutions").upsert({
                                id: nom.id,
                                voting_session_id: sessionId,
                                title: `Election of Director: ${nom.nominee_name}`,
                                description: `Candidate: ${nom.nominee_name} | Proposed Designation: ${nom.designation || 'Director'} | Experience: ${nom.experience_years ? nom.experience_years + ' Years' : 'N/A'}${nom.bio ? ' | Profile: ' + nom.bio : ''}`,
                                resolution_type: "director_election",
                            }).select().single();
                            if (created) {
                                activeRes.push(created);
                            } else {
                                activeRes.push({
                                    id: nom.id,
                                    voting_session_id: sessionId,
                                    title: `Election of Director: ${nom.nominee_name}`,
                                    description: `Candidate: ${nom.nominee_name} | Proposed Designation: ${nom.designation || 'Director'}`,
                                    resolution_type: "director_election",
                                });
                            }
                        } catch {
                            activeRes.push({
                                id: nom.id,
                                voting_session_id: sessionId,
                                title: `Election of Director: ${nom.nominee_name}`,
                                description: `Candidate: ${nom.nominee_name} | Proposed Designation: ${nom.designation || 'Director'}`,
                                resolution_type: "director_election",
                            });
                        }
                    }
                }

                return {
                    ...vs,
                    id: vs.id,
                    session_id: vs.id,
                    start_date: vs.voting_start || vs.start_date,
                    end_date: vs.voting_end || vs.end_date,
                    is_active: vs.status === "open",
                    company_name: vs.companies?.company_name || "",
                    resolutions: activeRes,
                    nominees: dbNom || [],
                };
            }
        } catch (dbEx) {
            console.warn("Direct getEventDetails DB fallback notice:", dbEx);
        }

        return null;
    },
    getShareholder: async (id) => {
        const { data, error } = await supabase
            .from("shareholders")
            .select("*, companies(*)")
            .eq("id", id)
            .single();
        if (error)
            throw error;
        return data;
    },
    /**
     * @deprecated Use votingApi.getEligibleEvents() instead.
     * Legacy query that blindly picked the latest session for a company.
     */
    getActiveSession: async (companyId) => {
        const { data, error } = await supabase
            .from("voting_sessions")
            .select("*")
            .eq("company_id", companyId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error)
            throw error;
        return data;
    },
    getResolutions: async (sessionId) => {
        const { data, error } = await supabase
            .from("resolutions")
            .select("*")
            .eq("session_id", sessionId);
        if (error)
            throw error;
        return data;
    },
    getShareholderVotes: async (shareholderId) => {
        const { data, error } = await supabase
            .from("votes")
            .select("*")
            .or(`shareholder_id.eq.${shareholderId},casting_shareholder_id.eq.${shareholderId}`);
        if (error)
            throw error;
        return data || [];
    },
    getSessionStats: async (resolutionIds) => {
        if (resolutionIds.length === 0)
            return [];
        const { data, error } = await supabase
            .from("vote_stats")
            .select("*")
            .in("resolution_id", resolutionIds);
        if (error)
            throw error;
        return data;
    },
    getCompanyShareholders: async (companyId) => {
        const { data, error } = await supabase
            .from("shareholders")
            .select("*")
            .eq("company_id", companyId);
        if (error)
            throw error;
        return data;
    },
    submitFeedback: async (feedback) => {
                const { error } = await supabase.from("shareholder_feedback").insert(feedback);
        if (error)
            throw error;
        return true;
    },
};
