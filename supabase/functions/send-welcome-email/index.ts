import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, validateOrigin } from "../_shared/cors.ts";
import { escapeHtml } from "../_shared/crypto.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!validateOrigin(req)) {
    return new Response(JSON.stringify({ error: "Invalid origin" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { email, companyName, cin, adminName, address, phone, regId } = await req.json();
    const FRONTEND_URL = "https://www.shareholdervoting.in";

    if (!email || !companyName) {
      return new Response(
        JSON.stringify({ error: "Email and Company Name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured.");
      return new Response(
        JSON.stringify({ error: "Email service temporarily unavailable" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const safeAdminName = escapeHtml(adminName || "Administrator");
    const safeCompanyName = escapeHtml(companyName);
    const safeCin = escapeHtml(cin || "N/A");
    const safeRegId = escapeHtml(regId || "N/A");
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone || "N/A");
    const safeAddress = escapeHtml(address || "N/A");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Vote India Secure <admin@shareholdervoting.in>",
        to: [email],
        subject: "Company Registration Confirmation - Vote India Secure",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to Vote India Secure</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 0; color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px; margin-top: 20px;">
      <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: 700;">Registration Confirmed</h1>
      <p style="color: #94a3b8; font-size: 14px; margin: 5px 0 0;">Corporate Governance &amp; E-Voting Portal</p>
    </div>

    <div style="background-color: #1e293b; border-radius: 16px; padding: 40px; border: 1px solid #334155;">
      <h2 style="color: #f8fafc; font-size: 20px; margin-top: 0; margin-bottom: 20px;">Hello ${safeAdminName},</h2>
      <p style="color: #cbd5e1; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
        <strong>${safeCompanyName}</strong> has been registered on the Vote India Secure platform.
      </p>

      <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; margin-bottom: 25px; border: 1px solid #334155;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #94a3b8; font-size: 14px; width: 40%;">Registration ID:</td>
            <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 500;">${safeRegId}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">CIN Number:</td>
            <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 500;">${safeCin}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">Admin Email:</td>
            <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 500;">${safeEmail}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">Contact Phone:</td>
            <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 500;">${safePhone}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">Registered Address:</td>
            <td style="padding: 8px 0; color: #cbd5e1; font-size: 14px;">${safeAddress}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${FRONTEND_URL}/company-login" style="background: #2563eb; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; display: inline-block;">Access Company Portal</a>
      </div>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <p style="color: #64748b; font-size: 12px;">
        &copy; ${new Date().getFullYear()} Vote India Secure. All rights reserved.<br>
        For security, never share credentials or OTPs via unsecured channels.
      </p>
    </div>
  </div>
</body>
</html>
        `,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
