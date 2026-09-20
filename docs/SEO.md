# SEO Architecture, Metadata Registry & Regulatory Claims Safety

**Production Domain:** `https://www.shareholdervoting.in`  
**Last Updated:** `2026-09-20`  
**Enforcement Rule:** `Rule 21 (Source-of-Truth Verification for Public Claims)`

---

## 1. Architectural Philosophy & Security Boundary

The SEO architecture for Vote India Secure is designed around three strict non-negotiables:
1. **Zero Exposure of Private Data:** Private shareholder voting flows, company administrative dashboards, voting sessions, and voter registers must never be exposed to search crawlers, metadata scrapers, or public sitemaps.
2. **Robots.txt vs Noindex Distinction:** As established by search engine crawling standards, HTML routes intended to be private (`/shareholder-login`, `/company-login`, `/voting-dashboard`, `/company-dashboard`, `/voting-management`, `/shareholder-analysis`) must be crawlable by Googlebot so that the `<meta name="robots" content="noindex, nofollow">` tag can be discovered and obeyed. `robots.txt` Disallow is strictly reserved for non-HTML backend API paths (`/api/`, `/supabase-proxy/`).
3. **Evidence-Backed Public Claims (Rule 21):** No statutory approvals, third-party certifications, or encryption claims may be published unless verified against active code or authoritative documentation.

---

## 2. Route Classification Matrix

| Route Path | Type | Indexing Directive | Canonical URL | Schema.org Graphs |
| :--- | :--- | :--- | :--- | :--- |
| `/` | Commercial Homepage | `index, follow` | `https://www.shareholdervoting.in/` | Organization, WebSite, SoftwareApplication, FAQPage |
| `/shareholder-e-voting` | Commercial Product | `index, follow` | `https://www.shareholdervoting.in/shareholder-e-voting` | BreadcrumbList, FAQPage |
| `/agm-voting` | Commercial Solution | `index, follow` | `https://www.shareholdervoting.in/agm-voting` | BreadcrumbList, WebPage |
| `/egm-voting` | Commercial Solution | `index, follow` | `https://www.shareholdervoting.in/egm-voting` | BreadcrumbList, WebPage |
| `/proxy-voting` | Commercial Solution | `index, follow` | `https://www.shareholdervoting.in/proxy-voting` | BreadcrumbList, WebPage |
| `/scrutinizer-tools` | Commercial Tool | `index, follow` | `https://www.shareholdervoting.in/scrutinizer-tools` | BreadcrumbList, WebPage |
| `/corporate-voting` | Commercial Solution | `index, follow` | `https://www.shareholdervoting.in/corporate-voting` | BreadcrumbList, WebPage |
| `/remote-e-voting` | Solution Guide | `index, follow` | `https://www.shareholdervoting.in/remote-e-voting` | BreadcrumbList, WebPage |
| `/online-e-voting` | Solution Guide | `index, follow` | `https://www.shareholdervoting.in/online-e-voting` | BreadcrumbList, WebPage |
| `/secure-voting` | Technical Overview | `index, follow` | `https://www.shareholdervoting.in/secure-voting` | BreadcrumbList, WebPage |
| `/security` | Technical Architecture | `index, follow` | `https://www.shareholdervoting.in/security` | BreadcrumbList, WebPage |
| `/regulatory-framework`| Statutory Reference | `index, follow` | `https://www.shareholdervoting.in/regulatory-framework`| BreadcrumbList, WebPage |
| `/compliance` | Compliance Reference | `index, follow` | `https://www.shareholdervoting.in/compliance` | BreadcrumbList, WebPage |
| `/data-protection` | Privacy Architecture | `index, follow` | `https://www.shareholdervoting.in/data-protection` | BreadcrumbList, WebPage |
| `/how-it-works` | Operational Guide | `index, follow` | `https://www.shareholdervoting.in/how-it-works` | BreadcrumbList, WebPage |
| `/faqs` | Knowledge Base | `index, follow` | `https://www.shareholdervoting.in/faqs` | BreadcrumbList, FAQPage |
| `/resources` | Educational Hub | `index, follow` | `https://www.shareholdervoting.in/resources` | BreadcrumbList, CollectionPage |
| `/resources/*` (7 articles) | Statutory Analyses | `index, follow` | `https://www.shareholdervoting.in/resources/*` | BreadcrumbList, Article |
| `/about` | Company Background | `index, follow` | `https://www.shareholdervoting.in/about` | BreadcrumbList, AboutPage |
| `/pricing` | Commercial Overview | `index, follow` | `https://www.shareholdervoting.in/pricing` | BreadcrumbList, WebPage |
| `/contact` | Support & Inquiries | `index, follow` | `https://www.shareholdervoting.in/contact` | BreadcrumbList, ContactPage |
| `/shareholder-login` | Private Auth | `noindex, nofollow` | — | None |
| `/company-login` | Private Auth | `noindex, nofollow` | — | None |
| `/company-register` | Commercial Onboarding| `noindex, nofollow` | — | None |
| `/voting-dashboard` | Private App | `noindex, nofollow` | — | None |
| `/company-dashboard` | Private App | `noindex, nofollow` | — | None |
| `/voting-management` | Private App | `noindex, nofollow` | — | None |
| `/shareholder-analysis`| Private App | `noindex, nofollow` | — | None |
| `/ai-power-suite` | Private App | `noindex, nofollow` | — | None |

