import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shareholder_id, email, name } = await req.json();

    if (!shareholder_id || !email) {
      throw new Error("Missing shareholder_id or email");
    }

    console.log(`Generating OTP for shareholder: ${shareholder_id}, email: ${email}`);

    // 1. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Hash the OTP for storage
    const encoder = new TextEncoder();
    const data = encoder.encode(otp);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const otpHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    // 3. Store OTP and Expiry in Database
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const updateResult = await supabaseAdmin
      .from("shareholders")
      .update({
        otp_code: otpHash,
        otp_expiry: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      })
      .eq("id", shareholder_id);

    if (updateResult.error) {
      console.error("Database update error:", updateResult.error);
      throw new Error(`Failed to store OTP: ${updateResult.error.message}`);
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      console.warn(`[DEV SIMULATION] RESEND_API_KEY missing. Shareholder OTP for ${email}: ${otp}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "OTP generated successfully (Simulation mode)", 
          simulated: true,
          otp: otp 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const textContent = `VOTE INDIA SECURE — 2-FACTOR VOTING AUTHENTICATION\n\nHello ${name || "Valued Shareholder"},\n\nYour One-Time Passcode (OTP) is: ${otp}\n\nThis verification code is valid for 10 minutes.\nNever share this code with anyone.\n\nVote India Secure Enterprise Platform`;

    const htmlContent = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Voter Verification OTP</title>
</head>
<body style="margin:0;padding:0;background-color:#020817;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#020817;padding:30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:580px;background-color:#0d1b2a;border:1px solid rgba(56,189,248,0.3);border-radius:24px;overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,0.8);">
          
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 20px;background:linear-gradient(180deg,#0a192f 0%,#0d1b2a 100%);text-align:center;border-bottom:1px solid rgba(255,255,255,0.08);">
              <h1 style="color:#ffffff;font-size:22px;margin:0 0 4px;font-weight:800;letter-spacing:-0.5px;">Vote India Secure</h1>
              <p style="color:#38bdf8;font-size:12px;font-weight:700;margin:0;text-transform:uppercase;letter-spacing:1px;">Two-Factor Voter Authentication</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              <h2 style="color:#ffffff;font-size:18px;margin:0 0 12px;font-weight:700;">Hello ${name || "Valued Shareholder"},</h2>
              <p style="color:#cbd5e1;font-size:14px;line-height:1.6;margin:0 0 24px;">
                To securely authenticate your voting terminal session, please enter the confidential 6-digit passcode below:
              </p>

              <!-- OTP Box -->
              <div style="background-color:#020817;border:2px solid #0284c7;border-radius:14px;padding:22px;text-align:center;margin:0 0 24px;">
                <span style="font-family:'Courier New',Courier,monospace;font-size:38px;font-weight:800;color:#38bdf8;letter-spacing:12px;display:inline-block;">${otp}</span>
              </div>

              <!-- Notice -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:rgba(2,132,199,0.1);border-left:4px solid #0284c7;border-radius:0 8px 8px 0;padding:12px 16px;">
                <tr>
                  <td style="color:#93c5fd;font-size:12px;line-height:1.5;">
                    ⏱️ <strong>Passcode Lifetime:</strong> Valid for 10 minutes. Never share this code with anyone.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background-color:#070d18;border-top:1px solid rgba(255,255,255,0.08);text-align:center;">
              <p style="color:#64748b;font-size:11px;line-height:1.6;margin:0;">
                © 2026 Vote India Secure · Enterprise Corporate E-Voting SaaS · Mumbai, India<br/>
                Automated statutory dispatch · Please do not reply directly
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Email sending with domain fallback
    const emailPayload = {
      from: "Vote India Secure <notifications@shareholdervoting.in>",
      reply_to: "support@shareholdervoting.in",
      to: [email],
      subject: "Your Secure E-Voting Login OTP — Vote India Secure",
      text: textContent,
      headers: {
        "X-Priority": "1",
        "Importance": "high",
        "X-Entity-Ref-ID": `otp-${shareholder_id}`
      },
      html: htmlContent,
    };

    let emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailPayload),
    });

    if (!emailResponse.ok) {
      const errorJson = await emailResponse.clone().json().catch(() => null);
      console.warn("Primary OTP sender failed, falling back to onboarding@resend.dev:", errorJson);
      emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          ...emailPayload,
          from: "Vote India Secure <onboarding@resend.dev>",
        }),
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "OTP sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error("Error in send-shareholder-otp-email function:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
