# Engineering & Architectural Rules: Vote India Secure

**Document Status**: Active & Enforced  
**Applicability**: All code, configurations, database migrations, Edge Functions, and documentation in this repository.

---

### Rule 1: Zero Hardcoded Backdoors or Bypass Logic
- Never include development backdoors, magic OTPs (e.g., `"123456"`), hardcoded test tokens, or bypass flags in production code paths.
- Test scenarios must use mock environments or dedicated unit test runners (`tests/*.test.mjs`), never bypass logic within application source code.

### Rule 2: Grounded Regulatory & Cryptographic Terminology
- Accurately describe the platform's security controls: **"SHA-256 tamper-evident hashing, PostgreSQL Row Level Security, and secure corporate voting software."**
- Never make unsupported marketing claims regarding blockchain consensus, decentralized ledgers, homomorphic encryption, or end-to-end ballot encryption at rest unless verified cryptographic implementations are present.

### Rule 3: Fail-Closed Secrets Management
- All sensitive cryptographic secrets (`OTP_HMAC_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`) must be loaded from server-side environment variables.
- If a required secret is absent in the runtime environment, the service must immediately fail closed and return `HTTP 503 Service Unavailable`.
- Never provide fallback hardcoded default strings (e.g., `process.env.SECRET || "default_dev_secret"`).

### Rule 4: No Client-Readable Session Tokens
- Voting session tokens must NEVER be stored in `localStorage`, `sessionStorage`, IndexedDB, or global JavaScript variables.
- All session authentication must be delivered and verified via `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/` cookies.

### Rule 5: Same-Site API Gateway
- All frontend network requests to backend services must target the same-site path `/api/*` on `shareholdervoting.in`.
- Vercel production rewrites and Vite development proxies route `/api/*` to Supabase Edge Functions. Cross-origin direct calls to external Supabase domains from the browser are prohibited for authenticated voting flows.

### Rule 6: CORS is Not Authorization
- Cross-Origin Resource Sharing (CORS) headers do not authenticate callers or prevent server-side request forgery.
- All state-changing requests (`POST`, `PUT`, `DELETE`, `PATCH`) must enforce:
  1. Origin / Referer validation against an explicit domain whitelist.
  2. Cryptographic Synchronizer CSRF Token (`X-CSRF-Token`) matching the active session.

### Rule 7: Anti-Enumeration Contract
- Authentication endpoints (`/api/auth/initiate`) must never reveal whether an account, DP ID, or PAN exists in the system.
- Every initiation request must return an identical `HTTP 202 Accepted` response with an opaque challenge UUID and identical message framing.
- Non-existing voter lookups must execute simulated cryptographic work to prevent timing side-channel attacks.

### Rule 8: Keyed HMAC-SHA-256 for OTP Verification
- Because 6-digit numeric OTPs have only 1,000,000 possibilities, plain SHA-256 hashes are vulnerable to offline rainbow table precomputation.
- All OTP verification digests must be computed using server-side keyed HMAC:
  $$\text{HMAC-SHA-256}(\text{OTP\_HMAC\_SECRET}, \text{challenge\_id} \parallel \text{otp})$$
- Verification is strictly capped at 5 attempts before irreversible lockout.

### Rule 9: Explicit Search Path on SECURITY DEFINER Functions
- Every PostgreSQL `SECURITY DEFINER` function must explicitly declare:
  ```sql
  SET search_path = pg_catalog, public;
  ```
- This prevents malicious actors from hijacking function execution via mutable search path schemas.

### Rule 10: Revocation of SECURITY DEFINER Privileges from Public
- Never allow `PUBLIC`, `anon`, or `authenticated` roles to invoke internal `SECURITY DEFINER` RPCs.
- Always execute:
  ```sql
  REVOKE EXECUTE ON FUNCTION public.<function_name> FROM PUBLIC, anon, authenticated;
  GRANT EXECUTE ON FUNCTION public.<function_name> TO service_role;
  ```

### Rule 11: No Direct Database Writes from the Browser
- Browser clients must never issue direct `INSERT`, `UPDATE`, or `DELETE` statements against `votes`, `auth_challenges`, or `shareholder_auth_sessions`.
- All mutations must pass through validated Edge Functions operating with the `service_role` key.

