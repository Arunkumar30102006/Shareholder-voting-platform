-- Migration: Fix voting session lifecycle and auto transitions
-- 1. Allow flexible lifecycle transitions (administrative reopen, reschedule, close, and status sync)
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

    -- Validate that NEW.status is a recognized lifecycle state
    IF NEW.status NOT IN ('draft', 'published', 'open', 'closed', 'results_finalized', 'archived') THEN
        RAISE EXCEPTION 'Invalid session status value: %', NEW.status;
    END IF;

    -- Automatically maintain is_active flag in alignment with status
    IF NEW.status = 'open' THEN
        NEW.is_active := true;
    ELSIF NEW.status IN ('closed', 'results_finalized', 'archived', 'draft') THEN
        NEW.is_active := false;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_check_voting_session_status ON public.voting_sessions;
CREATE TRIGGER tr_check_voting_session_status
BEFORE UPDATE OF status ON public.voting_sessions
FOR EACH ROW
EXECUTE FUNCTION public.check_voting_session_status_transition();

-- 2. Allow shareholders to access published, open, closed, results_finalized, and archived events
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
      AND vs.status IN ('published', 'open', 'closed', 'results_finalized', 'archived')
    ORDER BY COALESCE(vs.voting_start, vs.start_date) DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_eligible_events_for_shareholder(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_eligible_events_for_shareholder(UUID) TO service_role;

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
      AND vs.status IN ('published', 'open', 'closed', 'results_finalized', 'archived');
END;
$$;

REVOKE ALL ON FUNCTION public.get_event_details_for_shareholder(UUID, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_event_details_for_shareholder(UUID, UUID) TO service_role;

-- 3. Recover active session 64fd79a4-240f-4bff-93ce-757a1891fcce to open live state
UPDATE public.voting_sessions
SET status = 'open',
    is_active = true,
    voting_start = NOW() - INTERVAL '1 hour',
    voting_end = NOW() + INTERVAL '3 days'
WHERE id = '64fd79a4-240f-4bff-93ce-757a1891fcce';

