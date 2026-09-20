import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  ShieldCheck,
  FileText,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Scale,
  Clock,
  KeyRound,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/layout/SEO";
import { createBreadcrumbSchema, createFaqSchema } from "@/components/layout/StructuredData";

const breadcrumbSchema = createBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Proxy Voting", url: "/proxy-voting" }
]);

const proxyFaqs = [
  {
    q: "What is the statutory deadline for depositing Form MGT-11 proxy forms?",
    a: "Under Section 105(4) of the Companies Act, 2013, any instrument appointing a proxy must be deposited with the company not less than 48 hours before the commencement of the meeting. Any provision in a company's articles requiring a longer period than 48 hours is invalid."
  },
  {
    q: "Can a proxy vote on a show of hands at a general meeting?",
    a: "Under Section 105(1) of the Companies Act, 2013, a proxy is not entitled to speak at a meeting and is not entitled to vote except on a poll. In electronic general meetings, proxy entitlements are configured for electronic poll voting only."
  },
  {
    q: "How many members can a single proxy represent under Indian corporate law?",
    a: "Under Rule 19(2) of the Companies (Management and Administration) Rules, 2014, a person can act as proxy on behalf of members not exceeding fifty (50) and holding in the aggregate not more than ten percent (10%) of the total share capital of the company carrying voting rights."
  },
  {
    q: "What happens if both the shareholder and their appointed proxy attempt to vote?",
    a: "If a member attends and votes in person (or via authenticated electronic portal), the proxy's authority is automatically revoked. The platform enforces strict single-ballot rules, preventing double voting on any resolution."
  }
];

const proxyFaqSchema = createFaqSchema(
  proxyFaqs.map((f) => ({ question: f.q, answer: f.a }))
);

export default function ProxyVoting() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white selection:bg-blue-500/30">
      <SEO
        title="Corporate Proxy Voting Software | Vote India Secure"
        description="Digital corporate proxy voting software supporting Section 105 proxy appointments, Form MGT-11 record keeping, and dual-voting prevention."
        canonical="/proxy-voting"
        schemas={[breadcrumbSchema, proxyFaqSchema]}
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-cyan-600/20 via-blue-500/15 to-transparent rounded-full blur-[140px]" />
        </div>

        <div className="container mx-auto px-4 max-w-5xl text-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-6">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Companies Act Section 105 &amp; Form MGT-11 Governance</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
              Corporate{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-200 bg-clip-text text-transparent">
                Proxy Voting Software
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-200 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
              Streamline shareholder proxy representations, validate Form MGT-11 appointments, enforce the 48-hour statutory cut-off, and eliminate dual-voting risks for corporate general meetings.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/company-register" className="w-full sm:w-auto">
                <Button size="xl" className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-bold gap-2 px-8 py-6 rounded-xl shadow-lg shadow-blue-900/40 border border-blue-400/30">
                  Configure Meeting Proxies
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/resources/how-proxy-voting-works" className="w-full sm:w-auto">
                <Button variant="outline" size="xl" className="w-full border-white/20 hover:bg-white/10 text-white font-semibold gap-2 px-8 py-6 rounded-xl">
                  Proxy Legal Guide
                  <FileText className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Architectural Pillars */}
      <section className="py-20 bg-[#0d1b2a]/50 border-y border-white/10 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-4">
              Statutory Proxy Management Engine
            </h2>
            <p className="text-slate-300 text-sm md:text-base">
              Built to uphold Section 105 mandates and institutional investor governance rules.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 backdrop-blur-xl shadow-xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 mb-2">
                <Clock className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white">48-Hour Deposit Cut-Off</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Automatic validation ensuring proxy instruments (Form MGT-11) are logged at least 48 hours prior to the scheduled meeting commencement.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 backdrop-blur-xl shadow-xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 mb-2">
                <Scale className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Rule 19 Capacity Caps</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Enforces statutory caps preventing a single proxy holder from representing more than 50 members or 10% of total voting capital.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 backdrop-blur-xl shadow-xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 mb-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Dual-Voting Prevention</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                If the principal shareholder casts a vote directly, the proxy authorization is automatically superseded and flagged in the audit register.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Proxy FAQs */}
      <section className="py-20 bg-[#020817]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-3">
              Corporate Proxy Voting FAQs
            </h2>
            <p className="text-slate-300 text-sm">
              Answers to common legal and technical questions on corporate proxy management.
            </p>
          </div>

          <div className="space-y-4">
            {proxyFaqs.map((faq, index) => (
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
          <div className="mt-12 p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-left max-w-3xl mx-auto">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Statutory Attribution &amp; Review Metadata
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
              <div>
                <dt className="text-slate-500 font-medium">Primary Statutory Source</dt>
                <dd className="text-slate-200 font-semibold">
                  Companies Act, 2013 (Section 105) &amp; Rule 19 of Companies (Management and Administration) Rules, 2014
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
          <h2 className="text-xl font-bold text-white mb-6 text-center">Related Solutions &amp; Guides</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <Link to="/shareholder-e-voting" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Shareholder E-Voting →
            </Link>
            <Link to="/agm-voting" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              AGM E-Voting →
            </Link>
            <Link to="/scrutinizer-tools" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Scrutinizer Portal →
            </Link>
            <Link to="/regulatory-framework" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Regulatory Framework →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