### Rule 12: Frozen Record-Date Voting Invariant
- A shareholder's voting weight is strictly determined by their share balance on the statutory cut-off date.
- Voting calculations must read from `frozen_voter_master` or a frozen snapshot roster, never from live, mutable share balances that could change after the record date.

### Rule 13: Database-Level Duplicate Vote Prevention
- Idempotency and exactly-once voting must be enforced at the physical database schema level via:
  ```sql
  CONSTRAINT votes_resolution_shareholder_unique UNIQUE (resolution_id, shareholder_id)
  ```
- Application-level `SELECT ... WHERE` checks are not sufficient to prevent race conditions during concurrent submissions.

### Rule 14: Tamper-Evident SHA-256 Audit Ledger
- Every cast vote must compute a SHA-256 cryptographic hash chaining to the preceding transaction hash in the resolution ledger.
- Individual records must remain verifiable so that any modification to a ballot's choice or weight immediately breaks downstream verification hashes.

### Rule 15: Scrutinizer Custody & Dual-Witness Protocol
- In compliance with Rule 20(4)(xii) of the Companies Rules 2014, voting registers must remain sealed until formal unblocking by the appointed Scrutinizer in the presence of at least two independent witnesses.
- Unblocking actions must be permanently logged with witness names, timestamps, and IP addresses.

### Rule 16: Zero PII and Vote Choices in Client Telemetry
- Client-side analytics must NEVER transmit:
  - Permanent Account Numbers (PAN), DP IDs, Client IDs, or Folio numbers.
  - Passwords, OTPs, session tokens, or cookie values.
  - Vote choices (`FOR`, `AGAINST`, `ABSTAIN`) or resolution text.
- All telemetry payloads must pass through regex scrubbing before submission.

### Rule 17: Deferred Third-Party Analytics
- Analytics scripts (GTM, GA4) must never be placed in synchronous, blocking `<head>` tags in `index.html`.
- All analytics loading must be deferred until browser idle state (`requestIdleCallback`) or delayed by at least 2,000ms to protect Core Web Vitals.

### Rule 18: GPU-Accelerated CSS Lighting over Heavy WebGL
- Critical landing and authentication pages must not load heavy Three.js or WebGL bundles on the primary rendering path.
- Visual effects must use GPU-accelerated CSS 3D transforms (`HeroCyberOrb`) to ensure Total Blocking Time (TBT) remains $\le 200\text{ms}$.

### Rule 19: Strict React Hook Discipline & SSR Compatibility
- React Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`) must NEVER be invoked conditionally, inside loops, or after early returns.
- Browser-only globals (`window`, `document`, `navigator`, `localStorage`) must be guarded with `typeof window !== 'undefined'` to prevent crashes during Vite React SSG static pre-rendering.

### Rule 20: Clean Build, Typecheck, and Lint Gate
- The repository must always pass:
  - `npm run typecheck` with **0 TypeScript errors**.
  - `npm run lint` with **0 ESLint errors and 0 warnings**.
  - `npm test` with **100% passing automated test suites**.
  - `npm run build` with **successful static site generation output**.

### Rule 21: Source-of-Truth Verification for Public Claims (SEO & Regulatory Safety)
- Every security, cryptographic, or statutory claim in public website content, metadata, and structured data MUST map to:
  1. An implemented code path in the active repository,
  2. An automated test or configuration evidence verifying its behavior, and
  3. A documented source of truth in repository documentation or official statutes.
- If any of the three criteria is missing, the claim must be downgraded or removed immediately.
- **Strictly Prohibited Claims**:
  - Unverified approvals/affiliations: *"SEBI approved"*, *"MCA approved"*, *"Government approved"*, *"CDSL/NSDL affiliated"*, *"ISO certified"*, *"SOC 2 certified"*.
  - Unverified cryptographic/security assertions: *"AES-256 ballot encryption"*, *"mathematical vault"*, *"HSM managed"*, *"100% secure"*, *"bank grade"*, *"military grade"*.
  - Unsupported uptime/scale metrics: *"99.99% uptime guarantee"*, *"millions of votes"*, fictional physical addresses.
- **Mandatory Versioned Statutory Metadata**:
  - All public educational/statutory resource pages must contain an explicit attribution card specifying: `Source`, `Source Version`, `Last Reviewed Date`, and `Reviewer`.

