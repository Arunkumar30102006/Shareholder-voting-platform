import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  FileCheck2,
  Lock,
  Eye,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Scale,
  ShieldCheck,
  Download,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/layout/SEO";
import { createBreadcrumbSchema, createFaqSchema } from "@/components/layout/StructuredData";

const breadcrumbSchema = createBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Scrutinizer Tools", url: "/scrutinizer-tools" }
]);

const scrutinizerFaqs = [
  {
    q: "Who can be appointed as an independent Scrutinizer under Rule 20?",
    a: "Under Rule 20(4)(ix) of the Companies (Management and Administration) Rules, 2014, the Board of Directors must appoint one or more independent scrutinizers who may be a Chartered Accountant in practice, a Cost Accountant in practice, a Company Secretary in practice, or an Advocate, who is not in the employment of the company and who, in the opinion of the Board, can conduct the voting process in a fair and transparent manner."
  },
  {
    q: "What is the dual-witness unblocking requirement under Rule 20(4)(xii)?",
    a: "Rule 20(4)(xii) mandates that the electronic voting register of votes cast cannot be accessed by the company or third parties prior to meeting closure. After the meeting concludes and venue votes are tallied, the Scrutinizer unblocks the remote votes in the presence of at least two witnesses who are not in the employment of the company."
  },
  {
    q: "What is the statutory deadline for submitting the Scrutinizer's Report?",
    a: "Under Rule 20(4)(xii), the scrutinizer must submit a consolidated scrutinizer's report of the total votes cast in favour or against, if any, within three (3) days of the conclusion of the meeting to the Chairman or a person authorized by the Chairman."
  },
  {
    q: "How does the platform ensure safe custody of the electronic voting register?",
    a: "Under Rule 20(4)(xv), the scrutinizer must maintain the register of votes cast until the Chairman considers, approves, and signs the minutes. Vote India Secure provides tamper-evident audit log archives with cryptographic hash roots for long-term safe custody."
  }
];

const scrutinizerFaqSchema = createFaqSchema(
  scrutinizerFaqs.map((f) => ({ question: f.q, answer: f.a }))
);

export default function ScrutinizerTools() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white selection:bg-blue-500/30">
      <SEO
        title="Scrutinizer Voting Reports & Audit Tools | Vote India Secure"
        description="Independent scrutinizer portal for general meetings featuring dual-witness digital unblocking, cryptographic ballot verification, and Form MGT-13 aligned report exports."
        canonical="/scrutinizer-tools"
        schemas={[breadcrumbSchema, scrutinizerFaqSchema]}
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-purple-600/20 via-indigo-500/15 to-transparent rounded-full blur-[140px]" />
        </div>

        <div className="container mx-auto px-4 max-w-5xl text-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-6">
              <FileCheck2 className="w-4 h-4 text-purple-400" />
              <span>Independent Scrutinizer Audit &amp; Reporting Suite</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
              Scrutinizer Voting Reports &amp;{" "}
              <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-200 bg-clip-text text-transparent">
                Audit Tools
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-200 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
              A specialized portal for Company Secretaries, Chartered Accountants, and independent Scrutinizers conducting general meeting vote tabulations under Rule 20 of the Companies Rules, 2014.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/company-register" className="w-full sm:w-auto">
                <Button size="xl" className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-bold gap-2 px-8 py-6 rounded-xl shadow-lg shadow-blue-900/40 border border-blue-400/30">
                  Access Scrutinizer Portal
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/resources/scrutinizer-voting-workflow" className="w-full sm:w-auto">
                <Button variant="outline" size="xl" className="w-full border-white/20 hover:bg-white/10 text-white font-semibold gap-2 px-8 py-6 rounded-xl">
                  Scrutinizer Workflow Guide
                  <FileCheck2 className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Scrutinizer Capabilities */}
      <section className="py-20 bg-[#0d1b2a]/50 border-y border-white/10 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-4">
              Engineered for Independent Governance Review
            </h2>
            <p className="text-slate-300 text-sm md:text-base">
              Built specifically to facilitate the statutory duties mandated under Rule 20(4)(ix) through (xv).
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 backdrop-blur-xl shadow-xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 mb-2">
                <Lock className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Dual-Witness Digital Unblocking</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Structured ceremony requiring two independent witness signatures and affirmations before the sealed electronic voting register can be unblocked post-meeting.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 backdrop-blur-xl shadow-xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 mb-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Cryptographic Hash Verification</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Auditors can mathematically verify ballot integrity using SHA-256 Merkle root hashing, confirming no historical votes were altered or inserted.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 backdrop-blur-xl shadow-xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 mb-2">
                <Download className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Form MGT-13 Aligned Exports</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                One-click generation of consolidated report drafts structured with the affirmative, negative, and invalid vote tables specified by Form MGT-13.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scrutinizer FAQs */}
      <section className="py-20 bg-[#020817]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-3">
              Scrutinizer Protocol FAQs
            </h2>
            <p className="text-slate-300 text-sm">
              Answers to technical and statutory questions on scrutinizer reporting and unblocking workflows.
            </p>
          </div>

          <div className="space-y-4">
            {scrutinizerFaqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/15 bg-[#0d1b2a]/90 overflow-hidden backdrop-blur-xl transition-all shadow-lg"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm md:text-base font-bold text-white hover:text-purple-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-purple-400 shrink-0 ml-4 transition-transform duration-300 ${
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
          <div className="mt-12 p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-left max-w-3xl mx-auto">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Statutory Attribution &amp; Review Metadata
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
              <div>
                <dt className="text-slate-500 font-medium">Primary Statutory Source</dt>
                <dd className="text-slate-200 font-semibold">
                  Companies Act, 2013 (Section 108 &amp; 109) / Rule 20 &amp; 21 of Companies Rules, 2014
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Statutory Version</dt>
                <dd className="text-slate-200 font-semibold">As amended up to 2026</dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Last Content Review Date</dt>
                <dd className="text-slate-200 font-semibold">2026-09-20</dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Review Committee</dt>
                <dd className="text-slate-200 font-semibold">Corporate Governance Review</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Internal Cross-Linking */}
      <section className="py-16 bg-[#0d1b2a]/50 border-t border-white/10">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-xl font-bold text-white mb-6 text-center">Related Solutions &amp; Documentation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <Link to="/shareholder-e-voting" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-purple-300">
              Shareholder E-Voting →
            </Link>
            <Link to="/agm-voting" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-purple-300">
              AGM E-Voting →
            </Link>
            <Link to="/egm-voting" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-purple-300">
              EGM E-Voting →
            </Link>
            <Link to="/resources/ordinary-vs-special-resolution" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-purple-300">
              Resolution Formulas →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
