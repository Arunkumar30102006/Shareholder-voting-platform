-- ============================================================================
-- Migration: 20260920000001_generic_voting_event_and_egm.sql
-- Description: Migration A (Additive & Non-breaking rollout)
--   1. Adds canonical timing columns: voting_start, voting_end, meeting_date, notice_date
--   2. Preserves meeting_end_date for duration fidelity
--   3. Backfills canonical columns from legacy columns (start_date, end_date, meeting_start_date)
--   4. Adds structured EGM fields: egm_requisition_type, is_short_notice, 
--      explanatory_statement_reference, egm_reason
--   5. Creates event_classification_audit table with confidence scoring (HIGH/LOW)
--      and safe event_type classification without blind AGM defaulting
--   6. Enforces authoritative event lifecycle state machine via trigger
--   7. Synchronizes legacy is_active from status = 'open'
--   8. Creates service-role-only RPCs: get_eligible_events_for_shareholder
--      and get_event_details_for_shareholder with minimal projections
--   9. Updates cast_authorized_vote to use canonical voting_start/voting_end
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ADD CANONICAL COLUMNS (NON-BREAKING, COEXISTING WITH LEGACY COLUMNS)
-- ----------------------------------------------------------------------------
ALTER TABLE public.voting_sessions 
ADD COLUMN IF NOT EXISTS voting_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS voting_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS meeting_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS notice_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS meeting_end_date TIMESTAMPTZ;

-- ----------------------------------------------------------------------------
-- 2. BACKFILL CANONICAL COLUMNS FROM LEGACY COLUMNS
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    -- Backfill voting_start from start_date if start_date exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'voting_sessions' AND column_name = 'start_date'
    ) THEN
        UPDATE public.voting_sessions
        SET voting_start = start_date
        WHERE voting_start IS NULL AND start_date IS NOT NULL;
    END IF;

    -- Backfill voting_end from end_date if end_date exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'voting_sessions' AND column_name = 'end_date'
    ) THEN
        UPDATE public.voting_sessions
        SET voting_end = end_date
        WHERE voting_end IS NULL AND end_date IS NOT NULL;
    END IF;

    -- Backfill meeting_date from meeting_start_date if meeting_start_date exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'voting_sessions' AND column_name = 'meeting_start_date'
    ) THEN
        UPDATE public.voting_sessions
        SET meeting_date = meeting_start_date
        WHERE meeting_date IS NULL AND meeting_start_date IS NOT NULL;
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 3. STRUCTURED EGM FIELDS MATCHING ADMIN UI
-- ----------------------------------------------------------------------------
ALTER TABLE public.voting_sessions
ADD COLUMN IF NOT EXISTS egm_requisition_type TEXT,
ADD COLUMN IF NOT EXISTS is_short_notice BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS explanatory_statement_reference TEXT,
ADD COLUMN IF NOT EXISTS egm_reason TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_voting_sessions_egm_requisition'
    ) THEN
        ALTER TABLE public.voting_sessions
        ADD CONSTRAINT check_voting_sessions_egm_requisition
        CHECK (egm_requisition_type IS NULL OR egm_requisition_type IN ('BOARD_CONVENED', 'MEMBER_REQUISITION_SEC_100', 'NCLT_DIRECTED'));
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 4. HISTORICAL EVENT CLASSIFICATION AUDIT & SAFE DEFAULTING
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_classification_audit (
    session_id UUID PRIMARY KEY REFERENCES public.voting_sessions(id) ON DELETE CASCADE,
    old_title TEXT,
    old_description TEXT,
    detected_event_type TEXT,
    classification_reason TEXT,
    confidence TEXT CHECK (confidence IN ('HIGH', 'LOW')),
    review_required BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.voting_sessions ADD COLUMN IF NOT EXISTS event_type TEXT;

-- Classify existing rows and log to audit table
INSERT INTO public.event_classification_audit (
    session_id, old_title, old_description, detected_event_type, classification_reason, confidence, review_required
)
SELECT 
    id,
    title,
    description,
    CASE 
        -- HIGH confidence title matches
        WHEN UPPER(title) LIKE '%EXTRAORDINARY%' OR UPPER(title) LIKE '%EGM%' THEN 'EGM'
        WHEN UPPER(title) LIKE '%POSTAL BALLOT%' THEN 'POSTAL_BALLOT'
        WHEN UPPER(title) LIKE '%ANNUAL GENERAL%' OR UPPER(title) LIKE '%AGM%' THEN 'AGM'
        -- LOW confidence description matches (flagged for review, assigned neutral GENERAL_MEETING)
        WHEN UPPER(COALESCE(description, '')) LIKE '%EXTRAORDINARY%' OR UPPER(COALESCE(description, '')) LIKE '%EGM%' THEN 'GENERAL_MEETING'
        WHEN UPPER(COALESCE(description, '')) LIKE '%POSTAL BALLOT%' THEN 'GENERAL_MEETING'
        WHEN UPPER(COALESCE(description, '')) LIKE '%ANNUAL GENERAL%' OR UPPER(COALESCE(description, '')) LIKE '%AGM%' THEN 'GENERAL_MEETING'
        ELSE 'GENERAL_MEETING'
    END,
    CASE 
        WHEN UPPER(title) LIKE '%EXTRAORDINARY%' OR UPPER(title) LIKE '%EGM%' THEN 'Title explicitly indicates EGM'
        WHEN UPPER(title) LIKE '%POSTAL BALLOT%' THEN 'Title explicitly indicates Postal Ballot'
        WHEN UPPER(title) LIKE '%ANNUAL GENERAL%' OR UPPER(title) LIKE '%AGM%' THEN 'Title explicitly indicates AGM'
        WHEN UPPER(COALESCE(description, '')) ~* '(EXTRAORDINARY|EGM|POSTAL BALLOT|ANNUAL GENERAL|AGM)' THEN 'Ambiguous match in description only; assigned neutral GENERAL_MEETING'
        ELSE 'No specific event markers found; assigned neutral GENERAL_MEETING'
    END,
    CASE 
        WHEN UPPER(title) ~* '(EXTRAORDINARY|EGM|POSTAL BALLOT|ANNUAL GENERAL|AGM)' THEN 'HIGH'
        WHEN UPPER(COALESCE(description, '')) ~* '(EXTRAORDINARY|EGM|POSTAL BALLOT|ANNUAL GENERAL|AGM)' THEN 'LOW'
        ELSE 'HIGH'
    END,
    CASE 
        WHEN UPPER(title) ~* '(EXTRAORDINARY|EGM|POSTAL BALLOT|ANNUAL GENERAL|AGM)' THEN false
        WHEN UPPER(COALESCE(description, '')) ~* '(EXTRAORDINARY|EGM|POSTAL BALLOT|ANNUAL GENERAL|AGM)' THEN true
        ELSE false
    END
FROM public.voting_sessions
ON CONFLICT (session_id) DO NOTHING;

-- Apply classified event_type from audit table
UPDATE public.voting_sessions vs
SET event_type = eca.detected_event_type
FROM public.event_classification_audit eca
WHERE vs.id = eca.session_id AND vs.event_type IS NULL;

-- In case there are newly inserted rows without audit records, default safely to GENERAL_MEETING
UPDATE public.voting_sessions
SET event_type = 'GENERAL_MEETING'
WHERE event_type IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_voting_sessions_event_type'
    ) THEN
        ALTER TABLE public.voting_sessions
        ADD CONSTRAINT check_voting_sessions_event_type
        CHECK (event_type IN ('AGM', 'EGM', 'GENERAL_MEETING', 'POSTAL_BALLOT'));
    END IF;
