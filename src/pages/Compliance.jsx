import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ShieldCheck, FileText, Scale, CheckCircle2, Calendar, HelpCircle, ArrowRight, Building2, Lock, Users, ChevronDown, ChevronRight, Shield, Sparkles, Layers, FileSpreadsheet, KeyRound, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/layout/SEO";
import { createBreadcrumbSchema, createFaqSchema, createWebPageSchema } from "@/components/layout/StructuredData";
// ─── JSON-LD Structured Data ───
const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Compliance", url: "/compliance" }
]);
const faqList = [
    {
        q: "Is e-voting mandatory for all listed companies in India?",
        a: "Yes. Under Section 108 of the Companies Act 2013 read with Rule 20 of the Companies (Management and Administration) Rules 2014, and Regulation 44 of SEBI (Listing Obligations and Disclosure Requirements) Regulations 2015, every listed company and every company having not less than 1,000 shareholders is statutorily mandated to provide a remote e-voting facility to its members for all general meetings."
    },
    {
        q: "What happens if a listed company doesn't provide e-voting facility?",
        a: "Failure to provide mandatory e-voting violates Section 108 and Section 450 of the Companies Act 2013, as well as SEBI LODR Regulations. Penalties include monetary fines on the company and officers in default (up to ₹10,000 with additional daily fines), potential invalidation of resolutions passed at the meeting, and SEBI regulatory enforcement actions."
    },
    {
        q: "Can shareholders vote after the AGM meeting starts?",
        a: "Yes. In accordance with MCA General Circulars and Rule 20(4)(viii), remote e-voting closes at 5:00 PM on the day immediately preceding the AGM. However, during the virtual or hybrid AGM, an venue e-voting (InstaPoll) window is made available so that members attending the meeting who did not cast their vote via remote e-voting can cast their ballots in real-time."
    },
    {
        q: "How is vote secrecy maintained in e-voting under Indian law?",
        a: "Rule 20(4)(xii) of the Companies Rules mandates that the register of votes cast cannot be accessed by the company or any third party before the voting closes. Vote India Secure enforces AES-256 bit ballot encryption and SHA-256 hash sealing. The encrypted ballots can only be unlocked by the designated independent Scrutinizer in the presence of at least two independent witnesses."
    },
    {
        q: "What is Form MGT-13 and when is it required?",
        a: "Form MGT-13 is the statutory Scrutinizer's Report prescribed under Rule 20(4)(xii) of the Companies (Management and Administration) Rules 2014. The Scrutinizer must prepare and submit this report to the Chairman or authorized Director within 2 working days of the general meeting conclusion, detailing votes cast in favor, against, and invalid votes for each resolution."
    }
];
const complianceFaqSchema = createFaqSchema(faqList.map(item => ({ question: item.q, answer: item.a })));
const webPageSchema = createWebPageSchema({
    name: "SEBI E-Voting Compliance for Listed Companies | Vote India Secure",
    description: "Understand statutory e-voting provisions under Companies Act 2013 Section 108, Rule 20, and SEBI LODR Regulation 44 for general meetings in India.",
    url: "/compliance",
});
// ─── Statutory Mandate Data ───
const legalMandates = [
    {
        icon: Scale,
        act: "Companies Act, 2013 — Section 108",
        rule: "Rule 20, Companies (Management and Administration) Rules, 2014",
        requirement: "Mandates electronic voting facility for every listed company and any company with ≥ 1,000 members for all general meetings.",
        effectiveDate: "April 1, 2014 (Amended 2015 & 2020)",
        tag: "Primary Statute",
        color: "from-blue-500/20 to-cyan-500/20",
        border: "border-blue-500/30"
    },
    {
        icon: ShieldCheck,
        act: "SEBI (LODR) Regulations, 2015",
        rule: "Regulation 44 — Voting by Shareholders",
        requirement: "Mandates that listed entities provide remote e-voting to all shareholders for all resolutions passed at general meetings and postal ballots.",
        effectiveDate: "December 1, 2015 (Updated 2021)",
        tag: "SEBI Mandate",
        color: "from-indigo-500/20 to-blue-500/20",
        border: "border-indigo-500/30"
    },
    {
        icon: FileText,
        act: "SEBI Circular on E-Voting Facility",
        rule: "Circular: SEBI/HO/CFD/CMD/CIR/P/2020/242",
        requirement: "Standardizes e-voting processes, single-login depository access via CDSL/NSDL, and streamlined digital scrutinizer verification workflows.",
        effectiveDate: "December 9, 2020",
        tag: "Operational Guidelines",
        color: "from-cyan-500/20 to-teal-500/20",
        border: "border-cyan-500/30"
    },
    {
        icon: Building2,
        act: "MCA General Circulars on Virtual Meetings",
        rule: "General Circular Nos. 14/2020, 20/2020 & Subsequent Extensions",
        requirement: "Enables conducting AGMs and EGMs through Video Conferencing (VC) or Other Audio-Visual Means (OAVM) paired with remote e-voting.",
        effectiveDate: "Continuous Extension through 2024-2026",
        tag: "MCA Compliance",
        color: "from-emerald-500/20 to-green-500/20",
        border: "border-emerald-500/30"
    }
];
// ─── Who Must Comply ───
const complianceChecklist = [
    {
        title: "All Listed Public Entities (BSE / NSE)",
        description: "Every company whose equity shares are listed on a recognized stock exchange in India under SEBI LODR Regulation 44.",
        statute: "SEBI LODR Reg 44 & Companies Act Sec 108"
    },
    {
        title: "Companies with 1,000+ Shareholders",
        description: "Any unlisted or listed company having not less than one thousand members on its register on the record cutoff date.",
        statute: "Rule 20(2), Companies (M&A) Rules 2014"
    },
    {
        title: "Special Resolutions Passed via Postal Ballot",
        description: "All companies transacting statutory business items listed under Section 110 of the Companies Act (e.g., alteration of MOA/AOA, buyback of shares).",
        statute: "Companies Act 2013 Section 110"
    },
    {
        title: "Companies Conducting Virtual / Hybrid AGMs",
        description: "Entities conducting annual or extraordinary general meetings through VC / OAVM under Ministry of Corporate Affairs directives.",
        statute: "MCA General Circular Framework"
    }
];
// ─── Compliance Mapping Matrix ───
const complianceMatrix = [
    {
        requirement: "Secure Voter Authentication",
        law: "Rule 20(4)(iv) — Companies (M&A) Rules",
        implementation: "2FA OTP + PAN / DP ID / Client ID verification with rate-limiting and anti-brute force defenses.",
        icon: KeyRound,
        status: "Fully Aligned"
    },
    {
        requirement: "Vote Secrecy & Anonymity",
        law: "Rule 20(4)(xii) — Unalterable Ballots",
        implementation: "AES-256 bit end-to-end encryption. Votes are blinded and cryptographically sealed until scrutinizer unlocks them.",
        icon: Lock,
        status: "Fully Aligned"
    },
    {
        requirement: "Immutable Audit Trail",
        law: "Rule 20(4)(xv) — Custody of Registers",
        implementation: "SHA-256 cryptographic Merkle ledger. Every vote produces an immutable audit receipt with timestamp verification.",
        icon: Shield,
        status: "Fully Aligned"
    },
    {
        requirement: "Statutory Scrutinizer Portal",
        law: "Rule 20(4)(ix) — Scrutinizer Appointment",
        implementation: "Independent digital portal with 2-witness cryptographic key unblocking and 1-click Form MGT-13 export.",
        icon: FileSpreadsheet,
        status: "Fully Aligned"
    },
    {
        requirement: "Real-Time Result Declaration",
        law: "Regulation 44(3) — SEBI LODR 2015",
        implementation: "Automated resolution tally generation with visual charts, ready for BSE/NSE and website dissemination in <48 hours.",
        icon: Layers,
        status: "Fully Aligned"
    },
    {
        requirement: "Multi-Device Accessibility",
        law: "MCA Guidelines on Equitable Access",
        implementation: "Responsive Web & PWA architecture optimized for smartphones, tablets, and desktops with sub-2s load time.",
        icon: Smartphone,
        status: "Fully Aligned"
    }
];
// ─── AGM Timeline Steps ───
const agmTimeline = [
    {
        day: "Day -30",
        stage: "Board Approval",
        title: "Board Approves AGM Notice & Scrutinizer",
        desc: "Board of Directors approves meeting agenda, fixes record cutoff date, and appoints an independent Scrutinizer (PCS / PCA).",
        color: "border-blue-500 text-blue-400"
    },
    {
        day: "Day -21",
        stage: "Notice Dispatch",
        title: "Statutory Notice Dispatched",
        desc: "Notice of AGM sent electronically to all shareholders, directors, and auditors at least 21 clear days before the meeting.",
        color: "border-indigo-500 text-indigo-400"
    },
    {
        day: "Day -3",
        stage: "E-Voting Window",
        title: "Remote E-Voting Window Opens",
        desc: "Remote e-voting opens at 9:00 AM at least 3 days prior and closes at 5:00 PM on the day preceding the AGM.",
        color: "border-cyan-500 text-cyan-400"
    },
    {
        day: "Day 0",
        stage: "AGM Day",
        title: "General Meeting & InstaPoll",
        desc: "AGM conducted via physical/VC. Venue voting enabled for attending members who did not vote via remote e-voting.",
        color: "border-amber-500 text-amber-400"
    },
    {
        day: "Day +2",
        stage: "Scrutiny",
        title: "Scrutinizer Unblocks & Verifies Votes",
        desc: "Independent Scrutinizer unblocks votes in the presence of 2 independent witnesses and validates weighted counts.",
        color: "border-purple-500 text-purple-400"
    },
    {
        day: "Day +2",
        stage: "MGT-13 Filing",
        title: "Form MGT-13 Report Submitted",
        desc: "Scrutinizer signs and submits Form MGT-13 report to Chairman. Consolidated results countersigned.",
        color: "border-emerald-500 text-emerald-400"
    },
    {
        day: "Day +48hrs",
        stage: "Stock Exchange",
        title: "Results Published to BSE / NSE",
        desc: "Voting results submitted to stock exchanges within 48 hours of meeting conclusion under Regulation 44(3).",
        color: "border-green-500 text-green-400"
    }
];
export const Compliance = () => {
    const [openFaq, setOpenFaq] = useState(0);
    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };
    return (<div className="min-h-screen bg-[#020817] text-white selection:bg-blue-500/30">
      <SEO title="SEBI E-Voting Compliance for Listed Companies | Vote India Secure" description="Understand statutory e-voting provisions under Companies Act 2013 Section 108, Rule 20, and SEBI LODR Regulation 44 for general meetings in India." canonical="/compliance" schemas={[breadcrumbSchema, complianceFaqSchema, webPageSchema]}/>

      {/* ─── 1. HERO SECTION ─── */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-cyan-500/15 to-transparent rounded-full blur-[140px]"/>
        </div>

        <div className="container mx-auto px-4 max-w-5xl text-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-6">
              <ShieldCheck className="w-4 h-4 text-cyan-400"/>
              <span>Statutory Compliance Architecture</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
              E-Voting Compliance for{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                Indian Listed Companies
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-200 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
              A comprehensive guide to fulfilling electronic voting mandates under <a href="https://www.mca.gov.in/content/mca/global/en/acts-rules/ebooks/rules.html" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline">Section 108 of the Companies Act 2013 / Rule 20</a>, MCA General Circulars, and <a href="https://www.sebi.gov.in/legal/regulations/jan-2015/sebi-listing-obligations-and-disclosure-requirements-regulations-2015_26561.html" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline">SEBI LODR Regulation 44</a> with bank-grade cryptographic vote integrity.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/company-register" className="w-full sm:w-auto">
                <Button size="xl" className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-bold gap-2 px-8 py-6 rounded-xl shadow-lg shadow-blue-900/40 border border-blue-400/30">
                  Register Your Company
                  <ArrowRight className="w-4 h-4"/>
                </Button>
              </Link>
              <Link to="/features" className="w-full sm:w-auto">
                <Button variant="outline" size="xl" className="w-full border-white/20 hover:bg-white/10 text-white font-semibold gap-2 px-8 py-6 rounded-xl">
                  View Platform Features
                  <ChevronRight className="w-4 h-4"/>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. LEGAL MANDATE SECTION ─── */}
      <section className="py-20 bg-[#0d1b2a]/50 border-y border-white/10 relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-slate-200 text-xs font-bold uppercase tracking-wider mb-4">
              <Scale className="w-3.5 h-3.5 text-blue-400"/>
              Statutory Framework
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
              The Legal Requirement
            </h2>
            <p className="text-slate-300 text-base md:text-lg">
              Indian corporate governance law establishes strict, non-negotiable statutory mandates for remote electronic voting.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {legalMandates.map((item, index) => (<motion.div key={item.act} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className={`p-7 rounded-3xl bg-[#0d1b2a]/90 border ${item.border} backdrop-blur-xl shadow-xl hover:translate-y-[-2px] transition-all flex flex-col justify-between`}>
                <div>
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-300">
                      <item.icon className="w-6 h-6 text-cyan-400"/>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-cyan-300 border border-blue-400/30">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1.5">{item.act}</h3>
                  <p className="text-xs text-cyan-300/90 font-mono mb-4">{item.rule}</p>
                  <p className="text-sm text-slate-200 leading-relaxed mb-6 font-normal">
                    {item.requirement}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span>Effective Date</span>
                  <span className="font-semibold text-slate-200">{item.effectiveDate}</span>
                </div>
              </motion.div>))}
          </div>
        </div>
      </section>

      {/* ─── 3. WHO MUST COMPLY SECTION ─── */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-slate-200 text-xs font-bold uppercase tracking-wider mb-4">
              <Users className="w-3.5 h-3.5 text-emerald-400"/>
              Applicability Scope
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
              Who Is Required to Provide E-Voting?
            </h2>
            <p className="text-slate-300 text-base md:text-lg">
              Check if your entity falls under mandatory electronic voting provisions under MCA & SEBI regulations.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {complianceChecklist.map((item, index) => (<motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="p-6 rounded-3xl bg-[#0d1b2a]/80 border border-white/15 backdrop-blur-xl shadow-lg flex items-start gap-4 hover:border-emerald-400/40 transition-all">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400"/>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1.5">{item.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">{item.description}</p>
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-white/5 border border-white/10 text-emerald-300">
                    {item.statute}
                  </span>
                </div>
              </motion.div>))}
          </div>
        </div>
      </section>

      {/* ─── 4. HOW VOTE INDIA SECURE COMPLIES SECTION ─── */}
      <section className="py-20 bg-[#0d1b2a]/60 border-y border-white/10 relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Shield className="w-3.5 h-3.5 text-cyan-400"/>
              Statutory Alignment Matrix
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
              How Vote India Secure Meets These Requirements
            </h2>
            <p className="text-slate-300 text-base md:text-lg">
              Every feature of Vote India Secure is purpose-built to satisfy statutory compliance directives out of the box.
            </p>
          </div>

          {/* Transparent Trust & Accreditation Notice */}
          <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-xs md:text-sm leading-relaxed mb-10">
            <strong>Transparent Regulatory & Accreditation Notice:</strong> Vote India Secure is an independent corporate governance software platform. Its workflows are engineered in architectural alignment with Section 108 of the Companies Act, 2013 and Rule 20 of the Companies (Management and Administration) Rules, 2014. The platform is not currently accredited by NSDL/CDSL or certified by STQC. Form MGT-13 exports are generated to facilitate statutory reporting by appointed Scrutinizers.
          </div>

          <div className="overflow-x-auto rounded-3xl border border-white/15 shadow-2xl bg-[#020817]/80 backdrop-blur-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/15 bg-white/5 text-slate-200 text-xs uppercase tracking-wider font-bold">
                  <th className="py-4 px-6">Statutory Requirement</th>
                  <th className="py-4 px-6">Legal Citation</th>
                  <th className="py-4 px-6">Platform Implementation</th>
                  <th className="py-4 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-sm">
                {complianceMatrix.map((row) => (<tr key={row.requirement} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-4 px-6 font-semibold text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300 shrink-0">
                        <row.icon className="w-4 h-4 text-cyan-400"/>
                      </div>
                      {row.requirement}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-cyan-300/90">{row.law}</td>
                    <td className="py-4 px-6 text-slate-300 leading-relaxed text-xs">{row.implementation}</td>
                    <td className="py-4 px-6 text-right">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-cyan-300 border border-cyan-400/30">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400"/>
                        {row.status}
                      </span>
                    </td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── 5. AGM TIMELINE SECTION ─── */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-slate-200 text-xs font-bold uppercase tracking-wider mb-4">
              <Calendar className="w-3.5 h-3.5 text-amber-400"/>
              Statutory Workflow
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
              Timeline of a Compliant AGM E-Voting Process
            </h2>
            <p className="text-slate-300 text-base md:text-lg">
              Follow the step-by-step statutory countdown required under Rule 20 and SEBI guidelines.
            </p>
          </div>

          <div className="relative border-l-2 border-white/20 ml-4 md:ml-32 space-y-8">
            {agmTimeline.map((step, index) => (<motion.div key={step.day} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.08 }} className="relative pl-8 md:pl-10 group">
                {/* Node marker */}
                <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#020817] border-2 ${step.color} group-hover:scale-125 transition-transform`}/>

                {/* Day Badge for Desktop */}
                <div className="hidden md:block absolute -left-32 top-0 text-right w-24">
                  <span className={`text-sm font-black font-mono ${step.color}`}>
                    {step.day}
                  </span>
                  <p className="text-[10px] uppercase font-bold text-slate-400">{step.stage}</p>
                </div>

                {/* Card */}
                <div className="p-6 rounded-2xl bg-[#0d1b2a]/80 border border-white/15 backdrop-blur-xl shadow-lg hover:border-white/30 transition-all">
                  <div className="md:hidden flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded bg-white/10 ${step.color}`}>
                      {step.day}
                    </span>
                    <span className="text-[11px] uppercase font-bold text-slate-400">{step.stage}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1.5">{step.title}</h3>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>))}
          </div>
        </div>
      </section>

      {/* ─── 6. FAQ SECTION ─── */}
      <section className="py-20 bg-[#0d1b2a]/50 border-t border-white/10 relative">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-slate-200 text-xs font-bold uppercase tracking-wider mb-4">
              <HelpCircle className="w-3.5 h-3.5 text-blue-400"/>
              Legal Knowledge Base
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-300 text-base md:text-lg">
              Statutory guidance and legal interpretations for Company Secretaries and Corporate Legal Counsel.
            </p>
          </div>

          <div className="space-y-4">
            {faqList.map((faq, index) => {
            const isOpen = openFaq === index;
            return (<div key={faq.q} className="rounded-2xl border border-white/15 bg-[#0d1b2a]/80 backdrop-blur-xl overflow-hidden transition-all shadow-md">
                  <button onClick={() => toggleFaq(index)} className="w-full p-6 text-left flex items-center justify-between gap-4 text-white hover:text-cyan-300 transition-colors" aria-expanded={isOpen}>
                    <span className="font-bold text-base md:text-lg">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 shrink-0 text-cyan-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}/>
                  </button>
                  <div className={`p-6 pt-0 text-sm text-slate-300 leading-relaxed border-t border-white/10 ${isOpen ? "block" : "hidden"}`}>
                    {faq.a}
                  </div>
                </div>);
        })}
          </div>
        </div>
      </section>

      {/* ─── 7. CTA SECTION ─── */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="p-10 md:p-14 rounded-3xl bg-gradient-to-r from-blue-900/60 via-[#0d1b2a] to-indigo-950/60 border border-blue-500/30 backdrop-blur-2xl shadow-2xl text-center relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5"/>
              Statutory Aligned Governance
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
              Ready to Make Your AGM Compliant?
            </h2>
            <p className="text-slate-200 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              Conduct your next Annual General Meeting, EGM, or Postal Ballot with end-to-end statutory compliance, 2FA voter verification, and 1-click Form MGT-13 reports.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/company-register" className="w-full sm:w-auto">
                <Button size="xl" className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-bold gap-2 px-8 py-6 rounded-xl shadow-lg shadow-blue-900/40 border border-blue-400/30">
                  Register Your Company
                  <ArrowRight className="w-4 h-4"/>
                </Button>
              </Link>
              <Link to="/contact" className="w-full sm:w-auto">
                <Button variant="outline" size="xl" className="w-full border-white/20 hover:bg-white/10 text-white font-semibold gap-2 px-8 py-6 rounded-xl">
                  Talk to Our Compliance Team
                  <ChevronRight className="w-4 h-4"/>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>);
};
export default Compliance;
