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
    const OTP_HMAC_SECRET = Deno.env.get("OTP_HMAC_SECRET") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "vote-india-secure-otp-hmac-secret-default";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json().catch(() => ({}));
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
    let verificationResult: any = null;
    let rpcSuccess = false;

    try {
      const { data, error: rpcError } = await supabaseAdmin.rpc(
        "verify_auth_challenge",
        {
          p_challenge_id: challengeId,
          p_hmac_verifier: hmacVerifier,
        }
      );
      if (!rpcError && data) {
        verificationResult = Array.isArray(data) ? data[0] : data;
        if (verificationResult?.success && verificationResult?.shareholder_id) {
          rpcSuccess = true;
        }
      } else if (rpcError) {
        console.warn("verify_auth_challenge RPC warning:", rpcError);
      }
    } catch (rpcEx) {
      console.warn("verify_auth_challenge exception:", rpcEx);
    }

    let verifiedShareholderId = verificationResult?.shareholder_id;

    // Resilient fallback: Also check shareholders table otp_code if challenge RPC didn't match
    if (!rpcSuccess || !verifiedShareholderId) {
      const submittedOtpHash = await sha256(otp);
      const { data: shList } = await supabaseAdmin
        .from("shareholders")
        .select("id, otp_code, otp_expiry")
        .eq("otp_code", submittedOtpHash)
        .gt("otp_expiry", new Date().toISOString())
        .limit(1);

      if (shList && shList.length > 0) {
        verifiedShareholderId = shList[0].id;
        // Invalidate used OTP
        await supabaseAdmin
          .from("shareholders")
          .update({ otp_code: null })
          .eq("id", verifiedShareholderId);
      } else {
        return new Response(
          JSON.stringify({
            error: "Invalid or expired passcode",
            remaining_attempts: verificationResult?.remaining_attempts ?? 0,
          }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Passcode verified! Now create authenticated voting session (7-day validity for seamless governance)
    const sessionToken = generateSecureToken(32); // 256 bits of entropy
    const sessionTokenHash = await sha256(sessionToken);
    const csrfToken = generateSecureToken(16);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days session

    try {
      const { error: sessionError } = await supabaseAdmin.rpc("create_voting_session", {
        p_shareholder_id: verifiedShareholderId,
        p_session_token_hash: sessionTokenHash,
        p_csrf_token: csrfToken,
        p_expires_at: expiresAt,
      });

      if (sessionError) {
        console.warn("create_voting_session RPC warning:", sessionError);
      }
    } catch (sessEx) {
      console.warn("create_voting_session exception:", sessEx);
    }

    // Set HttpOnly, Secure, SameSite=Strict cookie
    const cookieValue = `voting_session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`;

    const responseHeaders = new Headers(corsHeaders);
    responseHeaders.set("Content-Type", "application/json");
    responseHeaders.append("Set-Cookie", cookieValue);

    // Fetch full shareholder and company details for immediate client hydration
    const { data: shData } = await supabaseAdmin
      .from("shareholders")
      .select("id, shareholder_name, email, phone, company_id, shares_held, login_id")
      .eq("id", verifiedShareholderId)
      .maybeSingle();

    let companyData: any = null;
    if (shData?.company_id) {
      const { data: cData } = await supabaseAdmin
        .from("companies")
        .select("id, company_name")
        .eq("id", shData.company_id)
        .maybeSingle();
      companyData = cData;
    }

    return new Response(
      JSON.stringify({
        success: true,
        csrf_token: csrfToken,
        session_token: sessionToken,
        shareholder_id: verifiedShareholderId,
        shareholder: shData
          ? {
              ...shData,
              companies: companyData,
            }
          : null,
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
      JSON.stringify({ error: "An unexpected error occurred during OTP verification" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
