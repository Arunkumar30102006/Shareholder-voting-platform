-- ============================================================================
-- Migration: 20260920000002_cleanup_deprecated_columns.sql
-- Description: Migration B (Post-Deployment Deprecation Cleanup)
--   1. Verifies that canonical columns (voting_start, voting_end, meeting_date) are fully populated
--   2. Drops deprecated columns (start_date, end_date, meeting_start_date)
--   3. Keeps meeting_end_date for meeting duration fidelity
--   NOTE: Run this migration ONLY after full application deployment and verification.
-- ============================================================================

DO $$
BEGIN
    -- Guard check: ensure canonical columns are populated before dropping legacy ones
    IF EXISTS (
        SELECT 1 FROM public.voting_sessions 
        WHERE voting_start IS NULL OR voting_end IS NULL
    ) THEN
        RAISE EXCEPTION 'MIGRATION B BLOCKED: voting_sessions records found with unmigrated voting_start or voting_end. Backfill before running this migration.';
    END IF;
END $$;

-- Drop legacy columns
ALTER TABLE public.voting_sessions DROP COLUMN IF EXISTS start_date;
ALTER TABLE public.voting_sessions DROP COLUMN IF EXISTS end_date;
ALTER TABLE public.voting_sessions DROP COLUMN IF EXISTS meeting_start_date;

-- Notice: meeting_end_date is deliberately preserved as the canonical meeting adjournment timestamp.
COMMENT ON COLUMN public.voting_sessions.voting_start IS 'Canonical voting window opening timestamp';
COMMENT ON COLUMN public.voting_sessions.voting_end IS 'Canonical voting window closing timestamp';
COMMENT ON COLUMN public.voting_sessions.meeting_date IS 'Canonical meeting start / convening timestamp';
COMMENT ON COLUMN public.voting_sessions.meeting_end_date IS 'Canonical meeting end / adjournment timestamp';
