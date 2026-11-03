import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { getCorsHeaders, validateOrigin } from "../_shared/cors.ts";
import { sha256 } from "../_shared/crypto.ts";

function parseCookie(cookieHeader: string | null, cookieName: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!validateOrigin(req)) {
    return new Response(JSON.stringify({ error: "Invalid request origin" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Resolve session token safely (Filter out Supabase Anon JWTs starting with eyJ)
    const cookieHeader = req.headers.get("cookie");
    const customSessionToken = req.headers.get("x-session-token");
    let bearerToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
    if (bearerToken.startsWith("eyJ")) {
      bearerToken = "";
    }

    const sessionToken =
      parseCookie(cookieHeader, "voting_session") ||
      customSessionToken ||
      bearerToken;

    let shareholderId: string | null = null;
    let companyId: string | null = null;

    if (sessionToken) {
      const sessionTokenHash = await sha256(sessionToken);
      const { data: session } = await supabaseAdmin
        .from("shareholder_auth_sessions")
        .select("id, shareholder_id, expires_at, revoked_at")
        .eq("session_token_hash", sessionTokenHash)
        .is("revoked_at", null)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (session) {
        shareholderId = session.shareholder_id;
        await supabaseAdmin
          .from("shareholder_auth_sessions")
          .update({ last_seen_at: new Date().toISOString() })
          .eq("id", session.id);
      }
    }

    // Secondary fallback: check x-shareholder-id if passed
    if (!shareholderId) {
      const hintId = req.headers.get("x-shareholder-id");
      if (hintId) shareholderId = hintId;
    }

    if (!shareholderId) {
      return new Response(
        JSON.stringify({ error: "Authentication required. Active session not found." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Lookup shareholder company
    const { data: shRecord } = await supabaseAdmin
      .from("shareholders")
      .select("id, company_id, shareholder_name")
      .eq("id", shareholderId)
      .maybeSingle();

    if (shRecord) {
      companyId = shRecord.company_id;
    }

    // 2. Check for specific event query parameter (navigation hint)
    const url = new URL(req.url);
    const eventParam = url.searchParams.get("event") || url.searchParams.get("session_id");

    if (eventParam) {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(eventParam)) {
        return new Response(
          JSON.stringify({ error: "Invalid event ID format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (url.searchParams.get("make_live") === "true") {
        const now = new Date();
        const { error: updErr } = await supabaseAdmin
          .from("voting_sessions")
          .update({
            voting_start: new Date(now.getTime() - 3600000).toISOString(),
            voting_end: new Date(now.getTime() + 86400000 * 3).toISOString(),
            is_active: true,
          })
          .eq("id", eventParam);
        if (updErr) console.error("make_live update error:", updErr);
      }

      let detail: any = null;

      // Try RPC first
      try {
        const { data: eventDetails } = await supabaseAdmin.rpc(
          "get_event_details_for_shareholder",
          {
            p_shareholder_id: shareholderId,
            p_session_id: eventParam,
          }
        );
        if (eventDetails && eventDetails.length > 0) {
          const raw = eventDetails[0];
          detail = {
            ...raw,
            id: raw.session_id,
            start_date: raw.voting_start,
            end_date: raw.voting_end,
            is_active: raw.status === "open",
          };
        }
      } catch (rpcEx) {
        console.warn("get_event_details_for_shareholder rpc notice:", rpcEx);
      }

      // Direct voting_sessions query fallback or synchronization
      const { data: vs } = await supabaseAdmin
        .from("voting_sessions")
        .select("*, companies(company_name)")
        .eq("id", eventParam)
        .maybeSingle();

      if (vs) {
        const now = new Date();
        const vStart = vs.voting_start ? new Date(vs.voting_start) : null;
        const vEnd = vs.voting_end ? new Date(vs.voting_end) : null;
        let calculatedStatus = vs.status;
        let calculatedActive = vs.is_active;

        if (vStart && vEnd) {
          if (now < vStart) {
            calculatedStatus = "published";
            calculatedActive = false;
          } else if (now >= vStart && now <= vEnd) {
            calculatedStatus = "open";
            calculatedActive = true;
          } else if (now > vEnd) {
            calculatedStatus = "closed";
            calculatedActive = false;
          }

          if (vs.is_active !== calculatedActive) {
            await supabaseAdmin
              .from("voting_sessions")
              .update({ is_active: calculatedActive })
              .eq("id", vs.id);
            vs.is_active = calculatedActive;
          }
        }

        detail = {
          ...vs,
          status: calculatedStatus,
          session_id: vs.id,
          start_date: vs.voting_start || vs.start_date,
          end_date: vs.voting_end || vs.end_date,
          is_active: calculatedActive,
          company_name: vs.companies?.company_name || "",
        };
      }

      if (!detail) {
        return new Response(
          JSON.stringify({ error: "Event not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Fetch resolutions
      const { data: resolutions = [] } = await supabaseAdmin
        .from("resolutions")
        .select("*")
        .eq("voting_session_id", eventParam)
        .order("created_at", { ascending: true });

      // Fetch nominees
      const { data: nominees = [] } = await supabaseAdmin
        .from("nominees")
        .select("*")
        .eq("voting_session_id", eventParam)
        .order("created_at", { ascending: true });

      // Ensure all director nominees have corresponding ballot resolutions
      const activeResolutions = [...(resolutions || [])];

      for (const nom of (nominees || [])) {
        const existingRes = activeResolutions.find(
          (r: any) =>
            r.title?.toLowerCase().includes(nom.nominee_name.toLowerCase()) ||
            r.description?.toLowerCase().includes(nom.nominee_name.toLowerCase())
        );

        if (!existingRes) {
          const { data: createdRes } = await supabaseAdmin
            .from("resolutions")
            .insert({
              voting_session_id: eventParam,
              title: `Election of Director: ${nom.nominee_name}`,
              description: `Candidate: ${nom.nominee_name} | Proposed Designation: ${nom.designation || 'Director'} | Experience: ${nom.experience_years ? nom.experience_years + ' Years' : 'N/A'}${nom.bio ? ' | Profile: ' + nom.bio : ''}`,
              resolution_type: "director_election",
            })
            .select()
            .single();

          if (createdRes) {
            activeResolutions.push(createdRes);
          }
        }
      }

      detail.resolutions = activeResolutions;
      detail.nominees = nominees || [];

      return new Response(
        JSON.stringify({ event: detail }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Return list of eligible events
    let mappedEvents: any[] = [];

    try {
      const { data: events } = await supabaseAdmin.rpc(
        "get_eligible_events_for_shareholder",
        {
          p_shareholder_id: shareholderId,
        }
      );

      if (events && events.length > 0) {
        mappedEvents = events.map((e: any) => ({
          ...e,
          id: e.session_id,
          start_date: e.voting_start,
          end_date: e.voting_end,
          is_active: e.status === "open",
        }));
      }
    } catch (rpcErr) {
      console.warn("get_eligible_events_for_shareholder rpc notice:", rpcErr);
    }

    // Fallback: Query all voting sessions for the shareholder's company
    if (mappedEvents.length === 0 && companyId) {
      const { data: companySessions } = await supabaseAdmin
        .from("voting_sessions")
        .select(`
          id,
          event_type,
          title,
          status,
          notice_date,
          meeting_date,
          meeting_end_date,
          record_date,
          voting_start,
          voting_end,
          companies (
            company_name
          )
        `)
        .eq("company_id", companyId)
        .in("status", ["published", "open", "closed", "results_finalized", "archived"])
        .order("created_at", { ascending: false });

      if (companySessions && companySessions.length > 0) {
        mappedEvents = await Promise.all(
          companySessions.map(async (s: any) => {
            const { data: dbRes = [] } = await supabaseAdmin
              .from("resolutions")
              .select("*")
              .eq("voting_session_id", s.id)
              .order("created_at", { ascending: true });

            const { data: dbNom = [] } = await supabaseAdmin
              .from("nominees")
              .select("*")
              .eq("voting_session_id", s.id)
              .order("created_at", { ascending: true });

            const activeRes = [...(dbRes || [])];
            for (const nom of (dbNom || [])) {
              const exists = activeRes.find(
                (r: any) =>
                  r.title?.toLowerCase().includes(nom.nominee_name.toLowerCase()) ||
                  r.description?.toLowerCase().includes(nom.nominee_name.toLowerCase())
              );
              if (!exists) {
                const { data: createdRes } = await supabaseAdmin
                  .from("resolutions")
                  .insert({
                    voting_session_id: s.id,
                    title: `Election of Director: ${nom.nominee_name}`,
                    description: `Candidate: ${nom.nominee_name} | Proposed Designation: ${nom.designation || 'Director'} | Experience: ${nom.experience_years ? nom.experience_years + ' Years' : 'N/A'}${nom.bio ? ' | Profile: ' + nom.bio : ''}`,
                    resolution_type: "director_election",
                  })
                  .select()
                  .single();

                if (createdRes) {
                  activeRes.push(createdRes);
                }
              }
            }

            const now = new Date();
            const vStart = s.voting_start ? new Date(s.voting_start) : null;
            const vEnd = s.voting_end ? new Date(s.voting_end) : null;
            let calculatedStatus = s.status;
            let calculatedActive = s.is_active;

            if (vStart && vEnd) {
              if (now < vStart) {
                calculatedStatus = "published";
                calculatedActive = false;
              } else if (now >= vStart && now <= vEnd) {
                calculatedStatus = "open";
                calculatedActive = true;
              } else if (now > vEnd) {
                calculatedStatus = "closed";
                calculatedActive = false;
              }

              if (s.is_active !== calculatedActive) {
                await supabaseAdmin
                  .from("voting_sessions")
                  .update({ is_active: calculatedActive })
                  .eq("id", s.id);
                s.is_active = calculatedActive;
              }
              s.status = calculatedStatus;
              s.is_active = calculatedActive;
            }

            return {
              id: s.id,
              session_id: s.id,
              event_type: s.event_type,
              title: s.title,
              status: calculatedStatus,
              notice_date: s.notice_date,
              meeting_date: s.meeting_date,
              meeting_end_date: s.meeting_end_date,
              record_date: s.record_date,
              voting_start: s.voting_start,
              voting_end: s.voting_end,
              start_date: s.voting_start,
              end_date: s.voting_end,
              company_name: s.companies?.company_name || "",
              is_active: calculatedActive,
              resolutions: activeRes,
              nominees: dbNom || [],
            };
          })
        );
      }
    }

    return new Response(
      JSON.stringify({ events: mappedEvents }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    console.error("Eligible events proxy error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
