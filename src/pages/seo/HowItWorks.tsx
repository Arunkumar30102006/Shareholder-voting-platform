import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Workflow,
  ShieldCheck,
  UploadCloud,
  Users,
  Vote,
  FileCheck2,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Clock,
  Lock,
  Building2,
  Sparkles,
  HelpCircle,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  KeyRound,
  Shield,
  Fingerprint,
  FileText,
  Layers,
  ArrowDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/layout/SEO";
import { createBreadcrumbSchema, createFaqSchema } from "@/components/layout/StructuredData";

const breadcrumbSchema = createBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "How It Works", url: "/how-it-works" }
]);

const hiwFaqs = [
  {
    q: "What is the complete statutory timeline for remote e-voting under Rule 20?",
    a: "Under Rule 20 of the Companies (Management and Administration) Rules, 2014: (1) Notice of AGM with e-voting instructions is dispatched at least 21 clear days before the meeting (T-21), (2) The statutory cut-off date to determine voting rights is set not earlier than 7 days before the AGM (T-7), (3) Remote e-voting commences at least 3 days prior and closes at 5:00 PM on the day preceding the AGM (T-1), and (4) Form MGT-13 Scrutinizer Report is submitted within 2 working days of meeting conclusion."
  },
  {
    q: "How are depository Benpos rosters ingested and weighted in Vote India Secure?",
    a: "Corporate administrators upload standardized Benpos CSV files received from depositories (NSDL/CDSL) or RTAs as on the cut-off date. The platform verifies DP ID/Client IDs, physical folios, and PANs, automatically calculating each shareholder's exact equity voting power (1 Share = 1 Vote)."
  },
  {
    q: "How does the platform protect ballot secrecy under Rule 20(4)(xii)?",
    a: "Individual voting choices are decoupled from voter identities in database views and protected by strict PostgreSQL Row-Level Security. The tally register remains locked and cannot be accessed by company directors, administrators, or third parties until the official scrutinizer unblocking ceremony."
  },
  {
    q: "How does the Independent Scrutinizer unblock the electronic voting register?",
    a: "Post-meeting, the appointed Scrutinizer initiates a digital multi-party unblocking ceremony in the presence of at least two independent witnesses who are not in the employment of the company. Upon unblocking, the system consolidates remote e-votes and venue polls into an MCA-aligned Form MGT-13 compatible draft report."
  },
  {
    q: "Can a shareholder modify their vote after submission?",
    a: "Under MCA Rule 20, once an electronic vote is cast on a resolution, the shareholder is strictly prohibited from modifying it. However, a shareholder who has cast their vote through remote e-voting may attend the general meeting, though they will not be entitled to cast their vote again at the venue."
  }
];

const hiwFaqSchema = createFaqSchema(
  hiwFaqs.map((f) => ({ question: f.q, answer: f.a }))
);

const statutoryStages = [
  {
    step: "01",
    phase: "T-21 Days Prior",
    title: "AGM Notice & Benpos Ingestion",
    desc: "The Company Secretarial team uploads the Depository Benpos register (NSDL/CDSL) and drafts Ordinary & Special resolutions. Automated notices with unique Voting User IDs and PINs are dispatched via email/SMS.",
    icon: UploadCloud,
    tag: "Notice & Setup",
    color: "from-blue-500/20 to-cyan-500/20 border-cyan-500/30 text-cyan-300"
  },
  {
    step: "02",
    phase: "T-7 Days Cut-Off",
    title: "Record Date Entitlement Freeze",
    desc: "Voting rights are immutably locked based on the paid-up value of shares held on the statutory cut-off date. Quorum thresholds (Section 103) are computed automatically.",
    icon: Calendar,
    tag: "Cut-Off Verification",
    color: "from-indigo-500/20 to-blue-500/20 border-indigo-500/30 text-indigo-300"
  },
  {
    step: "03",
    phase: "T-3 to T-1 Days (9 AM – 5 PM)",
    title: "Remote E-Voting Window",
    desc: "Shareholders log in via secure OTP authentication and cast weighted ballots on each resolution. Every ballot generates an immutable SHA-256 cryptographic digest and digital confirmation receipt.",
    icon: Vote,
    tag: "Remote Balloting",
    color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300"
  },
  {
    step: "04",
    phase: "Meeting Day (AGM / EGM)",
    title: "Live AGM & InstaPoll Venue Voting",
    desc: "During the virtual/hybrid general meeting, attendees who did not participate in remote e-voting can cast instant ballots via InstaPoll. Remote voters are blocked from double-voting.",
    icon: Users,
    tag: "InstaPoll Session",
    color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300"
  },
  {
    step: "05",
    phase: "Post-Meeting (Within 2 Days)",
    title: "2-Witness Unblocking & Form MGT-13",
    desc: "The Scrutinizer executes the digital unblocking ceremony with 2 independent witnesses under Rule 20(4)(xii), generating automated Form MGT-13 PDF reports for stock exchange filing (SEBI LODR 44).",
    icon: FileCheck2,
    tag: "Scrutiny & Filing",
    color: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300"
  }
];

