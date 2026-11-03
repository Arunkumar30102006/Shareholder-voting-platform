import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const name = body.name || body.nominee_name || body.nomineeName;
    const email = body.email || body.nominee_email || body.nomineeEmail;
    const companyName = body.companyName || body.company_name || body.company || "Corporate Issuer";
    const designation = body.designation || "Director";
    const qualification = body.qualification || "";
    const bio = body.bio || "";

    if (!email || !name) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required fields: email and name are required." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Simulating nomination notification email delivery.");
      return new Response(
        JSON.stringify({
          success: true,
          simulated: true,
          message: "Nomination alert email recorded (Simulated - RESEND_API_KEY not configured)",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailPayload = {
      from: "Vote India Secure <notifications@shareholdervoting.in>",
      to: [email],
      subject: `Nomination Alert: You have been nominated as ${designation || "Director"} - ${companyName}`,
      headers: {
        "Precedence": "bulk",
        "X-Entity-Ref-ID": `nomination-${email}`
      },
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Nomination Notification</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 36px 30px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: 800; letter-spacing: -0.025em;">📋 Nomination Notification</h1>
      <div style="height: 4px; width: 40px; background: #f59e0b; margin: 12px auto;"></div>
      <p style="color: #bfdbfe; font-size: 14px; margin: 6px 0 0; font-weight: 500;">${companyName}</p>
    </div>

    <!-- Content -->
    <div style="padding: 36px 32px;">
      <h2 style="color: #0f172a; font-size: 20px; margin-top: 0; margin-bottom: 16px; font-weight: 700;">Dear ${name},</h2>
      
      <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
        We are pleased to inform you that you have been officially registered as a candidate nominee on the ballot for <strong>${companyName}</strong>.
      </p>

      <div style="background-color: #f1f5f9; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 28px;">
        <h3 style="margin: 0 0 14px 0; color: #1e3a8a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">Candidate Ballot Details</h3>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #64748b; width: 130px;">Nominated For:</td>
            <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 700;">${designation || "Director"}</td>
          </tr>
          ${qualification ? `
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #64748b;">Qualification:</td>
            <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${qualification}</td>
          </tr>
          ` : ''}
          ${bio ? `
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #64748b;">Profile Summary:</td>
            <td style="padding: 6px 0; font-size: 14px; color: #334155; line-height: 1.5;">${bio}</td>
          </tr>
          ` : ''}
        </table>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 28px;">
        Your candidacy will be presented to eligible shareholders during the upcoming voting session. You will receive further updates regarding the meeting schedule, proceedings, and final scrutinizer results.
      </p>
      
      <div style="text-align: center; margin-bottom: 16px;">
        <a href="https://www.shareholdervoting.in" style="display: inline-block; background-color: #1e40af; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(30, 64, 175, 0.3);">
          Access Stakeholder Portal
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="color: #64748b; font-size: 12px; margin: 0 0 6px;">
        Sent on behalf of <strong>${companyName}</strong> via Vote India Secure
      </p>
      <p style="color: #94a3b8; font-size: 11px; margin: 0;">
        &copy; ${new Date().getFullYear()} Vote India Secure. Compliant with Section 108 of the Companies Act, 2013 & SEBI Regulations.
      </p>
    </div>
  </div>
</body>
</html>
      `,
    };

    let res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailPayload),
    });

    if (!res.ok) {
      const errorJson = await res.clone().json().catch(() => null);
      console.warn("Primary sender failed in send-nomination-email, testing fallback:", errorJson);

      // If domain verification is pending in Resend, retry with onboarding@resend.dev
      if (
        errorJson?.message?.toLowerCase().includes("domain") ||
        errorJson?.name === "validation_error" ||
        res.status === 403
      ) {
        res = await fetch("https://api.resend.com/emails", {
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
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.warn("Resend API delivery notice:", errorText);

      // If domain is unverified or Resend sandbox limits to verified testing email
      if (
        res.status === 403 ||
        errorText.includes("testing emails") ||
        errorText.includes("validation_error") ||
        errorText.includes("domain")
      ) {
        return new Response(
          JSON.stringify({
            success: true,
            simulated: true,
            message: "Nomination notification recorded (Resend sandbox fallback mode).",
            detail: errorText,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: false, message: `Email provider error: ${errorText}` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    console.log("Nomination email dispatched successfully:", data);

    return new Response(
      JSON.stringify({ success: true, message: "Nomination email dispatched successfully", data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal error";
    console.error("send-nomination-email handler error:", errorMsg);
    return new Response(
      JSON.stringify({ success: false, message: errorMsg }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