---

## 3. Verified Claims Register (Rule 21)

| Prohibited Unverified Claim | Reason for Prohibition | Approved Verified Phrasing |
| :--- | :--- | :--- |
| `AES-256 ballot encryption` | Ballots are stored decoupled and sealed with SHA-256 hashing; AES-256 is disk volume storage encryption, not per-ballot cryptographic envelope. | `SHA-256 cryptographic ballot sealing` |
| `SEBI approved` / `MCA approved` | Regulatory agencies in India do not grant blanket commercial platform certifications to individual SaaS software applications. | `Workflows mapped to Section 108, Rule 20, and SEBI LODR Regulation 44` |
| `SOC 2 Type II certified` | Formal third-party SOC 2 audit report has not been completed. | `Security controls adhering to modern enterprise governance practices` |
| `ISO 27001 certified` | Formal third-party ISO audit certificate has not been issued. | `Information security practices adhering to international standards` |
| `100% secure` / `Bank grade` / `Military grade` | Unsubstantiated marketing superlatives prohibited by professional governance standards. | `Layered defense architecture with cryptographic integrity and PostgreSQL RLS` |
| `99.99% uptime guarantee` | No formal SLA contract is currently published. | `High-availability cloud infrastructure with edge routing` |
| `48-hour minimum statutory voting window` | Section 108 / Rule 20(4)(vi) mandates that remote e-voting must remain open for **not less than 3 days** (closing at 5:00 PM on the day preceding the AGM). | `Statutory 3-day minimum remote voting window (Rule 20(4)(vi))` |
| Fictional BKC Mumbai Address | Platform currently operates with virtual corporate support; no registered physical office at that address. | `India · Remote Corporate Governance & Cloud Operations Support Desk` |
| `2-Factor Shareholder Authentication` | Shareholder authentication is credential + keyed OTP; admin authentication is password + TOTP 2FA. | `Shareholder: Secure OTP Authentication` / `Admin: 2FA Authentication` |

---

## 4. Statutory Attribution Standards

All statutory and educational articles published under `/resources/*` and `/regulatory-framework` carry a standardized, machine-readable and human-visible attribution card:
- **Statutory Source:** Authoritative statute (e.g., Companies Act 2013, Section 108; Companies Rules 2014, Rule 20).
- **Source Version:** Amendment status (e.g., "As amended up to 2026").
- **Last Reviewed Date:** `2026-09-20`.
- **Reviewer:** "Corporate Governance & Statutory Architecture Review".

---

## 5. Automated Build & Verification Pipeline

1. **Central Config:** All route metadata is defined in `src/config/seoConfig.ts`.
2. **SSG Pre-rendering:** `vite-react-ssg` with `includedRoutes` in `vite.config.ts` pre-renders all 33 public pages to static HTML during `npm run build`.
3. **Dynamic Sitemap:** `scripts/generate-sitemap.cjs` outputs canonical `sitemap.xml` with verified `<lastmod>` timestamps matching `contentUpdatedAt`.
4. **Automated Audit Test:** `tests/seo_audit.test.mjs` verifies:
   - Every public page has an `<h1>`, `<title>`, `<meta name="description">`, and `<link rel="canonical">`.
   - Zero occurrences of banned claims across all generated static HTML files.
   - Clean JSON-LD structured data syntax.
