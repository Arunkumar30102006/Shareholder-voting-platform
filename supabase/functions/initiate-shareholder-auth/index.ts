import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { getCorsHeaders, validateOrigin } from "../_shared/cors.ts";
import { generateSecureOtp, hmacSha256, escapeHtml } from "../_shared/crypto.ts";
import { verifyTurnstileToken } from "../_shared/turnstile.ts";

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
    const body = await req.json();
    const identifier = typeof body.identifier === "string" ? body.identifier.trim() : "";
    const pan = typeof body.pan === "string" ? body.pan.trim().toUpperCase() : "";
    const turnstileToken = (typeof body.turnstile_token === "string" ? body.turnstile_token : body.turnstileToken) || "";

    // 1. Enforce Cloudflare Turnstile bot verification BEFORE expensive DB queries or OTP dispatch
    const clientIp = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const turnstileResult = await verifyTurnstileToken(turnstileToken, clientIp);

    if (!turnstileResult.success) {
      return new Response(
        JSON.stringify({ error: turnstileResult.error || "Turnstile verification failed. Please complete the security challenge." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("FATAL: Missing Supabase service credentials.");
      return new Response(
        JSON.stringify({ error: "Configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!identifier || !pan) {
      return new Response(
        JSON.stringify({ error: "Missing required identification details" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Query shareholder via service_role client
    const { data: shareholder, error: queryError } = await supabaseAdmin
      .from("shareholders")
      .select("id, name, email, pan_number, folio_number, demat_account_number")
      .or(`folio_number.eq.${identifier},demat_account_number.eq.${identifier}`)
      .eq("pan_number", pan)
      .maybeSingle();

    const genericResponse = {
      message: "If the supplied details match a registered shareholder, an OTP has been sent to the registered contact.",
      challenge_id: crypto.randomUUID(),
    };

    if (queryError || !shareholder || !shareholder.email) {
      // Artificial delay to normalize response timing and mitigate timing attacks
      await new Promise((r) => setTimeout(r, 200 + Math.random() * 100));
      return new Response(JSON.stringify(genericResponse), {
        status: 202,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate secure 6-digit OTP
    const otp = generateSecureOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Challenge ID
    const challengeId = crypto.randomUUID();

    // Compute HMAC verifier: HMAC(secret, challenge_id:otp)
    const hmacVerifier = await hmacSha256(OTP_HMAC_SECRET, `${challengeId}:${otp}`);

    // Call PostgreSQL RPC to store challenge
    const { data: createdChallengeId, error: rpcError } = await supabaseAdmin.rpc(
      "create_auth_challenge",
      {
        p_shareholder_id: shareholder.id,
        p_hmac_verifier: hmacVerifier,
        p_expires_at: expiresAt,
      }
    );

    if (rpcError) {
      console.error("Error creating auth challenge:", rpcError);
      return new Response(
        JSON.stringify({ error: "Unable to initiate authentication challenge" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Decoupled Email dispatch via Resend
    if (RESEND_API_KEY) {
      const safeName = escapeHtml(shareholder.name || "Shareholder");
      const emailPayload = {
        from: "Vote India Secure <auth@shareholdervoting.in>",
        to: shareholder.email,
        subject: "Your Two-Factor Voter Passcode - Vote India Secure",
        text: `Your One-Time Passcode for voting authentication is: ${otp}. It is valid for 10 minutes. Do not share this code with anyone.`,
        html: `
          <div style="font-family: sans-serif; background-color: #020817; color: #ffffff; padding: 24px; border-radius: 12px; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #38bdf8; margin-top: 0;">Vote India Secure</h2>
            <p>Dear ${safeName},</p>
            <p>Please enter the following 6-digit passcode to verify your shareholder voting session:</p>
            <div style="background-color: #0f172a; border: 2px solid #0284c7; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #38bdf8;">${otp}</span>
            </div>
            <p style="font-size: 13px; color: #94a3b8;">This passcode expires in 10 minutes. If you did not initiate this request, please notify your company scrutinizer immediately.</p>
          </div>
        `,
      };

      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailPayload),
        });
      } catch (emailErr) {
        console.error("Email dispatch failed:", emailErr);
        // Do not fail user auth request if email provider has transient issue; log error
      }
    }

    return new Response(
      JSON.stringify({
        message: genericResponse.message,
        challenge_id: createdChallengeId || challengeId,
      }),
      {
        status: 202,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    console.error("initiate-shareholder-auth exception:", errorMsg);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
