import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CredentialsEmailRequest {
  type?: "credentials" | "otp" | "login_otp" | "deregistration_otp";
  shareholderEmail?: string;
  email?: string;
  shareholderName?: string;
  companyName: string;
  loginId?: string;
  password?: string;
  otp?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      type = "credentials",
      shareholderEmail,
      email,
      shareholderName,
      companyName,
      loginId,
      password,
      otp
    }: CredentialsEmailRequest = await req.json();

    const targetEmail = (email || shareholderEmail || "").trim();

    if (!targetEmail || !companyName) {
      throw new Error("Missing email or company name");
    }

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY secret is missing in Supabase Edge Functions environment.");
      throw new Error("Email service is temporarily unconfigured. Please configure RESEND_API_KEY.");
    }

    console.log(`Processing ${type} email for ${targetEmail}`);

    let subject = "";
    let html = "";
    let text = "";

    if (type === "deregistration_otp") {
      if (!otp) throw new Error("OTP is required");
      subject = `Security Verification Code - Deregistration of ${companyName}`;
      text = `DEREGISTRATION VERIFICATION CODE: ${otp}\n\nYou have requested to deregister ${companyName} on Vote India Secure.\nThis will permanently delete all company resolutions, voter rosters, and audit records.\nValid for 10 minutes.`;
      html = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Deregistration Code</title>
</head>
<body style="margin:0;padding:0;background-color:#020817;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#020817;padding:30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:580px;background-color:#0d1b2a;border:1px solid #ef4444;border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.6);">
          <tr>
            <td style="padding:32px;background:linear-gradient(180deg,#1e1b4b 0%,#0d1b2a 100%);">
              <div style="text-align:center;margin-bottom:20px;">
                <span style="font-size:32px;">⚠️</span>
                <h2 style="color:#ef4444;margin:10px 0 4px;font-size:22px;font-weight:800;">Deregistration Confirmation</h2>
                <p style="color:#94a3b8;font-size:13px;margin:0;">Vote India Secure Corporate Governance Portal</p>
              </div>
              <p style="color:#cbd5e1;font-size:15px;line-height:1.6;">You have initiated a request to deregister <strong style="color:#f87171;">${companyName}</strong>. This action will irreversibly terminate all voting sessions and purge database records.</p>
              <div style="background-color:#020817;border:1px dashed #ef4444;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
                <span style="font-family:'Courier New',monospace;font-size:36px;font-weight:800;color:#f87171;letter-spacing:10px;">${otp}</span>
              </div>
              <p style="color:#94a3b8;font-size:12px;line-height:1.5;margin:0;">⏱️ Valid for 10 minutes. If you did not authorize this action, secure your account immediately.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
    } else if (type === "login_otp" || type === "otp") {
      throw new Error("Client-initiated login OTP is disabled. Use the initiate-company-2fa endpoint.");
    } else {
      // Default: Shareholder Credentials Email
      if (!shareholderName || !loginId || !password) throw new Error("Missing credentials fields");
      subject = `Statutory E-Voting Notice & Credentials: ${companyName}`;
      
      // Plain text version (Outlook fallback)
      text = `VOTE INDIA SECURE — STATUTORY E-VOTING NOTICE
-----------------------------------------------------------------
Issuer: ${companyName}
Shareholder: ${shareholderName}
Compliance: Section 108 Companies Act 2013 & SEBI LODR Regulation 44

Dear ${shareholderName},

You have been enrolled on the official electronic voting roster for ${companyName}.
Please use your confidential electronic credentials below to access the voting terminal:

YOUR VOTING CREDENTIALS:
- VOTING USER ID : ${loginId}
- SECURITY PIN    : ${password}

ACCESS PORTAL:
https://www.shareholdervoting.in/shareholder-login

HOW TO VOTE IN 3 EASY STEPS:
1. Navigate to the Shareholder Portal using the link above.
2. Enter your Voting User ID and Security PIN.
3. Review statutory resolutions and cast your AES-256 encrypted weighted ballot.

STATUTORY BALLOT SECRECY (MCA Rule 20):
Your voting decision is mathematically decoupled from your identity and sealed in an encrypted vault. Under Rule 20(4)(xii), votes cannot be modified after submission.

-----------------------------------------------------------------
Vote India Secure · Mumbai, India · support@shareholdervoting.in`;

      // Ultra-Premium, Outlook-Optimized HTML Email Template
      html = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
  <!--[if gte mso 9]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="x-apple-disable-message-reformatting" />
  <title>E-Voting Credentials</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #020817; }
    .credential-box { background-color: #050d1a !important; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
      .hero-pad { padding: 24px 18px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#020817;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  
  <!-- Outer Wrapper -->
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#020817;padding:30px 10px;">
    <tr>
      <td align="center">
        
        <!-- Main Email Container (600px) -->
        <table role="presentation" class="email-container" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#0d1b2a;border:1px solid rgba(255,255,255,0.12);border-radius:24px;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,0.8);">
          
          <!-- Top Statutory Decorative Bar -->
          <tr>
            <td height="5" style="background:linear-gradient(90deg, #0284c7 0%, #38bdf8 50%, #10b981 100%);background-color:#0284c7;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header Section -->
          <tr>
            <td class="hero-pad" style="padding:36px 36px 24px;background:linear-gradient(180deg,#0a192f 0%,#0d1b2a 100%);text-align:center;border-bottom:1px solid rgba(255,255,255,0.08);">
              
              <!-- Compliance Pill Badge -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" style="margin:0 auto 16px;">
                <tr>
                  <td style="background-color:rgba(2,132,199,0.18);border:1px solid rgba(56,189,248,0.4);border-radius:20px;padding:6px 14px;color:#38bdf8;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
                    🏛️ SECTION 108 &amp; SEBI LODR 44 COMPLIANT
                  </td>
                </tr>
              </table>

              <!-- Brand Title -->
              <h1 style="color:#ffffff;font-size:26px;margin:0 0 6px;font-weight:800;letter-spacing:-0.5px;">Vote India Secure</h1>
              <p style="color:#94a3b8;font-size:13px;margin:0;font-weight:500;">National Corporate E-Voting &amp; Stakeholder Portal</p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td class="hero-pad" style="padding:32px 36px;">
              
              <!-- Salutation -->
              <h2 style="color:#ffffff;font-size:20px;margin:0 0 10px;font-weight:700;">Dear ${shareholderName},</h2>
              <p style="color:#cbd5e1;font-size:14px;line-height:1.6;margin:0 0 24px;">
                You are officially registered on the electronic voting register for <strong style="color:#38bdf8;font-size:15px;">${companyName}</strong>. Your confidential digital credentials have been generated to enable remote ballot participation:
              </p>

              <!-- Confidential Credentials Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#050d1a;border:1px solid rgba(56,189,248,0.35);border-radius:16px;overflow:hidden;margin:0 0 28px;box-shadow:0 10px 25px rgba(0,0,0,0.5);">
                <tr>
                  <td style="padding:14px 20px;background-color:#091528;border-bottom:1px solid rgba(56,189,248,0.2);">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="color:#38bdf8;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;">
                          🔑 CONFIDENTIAL VOTING TOKEN
                        </td>
                        <td align="right" style="color:#10b981;font-size:11px;font-weight:700;">
                          ● ACTIVE ROSTER
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 20px;">
                    
                    <!-- User ID Field -->
                    <div style="margin-bottom:18px;">
                      <span style="color:#94a3b8;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;display:block;margin-bottom:6px;">VOTING USER ID (LOGIN TOKEN)</span>
                      <div style="background-color:#020817;border:1px solid #1e3a8a;border-radius:10px;padding:12px 16px;">
                        <code style="color:#38bdf8;font-family:'Courier New',Courier,monospace;font-size:20px;font-weight:800;letter-spacing:1.5px;">${loginId}</code>
                      </div>
                    </div>

                    <!-- Security PIN Field -->
                    <div>
                      <span style="color:#94a3b8;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;display:block;margin-bottom:6px;">SECURITY PIN / PASSCODE</span>
                      <div style="background-color:#020817;border:1px solid #065f46;border-radius:10px;padding:12px 16px;">
                        <code style="color:#34d399;font-family:'Courier New',Courier,monospace;font-size:20px;font-weight:800;letter-spacing:2px;">${password}</code>
                      </div>
                    </div>

                  </td>
                </tr>
              </table>

              <!-- Action Button (Outlook Bulletproof VML + CSS) -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:0 0 28px;text-align:center;">
                <tr>
                  <td align="center">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://www.shareholdervoting.in/shareholder-login" style="height:52px;v-text-anchor:middle;width:280px;" arcsize="18%" stroke="f" fillcolor="#0284c7">
                      <w:anchorlock/>
                      <center style="color:#ffffff;font-family:sans-serif;font-size:15px;font-weight:bold;">Cast Your Ballot Now &rarr;</center>
                    </v:roundrect>
                    <![endif]-->
                    <a href="https://www.shareholdervoting.in/shareholder-login" target="_blank" style="background-color:#0284c7;background-image:linear-gradient(135deg, #0284c7 0%, #1e40af 100%);border-radius:12px;color:#ffffff;display:inline-block;font-size:15px;font-weight:800;line-height:52px;text-align:center;text-decoration:none;width:280px;box-shadow:0 6px 20px rgba(2,132,199,0.4);letter-spacing:0.5px;mso-hide:all;">
                      Cast Your Ballot Now &rarr;
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:10px;">
                    <span style="color:#64748b;font-size:11px;">Direct Link: https://www.shareholdervoting.in/shareholder-login</span>
                  </td>
                </tr>
              </table>

              <!-- 3-Step Guide -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:18px 20px;margin-bottom:24px;">
                <tr>
                  <td style="color:#ffffff;font-size:13px;font-weight:700;padding-bottom:10px;">
                    📋 Simple 3-Step Voting Procedure:
                  </td>
                </tr>
                <tr>
                  <td style="color:#cbd5e1;font-size:12px;line-height:1.8;">
                    <strong>1.</strong> Click the button above to enter the Shareholder Portal.<br/>
                    <strong>2.</strong> Log in using your <strong>User ID</strong> and <strong>Security PIN</strong>.<br/>
                    <strong>3.</strong> Review resolution agendas and submit your cryptographically signed vote.
                  </td>
                </tr>
              </table>

              <!-- Statutory Rule 20 Notice -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.3);border-radius:12px;padding:14px 18px;">
                <tr>
                  <td style="color:#fbbf24;font-size:12px;font-weight:700;padding-bottom:4px;">
                    ⚠️ MCA Rule 20 &amp; Statutory Ballot Integrity:
                  </td>
                </tr>
                <tr>
                  <td style="color:#cbd5e1;font-size:11.5px;line-height:1.5;">
                    Your vote is secured using SHA-256 tamper-evident hashing and PostgreSQL Row Level Security. Under Rule 20(4)(xii) of the Companies Act 2013, once a vote is cast remotely, it cannot be modified or re-cast at the general meeting.
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 36px;background-color:#070d18;border-top:1px solid rgba(255,255,255,0.08);text-align:center;">
              
              <!-- Security Badges -->
              <p style="color:#38bdf8;font-size:11px;font-weight:700;margin:0 0 8px;letter-spacing:1px;">
                🔒 SHA-256 TAMPER-EVIDENT · DPDP ACT 2023 ALIGNED · SECURE CORPORATE GOVERNANCE
              </p>
              
              <p style="color:#64748b;font-size:11px;line-height:1.6;margin:0 0 12px;">
                This is an automated statutory communication issued on behalf of <strong>${companyName}</strong> via Vote India Secure.<br/>
                For technical support, contact <a href="mailto:support@shareholdervoting.in" style="color:#38bdf8;text-decoration:none;">support@shareholdervoting.in</a>
              </p>

              <p style="color:#475569;font-size:10px;margin:0;">
                © 2026 Vote India Secure · Regd. Office: Bandra Kurla Complex (BKC), Mumbai, Maharashtra 400051, India
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
    }

    // Try sending with primary domain, fallback to onboarding@resend.dev if domain not yet verified
    const sendPayload = {
      from: "Vote India Secure <notifications@shareholdervoting.in>",
      reply_to: "support@shareholdervoting.in",
      to: [targetEmail],
      subject: subject,
      text: text,
      html: html,
    };

    let res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(sendPayload),
    });

    if (!res.ok) {
      const errorJson = await res.clone().json().catch(() => null);
      console.warn("Primary sender failed, testing fallback sender:", errorJson);

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
            ...sendPayload,
            from: "Vote India Secure <onboarding@resend.dev>",
          }),
        });
      }
    }

    const data = await res.json();
    console.log("Email API response:", data);

    if (!res.ok) {
      throw new Error(data.message || "Failed to deliver email via Resend");
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    console.error("Error in send-shareholder-credentials function:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);