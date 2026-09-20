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

    // 1. Validate HttpOnly session cookie
    const cookieHeader = req.headers.get("cookie");
    const sessionToken = parseCookie(cookieHeader, "voting_session");

    if (!sessionToken) {
      return new Response(
        JSON.stringify({ error: "Authentication required. No active session cookie found." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sessionTokenHash = await sha256(sessionToken);
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 2. Validate session in database
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("shareholder_auth_sessions")
      .select("id, shareholder_id, expires_at, revoked_at")
      .eq("session_token_hash", sessionTokenHash)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired session. Please authenticate again." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update last_seen_at
    await supabaseAdmin
      .from("shareholder_auth_sessions")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", session.id);

    // 3. Check for specific event query parameter (navigation hint)
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

      // Server re-authorizes shareholder's eligibility for this specific event
      const { data: eventDetails, error: detailError } = await supabaseAdmin.rpc(
        "get_event_details_for_shareholder",
        {
          p_shareholder_id: session.shareholder_id,
          p_session_id: eventParam,
        }
      );

      if (detailError) {
        console.error("Error fetching event details:", detailError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch event details" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!eventDetails || eventDetails.length === 0) {
        return new Response(
          JSON.stringify({ error: "Event not found or access not permitted" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Fetch resolutions for this verified event
      const { data: resolutions } = await supabaseAdmin
        .from("resolutions")
        .select("*")
        .eq("voting_session_id", eventParam)
        .order("created_at", { ascending: true });

      const raw = eventDetails[0];
      const detail = {
        ...raw,
        id: raw.session_id,
        start_date: raw.voting_start,
        end_date: raw.voting_end,
        is_active: raw.status === "open",
        resolutions: resolutions || [],
      };

      return new Response(
        JSON.stringify({ event: detail }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Return list of all eligible events for the authenticated shareholder
    const { data: events, error: eventsError } = await supabaseAdmin.rpc(
      "get_eligible_events_for_shareholder",
      {
        p_shareholder_id: session.shareholder_id,
      }
    );

    if (eventsError) {
      console.error("Error fetching eligible events:", eventsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch eligible events" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedEvents = (events || []).map((e: any) => ({
      ...e,
      id: e.session_id,
      start_date: e.voting_start,
      end_date: e.voting_end,
      is_active: e.status === "open",
    }));

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
