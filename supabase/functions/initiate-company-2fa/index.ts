import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { getCorsHeaders } from "../_shared/cors.ts";
import { generateSecureOtp, sha256, escapeHtml } from "../_shared/crypto.ts";
import { verifyTurnstileToken } from "../_shared/turnstile.ts";

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
    let turnstileToken = "";
    try {
      const body = await req.clone().json();
      turnstileToken = (typeof body.turnstile_token === "string" ? body.turnstile_token : body.turnstileToken) || "";
    } catch {
      // body empty or non-JSON
    }

    // 0. Verify Cloudflare Turnstile token to protect against automated 2FA triggering
    const clientIp = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const turnstileResult = await verifyTurnstileToken(turnstileToken, clientIp);

    if (!turnstileResult.success) {
      return new Response(
        JSON.stringify({ error: turnstileResult.error || "Turnstile verification failed. Please complete the security challenge." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("FATAL: Missing Supabase credentials in initiate-company-2fa");
      return new Response(
        JSON.stringify({ error: "Authentication service temporarily unavailable" }),
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

    // 2. Verify caller is a registered company administrator
    const { data: adminRecord, error: adminError } = await supabaseAdmin
      .from("company_admins")
      .select("company_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminError || !adminRecord) {
      return new Response(
        JSON.stringify({ error: "User is not registered as a company administrator" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Fetch Company Name for email
    const { data: companyRecord } = await supabaseAdmin
      .from("companies")
      .select("company_name")
      .eq("id", adminRecord.company_id)
      .maybeSingle();

    const companyName = companyRecord?.company_name || "Vote India Secure";
    const recipientEmail = user.email;

    if (!recipientEmail) {
      return new Response(
        JSON.stringify({ error: "No registered email found for this administrator account." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Generate cryptographically secure OTP & Hash
    const secureOtp = generateSecureOtp();
    const otpHash = await sha256(secureOtp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes TTL

    // 5. Store Challenge in Database via Security Definer RPC
    const { data: challengeId, error: rpcError } = await supabaseAdmin.rpc(
      "create_company_admin_2fa_challenge",
      {
        p_user_id: user.id,
        p_company_id: adminRecord.company_id,
        p_otp_hash: otpHash,
        p_expires_at: expiresAt,
      }
    );

    if (rpcError || !challengeId) {
      console.error("Error creating 2FA challenge:", rpcError);
      return new Response(
        JSON.stringify({ error: "Failed to create security challenge. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Dispatch OTP via Resend (Only the email receives the plain OTP)
    if (RESEND_API_KEY) {
      const safeCompanyName = escapeHtml(companyName);
      const emailHtml = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Admin Login Passcode</title>
</head>
<body style="margin:0;padding:0;background-color:#020817;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#020817;padding:30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:580px;background-color:#0d1b2a;border:1px solid rgba(2,132,199,0.4);border-radius:20px;overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,0.7);">
          <tr>
            <td style="padding:32px 32px 20px;background:linear-gradient(180deg,#0a192f 0%,#0d1b2a 100%);text-align:center;border-bottom:1px solid rgba(255,255,255,0.1);">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" style="margin:0 auto 12px;">
                <tr>
                  <td style="background-color:#0284c7;border-radius:12px;width:48px;height:48px;text-align:center;vertical-align:middle;color:#ffffff;font-size:24px;">🔒</td>
                </tr>
              </table>
              <h1 style="color:#ffffff;font-size:22px;margin:0 0 4px;font-weight:800;letter-spacing:-0.5px;">Vote India Secure</h1>
              <p style="color:#38bdf8;font-size:12px;font-weight:600;margin:0;text-transform:uppercase;letter-spacing:1.5px;">Corporate Governance Portal</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h2 style="color:#ffffff;font-size:18px;margin:0 0 12px;font-weight:700;">Administrator Verification</h2>
              <p style="color:#cbd5e1;font-size:14px;line-height:1.6;margin:0 0 24px;">
                You are authenticating into the corporate issuer console for <strong style="color:#38bdf8;">${safeCompanyName}</strong>. Please enter the one-time authentication passcode below:
              </p>
              <div style="background-color:#020817;border:2px solid #0284c7;border-radius:14px;padding:22px;text-align:center;margin:0 0 24px;">
                <span style="font-family:'Courier New',Courier,monospace;font-size:38px;font-weight:800;color:#38bdf8;letter-spacing:10px;display:inline-block;">${secureOtp}</span>
              </div>
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:rgba(2,132,199,0.1);border-left:4px solid #0284c7;border-radius:0 8px 8px 0;padding:12px 16px;">
                <tr>
                  <td style="color:#93c5fd;font-size:12px;line-height:1.5;">
                    ⏱️ <strong>Passcode Validity:</strong> This code expires in 10 minutes. Never disclose this code to anyone.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background-color:#070d18;border-top:1px solid rgba(255,255,255,0.08);text-align:center;">
              <p style="color:#64748b;font-size:11px;line-height:1.6;margin:0;">
                © 2026 Vote India Secure · Bandra Kurla Complex (BKC), Mumbai, India<br/>
                Automated statutory system notification · Do not reply directly
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      const sendPayload = {
        from: "Vote India Secure <admin@shareholdervoting.in>",
        to: [recipientEmail],
        subject: `Login Verification Passcode: ${companyName}`,
        text: `ADMIN LOGIN OTP: ${secureOtp}\n\nCompany: ${companyName}\nPlatform: Vote India Secure\nValid for 10 minutes. Never share this code with anyone.`,
        html: emailHtml,
      };

      try {
        let res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify(sendPayload),
        });

        if (!res.ok) {
          const errText = await res.text();
          console.warn("Primary sender failed in initiate-company-2fa, testing fallback:", errText);
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              ...sendPayload,
              from: "Vote India Secure <onboarding@resend.dev>",
            }),
          });
        }
      } catch (emailErr) {
        console.error("Email dispatch failed in initiate-company-2fa:", emailErr);
      }
    }

    // 7. Return Challenge ID to client (NEVER plain OTP)
    return new Response(
      JSON.stringify({
        success: true,
        challenge_id: challengeId,
        company_name: companyName,
        message: `A 6-digit verification code has been dispatched to ${recipientEmail}.`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    console.error("initiate-company-2fa exception:", errorMsg);
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
