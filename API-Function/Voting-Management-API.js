/**
 * ============================================================================
 * ROUTE: VOTING MANAGEMENT & GOVERNANCE HUB
 * Path: /voting-management
 * ============================================================================
 * Handles corporate voting lifecycle operations: scheduling AGM/EGM events,
 * statutory Rule 20 timeline enforcement, director candidate nominations,
 * agenda resolutions, meeting invitation dispatches, and real-time scrutinizer tallies.
 */

import { supabase } from "@/integrations/supabase/client";

export const VotingManagementAPI = {
    /**
     * 1. GET ALL VOTING SESSIONS FOR COMPANY
     * Loads corporate events (AGM, EGM, Postal Ballot) in descending order.
     */
    getSessions: async (companyId) => {
        const { data, error } = await supabase
            .from("voting_sessions")
            .select("*")
            .eq("company_id", companyId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * 2. CREATE OR UPDATE VOTING SESSION SCHEDULE
     * Validates and updates statutory timelines (voting_start, voting_end, meeting_date, record_date).
     * Synchronizes dual columns (start_date/voting_start, end_date/voting_end) and session status.
     */
    saveSessionSchedule: async (companyId, sessionId, schedulePayload) => {
        const now = new Date();
        const vStart = new Date(schedulePayload.voting_start);
        const vEnd = new Date(schedulePayload.voting_end);
        const isLive = now >= vStart && now <= vEnd;
        const isFinished = now > vEnd;

        const payload = {
            company_id: companyId,
            title: schedulePayload.title.trim(),
            description: schedulePayload.description?.trim() || null,
            event_type: schedulePayload.event_type || "AGM",
            voting_start: schedulePayload.voting_start,
            voting_end: schedulePayload.voting_end,
            meeting_date: schedulePayload.meeting_date || null,
            meeting_end_date: schedulePayload.meeting_end_date || null,
            notice_date: schedulePayload.notice_date || null,
            record_date: schedulePayload.record_date || null,
            meeting_link: schedulePayload.meeting_link || null,
            meeting_password: schedulePayload.meeting_password || null,
            meeting_platform: schedulePayload.meeting_platform || "zoom",
            voting_instructions: schedulePayload.voting_instructions || null,
            status: isLive ? "open" : (isFinished ? "closed" : "published"),
            is_active: isLive,
        };

        if (sessionId) {
            const { data, error } = await supabase
                .from("voting_sessions")
                .update(payload)
                .eq("id", sessionId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase
                .from("voting_sessions")
                .insert(payload)
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    },

    /**
     * 3. TRANSITION SESSION LIFECYCLE (OPEN / CLOSE / UNSEAL)
     * Transitions session state between 'published', 'open', and 'closed'.
     */
    updateSessionStatus: async (sessionId, newStatus) => {
        const now = new Date();
        const updates = { status: newStatus };

        if (newStatus === "open") {
            updates.is_active = true;
            updates.voting_start = now.toISOString();
            updates.start_date = now.toISOString();
        } else if (newStatus === "closed") {
            updates.is_active = false;
            updates.voting_end = now.toISOString();
            updates.end_date = now.toISOString();
        }

        const { data, error } = await supabase
            .from("voting_sessions")
            .update(updates)
            .eq("id", sessionId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * 4. ADD BALLOT RESOLUTION
     * Inserts an Ordinary, Special, or Unanimous resolution into the session.
     */
    addResolution: async (sessionId, resolution) => {
        const { data, error } = await supabase
            .from("resolutions")
            .insert({
                voting_session_id: sessionId,
                title: resolution.title.trim(),
                description: resolution.description.trim(),
                resolution_type: resolution.resolutionType || "ordinary",
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * 5. DELETE BALLOT RESOLUTION
     * Deletes a resolution and cascades its recorded votes.
     */
    deleteResolution: async (resolutionId) => {
        await supabase.from("votes").delete().eq("resolution_id", resolutionId);
        const { error } = await supabase.from("resolutions").delete().eq("id", resolutionId);
        if (error) throw error;
        return true;
    },

    /**
     * 6. ADD DIRECTOR NOMINEE & AUTO-SYNC RESOLUTION
     * Adds candidate to `nominees` table and automatically creates a corresponding
     * ballot resolution for director election under Sections 152 & 162.
     */
    addNominee: async (sessionId, nominee) => {
        const { data: nomData, error: nomErr } = await supabase
            .from("nominees")
            .insert({
                voting_session_id: sessionId,
                nominee_name: nominee.name.trim(),
                designation: nominee.designation?.trim() || "Director",
                qualification: nominee.qualification?.trim() || null,
                experience_years: parseInt(nominee.experienceYears) || 0,
                bio: nominee.bio?.trim() || null,
            })
            .select()
            .single();

        if (nomErr) throw nomErr;

        // Auto-create ballot resolution for this nominee
        await supabase.from("resolutions").insert({
            id: nomData.id,
            voting_session_id: sessionId,
            title: `Election of Director: ${nomData.nominee_name}`,
            description: `Candidate: ${nomData.nominee_name} | Proposed Designation: ${nomData.designation}`,
            resolution_type: "director_election",
        });

        return nomData;
    },

    /**
     * 7. DISPATCH MEETING INVITATIONS TO SHAREHOLDERS
     * Sends official email notices with join links and secure credentials.
     */
    sendMeetingInvites: async (session, company, shareholders) => {
        const recipients = shareholders.map(s => ({
            email: s.email,
            name: s.shareholder_name,
            shares: s.shares_held,
            loginId: s.login_id,
            voterToken: s.login_id,
        }));

        const invitePayload = {
            sessionId: session.id,
            companyName: company.company_name,
            meetingTitle: session.title,
            meetingLink: session.meeting_link || "https://vote-india-secure.web.app",
            meetingPassword: session.meeting_password || "N/A",
            meetingPlatform: session.meeting_platform || "Online Conference",
            startDate: session.voting_start || session.start_date,
            endDate: session.voting_end || session.end_date,
            recipients: recipients,
        };

        // 1. Try local Vite proxy
        try {
            const res = await fetch("/api/send-meeting-invites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(invitePayload),
            });
            if (res.ok) {
                await supabase.from("voting_sessions").update({ is_meeting_emails_sent: true }).eq("id", session.id);
                return await res.json();
            }
        } catch {}

        // 2. Direct Edge Function fallback
        const { data, error } = await supabase.functions.invoke("send-meeting-invites", {
            body: invitePayload
        });

        if (error) throw error;
        await supabase.from("voting_sessions").update({ is_meeting_emails_sent: true }).eq("id", session.id);
        return data;
    },

    /**
     * 8. GET LIVE SCRUTINIZER TALLIES & STATUTORY RESULTS
     * Calculates FOR, AGAINST, ABSTAIN totals, share weights, and checks Section 114
     * statutory majority (Special ≥ 75%, Ordinary > 50%).
     */
    getSessionResults: async (sessionId) => {
        const { data: resolutions, error: resErr } = await supabase
            .from("resolutions")
            .select("*")
            .eq("voting_session_id", sessionId);

        if (resErr) throw resErr;

        return await Promise.all((resolutions || []).map(async (res) => {
            const { data: votes } = await supabase
                .from("votes")
                .select("vote_value, weighted_votes")
                .eq("resolution_id", res.id);

            let forCount = 0, againstCount = 0, abstainCount = 0;
            (votes || []).forEach(v => {
                const weight = v.weighted_votes || 1;
                const val = (v.vote_value || "").toUpperCase();
                if (val === "FOR") forCount += weight;
                else if (val === "AGAINST") againstCount += weight;
                else if (val === "ABSTAIN") abstainCount += weight;
            });

            const validVotes = forCount + againstCount;
            const isWinner = res.resolution_type === "special"
                ? (validVotes > 0 && forCount >= 3 * againstCount)
                : (forCount > againstCount);

            return {
                id: res.id,
                title: res.title,
                description: res.description,
                resolution_type: res.resolution_type,
                stats: {
                    for: forCount,
                    against: againstCount,
                    abstain: abstainCount,
                    total: forCount + againstCount + abstainCount,
                    winner: isWinner,
                }
            };
        }));
    }
};

