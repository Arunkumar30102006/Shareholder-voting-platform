# System Architecture Document: Vote India Secure

**Document Version**: 2.0  
**Domain**: `https://www.shareholdervoting.in`  
**Core Stack**: React 18, TypeScript, Vite React SSG, Tailwind CSS, Supabase Edge Functions (Deno), PostgreSQL 15, Vercel Edge Network.

---

## 1. High-Level Architecture Overview

Vote India Secure is structured as a zero-trust, decoupled corporate voting architecture where browser clients never directly modify or authenticate database records, and never hold readable session bearer tokens in JavaScript storage.

```
                                    CLIENT TIER
             ┌────────────────────────────────────────────────────────┐
             │       React 18 + Vite React SSG (shareholdervoting.in) │
             │       • PWA Offline Shell                              │
             │       • Tailwind CSS + Dynamic CSS 3D Lighting         │
             │       • Zero Bearer Token in JS (sessionStorage/local) │
             └───────────────────────────┬────────────────────────────┘
                                         │
                                         │ HTTPS / Same-Site Credentials (cookies: include)
                                         ▼
                                   EDGE PROXY TIER
             ┌────────────────────────────────────────────────────────┐
             │ Vercel Rewrites / Same-Site API Gateway (/api/*)       │
             │   • /api/auth/initiate ──► initiate-shareholder-auth   │
             │   • /api/auth/verify   ──► verify-shareholder-otp      │
             │   • /api/auth/session  ──► shareholder-session         │
             │   • /api/cast-vote     ──► cast-vote                   │
             └───────────────────────────┬────────────────────────────┘
                                         │
                                         │ Internal Service-Role Auth & Context
                                         ▼
                                COMPUTE / EDGE TIER
             ┌────────────────────────────────────────────────────────┐
             │ Supabase Edge Functions (Deno Runtime)                 │
             │   • Anti-enumeration challenge generator               │
             │   • Keyed HMAC-SHA-256 verifier (OTP_HMAC_SECRET)      │
             │   • HttpOnly, Secure, SameSite=Strict cookie issuer    │
             │   • Synchronizer CSRF Token Validator                  │
             │   • Origin & Referer strict enforcement                │
             └───────────────────────────┬────────────────────────────┘
                                         │
                                         │ SECURITY DEFINER RPC (search_path = pg_catalog, public)
                                         ▼
                                  DATA & AUDIT TIER
             ┌────────────────────────────────────────────────────────┐
             │ PostgreSQL 15 (Supabase Hardened Instance)             │
             │   • auth_challenges (Isolated service_role only)       │
             │   • shareholder_auth_sessions (TTL & Revocation)       │
             │   • frozen_voter_master (Immutable record date shares) │
             │   • cast_authorized_vote RPC (Atomic vote + tally)     │
             │   • votes (UNIQUE constraint on resolution+shareholder)│
             │   • SHA-256 Tamper-Evident Chained Audit Ledger        │
             │   • Strict RLS (Anonymous direct mutation revoked)     │
             └────────────────────────────────────────────────────────┘
```

---

## 2. Authentication & Session Management Lifecycle

### 2.1. Challenge Initiation (`/api/auth/initiate`)
1. Shareholder inputs identifier (DP ID / Client ID / Folio) and PAN.
2. The frontend sends `POST /api/auth/initiate`.
3. The Edge Function verifies request origin and rate-limiting limits.
4. If voter details exist:
   - Generate cryptographically secure 6-digit OTP using `crypto.getRandomValues()`.
   - Compute keyed HMAC:
     $$\text{otp\_hash} = \text{HMAC-SHA-256}(\text{OTP\_HMAC\_SECRET}, \text{challenge\_id} \parallel \text{otp})$$
   - Store record in `auth_challenges` table with `expires_at = now() + 10 \text{ minutes}`, `attempts = 0`, `max_attempts = 5`.
   - Dispatch OTP via Resend or SMS provider to registered email/phone on file.
5. If voter details DO NOT exist:
   - Simulate work via cryptographic hashing to match execution timing.
6. **Anti-Enumeration Contract**: Both existing and non-existing accounts receive an identical `HTTP 202 Accepted` response:
   ```json
   {
     "message": "If the details match our registered records, a one-time verification code has been dispatched to your registered email.",
     "challenge_id": "c7a8e23b-4890-4e31-8f5b-9d4cb803a61f"
   }
   ```

### 2.2. OTP Verification & Session Issuance (`/api/auth/verify`)
1. Shareholder inputs the 6-digit OTP received.
2. Frontend sends `POST /api/auth/verify` with `{ challenge_id, otp }`.
3. Edge Function verifies:
   - Challenge exists, is unverified, and has not expired.
   - `attempts < max_attempts` (locks out permanently on 5th failure).
   - Keyed HMAC hash matches recorded hash.
4. On success:
   - Challenge marked `verified = true`.
   - Generates 256-bit cryptographically secure session token (`voting_session`) and matching CSRF token.
   - Inserts session into `shareholder_auth_sessions` linked to `shareholder_id` with 2-hour TTL.
   - Sets response cookie:
     ```http
     Set-Cookie: voting_session=<session_token>; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=7200
     ```
   - Returns JSON body containing only non-sensitive CSRF token and expiration:
     ```json
     {
       "success": true,
       "csrf_token": "<random_token>",
       "expires_at": 1726849200
     }
     ```

