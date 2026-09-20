# Product Requirements Document (PRD): Vote India Secure

**Platform**: Vote India Secure (`shareholdervoting.in`)  
**Product Type**: Enterprise Software-as-a-Service (SaaS) Platform for Shareholder Remote E-Voting & Corporate Governance  
**Target Market**: Publicly Listed Corporations, Unlisted Companies, RTAs (Registrars & Transfer Agents), Independent Scrutinizers, and Global Shareholders  
**Statutory Alignment**: Companies Act 2013 (Section 108), Companies (Management and Administration) Rules 2014 (Rule 20), SEBI (LODR) Regulations 2015 (Regulation 44), Form MGT-13 Scrutinizer Reporting  

---

## 1. Executive Summary & Vision

Vote India Secure is an enterprise-grade electronic voting and corporate governance platform engineered to conduct secure, auditable, and seamless remote ballots for Annual General Meetings (AGMs), Extraordinary General Meetings (EGMs), postal ballots, and court-convened meetings.

The platform provides an intuitive, high-performance Progressive Web App (PWA) interface for retail and institutional shareholders to authenticate rapidly via two-factor authentication and cast cryptographically sealed, weighted ballots. For corporate issuers and independent scrutinizers, it delivers robust tools for resolution setup, master roster ingestion, quorum tracking, and one-click statutory report generation.

---

## 2. Statutory & Regulatory Foundation

The platform is designed in strict alignment with the statutory requirements governing remote electronic voting in India:

1. **Section 108 of the Companies Act, 2013**:
   - Mandates electronic voting facilities for prescribed classes of companies (every listed company and companies with $\ge 1,000$ shareholders).
   - Guarantees every eligible member the right to exercise their vote remotely.

2. **Rule 20 of the Companies (Management and Administration) Rules, 2014**:
   - **Notice Requirements**: Mandatory publication and dispatch of voting instructions, cut-off dates, and login credentials at least 21 clear days before the meeting.
   - **Cut-Off Date (Record Date)**: The entitlement of shareholders to cast votes is determined strictly by their shareholding on the cut-off date (not more than 7 days prior to the general meeting).
   - **Voting Window**: Remote voting facility must remain open for not less than 3 days and close at 5:00 PM on the day immediately preceding the date of the general meeting.
   - **Irrevocability of Vote**: Once a shareholder has cast their ballot on a resolution, they shall not be allowed to change or modify it subsequently.
   - **Scrutinizer Unblocking & Dual Witnesses**: The remote e-voting register remains locked and sealed against premature disclosure until the completion of the general meeting. It is unblocked strictly by the appointed Scrutinizer in the presence of at least two independent witnesses who are not in employment of the company.
   - **Form MGT-13 Scrutinizer Report**: The Scrutinizer must submit a consolidated report to the Chairman within 3 working days of the conclusion of the meeting.

3. **SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015 (Regulation 44)**:
   - Mandatory e-voting facility for all shareholder resolutions of listed entities.
   - Submission of voting results to stock exchanges within 2 working days of the conclusion of the meeting in the prescribed XBRL/tabular format.

---

## 3. Product Scope & Functional Modules

