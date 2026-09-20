-- ============================================================================
-- Migration: 20260920000000_security_and_voting_integrity_hardening.sql
-- Description: Comprehensive database hardening for Vote India Secure
--   1. Strict RLS enforcement across all sensitive tables
--   2. Elimination of anonymous direct writes and data exposure
--   3. Dedicated auth_challenges and shareholder_auth_sessions tables
--   4. Safe duplicate-aware unique constraints on votes, voter_master, proxy_delegations
--   5. cast_authorized_vote RPC with record-date frozen weight & proxy delegation
--   6. Hardening of all SECURITY DEFINER functions with search_path = pg_catalog, public
--   7. Granular service_role privilege allowlisting
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. AUTH CHALLENGES TABLE (OTP Lifecycle, 10-min TTL)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.auth_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shareholder_id UUID NOT NULL REFERENCES public.shareholders(id) ON DELETE CASCADE,
    hmac_verifier TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_challenges_shareholder ON public.auth_challenges(shareholder_id);
CREATE INDEX IF NOT EXISTS idx_auth_challenges_expires ON public.auth_challenges(expires_at);

ALTER TABLE public.auth_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages auth_challenges" ON public.auth_challenges;
CREATE POLICY "Service role manages auth_challenges" ON public.auth_challenges
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 2. SHAREHOLDER AUTH SESSIONS TABLE (HttpOnly Cookie Sessions, 1-hr TTL)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shareholder_auth_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token_hash TEXT NOT NULL,
    shareholder_id UUID NOT NULL REFERENCES public.shareholders(id) ON DELETE CASCADE,
    csrf_token TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    last_seen_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON public.shareholder_auth_sessions(session_token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_shareholder ON public.shareholder_auth_sessions(shareholder_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON public.shareholder_auth_sessions(expires_at);

ALTER TABLE public.shareholder_auth_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages shareholder_auth_sessions" ON public.shareholder_auth_sessions;
CREATE POLICY "Service role manages shareholder_auth_sessions" ON public.shareholder_auth_sessions
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 3. PREREQUISITE TABLES & SCHEMA HARMONIZATION
-- ----------------------------------------------------------------------------

-- Ensure proxy_delegations table exists
CREATE TABLE IF NOT EXISTS public.proxy_delegations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delegator_id UUID REFERENCES public.shareholders(id) ON DELETE CASCADE,
    proxy_id UUID REFERENCES public.shareholders(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.voting_sessions(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'verified', 'revoked')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure voter_master table exists
CREATE TABLE IF NOT EXISTS public.voter_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.voting_sessions(id) ON DELETE CASCADE,
    shareholder_id UUID REFERENCES public.shareholders(id) ON DELETE CASCADE,
    voter_name TEXT NOT NULL DEFAULT '',
    folio_number TEXT,
    shares_count INTEGER NOT NULL DEFAULT 0,
    dvr_multiplier NUMERIC(5,2) DEFAULT 1.0,
    is_eligible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.voter_master ADD COLUMN IF NOT EXISTS is_eligible BOOLEAN DEFAULT true;

-- Ensure resolutions has both voting_session_id and session_id for full cross-compatibility
ALTER TABLE public.resolutions ADD COLUMN IF NOT EXISTS voting_session_id UUID REFERENCES public.voting_sessions(id) ON DELETE CASCADE;
ALTER TABLE public.resolutions ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.voting_sessions(id) ON DELETE CASCADE;
ALTER TABLE public.resolutions ADD COLUMN IF NOT EXISTS for_votes NUMERIC(20,2) DEFAULT 0;
ALTER TABLE public.resolutions ADD COLUMN IF NOT EXISTS against_votes NUMERIC(20,2) DEFAULT 0;
ALTER TABLE public.resolutions ADD COLUMN IF NOT EXISTS abstain_votes NUMERIC(20,2) DEFAULT 0;

-- Synchronize session_id and voting_session_id so neither is null if the other is set
UPDATE public.resolutions SET session_id = voting_session_id WHERE session_id IS NULL AND voting_session_id IS NOT NULL;
UPDATE public.resolutions SET voting_session_id = session_id WHERE voting_session_id IS NULL AND session_id IS NOT NULL;

-- Votes table schema enhancements
ALTER TABLE public.votes ADD COLUMN IF NOT EXISTS casting_shareholder_id UUID REFERENCES public.shareholders(id);
ALTER TABLE public.votes ADD COLUMN IF NOT EXISTS proxy_delegation_id UUID REFERENCES public.proxy_delegations(id);
ALTER TABLE public.votes ADD COLUMN IF NOT EXISTS weighted_votes NUMERIC(20,2);
ALTER TABLE public.votes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.votes ADD COLUMN IF NOT EXISTS voted_at TIMESTAMPTZ DEFAULT now();

-- ----------------------------------------------------------------------------
-- 4. SAFE DUPLICATE-AWARE UNIQUE CONSTRAINTS
-- ----------------------------------------------------------------------------

-- Check for duplicate votes before applying UNIQUE (resolution_id, shareholder_id)
DO $$
DECLARE
    dup_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO dup_count
    FROM (
        SELECT resolution_id, shareholder_id, COUNT(*) as cnt
        FROM public.votes
        GROUP BY resolution_id, shareholder_id
        HAVING COUNT(*) > 1
    ) dupes;

    IF dup_count > 0 THEN
        RAISE EXCEPTION
            'MIGRATION BLOCKED: % duplicate vote(s) detected in public.votes. '
            'Review and resolve according to documented business rules '
            'before re-running this migration. '
            'DO NOT automatically delete voting records.',
            dup_count;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_resolution_shareholder'
    ) THEN
        ALTER TABLE public.votes
        ADD CONSTRAINT unique_resolution_shareholder
        UNIQUE (resolution_id, shareholder_id);
    END IF;
END $$;

-- Unique constraint on voter_master
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_session_shareholder_voter'
    ) THEN
        ALTER TABLE public.voter_master
        ADD CONSTRAINT unique_session_shareholder_voter
        UNIQUE (session_id, shareholder_id);
    END IF;
EXCEPTION WHEN duplicate_table OR duplicate_object THEN
END $$;

-- Unique constraint on proxy_delegations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_session_delegator'
    ) THEN
        ALTER TABLE public.proxy_delegations
        ADD CONSTRAINT unique_session_delegator
        UNIQUE (session_id, delegator_id);
    END IF;
