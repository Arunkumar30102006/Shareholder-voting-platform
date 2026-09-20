# Engineering Tasks & Operational Checklist: Vote India Secure

**Document Version**: 2.0  
**Project**: Vote India Secure (`shareholdervoting.in`)  
**Audit Status**: 100% Complete — 0 Type Errors, 0 Lint Errors, 15/15 Tests Passing, Clean SSG Build

---

## 1. Hardening & Optimization Phase Matrix

| Phase | Description | Status | Verification |
|---|---|---|---|
| **Phase 0** | **Secrets & Environment Sanitization**<br>Stripped hardcoded API keys from `.env` and `.env.vercel`; created `.env.example`. | **COMPLETE** | Clean git status, no committed secrets |
| **Phase 1** | **Grounded Regulatory & Security Claims**<br>Replaced unsupported blockchain / AES-256 ballot claims with SHA-256 tamper-evident hashing and PostgreSQL RLS. | **COMPLETE** | Codebase-wide review of copy and meta tags |
| **Phase 2** | **Typecheck & Supabase Database Types**<br>Replaced corrupted UTF-16LE types with complete TypeScript schema definitions. | **COMPLETE** | `npm run typecheck` passes with 0 errors |
| **Phase 3** | **PostgreSQL Migration & Security Hardening**<br>Created migration with `auth_challenges`, `shareholder_auth_sessions`, RLS lockdown, search_path enforcement, and atomic RPC. | **COMPLETE** | Migration SQL file generated & reviewed |
| **Phase 4** | **Edge Functions & Same-Site API Gateway**<br>Created `initiate-shareholder-auth`, `verify-shareholder-otp`, `cast-vote`, `shareholder-session`, shared CORS and crypto. | **COMPLETE** | Edge Functions implemented with fail-closed secrets |
| **Phase 5** | **Cookie Auth & Voting Frontend Refactor**<br>Eliminated `"123456"` backdoor, converted auth to `HttpOnly` cookies, rewrote `VotingDashboard` and `ShareholderLogin`. | **COMPLETE** | No direct anonymous DB writes, no tokens in storage |
| **Phase 6** | **Email Hardening & HTML Sanitization**<br>Secured credential and welcome emails; removed plaintext passwords; added HTML escaping. | **COMPLETE** | Email Edge Functions hardened |
| **Phase 7** | **Automated Tests & Concurrency Verification**<br>Built 15 unit tests covering auth, OTP lockout, anti-enumeration, CSRF origin checks, and concurrent vote simulation. | **COMPLETE** | `npm test` passes (15/15 tests passing) |
| **Phase 8** | **React Hook Discipline & SSR Guarding**<br>Fixed conditional hook violations in charts and dashboards; ensured SSR safety in `vite-react-ssg`. | **COMPLETE** | `npm run lint` passes (0 errors, 0 warnings) |
| **Phase 9** | **Performance Tuning & Core Web Vitals**<br>Pure CSS 3D lighting (`HeroCyberOrb`), code chunking in `vite.config.ts`, killed rogue service workers. | **COMPLETE** | Verified non-critical chunk isolation |
| **Phase 10** | **Privacy-Preserving Deferred Analytics**<br>Removed blocking GTM from HTML head, built deferred loader (`analyticsLoader.ts`) and PII parameter scrubbing. | **COMPLETE** | Zero PII in telemetry, non-blocking hydration |
| **Phase 11** | **Durable Documentation System**<br>Created complete `/docs` suite: `PRD.md`, `ARCHITECTURE.md`, `RULES.md`, `DESIGN.md`, `TASKS.md`, `MEMORY.md`. | **COMPLETE** | All documents written and cross-referenced |

---

## 2. Operational Deployment Checklist

Before promoting this release to production on Vercel and Supabase, complete the following operational steps:

### 2.1. Supabase Database Migration
1. Apply the database migration to the production Supabase PostgreSQL instance:
   ```bash
   supabase db push
   # OR execute supabase/migrations/20260920000000_security_and_voting_integrity_hardening.sql in the Supabase SQL Editor
   ```
2. Verify that `auth_challenges` and `shareholder_auth_sessions` tables exist and have RLS enabled with service_role policies only.
3. Verify that `cast_authorized_vote`, `create_auth_challenge`, `verify_auth_challenge`, and `create_voting_session` have:
   - `search_path = pg_catalog, public`
   - `REVOKE EXECUTE ON FUNCTION ... FROM PUBLIC, anon, authenticated;`
   - `GRANT EXECUTE ON FUNCTION ... TO service_role;`

### 2.2. Supabase Edge Functions & Secrets Deployment
Deploy all Edge Functions and provision runtime environment secrets:
```bash
# 1. Set required secrets in Supabase dashboard or CLI:
supabase secrets set OTP_HMAC_SECRET="<generate-64-character-random-hex>"
supabase secrets set RESEND_API_KEY="re_..."
supabase secrets set APP_URL="https://www.shareholdervoting.in"

# 2. Deploy Edge Functions:
supabase functions deploy initiate-shareholder-auth --no-verify-jwt
supabase functions deploy verify-shareholder-otp --no-verify-jwt
supabase functions deploy shareholder-session --no-verify-jwt
supabase functions deploy cast-vote --no-verify-jwt
supabase functions deploy send-welcome-email
supabase functions deploy send-shareholder-credentials
```

### 2.3. Vercel Production Environment
1. In Vercel Project Settings $\rightarrow$ Environment Variables, ensure the following are configured:
   - `VITE_SUPABASE_URL`: `https://<project-ref>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `<production-anon-key>`
2. Verify that `vercel.json` rewrites are routing `/api/*` to the production Supabase project URL:
   - `/api/auth/initiate` $\rightarrow$ `/functions/v1/initiate-shareholder-auth`
   - `/api/auth/verify` $\rightarrow$ `/functions/v1/verify-shareholder-otp`
   - `/api/auth/session` $\rightarrow$ `/functions/v1/shareholder-session`
   - `/api/cast-vote` $\rightarrow$ `/functions/v1/cast-vote`

### 2.4. Production Pre-Flight Verification
Run all automated checks locally prior to committing:
```bash
npm run typecheck   # Must return 0 errors
npm run lint        # Must return 0 errors and 0 warnings
npm test            # Must pass 15/15 tests
npm run build       # Must generate 44 SSG pages and sitemap
npm run verify      # Must validate 38 HTML files, 54 schemas, 1151 links
```
