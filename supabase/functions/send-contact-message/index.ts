import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { verifyTurnstileToken } from "../_shared/turnstile.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { 
      firstname, 
      lastname, 
      email, 
      subject, 
      message, 
      name, 
      company, 
      phone,
      inquiryType 
    } = body;

    const turnstileToken = (typeof body.turnstile_token === "string" ? body.turnstile_token : body.turnstileToken) || "";

    // 0. Enforce Cloudflare Turnstile bot verification BEFORE processing inquiry or sending emails
    const clientIp = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const turnstileResult = await verifyTurnstileToken(turnstileToken, clientIp);

    if (!turnstileResult.success) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: turnstileResult.error || "Turnstile verification failed. Please complete the security challenge." 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    if (!email || !message) {
      throw new Error("Email and Message are required");
    }

    const senderName = name || `${firstname || ''} ${lastname || ''}`.trim() || "Valued User";
    const senderCompany = company || lastname || "N/A";
    const senderPhone = phone || "N/A";
    const cleanSubject = subject || "General Inquiry";

    // Generate unique Query/Ticket Reference ID
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `VS-${today}-${randomSuffix}`;
    
    // Timestamp in IST
    const submittedTimeIST = new Date().toLocaleString("en-IN", { 
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short"
    });

    // Determine correct routing, department & SLA based on inquiryType
    let department = "Shareholder Support & Technical Operations";
    let primaryInbox = "support@shareholdervoting.in";
    let inquiryLabel = "General Inquiry";
    let slaTimeline = "Within 24 hours";
    let isComplaint = false;

    switch (inquiryType) {
      case "corporate-sales":
        inquiryLabel = "Corporate Sales & AGM Deployment";
        department = "Corporate Governance & Enterprise Sales";
        primaryInbox = "admin@shareholdervoting.in";
        slaTimeline = "Within 2 business hours";
        break;
      case "partnership":
        inquiryLabel = "Partnership & RTA Integration";
        department = "Strategic Partnerships & Registry Integration";
        primaryInbox = "admin@shareholdervoting.in";
        slaTimeline = "Within 2 business hours";
        break;
      case "complaint":
        inquiryLabel = "Investor Grievance / Complaint";
        department = "Investor Grievance Redressal Cell";
        primaryInbox = "support@shareholdervoting.in";
        slaTimeline = "Within 4 business hours (Statutory Priority)";
        isComplaint = true;
        break;
      case "shareholder-support":
        inquiryLabel = "Shareholder Support & Voting Help";
        department = "Shareholder Voting Assistance & OTP Helpdesk";
        primaryInbox = "support@shareholdervoting.in";
        slaTimeline = "Within 2 hours (24/7 during live general meetings)";
        break;
      case "technical-issue":
        inquiryLabel = "Technical Issue";
        department = "Platform Engineering & IT Support";
        primaryInbox = "support@shareholdervoting.in";
        slaTimeline = "Within 1 business hour";
        break;
      default:
        inquiryLabel = "General Inquiry";
        department = "Customer Support Desk";
        primaryInbox = "support@shareholdervoting.in";
        slaTimeline = "Within 24 hours";
        break;
    }

    // Official Team Recipients (Strictly Zoho Mail official accounts, NO personal emails)
    const teamRecipients = [
      "admin@shareholdervoting.in",
      "support@shareholdervoting.in"
    ];

    // -------------------------------------------------------------
    // 1. Internal Team Alert Email (Sent to admin@ and support@)
    // -------------------------------------------------------------
    const internalEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Inquiry [Ticket #${ticketId}]</title>
</head>
<body style="margin: 0; padding: 0; background-color: #020817; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <div style="max-width: 620px; margin: 20px auto; background-color: #0d1b2a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
    
    <!-- Top Header -->
    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #0284c7 100%); padding: 24px 30px;">
      <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #bae6fd; font-weight: 700;">
        Vote Secure • Official Zoho Mail Alert
      </p>
      <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">
        ${inquiryLabel}
      </h1>
      <div style="display: inline-block; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.25); padding: 5px 12px; border-radius: 6px; margin-top: 10px; font-size: 13px; font-family: monospace; font-weight: bold; color: #ffffff;">
        Query Reference: #${ticketId}
      </div>
    </div>

    <div style="padding: 30px;">
      ${isComplaint ? `
      <div style="background-color: rgba(239, 68, 68, 0.12); border: 1px solid #ef4444; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px;">
        <strong style="color: #fca5a5; font-size: 13px;">⚠️ STATUTORY INVESTOR GRIEVANCE PROTOCOL</strong>
        <p style="color: #cbd5e1; font-size: 12px; margin: 4px 0 0 0;">This grievance has been assigned SLA target: <strong>${slaTimeline}</strong>.</p>
      </div>` : ''}

      <!-- Metadata Box -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
        <tr style="border-bottom: 1px solid #1e293b;">
          <td style="padding: 10px 0; color: #94a3b8; width: 35%;">Assigned Department:</td>
          <td style="padding: 10px 0; color: #38bdf8; font-weight: 600;">${department}</td>
        </tr>
        <tr style="border-bottom: 1px solid #1e293b;">
          <td style="padding: 10px 0; color: #94a3b8;">Customer Name:</td>
          <td style="padding: 10px 0; color: #ffffff; font-weight: 600;">${senderName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #1e293b;">
          <td style="padding: 10px 0; color: #94a3b8;">Customer Email:</td>
          <td style="padding: 10px 0; color: #38bdf8; font-weight: 600;">
            <a href="mailto:${email}" style="color: #38bdf8; text-decoration: none;">${email}</a>
          </td>
        </tr>
        <tr style="border-bottom: 1px solid #1e293b;">
          <td style="padding: 10px 0; color: #94a3b8;">Phone Number:</td>
          <td style="padding: 10px 0; color: #ffffff;">${senderPhone}</td>
        </tr>
        <tr style="border-bottom: 1px solid #1e293b;">
          <td style="padding: 10px 0; color: #94a3b8;">Organization / Company:</td>
          <td style="padding: 10px 0; color: #ffffff;">${senderCompany}</td>
        </tr>
        <tr style="border-bottom: 1px solid #1e293b;">
          <td style="padding: 10px 0; color: #94a3b8;">Submitted Date & Time:</td>
          <td style="padding: 10px 0; color: #cbd5e1;">${submittedTimeIST} IST</td>
        </tr>
        <tr style="border-bottom: 1px solid #1e293b;">
          <td style="padding: 10px 0; color: #94a3b8;">Subject:</td>
          <td style="padding: 10px 0; color: #ffffff; font-weight: 600;">${cleanSubject}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #94a3b8;">Target Response SLA:</td>
          <td style="padding: 10px 0; color: #4ade80; font-weight: 600;">${slaTimeline}</td>
        </tr>
      </table>

      <!-- Message Content -->
      <h3 style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">
        Message Details
      </h3>
      <div style="background-color: #020817; border: 1px solid #1e293b; border-radius: 12px; padding: 18px; color: #e2e8f0; font-size: 14px; line-height: 1.6; white-space: pre-wrap; word-break: break-word;">
${message}
      </div>

      <div style="margin-top: 24px; padding-top: 18px; border-top: 1px dashed #334155; text-align: center;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
          💡 <strong>One-Click Response:</strong> Click "Reply" in Zoho Mail to respond directly to <strong>${email}</strong>.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #020817; padding: 16px 30px; text-align: center; border-top: 1px solid #1e293b;">
      <p style="color: #64748b; font-size: 11px; margin: 0;">
        Vote Secure • Bandra Kurla Complex (BKC), Mumbai 400051, India • <a href="https://www.shareholdervoting.in" style="color: #0284c7; text-decoration: none;">www.shareholdervoting.in</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

    // -------------------------------------------------------------
    // 2. Comprehensive Automated Acknowledgment Email (Sent to Customer)
    // -------------------------------------------------------------
    const customerAckHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Request has been Received [Ticket #${ticketId}]</title>
</head>
<body style="margin: 0; padding: 0; background-color: #020817; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <div style="max-width: 620px; margin: 20px auto; background-color: #0d1b2a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
    
    <!-- Top Brand Header -->
    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #0284c7 100%); padding: 32px 30px; text-align: center;">
      <div style="display: inline-block; width: 52px; height: 52px; background: rgba(255,255,255,0.18); border-radius: 14px; line-height: 52px; font-size: 26px; color: #ffffff; margin-bottom: 12px;">
        🛡️
      </div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff;">
        Request Submitted Successfully
      </h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #bae6fd;">
        Vote Secure • Enterprise E-Voting Platform & Shareholder Services
      </p>
    </div>

    <div style="padding: 32px 30px;">
      <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 12px 0;">Dear ${senderName},</h2>
      
      <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
        Thank you for getting in touch with <strong>Vote Secure</strong>. We have received your inquiry and generated an official tracking reference number for your submission.
      </p>

      <!-- Ticket Details Card -->
      <div style="background-color: #020817; border: 1px solid #38bdf8/30; border-radius: 14px; padding: 22px; margin-bottom: 24px;">
        <div style="border-bottom: 1px solid #1e293b; padding-bottom: 12px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">
            Official Query Reference ID:
          </span>
          <span style="color: #38bdf8; font-size: 16px; font-family: monospace; font-weight: 800;">
            #${ticketId}
          </span>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #94a3b8; width: 42%;">Category:</td>
            <td style="padding: 6px 0; color: #ffffff; font-weight: 600;">${inquiryLabel}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Assigned Department:</td>
            <td style="padding: 6px 0; color: #38bdf8; font-weight: 500;">${department}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Submitted On:</td>
            <td style="padding: 6px 0; color: #cbd5e1;">${submittedTimeIST} IST</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Target Response SLA:</td>
            <td style="padding: 6px 0; color: #4ade80; font-weight: 700;">${slaTimeline}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Subject:</td>
            <td style="padding: 6px 0; color: #ffffff; font-weight: 500;">${cleanSubject}</td>
          </tr>
        </table>
      </div>

      <!-- Submitted Message Copy -->
      <h3 style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">
        Summary of Your Message:
      </h3>
      <div style="background-color: #020817; border: 1px solid #1e293b; border-radius: 10px; padding: 14px 18px; color: #cbd5e1; font-size: 13px; line-height: 1.6; margin-bottom: 24px; white-space: pre-wrap; word-break: break-word;">
${message}
      </div>

      <!-- Process Steps -->
      <div style="background-color: rgba(30, 58, 138, 0.25); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 12px; padding: 18px; margin-bottom: 24px;">
        <h4 style="color: #38bdf8; font-size: 13px; margin: 0 0 10px 0; font-weight: 700;">What Happens Next?</h4>
        <ol style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 12px; line-height: 1.8;">
          <li><strong>Ticket Logged:</strong> Your request is routed to a dedicated support officer in our ${department}.</li>
          <li><strong>Review & Resolution:</strong> We will review your submission in accordance with our ${slaTimeline} commitment.</li>
          <li><strong>Direct Communication:</strong> You will receive an official response directly on this email thread.</li>
        </ol>
      </div>

      <div style="background-color: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 10px; padding: 14px 16px; margin-bottom: 24px;">
        <p style="color: #34d399; font-size: 12px; margin: 0; line-height: 1.5;">
          💬 <strong>Need to provide more details, folio numbers, or attachments?</strong><br/>
          Simply reply directly to this email and keep the subject line intact with your Reference ID <strong>#${ticketId}</strong>.
        </p>
      </div>

      <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.6;">
        Warm regards,<br/>
        <strong style="color: #94a3b8;">Vote Secure Support & Corporate Governance Team</strong><br/>
        <span style="font-size: 11px;">Bandra Kurla Complex (BKC), Mumbai, Maharashtra 400051, India</span>
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #020817; padding: 18px 30px; text-align: center; border-top: 1px solid #1e293b;">
      <p style="color: #64748b; font-size: 11px; margin: 0 0 6px 0;">
        Vote Secure • SEBI & Companies Act 2013 Compliant E-Voting Platform
      </p>
      <p style="color: #475569; font-size: 10px; margin: 0;">
        Support Desk: <a href="mailto:support@shareholdervoting.in" style="color: #0284c7; text-decoration: none;">support@shareholdervoting.in</a> | Corporate: <a href="mailto:admin@shareholdervoting.in" style="color: #0284c7; text-decoration: none;">admin@shareholdervoting.in</a> | <a href="https://www.shareholdervoting.in" style="color: #0284c7; text-decoration: none;">www.shareholdervoting.in</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

    // -------------------------------------------------------------
    // 1. Dispatch Internal Alert to Official Zoho Mail Inboxes
    // -------------------------------------------------------------
    const internalRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `Vote Secure Desk <${primaryInbox}>`,
        to: teamRecipients,
        reply_to: email,
        subject: `[Ticket #${ticketId}] [${inquiryLabel}] ${cleanSubject}`,
        html: internalEmailHtml,
      }),
    });

    if (!internalRes.ok) {
      const errText = await internalRes.text();
      console.error("Internal Resend API Error:", errText);
      throw new Error(`Failed to deliver internal notification: ${errText}`);
    }

    const internalData = await internalRes.json();

    // -------------------------------------------------------------
    // 2. Dispatch Customer Acknowledgment Email with Ticket ID
    // -------------------------------------------------------------
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Vote Secure Support <support@shareholdervoting.in>",
          to: [email],
          reply_to: "support@shareholdervoting.in",
          subject: `[Ticket #${ticketId}] Your inquiry has been received - Vote Secure`,
          html: customerAckHtml,
        }),
      });
    } catch (ackError) {
      console.warn("Customer confirmation email non-fatal error:", ackError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: internalData.id,
        ticketId: ticketId,
        inquiryType: inquiryType,
        department: department,
        sla: slaTimeline,
        recipients: teamRecipients
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in send-contact-message:", error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