EXCEPTION WHEN duplicate_table OR duplicate_object THEN
END $$;

-- ----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY RESTRUCTURING (ELIMINATE DANGEROUS POLICIES)
-- ----------------------------------------------------------------------------

-- Votes table RLS
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for all users" ON public.votes;
DROP POLICY IF EXISTS "Enable select for all users" ON public.votes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.votes;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.votes;
DROP POLICY IF EXISTS "Shareholders can cast their own vote" ON public.votes;
DROP POLICY IF EXISTS "Shareholders see only their own votes" ON public.votes;
DROP POLICY IF EXISTS "Service role manages votes" ON public.votes;
DROP POLICY IF EXISTS "Company admins view company session votes" ON public.votes;

-- Service role full access to votes
CREATE POLICY "Service role manages votes" ON public.votes
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated company admins can view aggregate/scrutiny votes for their sessions
CREATE POLICY "Company admins view company session votes" ON public.votes
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.resolutions r
        JOIN public.voting_sessions vs ON vs.id = COALESCE(r.voting_session_id, r.session_id)
        JOIN public.company_admins ca ON ca.company_id = vs.company_id
        WHERE r.id = votes.resolution_id
          AND ca.user_id = auth.uid()
    )
);

-- Company Admins table RLS
ALTER TABLE public.company_admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public registration of admins" ON public.company_admins;
DROP POLICY IF EXISTS "Admins can view their own record" ON public.company_admins;
DROP POLICY IF EXISTS "Admins can update their own record" ON public.company_admins;
DROP POLICY IF EXISTS "Service role manages company_admins" ON public.company_admins;
DROP POLICY IF EXISTS "Admins view own record" ON public.company_admins;
DROP POLICY IF EXISTS "Admins update own record" ON public.company_admins;

CREATE POLICY "Service role manages company_admins" ON public.company_admins
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Admins view own record" ON public.company_admins
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins update own record" ON public.company_admins
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Companies table RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public registration of companies" ON public.companies;
DROP POLICY IF EXISTS "Admins can view their company" ON public.companies;
DROP POLICY IF EXISTS "Admins can update their company" ON public.companies;
DROP POLICY IF EXISTS "Service role manages companies" ON public.companies;
DROP POLICY IF EXISTS "Admins view own company" ON public.companies;
DROP POLICY IF EXISTS "Admins update own company" ON public.companies;

CREATE POLICY "Service role manages companies" ON public.companies
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Admins view own company" ON public.companies
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.company_admins ca
        WHERE ca.company_id = companies.id
          AND ca.user_id = auth.uid()
    )
);

CREATE POLICY "Admins update own company" ON public.companies
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.company_admins ca
        WHERE ca.company_id = companies.id
          AND ca.user_id = auth.uid()
    )
);

-- Shareholders table RLS
ALTER TABLE public.shareholders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read of shareholders" ON public.shareholders;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.shareholders;
DROP POLICY IF EXISTS "Service role manages shareholders" ON public.shareholders;
DROP POLICY IF EXISTS "Company admins view company shareholders" ON public.shareholders;

