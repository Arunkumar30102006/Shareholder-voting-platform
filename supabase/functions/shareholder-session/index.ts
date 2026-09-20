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

    const cookieHeader = req.headers.get("cookie");
    const sessionToken = parseCookie(cookieHeader, "voting_session");

    if (!sessionToken) {
      return new Response(
        JSON.stringify({ authenticated: false }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sessionTokenHash = await sha256(sessionToken);
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // If logout requested
    if (req.method === "DELETE" || (req.method === "POST" && req.url.endsWith("/logout"))) {
      await supabaseAdmin
        .from("shareholder_auth_sessions")
        .update({ revoked_at: new Date().toISOString() })
        .eq("session_token_hash", sessionTokenHash);

      const responseHeaders = new Headers(corsHeaders);
      responseHeaders.set("Content-Type", "application/json");
      responseHeaders.append(
        "Set-Cookie",
        "voting_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0"
      );

      return new Response(
        JSON.stringify({ success: true, message: "Logged out successfully" }),
        { status: 200, headers: responseHeaders }
      );
    }

    // Otherwise GET session status
    const { data: session, error } = await supabaseAdmin
      .from("shareholder_auth_sessions")
      .select(`
        id,
        shareholder_id,
        csrf_token,
        expires_at,
        shareholders (
          id,
          name,
          company_id,
          session_id,
          shares_held,
          folio_number,
          demat_account_number
        )
      `)
      .eq("session_token_hash", sessionTokenHash)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (error || !session) {
      const responseHeaders = new Headers(corsHeaders);
      responseHeaders.set("Content-Type", "application/json");
      // Clear invalid cookie
      responseHeaders.append(
        "Set-Cookie",
        "voting_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0"
      );
      return new Response(
        JSON.stringify({ authenticated: false }),
        { status: 200, headers: responseHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        authenticated: true,
        csrf_token: session.csrf_token,
        shareholder: session.shareholders,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    console.error("shareholder-session error:", errorMsg);
    return new Response(
      JSON.stringify({ error: "Unable to process session request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