END $$;

ALTER TABLE public.voting_sessions
ALTER COLUMN event_type SET NOT NULL;

-- ----------------------------------------------------------------------------
-- 5. AUTHORITATIVE STATUS & GENERATED / SYNCED IS_ACTIVE
-- ----------------------------------------------------------------------------
ALTER TABLE public.voting_sessions
DROP CONSTRAINT IF EXISTS voting_sessions_status_check;

ALTER TABLE public.voting_sessions
ADD CONSTRAINT voting_sessions_status_check
CHECK (status IN ('draft', 'published', 'open', 'closed', 'results_finalized', 'archived'));

-- Maintain is_active during transition phase via trigger
CREATE OR REPLACE FUNCTION public.sync_voting_session_is_active()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
    NEW.is_active := (NEW.status = 'open');
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_sync_voting_session_is_active ON public.voting_sessions;
CREATE TRIGGER tr_sync_voting_session_is_active
BEFORE INSERT OR UPDATE ON public.voting_sessions
FOR EACH ROW
EXECUTE FUNCTION public.sync_voting_session_is_active();

-- Backfill is_active based on status
UPDATE public.voting_sessions
SET is_active = (status = 'open');

-- ----------------------------------------------------------------------------
-- 6. STRICT STATE MACHINE TRANSITION ENFORCEMENT
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_voting_session_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- Valid lifecycle: DRAFT -> PUBLISHED -> OPEN -> CLOSED -> RESULTS_FINALIZED -> ARCHIVED
    IF (OLD.status = 'draft' AND NEW.status = 'published') OR
       (OLD.status = 'published' AND NEW.status = 'open') OR
       (OLD.status = 'open' AND NEW.status = 'closed') OR
       (OLD.status = 'closed' AND NEW.status = 'results_finalized') OR
       (OLD.status = 'results_finalized' AND NEW.status = 'archived') THEN
        RETURN NEW;
    ELSE
        RAISE EXCEPTION 'Invalid session lifecycle transition from % to %', OLD.status, NEW.status;
    END IF;
