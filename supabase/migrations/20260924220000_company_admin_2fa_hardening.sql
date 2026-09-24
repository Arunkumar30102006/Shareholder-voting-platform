-- ============================================================================
-- Migration: 20260924220000_company_admin_2fa_hardening.sql
-- Description: Server-Side 2FA Enforcement for Company Administrators
--   1. Dedicated company_admin_2fa_challenges table with RLS
--   2. create_company_admin_2fa_challenge RPC
--   3. verify_company_admin_2fa_challenge RPC (max 5 attempts, lockout, single-use)
--   4. check_company_admin_2fa_status RPC for server-side route & API authorization
--   5. invalidate_company_admin_2fa RPC for secure logout session termination
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. COMPANY ADMIN 2FA CHALLENGES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_admin_2fa_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    otp_hash TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_2fa_user ON public.company_admin_2fa_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_company_2fa_expires ON public.company_admin_2fa_challenges(expires_at);
CREATE INDEX IF NOT EXISTS idx_company_2fa_verified ON public.company_admin_2fa_challenges(user_id, verified_at);

ALTER TABLE public.company_admin_2fa_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages company_admin_2fa_challenges" ON public.company_admin_2fa_challenges;
CREATE POLICY "Service role manages company_admin_2fa_challenges" ON public.company_admin_2fa_challenges
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 2. CREATE CHALLENGE RPC (Called by initiate-company-2fa Edge Function)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_company_admin_2fa_challenge(
    p_user_id UUID,
    p_company_id UUID,
    p_otp_hash TEXT,
    p_expires_at TIMESTAMPTZ
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_challenge_id UUID;
BEGIN
    -- Invalidate previous pending challenges for this user
    UPDATE public.company_admin_2fa_challenges
    SET expires_at = now()
    WHERE user_id = p_user_id 
      AND verified_at IS NULL 
      AND expires_at > now();

    INSERT INTO public.company_admin_2fa_challenges (
        user_id,
        company_id,
        otp_hash,
        attempts,
        expires_at
    ) VALUES (
        p_user_id,
        p_company_id,
        p_otp_hash,
        0,
        p_expires_at
    ) RETURNING id INTO v_challenge_id;

    RETURN v_challenge_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_company_admin_2fa_challenge(UUID, UUID, TEXT, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_company_admin_2fa_challenge(UUID, UUID, TEXT, TIMESTAMPTZ) TO service_role;

-- ----------------------------------------------------------------------------
-- 3. VERIFY CHALLENGE RPC (Called by verify-company-2fa Edge Function)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.verify_company_admin_2fa_challenge(
    p_challenge_id UUID,
    p_user_id UUID,
    p_otp_hash TEXT
) RETURNS TABLE (
    success BOOLEAN,
    remaining_attempts INTEGER,
    error_message TEXT
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
    FROM public.company_admin_2fa_challenges
    WHERE id = p_challenge_id AND user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 0, 'Invalid or unrecognized challenge session.'::TEXT;
        RETURN;
    END IF;

    -- Check if challenge was already consumed
    IF v_rec.verified_at IS NOT NULL THEN
        RETURN QUERY SELECT FALSE, 0, 'This verification code has already been used.'::TEXT;
        RETURN;
    END IF;

    -- Check if expired
    IF v_rec.expires_at < now() THEN
        RETURN QUERY SELECT FALSE, 0, 'Verification code has expired. Please request a new one.'::TEXT;
        RETURN;
    END IF;

    -- Check if max attempts already exceeded
    IF v_rec.attempts >= v_max_attempts THEN
        RETURN QUERY SELECT FALSE, 0, 'Maximum verification attempts exceeded. Challenge has been locked.'::TEXT;
        RETURN;
    END IF;

    -- Increment attempts
    UPDATE public.company_admin_2fa_challenges
    SET attempts = attempts + 1
    WHERE id = p_challenge_id;

    -- Compare OTP hash
    IF v_rec.otp_hash = p_otp_hash THEN
        UPDATE public.company_admin_2fa_challenges
        SET verified_at = now()
        WHERE id = p_challenge_id;

        RETURN QUERY SELECT TRUE, (v_max_attempts - (v_rec.attempts + 1)), NULL::TEXT;
        RETURN;
    ELSE
        -- If this was the 5th failed attempt, expire the challenge immediately
        IF (v_rec.attempts + 1) >= v_max_attempts THEN
            UPDATE public.company_admin_2fa_challenges
            SET expires_at = now()
            WHERE id = p_challenge_id;

            RETURN QUERY SELECT FALSE, 0, 'Too many failed attempts. Challenge has been locked.'::TEXT;
            RETURN;
        END IF;

        RETURN QUERY SELECT FALSE, (v_max_attempts - (v_rec.attempts + 1)), 'Incorrect verification code. Please check your email.'::TEXT;
        RETURN;
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.verify_company_admin_2fa_challenge(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_company_admin_2fa_challenge(UUID, UUID, TEXT) TO service_role;

-- ----------------------------------------------------------------------------
-- 4. CHECK 2FA STATUS RPC (Called by ProtectedAdminRoute & Admin APIs)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_company_admin_2fa_status()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_has_active_2fa BOOLEAN := FALSE;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Verify that the caller is a registered company admin AND has a verified 2FA challenge
    -- within the active session window (12 hours) that was verified prior to expiry
    SELECT EXISTS (
        SELECT 1 
        FROM public.company_admin_2fa_challenges c
        JOIN public.company_admins ca ON ca.user_id = c.user_id AND ca.company_id = c.company_id
        WHERE c.user_id = auth.uid()
          AND c.verified_at IS NOT NULL
          AND c.verified_at > (now() - INTERVAL '12 hours')
          AND c.expires_at >= c.verified_at
    ) INTO v_has_active_2fa;

    RETURN COALESCE(v_has_active_2fa, FALSE);
END;
$$;

REVOKE ALL ON FUNCTION public.check_company_admin_2fa_status() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_company_admin_2fa_status() TO authenticated;

-- ----------------------------------------------------------------------------
-- 5. INVALIDATE 2FA RPC (Called on Sign Out)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.invalidate_company_admin_2fa()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
    IF auth.uid() IS NOT NULL THEN
        UPDATE public.company_admin_2fa_challenges
        SET expires_at = now()
        WHERE user_id = auth.uid()
          AND expires_at > now();
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.invalidate_company_admin_2fa() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.invalidate_company_admin_2fa() TO authenticated;
