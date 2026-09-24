import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { getCorsHeaders } from "../_shared/cors.ts";
import { sha256 } from "../_shared/crypto.ts";

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

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("FATAL: Missing Supabase credentials in verify-company-2fa");
      return new Response(
        JSON.stringify({ error: "Verification service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Authenticate caller via Supabase JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication credentials required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace(/^Bearer\s+/i, "");
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired session. Please sign in again." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Validate payload
    const body = await req.json();
    const challengeId = typeof body.challenge_id === "string" ? body.challenge_id.trim() : "";
    const otp = typeof body.otp === "string" ? body.otp.trim() : "";

    if (!challengeId || !otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "A valid challenge ID and 6-digit verification code are required." 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Hash submitted OTP
    const submittedHash = await sha256(otp);

    // 4. Call Atomic Verification RPC
    const { data: results, error: rpcError } = await supabaseAdmin.rpc(
      "verify_company_admin_2fa_challenge",
      {
        p_challenge_id: challengeId,
        p_user_id: user.id,
        p_otp_hash: submittedHash,
      }
    );

    if (rpcError) {
      console.error("verify_company_admin_2fa_challenge RPC error:", rpcError);
      return new Response(
        JSON.stringify({ success: false, error: "Database verification error occurred." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const outcome = Array.isArray(results) ? results[0] : results;

    if (!outcome || !outcome.success) {
      const remaining = outcome?.remaining_attempts ?? 0;
      const errorMsg = outcome?.error_message || "Invalid verification code.";
      const status = remaining <= 0 ? 429 : 400;

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMsg,
          remaining_attempts: remaining,
        }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Two-factor authentication verified successfully.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    console.error("verify-company-2fa exception:", errorMsg);
    return new Response(
      JSON.stringify({ success: false, error: errorMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
