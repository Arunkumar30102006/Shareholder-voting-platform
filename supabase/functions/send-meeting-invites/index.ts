import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MeetingInviteRequest {
  votingSessionId: string;
  companyName: string;
  meetingTitle: string;
  meetingLink: string;
  meetingPassword?: string;
  meetingPlatform: string;
  startDate: string;
  endDate: string;
  votingInstructions?: string;
  recipients: Array<{
    email: string;
    name: string;
    type: "shareholder" | "nominee";
    shares?: number;
  }>;
}

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Authenticate caller via Supabase JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication credentials required" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const token = authHeader.replace(/^Bearer\s+/i, "");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

      if (userError || !user) {
        return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Verify caller is a company admin
      const { data: adminRecord } = await supabaseAdmin
        .from("company_admins")
        .select("company_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!adminRecord) {
        return new Response(JSON.stringify({ error: "Caller is not an authorized company administrator" }), {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }

    const {
      votingSessionId,
      companyName,
      meetingTitle,
      meetingLink,
      meetingPassword,
      meetingPlatform,
      startDate,
      endDate,
      votingInstructions,
      recipients,
    }: MeetingInviteRequest = await req.json();

    console.log(`Sending meeting invites for session: ${votingSessionId}`);
    console.log(`Total recipients: ${recipients.length}`);

    if (!recipients || recipients.length === 0) {
      throw new Error("No recipients provided");
    }

    // 1. Generate Base Email Template
    const getHtmlTemplate = (recipientName: string, isNominee: boolean, totalShares?: number) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${meetingTitle}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header Area -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 48px 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">
                ${isNominee ? "📋 Nomination Notification" : "🗳️ Meeting & Voting Invitation"}
              </h1>
              <div style="height: 4px; width: 40px; background: #f59e0b; margin: 16px auto;"></div>
              <p style="color: #bfdbfe; margin: 0; font-size: 16px; font-weight: 500;">
                ${companyName}
              </p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <p style="font-size: 18px; font-weight: 600; color: #0f172a; margin: 0 0 16px;">
                Dear ${recipientName},
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #475569; margin: 0 0 24px;">
                ${isNominee
        ? `We are pleased to inform you that you have been <strong>nominated</strong> for the upcoming voting session. Your participation is requested at the scheduled meeting.`
        : `You are cordially invited to participate in the <strong>Annual General Meeting (AGM)</strong> and exercise your voting rights. ${totalShares ? `Represents: <strong>${totalShares.toLocaleString()}</strong> shares.` : ""}`
      }
              </p>
              
              <!-- Meeting Details Block -->
              <div style="background-color: #f1f5f9; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0; margin-bottom: 32px;">
                <h2 style="color: #1e3a8a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 16px; font-weight: 700;">
                  📅 Meeting Logistics
                </h2>
                
                <table width="100%" style="font-size: 14px; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; width: 100px;">Session:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${meetingTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b;">Starts:</td>
                    <td style="padding: 8px 0; color: #059669; font-weight: 600;">${formatDateTime(startDate)} IST</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b;">Platform:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-transform: capitalize;">${meetingPlatform}</td>
                  </tr>
                  ${meetingPassword ? `
                  <tr>
                    <td style="padding: 8px 0; color: #64748b;">Passcode:</td>
                    <td style="padding: 8px 0;"><code style="background: #cbd5e1; padding: 2px 6px; border-radius: 4px; color: #0f172a;">${meetingPassword}</code></td>
                  </tr>
                  ` : ""}
                </table>
              </div>
              
              <!-- Primary Action -->
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${meetingLink}" style="display: inline-block; background-color: #f59e0b; color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 12px; font-size: 16px; font-weight: 700; box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.4);">
                  🔗 Join Online Meeting
                </a>
                <p style="margin-top: 16px; color: #94a3b8; font-size: 12px;">
                  Direct Link: <a href="${meetingLink}" style="color: #3b82f6;">${meetingLink}</a>
                </p>
              </div>

              ${votingInstructions ? `
                <!-- Important Guidelines -->
                <div style="border-left: 4px solid #f59e0b; padding: 16px 20px; background: #fffbeb; margin-bottom: 32px;">
                  <h3 style="color: #92400e; font-size: 15px; margin: 0 0 8px; font-weight: 700;">Voting Instructions</h3>
                  <p style="color: #b45309; font-size: 13px; line-height: 1.5; margin: 0; white-space: pre-line;">${votingInstructions}</p>
                </div>
              ` : ""}

              <div style="font-size: 13px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 24px; text-align: center;">
                Please ensure you join with a stable internet connection. Credentials for voting will be requested during the session.
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 12px; margin: 0 0 8px;">
                Sent on behalf of <strong>${companyName}</strong> via Vote India Secure
              </p>
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                To ensure delivery, add notifications@shareholdervoting.in to your contacts.
              </p>
              <div style="margin-top: 16px; font-size: 10px; color: #cbd5e1;">
                &copy; ${new Date().getFullYear()} shareholdervoting.in
              </div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // 2. Sequential Batch Processing (Optimized for Deliverability)
    const BATCH_SIZE = 5; // Reduced batch size for even better reliability
    const allResults = [];

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(recipients.length / BATCH_SIZE)}...`);

      const batchPromises = batch.map(async (recipient) => {
        try {
          const isNominee = recipient.type === "nominee";
          const res = await resend.emails.send({
            from: `"${companyName} (via Vote India)" <notifications@shareholdervoting.in>`,
            to: recipient.email,
            subject: isNominee
              ? `[Nomination] - ${meetingTitle} - ${companyName}`
              : `[Action Required] AGM & Voting Invite - ${companyName}`,
            html: getHtmlTemplate(recipient.name, isNominee, recipient.shares),
            headers: {
              "X-Entity-Ref-ID": `${votingSessionId}-${recipient.email}`,
              "Precedence": "bulk"
            }
          });

          return { success: true, email: recipient.email, id: res.id };
        } catch (emailError: unknown) {
          const errMsg = emailError instanceof Error ? emailError.message : "Delivery failed";
          console.error(`Failed delivery to ${recipient.email}:`, emailError);
          return { success: false, email: recipient.email, error: errMsg };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      allResults.push(...batchResults);

      // Short delay between batches to respect SMTP reputation
      if (i + BATCH_SIZE < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    const successCount = allResults.filter(r => r.success).length;
    const failedCount = allResults.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failedCount,
        results: allResults
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal server error";
    console.error("Error in send-meeting-invites function:", error);
    return new Response(
      JSON.stringify({ error: errorMsg }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
