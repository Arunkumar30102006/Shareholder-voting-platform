# Engineering Memory & Architectural Decisions: Vote India Secure

**Document Status**: Active Knowledge Repository  
**Purpose**: Preserves historical engineering rationale, bug post-mortems, architectural trade-offs, and critical system invariants for current and future engineers.

---

## 1. Historical Vulnerabilities Eradicated

### 1.1. Hardcoded OTP Backdoor (`"123456"`)
- **Past State**: `ShareholderLogin.tsx` accepted `"123456"` as a valid OTP regardless of the user's identity, completely bypassing authentication in production.
- **Fix**: Removed all hardcoded OTP strings. Replaced with cryptographically secure, server-generated 6-digit OTPs verified via keyed HMAC-SHA-256 with 5-attempt lockout and 10-minute expiration.

### 1.2. Client-Side Secret Leakage
- **Past State**: `.env` and `.env.vercel` contained live `VITE_RESEND_API_KEY` and `GROQ_API_KEY` variables prefixed with `VITE_`, which Vite embeds directly into public browser bundles.
- **Fix**: Stripped all server keys from client `.env` files. Server-only secrets are now provisioned exclusively within Supabase Edge Functions environment variables.

### 1.3. Direct Browser-to-Database Voting & Anonymous Mutations
- **Past State**: Frontend components directly called `supabase.from("votes").insert(...)` and `supabase.from("shareholders").select(...)` using the public `anon` key.
- **Fix**: Revoked direct public insert/update permissions on `votes` and `shareholders`. All voting flows now transit through same-site Edge Function API proxies executing atomic PostgreSQL `SECURITY DEFINER` stored procedures with the `service_role` key.

### 1.4. React Hook Conditional Execution Violations
- **Past State**: Multiple components (`AdminVotingResults.tsx`, `VotingAnalytics.tsx`, `ShareholderAnalysis.tsx`, `chart.tsx`) called `useMemo`, `useState`, or `useEffect` after early `if (!data) return null` checks.
- **Fix**: Refactored all components to hoist hooks unconditionally to the top of the function scope, adhering strictly to the Rules of Hooks.

### 1.5. Blocking Synchronous Third-Party Scripts in Head
- **Past State**: Google Tag Manager was loaded via an inline `<script>` in the `<head>` of `index.html`, degrading FCP, LCP, and TBT, and tracking users prior to consent.
- **Fix**: Removed the blocking snippet from `index.html`. Created `src/lib/analyticsLoader.ts` to defer script injection until browser idle state (`requestIdleCallback`) with automatic PII and ballot data scrubbing.

---

## 2. Key Architectural Decisions & Rationale

### Decision 1: The Same-Site API Proxy (`/api/*`) vs Direct Cross-Domain RPCs
- **Context**: Browsers cannot read `HttpOnly` session cookies in JavaScript. If the frontend called `supabase.rpc("cast_authorized_vote", { p_session_token })`, it would need access to the token, defeating the purpose of `HttpOnly` protection against XSS.
- **Solution**: Route all requests through the same-site path `https://www.shareholdervoting.in/api/*` (handled via Vercel rewrites in production and Vite proxy in dev). The browser natively includes the `HttpOnly` cookie in the request. The Edge Function inspects the cookie, authenticates the session, and executes the RPC with the verified `shareholder_id`.

### Decision 2: Keyed HMAC-SHA-256 for 6-Digit OTPs
- **Context**: A 6-digit numeric OTP has only $1,000,000$ possible values ($100000$ to $999999$). Plain SHA-256 hashes can be reversed via precomputed rainbow tables in milliseconds.
- **Solution**: The server computes:
  $$\text{HMAC-SHA-256}(\text{OTP\_HMAC\_SECRET}, \text{challenge\_id} \parallel \text{otp})$$
  Because `OTP_HMAC_SECRET` is never exposed outside the secure Edge runtime, rainbow tables cannot be precomputed.

### Decision 3: Anti-Enumeration Authentication Challenge
- **Context**: Returning "User not found" or distinct error messages allows attackers to harvest valid shareholder PANs and DP IDs.
- **Solution**: The `/api/auth/initiate` endpoint always returns `HTTP 202 Accepted` with a generic confirmation message and an opaque challenge UUID. If the account does not exist, simulated cryptographic work is performed so response timings remain indistinguishable.

### Decision 4: Frozen Record-Date Voting Invariant
- **Context**: Under corporate law, shareholder voting entitlements must reflect shareholdings as of the statutory cut-off date. If a shareholder buys or sells shares between the cut-off date and the meeting, their voting weight must not change.
- **Solution**: The `cast_authorized_vote` RPC queries the frozen record-date shares (`frozen_voter_master`), ignoring subsequent modifications to the live shareholder registry.

### Decision 5: Pure CSS 3D Visuals over Heavy WebGL Canvas
- **Context**: Including Three.js or WebGL canvases on the critical landing page added $>650\text{KB}$ of JavaScript execution to the main thread, pushing Total Blocking Time (TBT) over $800\text{ms}$.
- **Solution**: Implemented `HeroCyberOrb.tsx` using pure GPU-accelerated CSS 3D transforms (`rotateX`, `rotateY`, `scale`). This achieved identical visual sophistication while cutting TBT to $\approx 0\text{ms}$.

---

## 3. Critical Invariants & Engineering Constraints

1. **Deno URL Imports in Edge Functions**:
   Supabase Edge Functions run on Deno and use URL imports (`https://deno.land/...`). Root `tsconfig.json` excludes `supabase/functions` to ensure Node-based TypeScript compilation (`tsc --noEmit`) remains completely clean.

2. **Static Site Generation (SSG) Browser Safety**:
   `vite-react-ssg` executes routes in a Node.js server environment during `npm run build`. Never reference `window`, `document`, `navigator`, or `localStorage` at the top level of a module or inside initial render without checking `typeof window !== 'undefined'`.

3. **Database Unique Constraints for Voting Idempotency**:
   Never rely solely on application-level checks to prevent double-voting. Always preserve the database composite constraint:
   ```sql
   UNIQUE (resolution_id, shareholder_id)
   ```
