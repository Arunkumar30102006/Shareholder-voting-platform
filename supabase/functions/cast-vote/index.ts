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

    // 2. Validate HttpOnly session cookie
    const cookieHeader = req.headers.get("cookie");
    const sessionToken = parseCookie(cookieHeader, "voting_session");

    if (!sessionToken) {
      return new Response(
        JSON.stringify({ error: "Authentication required. No active session cookie found." }),
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
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("shareholder_auth_sessions")
      .select("id, shareholder_id, csrf_token, expires_at, revoked_at")
      .eq("session_token_hash", sessionTokenHash)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

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

    // 6. Execute atomic cast_authorized_vote RPC
    const { data: receipt, error: rpcError } = await supabaseAdmin.rpc("cast_authorized_vote", {
      p_shareholder_id: session.shareholder_id,
      p_resolution_id: resolutionId,
      p_vote_value: voteValue,
      p_proxy_delegation_id: proxyDelegationId,
    });

    if (rpcError) {
      console.error("cast_authorized_vote error:", rpcError);
      const isDuplicate = rpcError.message?.includes("unique_resolution_shareholder") ||
                          rpcError.code === "23505";

      if (isDuplicate) {
        return new Response(
          JSON.stringify({ error: "A vote has already been cast for this resolution by this shareholder." }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: rpcError.message || "Failed to cast vote." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
