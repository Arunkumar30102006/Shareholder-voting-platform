import { useState, useEffect } from "react";
import { SEO } from "@/components/layout/SEO";
import { createBreadcrumbSchema } from "@/components/layout/StructuredData";
import { 
  Shield, 
  ChevronRight, 
  Lock, 
  Server, 
  FileCheck2, 
  Scale, 
  UserCheck, 
  AlertCircle, 
  Mail, 
  Building2, 
  CheckCircle2,
  Clock,
  KeyRound,
  EyeOff
} from "lucide-react";
import { Link } from "react-router-dom";

const breadcrumbSchema = createBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Privacy Policy", url: "/privacy-policy" }
]);

const sections = [
  { id: "introduction", title: "1. Introduction & Statutory Scope" },
  { id: "data-roles", title: "2. Data Roles (Fiduciary vs Processor)" },
  { id: "data-collected", title: "3. Categories of Personal Data Collected" },
  { id: "purpose-processing", title: "4. Legal Grounds & Purposes for Processing" },
  { id: "ballot-secrecy", title: "5. Cryptographic Ballot Secrecy & De-identification" },
  { id: "pan-demat", title: "6. Handling of PAN, DP ID & Demat Records" },
  { id: "data-residency", title: "7. Sovereign Data Residency (India Only)" },
  { id: "security-safeguards", title: "8. Technical & Organizational Safeguards" },
  { id: "retention-erasure", title: "9. Data Retention & Cryptographic Disposal" },
  { id: "principal-rights", title: "10. Rights of Data Principals (DPDP Act 2023)" },
  { id: "disclosure-sharing", title: "11. Third-Party Sharing & Statutory Disclosures" },
  { id: "cookies-telemetry", title: "12. Cookies, Telemetry & CERT-In Logs" },
  { id: "dpo-grievance", title: "13. Data Protection Officer & Grievance Redressal" },
  { id: "policy-updates", title: "14. Amendments & Regulatory Notifications" }
];

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState("introduction");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 110, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white pt-28 pb-24 selection:bg-blue-500/30">
      <SEO
        title="Privacy Policy & DPDP Act Compliance | Vote India Secure"
        description="Comprehensive statutory Privacy Policy for Vote India Secure in accordance with the Digital Personal Data Protection (DPDP) Act 2023, Companies Act 2013, and SEBI LODR Regulations."
        canonical="/privacy-policy"
        keywords="privacy policy shareholder voting, DPDP Act 2023 compliance, data protection corporate voting India, PAN DPID data handling, ballot secrecy compliance"
        schemas={[breadcrumbSchema]}
      />

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Banner */}
        <header className="mb-14 pb-8 border-b border-white/10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-5">
            <Shield className="w-4 h-4 text-cyan-400" />
            Statutory Legal Framework
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
            Privacy Policy &amp; Data Protection Charter
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-400" />
              Effective Date: August 2026
            </span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-emerald-400" />
              Governing Law: DPDP Act 2023 &amp; Companies Act 2013
            </span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-1.5">
              <Server className="w-4 h-4 text-purple-400" />
              Data Sovereignty: Republic of India
            </span>
          </div>
        </header>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative">
          
          {/* Sticky Sidebar Navigation */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-28 bg-[#0d1b2a]/80 backdrop-blur-xl border border-white/15 p-6 rounded-2xl shadow-xl max-h-[calc(100vh-140px)] overflow-y-auto">
              <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-4 pb-2 border-b border-white/10 flex items-center justify-between">
                <span>Charter Sections</span>
                <span className="text-cyan-400 font-mono text-[11px]">14 Clauses</span>
              </h3>
              <nav className="space-y-1" aria-label="Privacy Policy Table of Contents">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left text-xs font-medium py-2 px-3 rounded-lg transition-all flex items-center justify-between group ${
                      activeSection === section.id
                        ? "bg-blue-500/25 text-cyan-300 border border-blue-400/40 shadow-sm"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className="truncate pr-2">{section.title}</span>
                    <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${activeSection === section.id ? "text-cyan-400 translate-x-0.5" : "text-slate-500 group-hover:text-slate-300"}`} />
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-5 border-t border-white/10">
                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-slate-300 space-y-1.5">
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" /> DPO Helpline
                  </div>
                  <p className="text-slate-400 leading-normal">
                    Direct grievance filing under DPDP Section 13:
                  </p>
                  <a href="mailto:support@shareholdervoting.in" className="text-cyan-400 hover:underline font-mono text-[10px] block">
                    support@shareholdervoting.in
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Legal Content */}
          <main className="lg:col-span-8 space-y-12">
            
            {/* Clause 1 */}
            <section id="introduction" className="scroll-mt-32 p-8 rounded-3xl bg-[#0d1b2a]/70 border border-white/15 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300 font-bold">
                  1
                </div>
                <h2 className="text-2xl font-bold text-white">Introduction &amp; Statutory Scope</h2>
              </div>
              <div className="space-y-4 text-slate-200 text-sm sm:text-base font-normal leading-relaxed">
                <p>
                  Welcome to <strong>Vote India Secure</strong> (accessible at <span className="font-mono text-cyan-300">https://www.shareholdervoting.in</span>). We are dedicated to providing enterprise-grade, cryptographically secure electronic voting software tailored for Indian corporate governance.
                </p>
                <p>
                  This Privacy Policy &amp; Data Protection Charter governs the manner in which Vote India Secure collects, receives, processes, stores, protects, and de-identifies personal data and financial identifiers during shareholder voting sessions, Annual General Meetings (AGMs), Extraordinary General Meetings (EGMs), and postal ballots.
                </p>
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-400/30 text-xs sm:text-sm text-slate-200 space-y-2">
                  <span className="font-bold text-cyan-300 block">Primary Statutory Compliance Anchors:</span>
                  <ul className="list-disc pl-5 space-y-1 text-slate-300">
                    <li><strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> — Enacted by the Parliament of India.</li>
                    <li><strong>Section 108 of the Companies Act, 2013</strong> read with <strong>Rule 20 of the Companies (Management and Administration) Rules, 2014</strong>.</li>
                    <li><strong>Regulation 44 of SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015</strong>.</li>
                    <li><strong>Information Technology Act, 2000</strong> &amp; the SPDI Rules, 2011.</li>
                    <li><strong>CERT-In Directions (April 2022)</strong> on cybersecurity log retention and incident management.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Clause 2 */}
            <section id="data-roles" className="scroll-mt-32 p-8 rounded-3xl bg-[#0d1b2a]/70 border border-white/15 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300 font-bold">
                  2
                </div>
                <h2 className="text-2xl font-bold text-white">Data Roles: Data Fiduciary vs. Data Processor</h2>
              </div>
              <div className="space-y-4 text-slate-200 text-sm sm:text-base font-normal leading-relaxed">
                <p>
                  Under the statutory nomenclature of the DPDP Act 2023 and Indian corporate law, responsibilities are clearly partitioned:
                </p>
                <div className="grid sm:grid-cols-2 gap-4 my-4">
                  <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                    <div className="font-bold text-cyan-300 flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4" /> The Issuing Company (Data Fiduciary)
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      The listed entity, corporate enterprise, or investment trust convening the general meeting acts as the <em>Data Fiduciary</em>. The company determines the purpose and means of processing shareholder records in fulfilment of its statutory AGM obligations under Section 108.
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                    <div className="font-bold text-blue-300 flex items-center gap-2 text-sm">
                      <Lock className="w-4 h-4" /> Vote India Secure (Data Processor)
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Vote India Secure operates as a secure technology provider and <em>Data Processor</em> engaged by the Data Fiduciary. We process shareholder and meeting data strictly in accordance with statutory mandates, contractual data processing agreements (DPAs), and documented instructions.
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  Individual shareholders whose records are processed are classified as <strong>Data Principals</strong> under Indian law.
                </p>
              </div>
            </section>

            {/* Clause 3 */}
            <section id="data-collected" className="scroll-mt-32 p-8 rounded-3xl bg-[#0d1b2a]/70 border border-white/15 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300 font-bold">
                  3
                </div>
                <h2 className="text-2xl font-bold text-white">Categories of Personal Data Collected</h2>
              </div>
              <div className="space-y-4 text-slate-200 text-sm sm:text-base font-normal leading-relaxed">
                <p>
                  In accordance with the principle of <strong>Data Minimisation</strong> under the DPDP Act 2023, Vote India Secure only processes information strictly required to establish voter eligibility, authenticate identity, and calculate weighted voting power:
                </p>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-black/30 border border-white/10">
                    <h4 className="font-bold text-white text-sm mb-1">A. Depository &amp; Shareholder Identification Data</h4>
                    <p className="text-xs text-slate-300">
                      Permanent Account Number (PAN), Depository Participant ID (DP ID), Client ID (16-digit demat account number for NSDL/CDSL), Physical Folio Numbers, and legal entity names as provided by the RTA Benpos record.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/30 border border-white/10">
                    <h4 className="font-bold text-white text-sm mb-1">B. Entitlement &amp; Holding Quantities</h4>
                    <p className="text-xs text-slate-300">
                      Total number of equity/preference shares held as on the statutory Record Cut-Off Date, corresponding weighted voting rights, and share classification (Ordinary, Special Voting Rights).
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/30 border border-white/10">
                    <h4 className="font-bold text-white text-sm mb-1">C. Contact &amp; Authentication Metadata</h4>
                    <p className="text-xs text-slate-300">
                      Registered email addresses and mobile telephone numbers used solely for delivering one-time voting credentials, meeting notices, and 2-Factor OTP verification tokens.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/30 border border-white/10">
                    <h4 className="font-bold text-white text-sm mb-1">D. Cryptographic Balloting Records</h4>
                    <p className="text-xs text-slate-300">
                      Timestamped ballot submissions cryptographically encrypted with AES-256 and chained into a SHA-256 Merkle audit proof. Individual voter selections remain decoupled from voter identity until official scrutinizer unblocking.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/30 border border-white/10">
                    <h4 className="font-bold text-white text-sm mb-1">E. Technical Telemetry &amp; Statutory Audit Logs</h4>
                    <p className="text-xs text-slate-300">
                      IP addresses, browser user-agents, network port headers, session identifiers, and time-stamped activity logs recorded in compliance with CERT-In directions and Rule 20 audit mandates.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Clause 4 */}
            <section id="purpose-processing" className="scroll-mt-32 p-8 rounded-3xl bg-[#0d1b2a]/70 border border-white/15 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300 font-bold">
                  4
                </div>
                <h2 className="text-2xl font-bold text-white">Legal Grounds &amp; Purposes for Processing</h2>
              </div>
              <div className="space-y-4 text-slate-200 text-sm sm:text-base font-normal leading-relaxed">
                <p>
                  Personal data is processed on the basis of <strong>Statutory Obligation</strong> and <strong>Legitimate Uses</strong> under Section 7 of the DPDP Act 2023 and Section 108 of the Companies Act 2013 for the following exclusive purposes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-xs sm:text-sm text-slate-300">
                  <li><strong>Shareholder Verification:</strong> Cross-referencing voter identity against depository Benpos rosters to prevent unauthorized ballot submissions and proxy fraud.</li>
                  <li><strong>Ballot Tabulation:</strong> Calculating voting outcomes weighted by shareholding volume (Assent / Dissent / Abstain).</li>
                  <li><strong>Scrutinizer Audit &amp; Form MGT-13:</strong> Generating official scrutinizer audit packages for stock exchange disclosure and MCA corporate filings.</li>
                  <li><strong>Dispute Resolution &amp; Meeting Regularity:</strong> Providing mathematical proof of quorum and non-repudiation in corporate judicial proceedings before the NCLT.</li>
                </ul>
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-200 text-xs sm:text-sm font-medium">
                  <strong>Explicit Non-Commercial Guarantee:</strong> Vote India Secure strictly prohibits the sale, rental, profiling, advertising, or commercial monetisation of personal or financial voter data.
                </div>
              </div>
            </section>

            {/* Clause 5 */}
            <section id="ballot-secrecy" className="scroll-mt-32 p-8 rounded-3xl bg-[#0d1b2a]/70 border border-white/15 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300 font-bold">
                  5
                </div>
                <h2 className="text-2xl font-bold text-white">Cryptographic Ballot Secrecy &amp; De-identification</h2>
              </div>
              <div className="space-y-4 text-slate-200 text-sm sm:text-base font-normal leading-relaxed">
                <p>
                  Under <strong>Rule 20(4)(xii) of the Companies Rules</strong>, the register of votes cast cannot be accessed by the company, board of directors, management, or system administrators before the conclusion of voting at the general meeting.
                </p>
                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                    <EyeOff className="w-4 h-4" /> Architectural Ballot Decoupling
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    When a shareholder casts their vote, the ballot payload is encrypted using <strong>AES-256 Galois/Counter Mode (GCM)</strong> and linked to a unique cryptographic receipt ID. The voter's identity is decoupled from their chosen resolution stance within the live database.
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The electronic vault containing encrypted tallies can only be unblocked post-meeting by the designated independent Scrutinizer in the presence of at least two independent witnesses through multi-party authorization keys.
                  </p>
                </div>
              </div>
            </section>

            {/* Clause 6 */}
            <section id="pan-demat" className="scroll-mt-32 p-8 rounded-3xl bg-[#0d1b2a]/70 border border-white/15 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300 font-bold">
                  6
                </div>
                <h2 className="text-2xl font-bold text-white">Handling of PAN, DP ID &amp; Demat Records</h2>
              </div>
              <div className="space-y-4 text-slate-200 text-sm sm:text-base font-normal leading-relaxed">
                <p>
                  Permanent Account Number (PAN) and Demat Account numbers (DP ID / Client ID) are treated as <strong>Sensitive Financial Identifiers</strong>:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-xs sm:text-sm text-slate-300">
                  <li><strong>Zero Plain-Text Transmission:</strong> All demographic credentials transmitted over the public internet are encrypted using TLS 1.3 with Perfect Forward Secrecy.</li>
                  <li><strong>One-Way Hash Masking:</strong> Sensitive identifiers are stored in salted, one-way hashed formats (SHA-256 / Argon2id) for audit cross-referencing.</li>
                  <li><strong>No Permanent Storage of Ephemeral Tokens:</strong> 2FA OTP tokens expire automatically within 5 minutes and are purged from active memory upon successful verification.</li>
                </ul>
              </div>
            </section>

            {/* Clause 7 */}
            <section id="data-residency" className="scroll-mt-32 p-8 rounded-3xl bg-[#0d1b2a]/70 border border-white/15 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300 font-bold">
                  7
                </div>
                <h2 className="text-2xl font-bold text-white">Sovereign Data Residency (India Only)</h2>
              </div>
              <div className="space-y-4 text-slate-200 text-sm sm:text-base font-normal leading-relaxed">
                <p>
                  In compliance with national data sovereignty standards and CERT-In cyber frameworks:
                </p>
                <div className="p-5 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-start gap-4">
                  <Server className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-white text-sm">100% In-Country Infrastructure</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      All primary database clusters, backup archives, application nodes, and audit logs are physically hosted inside sovereign Tier-4 data centers located in <strong>Mumbai and Bengaluru, India</strong>.
                    </p>
                    <p className="text-xs text-slate-400">
                      Zero voter records or personal demat identifiers are routed, transferred, or stored in foreign jurisdictions.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Clause 8 */}
            <section id="security-safeguards" className="scroll-mt-32 p-8 rounded-3xl bg-[#0d1b2a]/70 border border-white/15 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300 font-bold">
                  8
                </div>
                <h2 className="text-2xl font-bold text-white">Technical &amp; Organizational Safeguards</h2>
              </div>
              <div className="space-y-4 text-slate-200 text-sm sm:text-base font-normal leading-relaxed">
                <p>
                  Our multi-layered defense-in-depth architecture enforces the highest enterprise security standards:
                </p>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                    <span className="font-bold text-cyan-300 block mb-1">PostgreSQL Row-Level Security (RLS)</span>
                    <p className="text-slate-300">Granular database policies guarantee strict tenant isolation between disparate corporate issuers.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                    <span className="font-bold text-cyan-300 block mb-1">Rate Limiting &amp; Anti-Brute Force</span>
                    <p className="text-slate-300">Automated IP throttling and progressive delays protect voter login endpoints from dictionary attacks.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                    <span className="font-bold text-cyan-300 block mb-1">Continuous Integrity Checks</span>
                    <p className="text-slate-300">SHA-256 Merkle tree verification ensures zero undetected tampering across all recorded ballots.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                    <span className="font-bold text-cyan-300 block mb-1">DDoS Mitigation &amp; WAF</span>
                    <p className="text-slate-300">Edge-level Web Application Firewall filtering with automated bot traffic suppression.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Clause 9 */}
            <section id="retention-erasure" className="scroll-mt-32 p-8 rounded-3xl bg-[#0d1b2a]/70 border border-white/15 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300 font-bold">
                  9
                </div>
                <h2 className="text-2xl font-bold text-white">Data Retention &amp; Cryptographic Disposal</h2>
              </div>
              <div className="space-y-4 text-slate-200 text-sm sm:text-base font-normal leading-relaxed">
                <p>
                  Data retention timelines are strictly aligned with Indian statutory preservation mandates:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-xs sm:text-sm text-slate-300">
                  <li><strong>Meeting Register &amp; Scrutinizer Audit Trail:</strong> Retained for the statutory duration mandated under Section 128 of the Companies Act 2013 (up to 8 financial years for company records) or until hand-over to the Chairman / Scrutinizer.</li>
                  <li><strong>Cybersecurity Telemetry &amp; System Logs:</strong> Retained for <strong>180 calendar days</strong> as required by CERT-In Directions under the IT Act.</li>
                  <li><strong>Cryptographic Disposal:</strong> Upon expiry of the statutory retention window and written confirmation from the Data Fiduciary, voter rosters and session data are cryptographically wiped using multi-pass overwrites.</li>
                </ul>
              </div>
            </section>

            {/* Clause 10 */}
            <section id="principal-rights" className="scroll-mt-32 p-8 rounded-3xl bg-[#0d1b2a]/70 border border-white/15 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300 font-bold">
                  10
                </div>
                <h2 className="text-2xl font-bold text-white">Rights of Data Principals (DPDP Act 2023)</h2>
              </div>
              <div className="space-y-4 text-slate-200 text-sm sm:text-base font-normal leading-relaxed">
                <p>
                  Under Chapter III of the DPDP Act 2023, shareholders (Data Principals) possess the following enforceable rights:
                </p>
                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Right to Access Information (Section 11):</strong> Request a summary of personal data processed and identities of Data Fiduciaries with whom data has been shared.
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Right to Correction &amp; Updation (Section 12):</strong> Request correction of inaccurate demographic data. <em>(Note: Official depository records must be updated directly via your DP / RTA).</em>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Right to Nominate (Section 14):</strong> Nominate any individual to exercise data principal rights in the event of death or incapacity.
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Right of Grievance Redressal (Section 13):</strong> Access an easy and prompt grievance resolution mechanism with our Data Protection Officer.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Clause 11 */}
            <section id="disclosure-sharing" className="scroll-mt-32 p-8 rounded-3xl bg-[#0d1b2a]/70 border border-white/15 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300 font-bold">
                  11
                </div>
                <h2 className="text-2xl font-bold text-white">Third-Party Sharing &amp; Statutory Disclosures</h2>
              </div>
              <div className="space-y-4 text-slate-200 text-sm sm:text-base font-normal leading-relaxed">
                <p>
                  Vote India Secure only shares or discloses data to authorized third parties under strict statutory and operational necessity:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-xs sm:text-sm text-slate-300">
                  <li><strong>Appointed Scrutinizers:</strong> Delivery of encrypted tallies, register logs, and Form MGT-13 reports to the independent Practising Company Secretary (PCS) appointed under Rule 20.</li>
                  <li><strong>Regulatory &amp; Judicial Bodies:</strong> Compliance with lawful orders issued by SEBI, MCA, NCLT, or law enforcement agencies.</li>
                  <li><strong>Transactional Communication Infrastructure:</strong> SMS gateways (DLT-registered in India under TRAI regulations) and email gateways for delivery of 2FA OTPs and statutory voting confirmation receipts.</li>
                </ul>
              </div>
            </section>

            {/* Clause 12 */}
            <section id="cookies-telemetry" className="scroll-mt-32 p-8 rounded-3xl bg-[#0d1b2a]/70 border border-white/15 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300 font-bold">
                  12
                </div>
                <h2 className="text-2xl font-bold text-white">Cookies, Telemetry &amp; CERT-In Audit Logs</h2>
              </div>
              <div className="space-y-4 text-slate-200 text-sm sm:text-base font-normal leading-relaxed">
                <p>
                  We maintain a strict cookie and session posture:
                </p>
                <div className="space-y-2 text-xs sm:text-sm text-slate-300">
                  <p>
                    <strong>Strictly Necessary Cookies:</strong> We only utilize essential, encrypted HTTP-only session cookies required for maintaining authenticated states during live voting. We do not deploy third-party advertising cookies or cross-site tracking pixels.
                  </p>
                  <p>
                    <strong>CERT-In Security Compliance:</strong> As required by the Indian Computer Emergency Response Team (CERT-In), system logs containing IP addresses, DNS queries, and time synchronisation (NTP) data are preserved securely for 180 days to enable cybersecurity forensic audits.
                  </p>
                </div>
              </div>
            </section>

            {/* Clause 13 */}
            <section id="dpo-grievance" className="scroll-mt-32 p-8 rounded-3xl bg-[#0d1b2a]/70 border border-white/15 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300 font-bold">
                  13
                </div>
                <h2 className="text-2xl font-bold text-white">Data Protection Officer &amp; Grievance Redressal</h2>
              </div>
              <div className="space-y-4 text-slate-200 text-sm sm:text-base font-normal leading-relaxed">
                <p>
                  In accordance with Section 13 of the DPDP Act 2023 and Rule 5(9) of the SPDI Rules, any Data Principal may direct privacy inquiries, rights enforcement requests, or grievances to our designated Grievance Officer:
                </p>
                <div className="p-6 rounded-2xl bg-black/40 border border-white/15 space-y-3">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-base">
                    <UserCheck className="w-5 h-5" /> Data Protection &amp; Grievance Redressal Officer
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-300 pt-2">
                    <div>
                      <span className="text-slate-400 block text-xs">Officer Name:</span>
                      <strong>Legal &amp; Privacy Compliance Desk</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">Designation:</span>
                      <strong>Data Protection Officer (DPO)</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">Official Email:</span>
                      <a href="mailto:support@shareholdervoting.in" className="text-cyan-400 hover:underline font-mono">
                        support@shareholdervoting.in
                      </a>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">Operations Office:</span>
                      <span>Corporate Governance &amp; Cloud Operations Support Desk, India</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 pt-2 border-t border-white/10">
                    <strong>Grievance Resolution Timeline:</strong> We acknowledge all grievances within 48 hours and provide substantive resolution within <strong>30 calendar days</strong>. If unsatisfied, Data Principals may escalate to the <em>Data Protection Board of India (DPBI)</em>.
                  </p>
                </div>
              </div>
            </section>

            {/* Clause 14 */}
            <section id="policy-updates" className="scroll-mt-32 p-8 rounded-3xl bg-[#0d1b2a]/70 border border-white/15 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300 font-bold">
                  14
                </div>
                <h2 className="text-2xl font-bold text-white">Amendments &amp; Regulatory Notifications</h2>
              </div>
              <div className="space-y-4 text-slate-200 text-sm sm:text-base font-normal leading-relaxed">
                <p>
                  Vote India Secure reserves the right to amend this Privacy Policy periodically to reflect technological enhancements, statutory revisions under the DPDP Act rules, SEBI circulars, or MCA notifications.
                </p>
                <p className="text-xs text-slate-300">
                  Any material changes impacting shareholder data processing will be notified on our website and reflected in the updated Effective Date at the top of this document.
                </p>
              </div>
            </section>

            {/* Navigation to other legal documents */}
            <div className="pt-6 flex flex-wrap gap-4 justify-between items-center text-xs sm:text-sm text-slate-400 border-t border-white/10">
              <div className="flex flex-wrap gap-4">
                <Link to="/terms-of-service" className="text-cyan-400 hover:underline">
                  Terms of Service →
                </Link>
                <Link to="/data-protection" className="text-cyan-400 hover:underline">
                  Data Protection Architecture →
                </Link>
                <Link to="/compliance" className="text-cyan-400 hover:underline">
                  SEBI Compliance Matrix →
                </Link>
              </div>
              <span>© 2026 Vote India Secure. All rights reserved.</span>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