```
┌────────────────────────────────────────────────────────────────────────┐
│                      VOTE INDIA SECURE ECOSYSTEM                       │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ Shareholder Hub   │ Corporate Portal  │ Scrutinizer & Compliance Hub   │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ • 2FA OTP Auth    │ • Company Profile │ • Dual-Witness Unblocking Key  │
│ • Weighted Voting │ • Voter Roster Ingest│ • Real-Time Quorum Tracking  │
│ • Offline-Ready   │ • Resolution Setup│ • MGT-13 Statutory PDF Export  │
│ • Audit Receipts  │ • Timing Windows  │ • Merkle Ledger Verification   │
│ • AI Summaries    │ • Depository Sync │ • Stock Exchange Data Export   │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

### 3.1. Shareholder Experience Portal
- **Authentication**:
  - Two-Factor Authentication using Depository DP ID / Client ID / Folio Number + Permanent Account Number (PAN) + 6-digit Time-bound OTP dispatched to registered email/SMS.
  - Zero-enumeration login workflow: Identical response time and generic HTTP 202 Accepted acknowledgement to prevent user discovery.
  - Session protection via same-site `HttpOnly`, `Secure`, `SameSite=Strict` cookies and synchronizer CSRF tokens.
- **Ballot Presentation**:
  - Clear display of company details, meeting notice, resolution text, explanatory statements (Section 102), and resolution category (Ordinary vs. Special).
  - Optional AI-assisted executive summary of complex resolution legal text.
- **Ballot Execution**:
  - Choices: **FOR (Assent)**, **AGAINST (Dissent)**, or **ABSTAIN**.
  - Pro-rata weighted voting based strictly on frozen record-date shares.
  - Immediate generation of a downloadable, cryptographically signed voting confirmation receipt with SHA-256 verification hash and QR code.

### 3.2. Corporate Governance & Issuer Portal
- **Issuer Registration & Profile**:
  - CIN (Corporate Identification Number) verification, registered office, Company Secretary and Compliance Officer contact records.
- **Meeting Management**:
  - AGM/EGM scheduling, notice upload, record-date declaration, voting window start and end timers.
- **Resolution Orchestration**:
  - Resolution classification (Ordinary: $>50\%$ simple majority; Special: $\ge 75\%$ supermajority).
  - Draft notice attachment, financial statement links, director interest disclosures.
- **Shareholder Master Ingestion**:
  - Secure bulk upload of NSDL, CDSL, and physical registrar shareholder rosters (CSV/XLSX).
  - Automatic validation of DP ID/Client ID formats, PAN masking, and share balance sanity checks.
  - Snapshot freeze on cut-off date to create immutable `frozen_voter_master`.

### 3.3. Independent Scrutinizer Audit Portal
- **Statutory Custody**:
  - Cryptographic vault sealing prior to general meeting commencement.
  - Multi-party unblocking workflow requiring Scrutinizer authentication and registration of two non-employee independent witnesses.
- **Consolidated Tabulation**:
  - Real-time calculation of total votes cast, valid votes, invalid votes, assents, dissents, and abstentions.
  - Disaggregation by promoter group, public institutional holders, and public non-institutional holders (SEBI format).
- **Statutory Reporting**:
  - 1-Click generation of official Form MGT-13 Scrutinizer Report in PDF format.
  - Export to CSV/JSON matching BSE/NSE corporate filing upload specifications.

---

## 4. Technical Quality Attributes & SLAs

| Attribute | SLA / Requirement | Measurement & Verification |
|---|---|---|
| **Voting Invariant** | Exactly-once voting per `(resolution_id, shareholder_id)` | PostgreSQL composite `UNIQUE` constraint + atomic serializable RPC |
| **Tamper-Evidence** | Cryptographic hash chaining for all cast ballots | SHA-256 hash incorporating `previous_hash`, `shareholder_id`, `resolution_id`, `choice`, `weight` |
| **LCP (Largest Contentful Paint)** | $\le 2.5$ seconds | Google Lighthouse / PageSpeed Insights on desktop and 4G mobile |
| **FCP (First Contentful Paint)** | $\le 1.8$ seconds | Optimized critical CSS, preload tags, static SSG pre-rendering |
| **TBT (Total Blocking Time)** | $\le 200$ ms | Elimination of heavy main-thread 3D WebGL; deferred non-critical JS |
| **CLS (Cumulative Layout Shift)** | $\le 0.1$ | Explicit aspect ratios, font display swap, reserve dimensions for dynamic widgets |
| **Session Security** | Zero client-accessible tokens | `HttpOnly`, `Secure`, `SameSite=Strict` cookies; no sensitive data in `localStorage` |

---

## 5. Security & Privacy Non-Negotiables

1. **Grounded Terminology**:
   - Describe cryptographic protections accurately as **"SHA-256 tamper-evident hashing, PostgreSQL Row Level Security, and secure corporate voting software."**
   - Strictly prohibit unsupported assertions regarding blockchain consensus or end-to-end homomorphic/ballot encryption.
2. **Fail-Closed Architecture**:
   - If required server-side secrets (`OTP_HMAC_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`) are missing, reject requests with HTTP 503 rather than falling back to insecure defaults.
3. **No Direct Database Writes from Browser**:
   - All voter authentication, session issuance, and ballot submissions must transit through same-site Edge Function API proxies.
   - Row-Level Security (RLS) restricts anonymous or client-authenticated roles from inserting or modifying votes directly.
