import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { getCorsHeaders, validateOrigin } from "../_shared/cors.ts";
import { hmacSha256, sha256, generateSecureToken } from "../_shared/crypto.ts";

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
    const OTP_HMAC_SECRET = Deno.env.get("OTP_HMAC_SECRET");
    if (!OTP_HMAC_SECRET) {
      console.error("FATAL: OTP_HMAC_SECRET is missing. Failing closed.");
      return new Response(
        JSON.stringify({ error: "Authentication service temporarily unavailable" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const challengeId = typeof body.challenge_id === "string" ? body.challenge_id.trim() : "";
    const otp = typeof body.otp === "string" ? body.otp.trim() : "";

    if (!challengeId || !otp || otp.length !== 6) {
      return new Response(
        JSON.stringify({ error: "Invalid challenge or passcode format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Compute expected HMAC verifier: HMAC(secret, challenge_id:otp)
    const hmacVerifier = await hmacSha256(OTP_HMAC_SECRET, `${challengeId}:${otp}`);

    // Call PostgreSQL RPC to verify challenge atomically
    const { data: verificationResult, error: rpcError } = await supabaseAdmin.rpc(
      "verify_auth_challenge",
      {
        p_challenge_id: challengeId,
        p_hmac_verifier: hmacVerifier,
      }
    );

    if (rpcError) {
      console.error("verify_auth_challenge RPC error:", rpcError);
      return new Response(
        JSON.stringify({ error: "Verification failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const res = Array.isArray(verificationResult) ? verificationResult[0] : verificationResult;

    if (!res || !res.success || !res.shareholder_id) {
      return new Response(
        JSON.stringify({
          error: "Invalid or expired passcode",
          remaining_attempts: res?.remaining_attempts ?? 0,
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Passcode verified! Now create authenticated voting session
    const sessionToken = generateSecureToken(32); // 256 bits of entropy
    const sessionTokenHash = await sha256(sessionToken);
    const csrfToken = generateSecureToken(16);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour session

    const { error: sessionError } = await supabaseAdmin.rpc("create_voting_session", {
      p_shareholder_id: res.shareholder_id,
      p_session_token_hash: sessionTokenHash,
      p_csrf_token: csrfToken,
      p_expires_at: expiresAt,
    });

    if (sessionError) {
      console.error("Failed to create voting session:", sessionError);
      return new Response(
        JSON.stringify({ error: "Failed to establish authenticated session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Set HttpOnly, Secure, SameSite=Strict cookie
    // Max-Age=3600 (1 hour)
    const cookieValue = `voting_session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`;

    const responseHeaders = new Headers(corsHeaders);
    responseHeaders.set("Content-Type", "application/json");
    responseHeaders.append("Set-Cookie", cookieValue);

    return new Response(
      JSON.stringify({
        success: true,
        csrf_token: csrfToken,
        message: "Authenticated successfully",
      }),
      {
        status: 200,
        headers: responseHeaders,
      }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    console.error("verify-shareholder-otp exception:", errorMsg);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
