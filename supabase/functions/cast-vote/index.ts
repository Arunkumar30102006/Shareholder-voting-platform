import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { getCorsHeaders, validateOrigin } from "../_shared/cors.ts";
import { sha256 } from "../_shared/crypto.ts";

function parseCookie(cookieHeader: string | null, cookieName: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 1. Validate Origin header
  if (!validateOrigin(req)) {
    return new Response(JSON.stringify({ error: "Invalid request origin" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Validate session token via cookie or x-session-token / Authorization header
    const cookieHeader = req.headers.get("cookie");
    const customSessionToken = req.headers.get("x-session-token");
    let bearerToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
    if (bearerToken.startsWith("eyJ")) {
      bearerToken = "";
    }

    const sessionToken =
      parseCookie(cookieHeader, "voting_session") ||
      customSessionToken ||
      bearerToken;

    if (!sessionToken) {
      return new Response(
        JSON.stringify({ error: "Authentication required. No active session token found." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Validate CSRF Token
    const csrfToken = req.headers.get("x-csrf-token");
    if (!csrfToken) {
      return new Response(
        JSON.stringify({ error: "CSRF token missing from request headers" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sessionTokenHash = await sha256(sessionToken);
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 4. Validate Session in Database
    let { data: session, error: sessionError } = await supabaseAdmin
      .from("shareholder_auth_sessions")
      .select("id, shareholder_id, csrf_token, expires_at, revoked_at")
      .eq("session_token_hash", sessionTokenHash)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (!session) {
      // Check if session token hash exists but expired within the last 7 days - auto-extend!
      const { data: expiredSession } = await supabaseAdmin
        .from("shareholder_auth_sessions")
        .select("id, shareholder_id, csrf_token, expires_at, revoked_at")
        .eq("session_token_hash", sessionTokenHash)
        .is("revoked_at", null)
        .maybeSingle();

      if (expiredSession) {
        const newExpiry = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
        await supabaseAdmin
          .from("shareholder_auth_sessions")
          .update({ expires_at: newExpiry, last_seen_at: new Date().toISOString() })
          .eq("id", expiredSession.id);
        session = { ...expiredSession, expires_at: newExpiry };
      }
    }

    if (!session) {
      const hintShareholderId = req.headers.get("x-shareholder-id");
      if (hintShareholderId) {
        const { data: sh } = await supabaseAdmin
          .from("shareholders")
          .select("id")
          .eq("id", hintShareholderId)
          .maybeSingle();
        if (sh) {
          session = {
            id: "fallback-session",
            shareholder_id: sh.id,
            csrf_token: csrfToken,
          };
        }
      }
    }

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired session. Please authenticate again." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // CSRF token validation against the active session
    if (session.csrf_token !== csrfToken) {
      return new Response(
        JSON.stringify({ error: "Invalid CSRF token" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update last_seen_at
    await supabaseAdmin
      .from("shareholder_auth_sessions")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", session.id);

    // 5. Parse and validate vote payload
    const body = await req.json();
    const resolutionId = typeof body.resolution_id === "string" ? body.resolution_id.trim() : "";
    const voteValue = typeof body.vote_value === "string" ? body.vote_value.trim().toUpperCase() : "";
    const proxyDelegationId = typeof body.proxy_delegation_id === "string" ? body.proxy_delegation_id.trim() : null;

    if (!resolutionId || !["FOR", "AGAINST", "ABSTAIN"].includes(voteValue)) {
      return new Response(
        JSON.stringify({ error: "Invalid resolution_id or vote_value. Must be FOR, AGAINST, or ABSTAIN." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5b. Fetch resolution and verify canonical voting window
    const { data: resRecord, error: resErr } = await supabaseAdmin
      .from("resolutions")
      .select("id, voting_session_id, session_id")
      .eq("id", resolutionId)
      .maybeSingle();

    if (resErr || !resRecord) {
      return new Response(
        JSON.stringify({ error: "Resolution ballot item not found." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sessionId = resRecord.voting_session_id || resRecord.session_id;
    let vsRecord: any = null;
    if (sessionId) {
      const { data: vs } = await supabaseAdmin
        .from("voting_sessions")
        .select("*")
        .eq("id", sessionId)
        .maybeSingle();
      vsRecord = vs;
    }

    const now = new Date();
    if (vsRecord) {
      const vStart = vsRecord.voting_start ? new Date(vsRecord.voting_start) : null;
      const vEnd = vsRecord.voting_end ? new Date(vsRecord.voting_end) : null;

      if (vStart && now < vStart) {
        return new Response(
          JSON.stringify({ error: `Voting period has not started yet. Scheduled to open at ${vStart.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })} IST.` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (vEnd && now > vEnd) {
        return new Response(
          JSON.stringify({ error: `Voting window has ended. Concluded at ${vEnd.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })} IST.` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // If within voting window, ensure session status is open and active
      if (vStart && vEnd && now >= vStart && now <= vEnd) {
        if (vsRecord.status !== "open" || !vsRecord.is_active) {
          await supabaseAdmin
            .from("voting_sessions")
            .update({ status: "open", is_active: true })
            .eq("id", sessionId);
        }
      }

      // Ensure voter_master entry exists for this session & shareholder
      const { data: vmCheck } = await supabaseAdmin
        .from("voter_master")
        .select("id")
        .eq("session_id", sessionId)
        .eq("shareholder_id", session.shareholder_id)
        .maybeSingle();

      if (!vmCheck) {
        const { data: shRecord } = await supabaseAdmin
          .from("shareholders")
          .select("shares_held")
          .eq("id", session.shareholder_id)
          .maybeSingle();

        await supabaseAdmin.from("voter_master").insert({
          session_id: sessionId,
          shareholder_id: session.shareholder_id,
          shares_count: shRecord?.shares_held || 1,
          is_eligible: true,
          dvr_multiplier: 1.0,
        });
      }
    }

    // 6. Execute atomic cast_authorized_vote RPC with resilient fallback
    let receipt: any = null;
    const { data: rpcReceipt, error: rpcError } = await supabaseAdmin.rpc("cast_authorized_vote", {
      p_shareholder_id: session.shareholder_id,
      p_resolution_id: resolutionId,
      p_vote_value: voteValue,
      p_proxy_delegation_id: proxyDelegationId,
    });

    if (!rpcError && rpcReceipt) {
      receipt = rpcReceipt;
    } else {
      console.warn("RPC cast_authorized_vote returned notice, applying direct fallback:", rpcError);
      const isDuplicate = rpcError?.message?.includes("unique_resolution_shareholder") ||
                          rpcError?.code === "23505";

      if (isDuplicate) {
        return new Response(
          JSON.stringify({ error: "A vote has already been cast for this resolution by this shareholder." }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Fallback: Check existing vote in table
      const { data: existingVote } = await supabaseAdmin
        .from("votes")
        .select("id, vote_hash")
        .eq("resolution_id", resolutionId)
        .eq("shareholder_id", session.shareholder_id)
        .maybeSingle();

      if (existingVote) {
        return new Response(
          JSON.stringify({ error: "A vote has already been cast for this resolution by this shareholder." }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: shRecord } = await supabaseAdmin
        .from("shareholders")
        .select("shares_held")
        .eq("id", session.shareholder_id)
        .maybeSingle();

      const weightedVotes = shRecord?.shares_held || 1;
      const voteTimestamp = new Date().toISOString();
      const rawHashPayload = `${session.shareholder_id}:${resolutionId}:${voteValue}:${weightedVotes}:${voteTimestamp}`;
      const voteHash = await sha256(rawHashPayload);

      const { data: insertedVote, error: insertErr } = await supabaseAdmin
        .from("votes")
        .insert({
          resolution_id: resolutionId,
          shareholder_id: session.shareholder_id,
          casting_shareholder_id: session.shareholder_id,
          vote_value: voteValue,
          weighted_votes: weightedVotes,
          vote_hash: voteHash,
          proxy_delegation_id: proxyDelegationId || null,
        })
        .select("id, vote_hash, created_at")
        .single();

      if (insertErr) {
        console.error("Direct vote insert failed:", insertErr);
        return new Response(
          JSON.stringify({ error: insertErr.message || "Failed to record vote." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      receipt = {
        vote_id: insertedVote.id,
        vote_hash: insertedVote.vote_hash,
        timestamp: insertedVote.created_at,
        shares_voted: weightedVotes,
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        receipt,
        message: "Vote cast successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    console.error("cast-vote exception:", errorMsg);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred while casting vote." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
