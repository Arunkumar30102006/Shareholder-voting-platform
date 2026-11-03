# API-Function Directory (Route-Based API Architecture)

This folder contains the complete, route-based categorization of all API functions and backend service endpoints used in **Vote India Secure**.

---

### Folder Overview & Route Mapping

| File Name | Route / Page | Core API Responsibilities |
|---|---|---|
| **`Shareholder-Voting-API.js`** | `/voting-dashboard`<br>`/shareholder-login` | • `initiateAuth()` (User ID/Password validation & OTP challenge)<br>• `verifyOtp()` (HMAC passcode verification)<br>• `checkSession()` (Session cookie & token verification)<br>• `castVote()` (Cryptographic vote hash calculation & ballot submission)<br>• `getEligibleEvents()` (Eligible corporate AGM/EGM retrieval)<br>• `getResolutions()` (Ballot items & director elections)<br>• `getShareholderVotes()` (Existing cast ballots)<br>• `logout()` (Session termination) |
| **`Company-Dashboard-API.js`** | `/company-dashboard` | • `getCompanyProfile()` (Corporate data & capital representation)<br>• `getShareholders()` (Shareholder registry ledger)<br>• `addShareholder()` (Register stakeholder with login token)<br>• `updateShareholder()` (Edit stakeholder details & shares)<br>• `deleteShareholderCascaded()` (Atomic RPC deletion across all tables)<br>• `resendCredentials()` (Regenerate password and dispatch email)<br>• `calculateQuorum()` (Section 103 statutory quorum check) |
| **`Voting-Management-API.js`** | `/voting-management` | • `getSessions()` (List company voting events)<br>• `saveSessionSchedule()` (Dual-column timestamp & window sync)<br>• `updateSessionStatus()` (Admin manual start/pause/unseal)<br>• `addResolution()` / `deleteResolution()` (Ballot motion management)<br>• `addNominee()` (Director nominations with resolution auto-sync)<br>• `sendMeetingInvites()` (Dispatch official AGM notice & credentials)<br>• `getSessionResults()` (Section 114 statutory consensus calculation) |
| **`Company-Auth-Registration-API.js`** | `/company-login`<br>`/company-register` | • `loginAdmin()` (Corporate admin authentication)<br>• `initiate2FA()` / `verify2FA()` (Multi-factor challenge)<br>• `registerCompany()` (CIN pre-flight check, Supabase user creation, enterprise onboarding, and welcome email dispatch) |
| **`Backend-Edge-Functions-Endpoints.js`** | Backend Serverless (`supabase/functions/*`) | • `cast-vote` (Serverless ballot casting endpoint)<br>• `initiate-shareholder-auth` (Serverless authentication endpoint)<br>• `verify-shareholder-otp` (Passcode verification endpoint)<br>• `send-meeting-invites` (Email dispatch via Resend)<br>• `send-welcome-email` (Registration onboarding dispatch)<br>• PostgreSQL Stored Procedures (`cast_authorized_vote`, `delete_shareholder_cascaded`) |

---

### Key Architectural Highlights for Review Presentation

1. **Route-Based Organization:** Each file corresponds directly to a specific user role and application route, separating shareholder flows from corporate administration.
2. **MCA Rule 20 Compliance:** Single-use credential validation (`is_credential_used`) is integrated into both frontend checks and backend endpoints to prevent double voting.
3. **Multi-Layer Reliability:** High-volume operations like ballot casting include automatic fallbacks (API Proxy → Edge Function → Database RPC → Table Upsert).
4. **Referential Integrity:** Database stored procedures (`RPCs`) guarantee atomic execution without orphaned rows.

