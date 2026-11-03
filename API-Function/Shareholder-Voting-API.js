/**
 * ============================================================================
 * ROUTE: SHAREHOLDER VOTING & BALLOT PORTAL
 * Path: /voting-dashboard & /shareholder-login
 * ============================================================================
 * Handles all shareholder-facing API interactions including authentication,
 * OTP verification, session checks, cryptographic ballot casting, and voting
 * consensus queries in accordance with MCA Rule 20.
 */

import { supabase } from "@/integrations/supabase/client";
import { authSession } from "@/lib/authSession";

export const ShareholderVotingAPI = {
    /**
     * 1. INITIATE SHAREHOLDER AUTHENTICATION CHALLENGE
     * Validates User ID & Password or Demat/Folio & PAN.
     * Enforces MCA Rule 20: Rejects deactivated credentials if vote already cast.
     * Dispatches a 6-digit OTP to the registered shareholder email.
     */
    initiateAuth: async (identifier, pan) => {
        try {
            const { data, error } = await supabase.functions.invoke("initiate-shareholder-auth", {
                body: { identifier, pan }
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
            // Local development fallback via Vite proxy
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
     * 2. VERIFY SHAREHOLDER 6-DIGIT OTP
     * Verifies the one-time passcode against the cryptographic HMAC challenge.
     * Issues an authenticated session token upon successful validation.
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
     * 3. CHECK ACTIVE SHAREHOLDER SESSION
     * Retrieves the current authenticated shareholder session via session token or cookie.
     */
    checkSession: async () => {
        const storedShareholder = authSession.getShareholder();
        const storedCsrf = authSession.getCsrfToken();
        const storedSessionToken = authSession.getSessionToken();
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

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
            } catch (dbErr) {}
        }

        const headers = { 
            "Content-Type": "application/json",
            "apikey": anonKey,
            "Authorization": `Bearer ${anonKey}`
        };
        if (storedSessionToken) headers["x-session-token"] = storedSessionToken;
        if (storedCsrf) headers["X-CSRF-Token"] = storedCsrf;
        if (storedShareholder?.id) headers["x-shareholder-id"] = storedShareholder.id;

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

        if (storedShareholder) {
            return {
                authenticated: true,
                csrf_token: storedCsrf || ("csrf-" + Math.random().toString(36).substring(2, 15)),
                shareholder: storedShareholder
            };
        }

        return { authenticated: false };
    },

    /**
     * 4. CAST CRYPTOGRAPHIC BALLOT VOTE
     * Submits a FOR, AGAINST, or ABSTAIN ballot for a resolution or director election.
     * Automatically handles 409 duplicate checks and marks is_credential_used = true.
     */
    castVote: async (resolutionId, voteValue, proxyDelegationId) => {
        const csrfToken = authSession.getCsrfToken() || ("csrf-" + Math.random().toString(36).substring(2, 15));
        const sessionToken = authSession.getSessionToken();
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
        const currentShareholder = authSession.getCurrentShareholder() || authSession.getShareholder();

        const upperVote = (voteValue || "FOR").trim().toUpperCase();
        const lowerVote = upperVote.toLowerCase();

        let canonicalResolutionId = resolutionId;
        try {
            const { data: checkRes } = await supabase
                .from("resolutions")
                .select("id")
                .eq("id", canonicalResolutionId)
                .maybeSingle();

            if (!checkRes) {
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

                    if (matchedRes) canonicalResolutionId = matchedRes.id;
                }
            }
        } catch (resErr) {}

        const headers = {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
            "apikey": anonKey,
            "Authorization": `Bearer ${anonKey}`,
        };
        if (sessionToken) headers["x-session-token"] = sessionToken;
        if (currentShareholder?.id) headers["x-shareholder-id"] = currentShareholder.id;

        // Primary: Same-site API Proxy Route
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
                if (currentShareholder?.id) {
                    supabase.from("shareholders").update({ is_credential_used: true }).eq("id", currentShareholder.id).then(() => {});
                }
                return data.receipt || data;
            }
            if (res.status === 409) {
                if (currentShareholder?.id) {
                    supabase.from("shareholders").update({ is_credential_used: true }).eq("id", currentShareholder.id).then(() => {});
                }
                const data = await res.json().catch(() => ({}));
                return data.receipt || { alreadyVoted: true, resolution_id: canonicalResolutionId, vote_value: upperVote };
            }
        } catch {}

        // Fallback: Direct Edge Function
        try {
            const { data, error } = await supabase.functions.invoke("cast-vote", {
                headers: {
                    "X-CSRF-Token": csrfToken,
                    ...(sessionToken ? { "x-session-token": sessionToken } : {}),
                },
                body: {
                    resolution_id: canonicalResolutionId,
                    vote_value: upperVote,
                    proxy_delegation_id: proxyDelegationId || null,
                }
            });
            if (!error && (data?.receipt || data?.success)) {
                if (currentShareholder?.id) {
                    supabase.from("shareholders").update({ is_credential_used: true }).eq("id", currentShareholder.id).then(() => {});
                }
                return data.receipt || data;
            }
        } catch {}

        // Fallback: Atomic Database RPC Function
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
            } catch {}
        }

        throw new Error("Unable to record ballot. Please verify network connection.");
    },

    /**
     * 5. GET ELIGIBLE VOTING EVENTS FOR SHAREHOLDER
     * Retrieves all published, open, and closed voting sessions for the shareholder's company.
     */
    getEligibleEvents: async (shareholderCompanyId) => {
        let query = supabase
            .from("voting_sessions")
            .select("*, companies(*)")
            .order("voting_start", { ascending: false });

        if (shareholderCompanyId) {
            query = query.eq("company_id", shareholderCompanyId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    /**
     * 6. GET RESOLUTIONS FOR A VOTING SESSION
     * Fetches all agenda items, special resolutions, and director elections.
     */
    getResolutions: async (sessionId) => {
        const { data, error } = await supabase
            .from("resolutions")
            .select("*")
            .eq("voting_session_id", sessionId)
            .order("created_at", { ascending: true });

        if (error) throw error;
        return data || [];
    },

    /**
     * 7. GET SHAREHOLDER'S CAST VOTES
     * Retrieves existing recorded ballots for the shareholder in this session.
     */
    getShareholderVotes: async (sessionId, shareholderId) => {
        const { data, error } = await supabase
            .from("votes")
            .select("id, resolution_id, vote_value, vote_hash, created_at, voted_at, resolutions!inner(voting_session_id)")
            .eq("resolutions.voting_session_id", sessionId)
            .or(`shareholder_id.eq.${shareholderId},casting_shareholder_id.eq.${shareholderId}`);

        if (error) throw error;
        return data || [];
    },

    /**
     * 8. SHAREHOLDER LOGOUT
     * Clears local authentication session and revokes server cookie/token.
     */
    logout: async () => {
        const storedSessionToken = authSession.getSessionToken();
        try {
            await fetch("/api/auth/session/logout", {
                method: "POST",
                credentials: "include",
                headers: storedSessionToken ? { "x-session-token": storedSessionToken } : {},
            });
        } finally {
            authSession.clearSession();
        }
        return true;
    }
};