export const HowItWorks = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activePersona, setActivePersona] = useState<"company" | "shareholder" | "scrutinizer">("company");

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white selection:bg-blue-500/30">
      <SEO
        title="How Corporate E-Voting Works | End-to-End Governance Architecture"
        description="Comprehensive guide to India's SEBI & Companies Act compliant e-voting lifecycle: Depository Benpos ingestion, 2FA voter ballots, two-witness scrutinizer unblocking, and Form MGT-13 reporting."
        canonical="/how-it-works"
        keywords="how e-voting works India, corporate voting process, AGM remote e-voting lifecycle, Rule 20 Companies Act, Form MGT-13 scrutinizer report, NSDL CDSL Benpos upload"
        schemas={[breadcrumbSchema, hiwFaqSchema]}
      />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-blue-600/20 via-cyan-500/15 to-purple-600/10 rounded-full blur-[140px]" />
        </div>

        <div className="container mx-auto px-4 max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
            <Workflow className="w-4 h-4 text-cyan-400" />
            <span>Statutory Corporate Governance Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
            How Corporate{" "}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
              E-Voting Works
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-200 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
            A transparent, step-by-step architectural breakdown of the Indian corporate electronic voting lifecycle under Section 108 of the Companies Act 2013 and SEBI LODR Regulation 44.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/company-register" className="w-full sm:w-auto">
              <Button size="xl" className="w-full bg-[#1e3a8a] hover:bg-blue-800 text-white font-bold gap-2 px-8 py-6 rounded-xl shadow-lg shadow-blue-900/40 border border-blue-400/30">
                Register Your Company
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/live-demo" className="w-full sm:w-auto">
              <Button variant="outline" size="xl" className="w-full border-white/20 hover:bg-white/10 text-cyan-300 font-semibold gap-2 px-8 py-6 rounded-xl">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Try Interactive Live Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* STATUTORY 5-STAGE LIFECYCLE TIMELINE */}
      <section className="py-20 bg-[#0d1b2a]/60 border-y border-white/10 relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              <span>Statutory AGM / EGM Milestones</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              The 5-Stage Governance Lifecycle
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-normal">
              Every phase is mathematically locked and time-stamped in alignment with Ministry of Corporate Affairs (MCA) Rule 20 mandates.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-4 relative">
            {statutoryStages.map((stage, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 hover:border-cyan-400/40 transition-all backdrop-blur-xl flex flex-col justify-between space-y-4 shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-black font-mono text-cyan-400">{stage.step}</span>
                    <div className={`p-2 rounded-xl border ${stage.color}`}>
                      <stage.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    {stage.phase}
                  </span>
                  <h3 className="font-bold text-white text-sm leading-snug mb-2">{stage.title}</h3>
                  <p className="text-xs text-slate-300 font-normal leading-relaxed">{stage.desc}</p>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <span className="text-[11px] font-semibold text-cyan-300 block">{stage.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PERSONA TABS: COMPANY, SHAREHOLDER, SCRUTINIZER */}
      <section className="py-20 bg-[#020817]">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Tailored Portals for Every Stakeholder
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Role-based interfaces engineered for Company Secretaries, Shareholders, and Scrutinizers.
            </p>
          </div>

          {/* Persona Switcher Buttons */}
          <div className="flex justify-center mb-8">
            <div className="grid grid-cols-3 bg-[#0d1b2a] p-1.5 rounded-2xl border border-white/15 max-w-md w-full shadow-lg">
              <button
                type="button"
                onClick={() => setActivePersona("company")}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activePersona === "company"
                    ? "bg-[#1e3a8a] text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Issuers
              </button>
              <button
                type="button"
                onClick={() => setActivePersona("shareholder")}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activePersona === "shareholder"
                    ? "bg-cyan-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Shareholders
              </button>
              <button
                type="button"
                onClick={() => setActivePersona("scrutinizer")}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activePersona === "scrutinizer"
                    ? "bg-purple-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                Scrutinizers
              </button>
            </div>
          </div>

          {/* Active Persona Content Card */}
          <div className="p-8 rounded-3xl bg-[#0d1b2a]/90 border border-white/20 backdrop-blur-2xl shadow-2xl">
            {activePersona === "company" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300">
                    <Building2 className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">For Corporate Issuers &amp; Secretarial Desks</h3>
                    <p className="text-xs text-slate-300">Full lifecycle management from Benpos ingestion to MCA reporting.</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold">
                      <FileSpreadsheet className="w-4 h-4" /> 1. Benpos Roster Ingestion
                    </div>
                    <p className="text-xs text-slate-300 font-normal leading-relaxed">
                      Upload NSDL/CDSL Benpos CSV registers with automated DP ID/Client ID, PAN, and folio verification.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-blue-300 text-xs font-bold">
                      <FileText className="w-4 h-4" /> 2. Resolution Drafts &amp; Timers
                    </div>
                    <p className="text-xs text-slate-300 font-normal leading-relaxed">
                      Configure Ordinary and Special resolutions with statutory Section 102 explanatory notes and auto-closing timers.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                      <Users className="w-4 h-4" /> 3. Section 103 Quorum Tracker
                    </div>
                    <p className="text-xs text-slate-300 font-normal leading-relaxed">
                      Live statutory quorum engine tracking member attendance against the legal threshold (5, 15, or 30 members).
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2">
                  <Link to="/company-dashboard" className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1">
                    Explore Enterprise Dashboard <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {activePersona === "shareholder" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                    <Users className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">For Shareholders &amp; Institutional Investors</h3>
                    <p className="text-xs text-slate-300">Frictionless OTP voting with cryptographic ballot integrity controls.</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold">
                      <KeyRound className="w-4 h-4" /> 1. OTP Verification
                    </div>
                    <p className="text-xs text-slate-300 font-normal leading-relaxed">
                      Log in using verified shareholder credentials (Folio/Demat ID) and time-sensitive 6-digit email OTP.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                      <Vote className="w-4 h-4" /> 2. Weighted Ballot Casting
                    </div>
                    <p className="text-xs text-slate-300 font-normal leading-relaxed">
                      Vote FOR, AGAINST, or ABSTAIN on each agenda item. Voting power dynamically equals exact shares held on record date.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-purple-300 text-xs font-bold">
                      <Shield className="w-4 h-4" /> 3. Cryptographic Receipt
                    </div>
                    <p className="text-xs text-slate-300 font-normal leading-relaxed">
                      Receive an instant SHA-256 transaction hash confirmation and printable PDF audit receipt for personal records.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2">
                  <Link to="/shareholder-login" className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1">
                    Go to Shareholder Login <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {activePersona === "scrutinizer" && (
              <div className="space-y-6">
                 <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                    <FileCheck2 className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">For Practising Company Secretaries &amp; Scrutinizers</h3>
                    <p className="text-xs text-slate-300">Multi-witness digital key unblocking and Form MGT-13 aligned report exports.</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-purple-300 text-xs font-bold">
                      <Lock className="w-4 h-4" /> 1. Rule 20(4)(xii) Unblocking
                    </div>
                    <p className="text-xs text-slate-300 font-normal leading-relaxed">
                      Execute the statutory unblocking ceremony in the presence of 2 independent witnesses who confirm they are not employees.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold">
                      <Layers className="w-4 h-4" /> 2. Merkle Root Verification
                    </div>
                    <p className="text-xs text-slate-300 font-normal leading-relaxed">
                      Mathematically verify vote integrity using SHA-256 Merkle proofs to detect any ballot modifications.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                      <FileCheck2 className="w-4 h-4" /> 3. Form MGT-13 Aligned Export
                    </div>
                    <p className="text-xs text-slate-300 font-normal leading-relaxed">
                      Generate structured consolidated report drafts aligned with statutory Form MGT-13 disclosure requirements.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2">
                  <Link to="/voting-management" className="text-xs font-bold text-purple-400 hover:underline flex items-center gap-1">
                    View Scrutinizer Workflow <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="py-20 bg-[#0d1b2a]/50 border-t border-white/10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-2xl md:text-4xl font-black text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm">
              Statutory guidance on electronic voting timelines, voter authentication, and report filings.
            </p>
          </div>

          <div className="space-y-4">
            {hiwFaqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/15 bg-[#0d1b2a]/90 overflow-hidden backdrop-blur-xl transition-all shadow-lg"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm md:text-base font-bold text-white hover:text-cyan-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-cyan-400 shrink-0 ml-4 transition-transform duration-300 ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-slate-200 leading-relaxed border-t border-white/10 font-normal">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERNAL NAVIGATION RESOURCES */}
      <section className="py-16 bg-[#020817] border-t border-white/10">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-lg font-bold text-white mb-6 text-center">Explore More Governance Modules</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <Link to="/shareholder-voting" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Shareholder Portal →
            </Link>
            <Link to="/remote-e-voting" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Remote E-Voting →
            </Link>
            <Link to="/security" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Security Architecture →
            </Link>
            <Link to="/faqs" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Governance FAQs →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
