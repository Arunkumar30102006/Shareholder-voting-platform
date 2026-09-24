import { supabase } from "@/integrations/supabase/client";
import { authSession } from "@/lib/authSession";
import { Shareholder, VotingSession, Resolution, VoteRecord, VoteType, EligibleEventSummary, EligibleEventDetail } from "@/types/voting";

export interface CastVoteResult {
  vote_id: string;
  receipt_hash: string;
  weighted_votes: number;
  timestamp: string;
}

export const votingApi = {
  /**
   * Initiates authentication challenge for a shareholder.
   * Returns generic message and opaque challenge_id (anti-enumeration).
   */
  initiateAuth: async (
    identifier: string,
    pan: string,
    turnstileToken?: string
  ): Promise<{ message: string; challenge_id: string }> => {
    const res = await fetch("/api/auth/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier,
        pan,
        turnstile_token: turnstileToken || "",
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to initiate login" }));
      throw new Error(err.error || "Authentication failed");
    }

    return res.json();
  },

  /**
   * Verifies the 6-digit OTP against the challenge.
   * On success, server issues HttpOnly session cookie and returns CSRF token.
   */
  verifyOtp: async (challengeId: string, otp: string): Promise<{ success: boolean; csrf_token: string }> => {
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challenge_id: challengeId, otp }),
    });

    const data = await res.json().catch(() => ({ error: "Verification failed" }));

    if (!res.ok) {
      throw new Error(data.error || "Passcode verification failed");
    }

    if (data.csrf_token) {
      authSession.setSession(data.csrf_token, null);
    }

    return data;
  },

  /**
   * Retrieves current authenticated shareholder session via HttpOnly cookie.
   */
  checkSession: async () => {
    try {
      const res = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) return { authenticated: false };
      const data = await res.json();

      if (data.authenticated && data.csrf_token) {
        authSession.setSession(data.csrf_token, data.shareholder);
      }

      return data;
    } catch {
      return { authenticated: false };
    }
  },

  /**
   * Revokes current voting session and clears HttpOnly cookie.
   */
  logout: async (): Promise<boolean> => {
    try {
      await fetch("/api/auth/session/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      authSession.clearSession();
    }
    return true;
  },

  /**
   * Casts an authorized vote via same-site API endpoint.
   * Browser passes HttpOnly cookie automatically and includes X-CSRF-Token header.
   */
  castVote: async (
    resolutionId: string,
    voteValue: VoteType,
    proxyDelegationId?: string | null
  ): Promise<CastVoteResult> => {
    const csrfToken = authSession.getCsrfToken();
    if (!csrfToken) {
      throw new Error("Missing CSRF security token. Please refresh your session.");
    }

    const res = await fetch("/api/cast-vote", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify({
        resolution_id: resolutionId,
        vote_value: voteValue,
        proxy_delegation_id: proxyDelegationId || null,
      }),
    });

    const data = await res.json().catch(() => ({ error: "Failed to cast vote" }));

    if (!res.ok) {
      throw new Error(data.error || "Failed to submit ballot");
    }

    return data.receipt;
  },

  /**
   * Retrieves all eligible voting events for the current authenticated shareholder.
   * Server resolves shareholder_id from HttpOnly session cookie (anti-tamper invariant).
   */
  getEligibleEvents: async (): Promise<EligibleEventSummary[]> => {
    const res = await fetch("/api/eligible-events", {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
      }
      const err = await res.json().catch(() => ({ error: "Failed to fetch eligible events" }));
      throw new Error(err.error || "Failed to fetch eligible events");
    }

    const data = await res.json();
    return data.events || [];
  },

  /**
   * Retrieves detailed event data and resolutions for a specific event hint.
   * Server validates enrollment and re-authorizes access server-side.
   */
  getEventDetails: async (sessionId: string): Promise<EligibleEventDetail> => {
    const res = await fetch(`/api/eligible-events?event=${encodeURIComponent(sessionId)}`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
      }
      const err = await res.json().catch(() => ({ error: "Failed to fetch event details" }));
      throw new Error(err.error || "Failed to fetch event details");
    }

    const data = await res.json();
    return data.event;
  },

  getShareholder: async (id: string): Promise<Shareholder> => {
    const { data, error } = await supabase
      .from("shareholders")
      .select("*, companies(*)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * @deprecated Use votingApi.getEligibleEvents() instead.
   * Legacy query that blindly picked the latest session for a company.
   */
  getActiveSession: async (companyId: string): Promise<VotingSession | null> => {
    const { data, error } = await supabase
      .from("voting_sessions")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  getResolutions: async (sessionId: string): Promise<Resolution[]> => {
    const { data, error } = await supabase
      .from("resolutions")
      .select("*")
      .eq("session_id", sessionId);

    if (error) throw error;
    return data;
  },

  getShareholderVotes: async (shareholderId: string): Promise<VoteRecord[]> => {
    const { data, error } = await supabase
      .from("votes")
      .select("*")
      .eq("shareholder_id", shareholderId);

    if (error) throw error;
    return data as unknown as VoteRecord[];
  },

  getSessionStats: async (resolutionIds: string[]) => {
    if (resolutionIds.length === 0) return [];

    const { data, error } = await supabase
      .from("vote_stats")
      .select("*")
      .in("resolution_id", resolutionIds);

    if (error) throw error;
    return data;
  },

  getCompanyShareholders: async (companyId: string): Promise<Shareholder[]> => {
    const { data, error } = await supabase
      .from("shareholders")
      .select("*")
      .eq("company_id", companyId);

    if (error) throw error;
    return data as unknown as Shareholder[];
  },

  submitFeedback: async (feedback: {
    session_id: string;
    shareholder_id?: string;
    content: string;
    sentiment_label: "Positive" | "Neutral" | "Negative";
    sentiment_score: number;
    themes: string[];
  }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("shareholder_feedback") as any).insert(feedback);

    if (error) throw error;
    return true;
  },
};
