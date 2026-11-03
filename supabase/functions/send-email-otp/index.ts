import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name } = await req.json();

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase database configuration");
    }

    if (!email) {
      throw new Error("Email is required");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Store OTP in verification_codes table
    const { error: dbError } = await supabase
      .from("verification_codes")
      .upsert({
        email: email.toLowerCase().trim(),
        code: otp,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      });

    if (dbError) {
      console.error("DB error saving verification code:", dbError);
      throw new Error(`Failed to record verification code: ${dbError.message}`);
    }

    // 3. Dispatch Email via Resend with verified fallback
    let emailSent = false;
    if (RESEND_API_KEY) {
      const emailPayload = {
        from: "Vote India Secure <admin@shareholdervoting.in>",
        to: [email],
        subject: "Company Registration Verification Code — Vote India Secure",
        headers: {
          "X-Priority": "1",
          "Importance": "high",
        },
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verification Code</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 0; color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a; padding: 20px;">
    
    <div style="text-align: center; margin-bottom: 30px; margin-top: 20px;">
      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 12px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 30px; color: white;">&#10003;</span>
      </div>
      <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: 700;">Vote India Secure</h1>
      <p style="color: #94a3b8; font-size: 14px; margin: 5px 0 0;">Secure Digital Voting for Shareholders</p>
    </div>

    <div style="background-color: #1e293b; border-radius: 16px; padding: 40px; border: 1px solid #334155; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
      <h2 style="color: #f8fafc; font-size: 20px; margin-top: 0; margin-bottom: 20px;">Hello ${name || "Admin"},</h2>
      
      <p style="color: #cbd5e1; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
        You are registering a company on the <strong>Vote India Secure</strong> corporate governance platform. Please use the verification code below to verify your email address:
      </p>

      <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; text-align: center; border: 1px solid #3b82f6; margin: 30px 0;">
        <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; color: #38bdf8; letter-spacing: 8px;">${otp}</span>
      </div>
      
      <p style="color: #94a3b8; font-size: 14px; text-align: center; margin-bottom: 0;">
        ⏱️ This verification code is valid for 10 minutes.
      </p>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <p style="color: #64748b; font-size: 12px;">
        &copy; ${new Date().getFullYear()} Vote India Secure. All rights reserved.<br>
        This is an automated security message, please do not reply.
      </p>
    </div>
  </div>
</body>
</html>
        `,
      };

      try {
        let emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify(emailPayload),
        });

        if (!emailResponse.ok) {
          const errText = await emailResponse.text().catch(() => "");
          console.warn("Primary email sender failed, trying fallback onboarding@resend.dev:", errText);

          const fallbackRes = await fetch("https://api.resend.com/emails", {
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

          if (fallbackRes.ok) {
            emailSent = true;
          } else {
            const fallbackErr = await fallbackRes.text().catch(() => "");
            console.warn("Fallback Resend sender also failed:", fallbackErr);
          }
        } else {
          emailSent = true;
        }
      } catch (sendErr) {
        console.error("Resend fetch exception in send-email-otp:", sendErr);
      }
    } else {
      console.warn(`[DEV SIMULATION] RESEND_API_KEY missing. Verification OTP for ${email}: ${otp}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification code sent successfully.",
        simulated: !emailSent 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal error";
    console.error("send-email-otp error:", errorMsg);
    return new Response(
      JSON.stringify({ success: false, message: errorMsg }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