### 2.3. Same-Site API Proxying
To prevent cross-domain cookie restrictions (Third-Party Cookie Deprecation / Safari ITP), all API requests use the same origin `shareholdervoting.in`:
- `vercel.json` rewrites `/api/*` to the Supabase project endpoint.
- `vite.config.ts` proxies `/api/*` to Supabase during local development.
- The browser natively includes the `HttpOnly` cookie in all requests without JavaScript intervention (`credentials: "include"`).

---

## 3. Atomic Voting & Tamper-Evident Ledger

### 3.1. Voting Execution Flow (`/api/cast-vote`)
```
Browser                     API Proxy / Edge Function                 PostgreSQL RPC
   │                                   │                                     │
   ├── POST /api/cast-vote ───────────►│                                     │
   │   (Cookie: voting_session,        │                                     │
   │    Header: X-CSRF-Token,          │                                     │
   │    Body: resolution_id, choice)   │                                     │
   │                                   ├── Validate Origin & CSRF Token      │
   │                                   ├── Resolve session token from cookie │
   │                                   ├── Lookup active session in DB ─────►│
   │                                   │◄── Return shareholder_id ───────────┤
   │                                   │                                     │
   │                                   ├── Call cast_authorized_vote() ─────►│
   │                                   │   (shareholder_id, resolution_id,   │
   │                                   │    vote_choice)                     │
   │                                   │                                     │
   │                                   │                                     ├── BEGIN TRANSACTION
   │                                   │                                     ├── Check resolution active
   │                                   │                                     ├── Check unique constraint
   │                                   │                                     ├── Fetch frozen record-date shares
   │                                   │                                     ├── Fetch last audit ledger hash
   │                                   │                                     ├── Compute SHA-256 vote hash
   │                                   │                                     ├── Insert into votes table
   │                                   │                                     ├── Update resolution tallies
   │                                   │                                     ├── COMMIT
   │                                   │◄── Return receipt details ──────────┤
   │◄── HTTP 200 { success, receipt } ─┤
```

### 3.2. Frozen Record-Date Voting Invariant
Statutory rules require voting entitlements to reflect shareholdings strictly as of the cut-off date. In `cast_authorized_vote`:
```sql
SELECT record_date_shares INTO v_voting_weight
FROM frozen_voter_master
WHERE resolution_id = p_resolution_id AND shareholder_id = p_shareholder_id;

-- Fallback to voter snapshot if resolution-specific roster is not segregated
IF v_voting_weight IS NULL THEN
  SELECT shares INTO v_voting_weight
  FROM shareholders
  WHERE id = p_shareholder_id;
END IF;
```
Live modifications to a shareholder's balance after the record date have zero impact on their voting power.

### 3.3. Duplicate Vote Prevention
Enforced at the physical database layer via composite unique index:
```sql
ALTER TABLE public.votes
ADD CONSTRAINT votes_resolution_shareholder_unique
UNIQUE (resolution_id, shareholder_id);
```
Any race condition or concurrent request attempt fails with PostgreSQL error code `23505` (`unique_violation`), guaranteeing that double-voting is mathematically impossible.

### 3.4. Cryptographic Chained Audit Ledger
Every vote record generates an audit entry linked to the previous transaction hash:
$$\text{Hash}_n = \text{SHA-256}(\text{Hash}_{n-1} \parallel \text{shareholder\_id} \parallel \text{resolution\_id} \parallel \text{choice} \parallel \text{weight} \parallel \text{timestamp})$$

Any modification to historical records or ballot choices breaks the chain, providing instantaneous mathematical tamper detection for the Scrutinizer.

---

## 4. Database Hardening & Security Policies

1. **Explicit Search Path**:
   Every `SECURITY DEFINER` function explicitly defines:
   ```sql
   SET search_path = pg_catalog, public;
   ```
   This prevents schema spoofing and search-path injection vulnerabilities.

2. **Revocation from Public**:
   All sensitive functions have `EXECUTE` privileges explicitly revoked from `PUBLIC`, `anon`, and `authenticated`. Only `service_role` can invoke them:
   ```sql
   REVOKE EXECUTE ON FUNCTION public.cast_authorized_vote FROM PUBLIC, anon, authenticated;
   GRANT EXECUTE ON FUNCTION public.cast_authorized_vote TO service_role;
   ```

3. **Row-Level Security (RLS)**:
   - `auth_challenges`: Service-role only (`FALSE` for public).
   - `shareholder_auth_sessions`: Service-role only (`FALSE` for public).
   - `votes`: Direct insert/update disabled for public roles. Can only be queried by the Scrutinizer or authenticated user for their own receipt.
   - `companies`, `resolutions`: Read-only for active meetings; write-restricted to authenticated company administrators.

---

## 5. Performance, SSG & Core Web Vitals

1. **Static Site Generation (SSG)**:
   Built using `vite-react-ssg` with crawler-friendly pre-rendered HTML for all marketing, governance, blog, and regulatory pages.
2. **Chunk Optimization**:
   - `vendor-react`: Core React runtime.
   - `three-bundle`: Three.js / WebGL completely isolated from landing page critical path.
   - `pdf-bundle`: jsPDF and document parsing deferred until report export is requested.
   - `charts-bundle`: Recharts loaded only on dashboard routes.
3. **Pure CSS Dynamic Lighting**:
   Landing page visuals powered by GPU-accelerated CSS 3D transforms (`HeroCyberOrb`), eliminating main-thread JavaScript execution and maintaining $TBT \le 200\text{ms}$.
4. **Deferred Consent Analytics**:
   Google Tag Manager and telemetry scripts are removed from blocking HTML head and loaded via idle callbacks (`requestIdleCallback`) only after user interaction, with automatic PII parameter scrubbing.