CREATE POLICY "Service role manages shareholders" ON public.shareholders
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Company admins view company shareholders" ON public.shareholders
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.company_admins ca
        WHERE ca.company_id = shareholders.company_id
          AND ca.user_id = auth.uid()
    )
);

-- Verification codes table RLS
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access to verification_codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Enable all access for verification_codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Service role manages verification_codes" ON public.verification_codes;

CREATE POLICY "Service role manages verification_codes" ON public.verification_codes
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 6. HARDENED SECURITY DEFINER RPC FUNCTIONS
-- ----------------------------------------------------------------------------

-- Function: create_auth_challenge
CREATE OR REPLACE FUNCTION public.create_auth_challenge(
    p_shareholder_id UUID,
    p_hmac_verifier TEXT,
    p_expires_at TIMESTAMPTZ
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_challenge_id UUID;
BEGIN
    -- Invalidate previous active challenges for this shareholder
    UPDATE public.auth_challenges
    SET expires_at = now()
    WHERE shareholder_id = p_shareholder_id 
      AND verified_at IS NULL 
      AND expires_at > now();

    INSERT INTO public.auth_challenges (
        shareholder_id,
        hmac_verifier,
        attempts,
        expires_at
    ) VALUES (
        p_shareholder_id,
        p_hmac_verifier,
        0,
        p_expires_at
    ) RETURNING id INTO v_challenge_id;

    RETURN v_challenge_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_auth_challenge(UUID, TEXT, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_auth_challenge(UUID, TEXT, TIMESTAMPTZ) TO service_role;

-- Function: verify_auth_challenge
CREATE OR REPLACE FUNCTION public.verify_auth_challenge(
    p_challenge_id UUID,
    p_hmac_verifier TEXT
) RETURNS TABLE (
    shareholder_id UUID,
    success BOOLEAN,
    remaining_attempts INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_rec RECORD;
    v_max_attempts CONSTANT INTEGER := 5;
BEGIN
    SELECT * INTO v_rec
    FROM public.auth_challenges
    WHERE id = p_challenge_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT NULL::UUID, FALSE, 0;
        RETURN;
    END IF;

    -- Check if already verified, expired, or attempts exhausted
    IF v_rec.verified_at IS NOT NULL OR v_rec.expires_at < now() OR v_rec.attempts >= v_max_attempts THEN
        RETURN QUERY SELECT NULL::UUID, FALSE, 0;
        RETURN;
    END IF;

    -- Increment attempts
    UPDATE public.auth_challenges
    SET attempts = attempts + 1
    WHERE id = p_challenge_id;

    -- Check verifier
    IF v_rec.hmac_verifier = p_hmac_verifier THEN
        UPDATE public.auth_challenges
        SET verified_at = now()
        WHERE id = p_challenge_id;

        RETURN QUERY SELECT v_rec.shareholder_id, TRUE, (v_max_attempts - (v_rec.attempts + 1));
        RETURN;
    ELSE
        RETURN QUERY SELECT NULL::UUID, FALSE, GREATEST(0, v_max_attempts - (v_rec.attempts + 1));
        RETURN;
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.verify_auth_challenge(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_auth_challenge(UUID, TEXT) TO service_role;

-- Function: create_voting_session
CREATE OR REPLACE FUNCTION public.create_voting_session(
    p_shareholder_id UUID,
    p_session_token_hash TEXT,
    p_csrf_token TEXT,
    p_expires_at TIMESTAMPTZ
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_session_id UUID;
BEGIN
    INSERT INTO public.shareholder_auth_sessions (
        shareholder_id,
        session_token_hash,
        csrf_token,
        expires_at
    ) VALUES (
        p_shareholder_id,
        p_session_token_hash,
        p_csrf_token,
        p_expires_at
    ) RETURNING id INTO v_session_id;

    RETURN v_session_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_voting_session(UUID, TEXT, TEXT, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_voting_session(UUID, TEXT, TEXT, TIMESTAMPTZ) TO service_role;

-- Function: cast_authorized_vote
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

    -- 4. Check voting window and session status
    IF v_session.status != 'open' OR now() < v_session.start_date OR now() > v_session.end_date THEN
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

    -- 6. Strict Voter Master lookup on frozen record date (zero fallback to mutable shareholders table)
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

    -- 9. Insert vote record (DB unique constraint will prevent concurrent duplicate votes)
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

-- ----------------------------------------------------------------------------
-- 7. HARDEN EXISTING SECURITY DEFINER FUNCTIONS (FIX search_path)
-- ----------------------------------------------------------------------------

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'log_audit_event') THEN
        ALTER FUNCTION public.log_audit_event() SET search_path = pg_catalog, public;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_weighted_vote') THEN
        ALTER FUNCTION public.calculate_weighted_vote() SET search_path = pg_catalog, public;
    END IF;
END $$;
