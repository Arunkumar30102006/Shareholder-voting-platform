import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Zap,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Users,
  Scale,
  Clock,
  FileCheck2,
  FileText,
  Sparkles,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/layout/SEO";
import { createBreadcrumbSchema, createFaqSchema } from "@/components/layout/StructuredData";

const breadcrumbSchema = createBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "EGM E-Voting", url: "/egm-voting" }
]);

const egmFaqs = [
  {
    q: "Under what circumstances is an Extraordinary General Meeting (EGM) convened?",
    a: "An EGM can be convened by the Board of Directors under Section 100 of the Companies Act, 2013 on its own motion, or on the requisition of members holding not less than one-tenth (10%) of the paid-up share capital carrying voting rights, to transact urgent special business that cannot wait until the next AGM."
  },
  {
    q: "Can an EGM be called on shorter notice than 21 clear days?",
    a: "Yes. Under Section 101(1) proviso of the Companies Act, 2013, an EGM may be called on shorter notice if consent is given in writing or by electronic mode by majority in number of members entitled to vote and who represent not less than 95% of such part of the paid-up share capital."
  },
  {
    q: "How does Postal Ballot voting work alongside EGMs?",
    a: "Under Section 110 of the Companies Act, 2013 read with Rule 22, certain statutory business items (such as alteration of MOA/AOA, buybacks, or change of registered office) must be transacted through postal ballot. Electronic voting replaces physical paper ballots for all mandated companies under Section 108."
  },
  {
    q: "What majority is required to pass a Special Resolution at an EGM?",
    a: "Under Section 114(2) of the Companies Act, 2013, a Special Resolution requires that the votes cast in favor of the resolution by members are not less than three times the number of votes cast against it (i.e. at least 75% supermajority of valid votes cast)."
  }
];

const egmFaqSchema = createFaqSchema(
  egmFaqs.map((f) => ({ question: f.q, answer: f.a }))
);

export const EgmVoting = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white selection:bg-blue-500/30">
      <SEO
        title="EGM E-Voting Platform for Companies | Vote India Secure"
        description="Extraordinary General Meeting (EGM) e-voting platform for urgent special resolutions, Section 100 member requisitions, and statutory shareholder voting workflows."
        canonical="/egm-voting"
        schemas={[breadcrumbSchema, egmFaqSchema]}
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-amber-600/20 via-orange-500/15 to-transparent rounded-full blur-[140px]" />
        </div>

        <div className="container mx-auto px-4 max-w-5xl text-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-6">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Special Business &amp; General Meeting Governance</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
              Extraordinary General Meeting{" "}
              <span className="bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-200 bg-clip-text text-transparent">
                E-Voting Platform
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-200 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
              A comprehensive platform for convening EGMs, passing Special Resolutions under Section 114, and executing electronic voting workflows under Section 100 &amp; 108 of the Companies Act, 2013.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/company-register" className="w-full sm:w-auto">
                <Button size="xl" className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-bold gap-2 px-8 py-6 rounded-xl shadow-lg shadow-blue-900/40 border border-blue-400/30">
                  Register Your Organization
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/resources/how-egm-e-voting-works" className="w-full sm:w-auto">
                <Button variant="outline" size="xl" className="w-full border-white/20 hover:bg-white/10 text-white font-semibold gap-2 px-8 py-6 rounded-xl">
                  EGM Operational Guide
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Special Resolutions Section */}
      <section className="py-20 bg-[#0d1b2a]/50 border-y border-white/10 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-4">
              Key Special Resolutions Transacted via EGM &amp; Postal Ballot
            </h2>
            <p className="text-slate-300 text-sm md:text-base">
              Statutory corporate business items governed under Indian corporate law.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              {
                title: "Mergers & Amalgamations (M&A)",
                desc: "Statutory scheme of arrangements, corporate restructuring, or demergers under NCLT supervision.",
                statute: "Companies Act Sec 230–232"
              },
              {
                title: "Capital Restructuring & Preferential Issues",
                desc: "Approving preferential allotments, rights issues, ESOP schemes, or alterations in share capital.",
                statute: "Companies Act Sec 62 & 66"
              },
              {
                title: "MOA & AOA Amendments",
                desc: "Passing special resolutions to alter object clauses, registered office shifts, or corporate name changes.",
                statute: "Companies Act Sec 13 & 14"
              },
              {
                title: "Material Related Party Transactions",
                desc: "Approval of material related party transactions exceeding statutory thresholds under SEBI LODR Regulation 23.",
                statute: "SEBI LODR Reg 23"
              },
              {
                title: "Urgent Board Reconstitution",
                desc: "Appointment, regularisation, or removal of key directors and Independent Directors requiring shareholder consent.",
                statute: "Companies Act Sec 149 & 169"
              },
              {
                title: "Member Requisitioned Meetings",
                desc: "Conveying general meetings called by members holding ≥ 10% paid-up share capital under Section 100.",
                statute: "Companies Act Sec 100"
              }
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-3xl bg-[#0d1b2a]/80 border border-white/15 backdrop-blur-xl shadow-lg hover:border-amber-400/40 transition-all">
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4 font-normal">{item.desc}</p>
                <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-white/5 border border-white/10 text-amber-300">
                  {item.statute}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EGM FAQ Section */}
      <section className="py-20 bg-[#020817]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-3">
              EGM &amp; Postal Ballot FAQs
            </h2>
            <p className="text-slate-300 text-sm">
              Statutory guidance on member requisitions, short notice, and special resolution supermajorities.
            </p>
          </div>

          <div className="space-y-4">
            {egmFaqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/15 bg-[#0d1b2a]/90 overflow-hidden backdrop-blur-xl transition-all shadow-lg"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm md:text-base font-bold text-white hover:text-amber-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-amber-400 shrink-0 ml-4 transition-transform duration-300 ${
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

          {/* Statutory Legal Disclaimer */}
          <div className="mt-12 p-5 rounded-2xl bg-black/40 border border-white/10 text-center max-w-3xl mx-auto">
            <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
              <span className="font-bold text-slate-300">Statutory Legal Disclaimer: </span>
              This page provides informational guidance on the statutory framework governing Extraordinary General Meetings and Postal Ballots under the Companies Act, 2013 and SEBI (LODR) Regulations, 2015. It does not constitute legal or corporate secretarial advice. Companies must consult qualified company secretaries and legal counsel to assess specific compliance obligations, Section 101(1) shorter notice consents, and regulatory filings.
            </p>
          </div>

          {/* Statutory Attribution Card */}
          <div className="mt-8 p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-left max-w-3xl mx-auto">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Statutory Attribution &amp; Review Metadata
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
              <div>
                <dt className="text-slate-500 font-medium">Primary Statutory Source</dt>
                <dd className="text-slate-200 font-semibold">
                  Companies Act, 2013 (Section 100, 101, 108, 114) &amp; Rule 20
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

      {/* Internal Navigation */}
      <section className="py-16 bg-[#0d1b2a]/50 border-t border-white/10">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-xl font-bold text-white mb-6 text-center">Related Corporate Governance Solutions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <Link to="/shareholder-e-voting" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Shareholder E-Voting →
            </Link>
            <Link to="/proxy-voting" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Proxy Voting →
            </Link>
            <Link to="/scrutinizer-tools" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Scrutinizer Tools →
            </Link>
            <Link to="/resources/ordinary-vs-special-resolution" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Special Resolutions →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EgmVoting;
