import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Vote,
  ShieldCheck,
  Lock,
  CheckCircle2,
  ArrowRight,
  Building2,
  Users,
  ChevronRight,
  ChevronDown,
  FileText,
  Smartphone,
  Scale,
  Sparkles,
  BarChart3,
  Clock,
  HelpCircle,
  KeyRound,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/layout/SEO";
import { createBreadcrumbSchema, createFaqSchema } from "@/components/layout/StructuredData";

const breadcrumbSchema = createBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Shareholder Voting", url: "/shareholder-voting" }
]);

const shareholderFaqs = [
  {
    q: "How do I log in to vote if my shares are in Demat form?",
    a: "Demat shareholders log in using their Depository Participant ID (DP ID) and Client ID (for NSDL/CDSL accounts) paired with their registered PAN and a 2FA OTP delivered to their registered email or phone number."
  },
  {
    q: "How do physical share certificate holders participate in e-voting?",
    a: "Physical shareholders enter their Registered Folio Number as recorded with the company's Registrar and Share Transfer Agent (RTA), along with their registered PAN and 2FA OTP authentication."
  },
  {
    q: "What is the significance of the cut-off date for voting rights?",
    a: "The cut-off date (record date) is fixed by the company under Rule 20. Only shareholders holding shares as of the close of business on the cut-off date are eligible to vote. Your voting weight equals the number of shares held on that specific date."
  },
  {
    q: "Can I vote FOR on some resolutions and AGAINST on others?",
    a: "Yes. Every resolution on the ballot is voted on independently. You can select FOR, AGAINST, or ABSTAIN for each resolution separately according to your investment discretion."
  }
];

const shareholderFaqSchema = createFaqSchema(
  shareholderFaqs.map((f) => ({ question: f.q, answer: f.a }))
);

export const ShareholderVoting = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white selection:bg-blue-500/30">
      <SEO
        title="Shareholder E-Voting Software | Vote India Secure"
        description="Enterprise shareholder electronic voting software with OTP authentication, weighted share representation, and cryptographic ballot verification."
        canonical="/shareholder-e-voting"
        schemas={[breadcrumbSchema, shareholderFaqSchema]}
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-cyan-500/15 to-transparent rounded-full blur-[140px]" />
        </div>

        <div className="container mx-auto px-4 max-w-5xl text-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-6">
              <Vote className="w-4 h-4 text-cyan-400" />
              <span>Shareholder E-Voting Portal</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
              Shareholder{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                E-Voting Software
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-200 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
              Exercise your shareholder voting rights securely online. Learn how to log in with Demat or Physical share records, review AGM/EGM resolutions, cast weighted ballots, and receive cryptographic receipts.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/shareholder-login" className="w-full sm:w-auto">
                <Button size="xl" className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-bold gap-2 px-8 py-6 rounded-xl shadow-lg shadow-blue-900/40 border border-blue-400/30">
                  Access Shareholder Login
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/live-demo" className="w-full sm:w-auto">
                <Button variant="outline" size="xl" className="w-full border-white/20 hover:bg-white/10 text-white font-semibold gap-2 px-8 py-6 rounded-xl">
                  Try Interactive Demo
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demat vs Physical Holdings Guide */}
      <section className="py-20 bg-[#0d1b2a]/50 border-y border-white/10 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-4">
              How to Log In &amp; Verify Your Holdings
            </h2>
            <p className="text-slate-300 text-sm md:text-base">
              Step-by-step authentication instructions for both electronic depository holders and physical folio holders.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 backdrop-blur-xl shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300 font-bold text-lg">
                <Smartphone className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Demat Shareholders (CDSL / NSDL)</h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
                If your shares are held in electronic dematerialized format:
              </p>
              <ul className="space-y-2 text-xs md:text-sm text-slate-200">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>CDSL:</strong> 16-digit Beneficiary Owner ID (BO ID).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>NSDL:</strong> 8-character DP ID (starts with IN) + 8-digit Client ID.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Enter your registered PAN and enter the 6-digit OTP sent to your email/mobile.</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 backdrop-blur-xl shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold text-lg">
                <FileText className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Physical Shareholders (Registered Folio)</h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
                If your shares are held in physical share certificates:
              </p>
              <ul className="space-y-2 text-xs md:text-sm text-slate-200">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Enter the <strong>Registered Folio Number</strong> printed on your share certificate or meeting notice.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Provide your registered PAN or bank account details registered with the company&apos;s RTA.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Enter the 6-digit OTP dispatched to your registered communication address.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6-Step Voting Walkthrough */}
      <section className="py-20 bg-[#020817] relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-4">
              Step-by-Step Voting Workflow
            </h2>
            <p className="text-slate-300 text-sm md:text-base">
              A transparent walk-through from credential login to downloading your cryptographic voting receipt.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Secure OTP Authentication",
                desc: "Log in with your User ID and credentials, followed by secure 6-digit keyed OTP verification.",
                icon: KeyRound,
              },
              {
                step: "02",
                title: "Meeting Overview",
                desc: "Review meeting agenda, statutory annual reports, and active voting window countdown timers.",
                icon: Building2,
              },
              {
                step: "03",
                title: "Resolution Analysis",
                desc: "Read Ordinary and Special resolution texts, explanatory statements, and director candidate bios.",
                icon: FileText,
              },
              {
                step: "04",
                title: "Ballot Selection",
                desc: "Select FOR, AGAINST, or ABSTAIN for each resolution. Proportional share weights apply automatically.",
                icon: Vote,
              },
              {
                step: "05",
                title: "Cryptographic Hashing",
                desc: "Upon submission, your vote generates a SHA-256 cryptographic hash anchored to the session ledger.",
                icon: ShieldCheck,
              },
              {
                step: "06",
                title: "Receipt Download",
                desc: "Download an official PDF Voting Certificate with unique transaction proofs for your records.",
                icon: Download,
              },
            ].map((s) => (
              <div key={s.step} className="p-7 rounded-3xl bg-[#0d1b2a]/80 border border-white/15 backdrop-blur-xl shadow-lg relative group hover:border-cyan-400/40 transition-all">
                <div className="text-3xl font-black text-cyan-400/40 font-mono mb-4">{s.step}</div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300 mb-4">
                  <s.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shareholder FAQ Section */}
      <section className="py-20 bg-[#0d1b2a]/50 border-t border-white/10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-3">
              Shareholder Voting FAQs
            </h2>
            <p className="text-slate-300 text-sm">
              Common questions answered for individual, institutional, and NRI equity shareholders.
            </p>
          </div>

          <div className="space-y-4">
            {shareholderFaqs.map((faq, index) => (
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

          {/* Statutory Attribution Card */}
          <div className="mt-12 p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-white">Statutory Source &amp; Legal Framework</p>
              <p className="text-slate-400 mt-0.5">Section 108 of the Companies Act 2013 read with Rule 20 of Companies (Management and Administration) Rules 2014.</p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="inline-block px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 font-mono text-[11px] border border-blue-400/30">Last Reviewed: 2026-09-20</span>
            </div>
          </div>
        </div>
      </section>

      {/* Internal Navigation Links */}
      <section className="py-16 bg-[#020817]">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-xl font-bold text-white mb-6 text-center">Related Governance Guides</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <Link to="/remote-e-voting" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Remote E-Voting Guide →
            </Link>
            <Link to="/agm-voting" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              AGM E-Voting →
            </Link>
            <Link to="/compliance" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Statutory Compliance →
            </Link>
            <Link to="/faqs" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              E-Voting FAQs →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ShareholderVoting;
