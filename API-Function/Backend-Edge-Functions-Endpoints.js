/**
 * ============================================================================
 * BACKEND SERVERLESS ENDPOINTS & DATABASE STORED PROCEDURES (RPCs)
 * Location: supabase/functions/* & PostgreSQL Stored Functions
 * ============================================================================
 * Reference map of all backend microservices, parameters, security policies,
 * and database RPC functions powering the application.
 */

export const BackendEdgeFunctionsMap = {
    /**
     * 1. CAST VOTE ENDPOINT
     * Path: supabase/functions/cast-vote/index.ts
     * Route: POST /functions/v1/cast-vote
     * Headers: Authorization, x-session-token, x-csrf-token
     * Body: { resolution_id: UUID, vote_value: "FOR"|"AGAINST"|"ABSTAIN", proxy_delegation_id?: UUID }
     * Purpose:
     * - Verifies HttpOnly session cookie or session_token hash
     * - Generates SHA-256 vote hash
     * - Prevents duplicate voting (returns 409 Conflict)
     * - Executes atomic vote recording and updates is_credential_used = true
     */
    castVoteEndpoint: {
        path: "supabase/functions/cast-vote/index.ts",
        method: "POST",
        route: "/functions/v1/cast-vote",
        security: "Session Token + CSRF Validation + Rate Limiting",
    },

    /**
     * 2. INITIATE SHAREHOLDER AUTH
     * Path: supabase/functions/initiate-shareholder-auth/index.ts
     * Route: POST /functions/v1/initiate-shareholder-auth
     * Body: { identifier: string, pan: string }
     * Purpose:
     * - Checks User ID / Password / Demat / PAN
     * - MCA Rule 20 Enforcement: Rejects deactivated credentials if ballot already cast
     * - Generates 6-digit OTP with 10-minute TTL
     * - Computes HMAC-SHA256 verifier stored in auth_challenges
     * - Sends email via Resend API
     */
    initiateShareholderAuthEndpoint: {
        path: "supabase/functions/initiate-shareholder-auth/index.ts",
        method: "POST",
        route: "/functions/v1/initiate-shareholder-auth",
        security: "Anti-enumeration + SHA-256 password hash + HMAC challenge",
    },

    /**
     * 3. VERIFY SHAREHOLDER OTP
     * Path: supabase/functions/verify-shareholder-otp/index.ts
     * Route: POST /functions/v1/verify-shareholder-otp
     * Body: { challenge_id: UUID, otp: string }
     * Purpose:
     * - Validates 6-digit OTP against HMAC verifier
     * - Issues HttpOnly session cookie + CSRF token
     * - Creates active session row in shareholder_auth_sessions
     */
    verifyShareholderOtpEndpoint: {
        path: "supabase/functions/verify-shareholder-otp/index.ts",
        method: "POST",
        route: "/functions/v1/verify-shareholder-otp",
        security: "Single-use challenge consumption + Session Token Generation",
    },

    /**
     * 4. SEND MEETING INVITATIONS
     * Path: supabase/functions/send-meeting-invites/index.ts
     * Route: POST /functions/v1/send-meeting-invites
     * Purpose:
     * - Dispatches AGM/EGM notices, virtual conference links, and credentials to shareholders
     */
    sendMeetingInvitesEndpoint: {
        path: "supabase/functions/send-meeting-invites/index.ts",
        method: "POST",
        route: "/functions/v1/send-meeting-invites",
        security: "Admin Authorized",
    },

    /**
     * 5. SEND WELCOME EMAIL
     * Path: supabase/functions/send-welcome-email/index.ts
     * Route: POST /functions/v1/send-welcome-email
     * Purpose:
     * - Sends company registration confirmation and compliance onboarding details
     */
    sendWelcomeEmailEndpoint: {
        path: "supabase/functions/send-welcome-email/index.ts",
        method: "POST",
        route: "/functions/v1/send-welcome-email",
        security: "Company Registration Workflow",
    },

    /**
     * 6. POSTGRESQL STORED PROCEDURES (RPCs)
     * Located in: supabase/migrations/
     */
    databaseRPCs: {
        castAuthorizedVote: {
            signature: "public.cast_authorized_vote(p_shareholder_id UUID, p_resolution_id UUID, p_vote_value TEXT, p_proxy_delegation_id UUID)",
            purpose: "Atomically records an immutable ballot, computes vote hash, and enforces unique shareholder vote constraint."
        },
        deleteShareholderCascaded: {
            signature: "public.delete_shareholder_cascaded(p_shareholder_id UUID, p_company_id UUID)",
            purpose: "Atomically removes a shareholder and safely cascades deletions across votes, voter_master, proxy_delegations, and auth_sessions."
        },
        checkVotingSessionStatusTransition: {
            signature: "public.check_voting_session_status_transition()",
            purpose: "Trigger function that synchronizes voting session status and automatic active/closed window flags."
        }
    }
};