END;
$$;

DROP TRIGGER IF EXISTS tr_check_voting_session_status ON public.voting_sessions;
CREATE TRIGGER tr_check_voting_session_status
BEFORE UPDATE OF status ON public.voting_sessions
FOR EACH ROW
EXECUTE FUNCTION public.check_voting_session_status_transition();

-- ----------------------------------------------------------------------------
-- 7. SERVICE-ROLE-ONLY RPCS FOR SHAREHOLDER EVENT ACCESS
-- ----------------------------------------------------------------------------

-- List endpoint: minimum projection for event switcher
CREATE OR REPLACE FUNCTION public.get_eligible_events_for_shareholder(
    p_shareholder_id UUID
)
RETURNS TABLE (
    session_id UUID,
    event_type TEXT,
    title TEXT,
    status TEXT,
    notice_date TIMESTAMPTZ,
    meeting_date TIMESTAMPTZ,
    meeting_end_date TIMESTAMPTZ,
    record_date TIMESTAMPTZ,
    voting_start TIMESTAMPTZ,
    voting_end TIMESTAMPTZ,
    company_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        vs.id AS session_id,
        vs.event_type,
        vs.title,
        vs.status,
        vs.notice_date,
        vs.meeting_date,
        vs.meeting_end_date,
        vs.record_date,
        COALESCE(vs.voting_start, vs.start_date) AS voting_start,
        COALESCE(vs.voting_end, vs.end_date) AS voting_end,
        c.company_name
    FROM public.voter_master vm
    JOIN public.voting_sessions vs ON vs.id = vm.session_id
    JOIN public.companies c ON c.id = vs.company_id
    WHERE vm.shareholder_id = p_shareholder_id
      AND vm.is_eligible = true
      AND vs.status IN ('published', 'open')
    ORDER BY COALESCE(vs.voting_start, vs.start_date) DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_eligible_events_for_shareholder(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_eligible_events_for_shareholder(UUID) TO service_role;

-- Detail endpoint: verified ballot metadata & shares count
CREATE OR REPLACE FUNCTION public.get_event_details_for_shareholder(
    p_shareholder_id UUID,
    p_session_id UUID
)
RETURNS TABLE (
    session_id UUID,
    event_type TEXT,
    title TEXT,
    description TEXT,
    status TEXT,
    notice_date TIMESTAMPTZ,
    meeting_date TIMESTAMPTZ,
    meeting_end_date TIMESTAMPTZ,
    record_date TIMESTAMPTZ,
    voting_start TIMESTAMPTZ,
    voting_end TIMESTAMPTZ,
    meeting_link TEXT,
    meeting_platform TEXT,
    voting_instructions TEXT,
    shares_count INTEGER,
    dvr_multiplier NUMERIC(5,2),
    is_short_notice BOOLEAN,
    egm_requisition_type TEXT,
    explanatory_statement_reference TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        vs.id,
        vs.event_type,
        vs.title,
        vs.description,
        vs.status,
        vs.notice_date,
        vs.meeting_date,
        vs.meeting_end_date,
        vs.record_date,
        COALESCE(vs.voting_start, vs.start_date) AS voting_start,
        COALESCE(vs.voting_end, vs.end_date) AS voting_end,
        vs.meeting_link,
        vs.meeting_platform,
        vs.voting_instructions,
        vm.shares_count,
        vm.dvr_multiplier,
        vs.is_short_notice,
        vs.egm_requisition_type,
        vs.explanatory_statement_reference
    FROM public.voter_master vm
    JOIN public.voting_sessions vs ON vs.id = vm.session_id
    WHERE vm.shareholder_id = p_shareholder_id
      AND vs.id = p_session_id
      AND vm.is_eligible = true
      AND vs.status IN ('published', 'open');
END;
$$;

REVOKE ALL ON FUNCTION public.get_event_details_for_shareholder(UUID, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_event_details_for_shareholder(UUID, UUID) TO service_role;

-- ----------------------------------------------------------------------------
-- 8. UPDATE CAST_AUTHORIZED_VOTE TO USE CANONICAL TIMING
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cast_authorized_vote(
    p_shareholder_id UUID,
    p_resolution_id UUID,
    p_vote_value TEXT,
    p_proxy_delegation_id UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_resolution RECORD;
    v_session RECORD;
    v_beneficiary_id UUID;
    v_voter_master RECORD;
    v_weighted_votes NUMERIC(20,2);
    v_vote_hash TEXT;
    v_vote_id UUID;
    v_vote_timestamp TIMESTAMPTZ := now();
    v_proxy RECORD;
    v_v_start TIMESTAMPTZ;
    v_v_end TIMESTAMPTZ;
BEGIN
    -- 1. Validate vote_value
    p_vote_value := UPPER(TRIM(p_vote_value));
    IF p_vote_value NOT IN ('FOR', 'AGAINST', 'ABSTAIN') THEN
        RAISE EXCEPTION 'Invalid vote value. Must be FOR, AGAINST, or ABSTAIN.';
    END IF;

    -- 2. Fetch resolution
    SELECT * INTO v_resolution
    FROM public.resolutions
    WHERE id = p_resolution_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Resolution not found.';
    END IF;

    -- 3. Fetch session
    SELECT * INTO v_session
    FROM public.voting_sessions
    WHERE id = COALESCE(v_resolution.voting_session_id, v_resolution.session_id);

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Voting session not found.';
    END IF;

    -- 4. Check voting window and session status using canonical voting_start/voting_end with fallback
    v_v_start := COALESCE(v_session.voting_start, v_session.start_date);
    v_v_end := COALESCE(v_session.voting_end, v_session.end_date);

    IF v_session.status != 'open' OR now() < v_v_start OR now() > v_v_end THEN
        RAISE EXCEPTION 'Voting session is not currently open.';
    END IF;

    -- 5. Determine beneficiary (proxy vs direct)
    IF p_proxy_delegation_id IS NOT NULL THEN
        SELECT * INTO v_proxy
        FROM public.proxy_delegations
        WHERE id = p_proxy_delegation_id
          AND proxy_id = p_shareholder_id
          AND session_id = v_session.id
          AND status IN ('active', 'verified');

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Active, verified proxy delegation not found for this session.';
        END IF;

        v_beneficiary_id := v_proxy.delegator_id;
    ELSE
        v_beneficiary_id := p_shareholder_id;
    END IF;

    -- 6. Strict Voter Master lookup on frozen record date
    SELECT * INTO v_voter_master
    FROM public.voter_master
    WHERE session_id = v_session.id
      AND shareholder_id = v_beneficiary_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Shareholder is not on the frozen voter master roster for this session.';
    END IF;

    IF v_voter_master.is_eligible IS FALSE THEN
        RAISE EXCEPTION 'Shareholder is not eligible to vote in this session.';
    END IF;

    -- 7. Compute weighted votes
    v_weighted_votes := v_voter_master.shares_count * COALESCE(v_voter_master.dvr_multiplier, 1.0);

    -- 8. Compute server-side SHA-256 vote hash
    v_vote_hash := encode(
        digest(
            v_beneficiary_id::text || ':' ||
            p_resolution_id::text || ':' ||
            p_vote_value || ':' ||
            v_weighted_votes::text || ':' ||
            v_vote_timestamp::text,
            'sha256'
        ),
        'hex'
    );

    -- 9. Insert vote record (DB unique constraint prevents double-voting)
    INSERT INTO public.votes (
        resolution_id,
        shareholder_id,
        casting_shareholder_id,
        proxy_delegation_id,
        vote_value,
        weighted_votes,
        vote_hash,
        created_at
    ) VALUES (
        p_resolution_id,
        v_beneficiary_id,
        p_shareholder_id,
        p_proxy_delegation_id,
        p_vote_value,
        v_weighted_votes,
        v_vote_hash,
        v_vote_timestamp
    ) RETURNING id INTO v_vote_id;

    -- 10. Update resolution aggregate counters
    IF p_vote_value = 'FOR' THEN
        UPDATE public.resolutions SET for_votes = COALESCE(for_votes, 0) + v_weighted_votes WHERE id = p_resolution_id;
    ELSIF p_vote_value = 'AGAINST' THEN
        UPDATE public.resolutions SET against_votes = COALESCE(against_votes, 0) + v_weighted_votes WHERE id = p_resolution_id;
    ELSIF p_vote_value = 'ABSTAIN' THEN
        UPDATE public.resolutions SET abstain_votes = COALESCE(abstain_votes, 0) + v_weighted_votes WHERE id = p_resolution_id;
    END IF;

    -- 11. Return ballot receipt
    RETURN jsonb_build_object(
        'vote_id', v_vote_id,
        'receipt_hash', v_vote_hash,
        'weighted_votes', v_weighted_votes,
        'timestamp', v_vote_timestamp
    );
END;
$$;

REVOKE ALL ON FUNCTION public.cast_authorized_vote(UUID, UUID, TEXT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cast_authorized_vote(UUID, UUID, TEXT, UUID) TO service_role;
