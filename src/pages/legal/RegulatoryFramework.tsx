import { useState, useEffect } from "react";
import { SEO } from "@/components/layout/SEO";
import { Scale, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";

const sections = [
  { id: "statutory-scope", title: "1. Scope & Transparency Notice" },
  { id: "companies-act", title: "2. Companies Act Section 108 & Rule 20" },
  { id: "timelines", title: "3. Operational E-Voting Timelines" },
  { id: "technical-mapping", title: "4. Workflow Mappings" },
  { id: "scrutinizer-process", title: "5. Independent Scrutinizer Protocol" },
  { id: "statutory-metadata", title: "6. Regulatory Version & Attribution" },
];

export default function RegulatoryFramework() {
  const [activeSection, setActiveSection] = useState("statutory-scope");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 100, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen relative pt-28 pb-20 bg-[#020817] text-white">
      <SEO
        title="Electronic Voting Regulatory Framework | Vote India Secure"
        description="Overview of how platform technical workflows map to Section 108 of the Companies Act 2013 and Rule 20 requirements for general meeting voting."
        canonical="/regulatory-framework"
      />

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-4">
            <Scale className="w-4 h-4" /> Statutory Architecture Analysis
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Electronic Voting Regulatory Framework
          </h1>
          <p className="text-slate-400">
            Technical mappings to Indian statutory general meeting voting provisions.
          </p>
        </div>

        {/* Transparency Notice Banner */}
        <div className="mb-10 p-5 rounded-xl bg-amber-500/10 border border-amber-400/20 text-amber-200 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Transparency &amp; Legal Disclaimer:</strong> This page describes how the platform's technical workflows relate to selected Indian corporate and electronic voting provisions (principally Section 108 of the Companies Act, 2013 and Rule 20 of the Companies (Management and Administration) Rules, 2014). It is provided for informational and architectural clarity only and does not constitute a formal certification, government approval, official accreditation, or legal compliance determination. Companies must consult their company secretary and legal counsel regarding applicable statutory obligations.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-12 relative">
          {/* Sticky Sidebar */}
          <aside className="md:w-1/4 hidden md:block">
            <div className="sticky top-28 bg-[#020817]/60 backdrop-blur-md border border-white/10 p-6 rounded-xl">
              <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Table of Contents</h3>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`block w-full text-left text-sm py-2 px-3 rounded-lg transition-colors flex items-center justify-between ${
                      activeSection === section.id
                        ? "bg-blue-500/20 text-blue-400 font-medium"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    {section.title}
                    {activeSection === section.id && <ChevronRight className="w-4 h-4" />}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="md:w-3/4 max-w-3xl prose prose-invert prose-blue">
            <section id="statutory-scope" className="mb-12 scroll-mt-28">
              <h2 className="text-2xl font-bold text-white mb-4">1. Scope &amp; Applicable Provisions</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Under the Indian corporate law framework, voting at general meetings of prescribed companies is governed by the Companies Act, 2013, read with relevant ministerial rules and capital market listing regulations.
              </p>
              <p className="text-slate-300 leading-relaxed">
                Specifically, <strong>Section 108</strong> of the Companies Act, 2013 and <strong>Rule 20</strong> of the Companies (Management and Administration) Rules, 2014 mandate that prescribed classes of companies provide members the facility to exercise their voting rights through electronic means.
              </p>
            </section>

            <section id="companies-act" className="mb-12 scroll-mt-28">
              <h2 className="text-2xl font-bold text-white mb-4">2. Companies Act Section 108 &amp; Rule 20</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Rule 20 outlines the operational parameters for a secured electronic voting system. Key statutory elements include:
              </p>
              <ul className="list-disc pl-6 text-slate-300 space-y-2">
                <li><strong>Secured System Integrity:</strong> The electronic voting platform must produce verifiable records that ensure ballots cannot be intercepted, altered, or forged.</li>
                <li><strong>Secret Ballot Secrecy:</strong> Rule 20(4)(xii) stipulates that the register of votes cast cannot be accessed by the company or third parties prior to meeting closure.</li>
                <li><strong>Proportional Entitlement:</strong> Voting entitlement must correspond precisely to the shareholding as of the designated cut-off record date.</li>
              </ul>
            </section>

            <section id="timelines" className="mb-12 scroll-mt-28">
              <h2 className="text-2xl font-bold text-white mb-4">3. Operational E-Voting Timelines</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Rule 20(4)(vi) establishes strict scheduling rules for the remote e-voting window:
              </p>
              <ul className="list-disc pl-6 text-slate-300 space-y-2">
                <li><strong>Duration:</strong> The facility for remote e-voting shall remain open for not less than three (3) days.</li>
                <li><strong>Cut-off Time:</strong> Remote voting must close precisely at 5:00 p.m. on the date preceding the date of the general meeting.</li>
                <li><strong>Enforced Lock:</strong> Once the deadline expires, the system must automatically prevent any further remote ballots from being submitted or modified.</li>
              </ul>
            </section>

            <section id="technical-mapping" className="mb-12 scroll-mt-28">
              <h2 className="text-2xl font-bold text-white mb-4">4. Platform Workflow Mappings</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Vote India Secure implements technical controls specifically structured around these operational requirements:
              </p>
              <div className="space-y-4 mt-6">
                {[
                  {
                    title: "Authentication & Credential Verification",
                    desc: "Voter identity is verified using registered shareholder roster identifiers (Folio/DP ID/PAN) combined with time-sensitive keyed OTP delivery to registered emails."
                  },
                  {
                    title: "Ballot Integrity & Decoupling",
                    desc: "Each cast vote produces a unique SHA-256 cryptographic digest. Voter identities are decoupled from chosen resolutions in live reporting to preserve ballot secrecy."
                  },
                  {
                    title: "Immutable Lifecycle Enforcement",
                    desc: "State machine transitions (DRAFT → PUBLISHED → OPEN → CLOSED) are enforced at the PostgreSQL database level, preventing early tallying or post-closure submissions."
                  },
                  {
                    title: "Cut-off Date Integration",
                    desc: "Voting weight formulas reflect the voter master roster snapshot as of the statutory record date."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3 bg-[#020817] p-4 rounded-xl border border-white/5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block mb-1">{item.title}</strong>
                      <span className="text-slate-300 text-sm">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="scrutinizer-process" className="mb-12 scroll-mt-28">
              <h2 className="text-2xl font-bold text-white mb-4">5. Independent Scrutinizer Protocol</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Under Rule 20(4)(ix) and Rule 20(4)(xii), the Board of Directors must appoint an independent Scrutinizer (e.g., a Company Secretary or Chartered Accountant in practice) to oversee the voting process.
              </p>
              <ul className="list-disc pl-6 text-slate-300 space-y-2">
                <li><strong>Dual-Witness Unblocking:</strong> The scrutinizer unblocks the remote votes only after the general meeting concludes, in the presence of at least two independent witnesses who are not employees of the company.</li>
                <li><strong>Consolidated Tabulation:</strong> The scrutinizer prepares a consolidated report accounting for votes cast remotely and at the meeting venue.</li>
                <li><strong>Form MGT-13 Alignment:</strong> The platform exports structured audit summaries aligned with the columns and disclosures required by Form MGT-13.</li>
              </ul>
            </section>

            {/* Versioned Statutory Metadata Card */}
            <section id="statutory-metadata" className="mt-12 pt-8 border-t border-white/10">
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
                  Statutory Attribution &amp; Review Metadata
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400">
                  <div>
                    <dt className="text-slate-500 font-medium mb-1">Primary Statutory Source</dt>
                    <dd className="text-slate-200 font-semibold">
                      Companies Act, 2013 (Section 108 &amp; 114) / Companies (Management and Administration) Rules, 2014 (Rule 20)
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium mb-1">Statutory Version</dt>
                    <dd className="text-slate-200 font-semibold">As amended up to 2026</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium mb-1">Last Content Review Date</dt>
                    <dd className="text-slate-200 font-semibold">2026-09-20</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium mb-1">Review Committee</dt>
                    <dd className="text-slate-200 font-semibold">
                      Corporate Governance &amp; Statutory Architecture Review
                    </dd>
                  </div>
                </dl>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
