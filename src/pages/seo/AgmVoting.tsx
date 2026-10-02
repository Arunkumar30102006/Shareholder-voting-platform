import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2,
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
  Lock,
  Sparkles,
  HelpCircle,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/layout/SEO";
import { createBreadcrumbSchema, createFaqSchema, createWebPageSchema } from "@/components/layout/StructuredData";

const breadcrumbSchema = createBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "AGM E-Voting", url: "/agm-voting" }
]);

const agmFaqs = [
  {
    q: "What is the statutory deadline for holding an Annual General Meeting in India?",
    a: "Under Section 96 of the Companies Act, 2013, every company (other than a One Person Company) must hold an AGM within 6 months from the date of closing of the financial year, with an interval of not more than 15 months between two consecutive AGMs."
  },
  {
    q: "What is the difference between Ordinary Business and Special Business at an AGM?",
    a: "Under Section 102(2)(a), Ordinary Business includes: (1) consideration of financial statements and reports, (2) declaration of dividends, (3) appointment of directors in place of retiring directors, and (4) appointment and remuneration of auditors. All other business transacted at an AGM is deemed Special Business."
  },
  {
    q: "How does InstaPoll (Venue Voting) work during a virtual or hybrid AGM?",
    a: "For members attending the virtual or hybrid AGM via Video Conferencing (VC/OAVM) who did not cast their vote during the pre-AGM remote e-voting window, an in-meeting electronic voting window (InstaPoll) is enabled during the meeting. The platform ensures members who already voted remotely cannot vote again."
  },
  {
    q: "How is quorum calculated for an AGM under Indian law?",
    a: "Under Section 103 of the Companies Act, 2013, quorum for a public company depends on the total number of members as on the meeting date: (a) not less than 5 members for up to 1,000 members; (b) not less than 15 members for 1,000 to 5,000 members; and (c) not less than 30 members for exceeding 5,000 members."
  }
];

const agmFaqSchema = createFaqSchema(
  agmFaqs.map((f) => ({ question: f.q, answer: f.a }))
);

const webPageSchema = createWebPageSchema({
  name: "AGM Voting Software | Section 96 Compliant",
  description: "Annual General Meeting voting platform with pre-AGM remote polls, InstaPoll venue voting and Form MGT-13 scrutinizer exports. Section 96 & 108 aligned.",
  url: "/agm-voting",
});

export const AgmVoting = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white selection:bg-blue-500/30">
      <SEO
        title="AGM Voting Software | Section 96 Compliant"
        description="Annual General Meeting voting platform with pre-AGM remote polls, InstaPoll venue voting and Form MGT-13 scrutinizer exports. Section 96 & 108 aligned."
        canonical="/agm-voting"
        schemas={[breadcrumbSchema, agmFaqSchema, webPageSchema]}
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-indigo-500/15 to-transparent rounded-full blur-[140px]" />
        </div>

        <div className="container mx-auto px-4 max-w-5xl text-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-6">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Section 96 &amp; 108 Statutory AGM Governance</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
              Annual General Meeting{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                (AGM) E-Voting
              </span>{" "}
              Software
            </h1>

            <p className="text-base sm:text-xl text-slate-200 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
              A comprehensive operational and statutory platform for conducting Annual General Meetings compliant with Section 96 and Section 108 of the Companies Act, featuring pre-AGM remote polls, live virtual InstaPolls, and automated Form MGT-13 scrutinizer reports.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/company-register" className="w-full sm:w-auto">
                <Button size="xl" className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-bold gap-2 px-8 py-6 rounded-xl shadow-lg shadow-blue-900/40 border border-blue-400/30">
                  Register Your Organization
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/remote-e-voting" className="w-full sm:w-auto">
                <Button variant="outline" size="xl" className="w-full border-white/20 hover:bg-white/10 text-white font-semibold gap-2 px-8 py-6 rounded-xl">
                  Remote E-Voting Rules
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AGM Workflow */}
      <section className="py-20 bg-[#0d1b2a]/50 border-y border-white/10 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-4">
              Key Components of an AGM E-Voting Session
            </h2>
            <p className="text-slate-300 text-sm md:text-base">
              A structured breakdown of statutory requirements for Indian corporate secretarial and legal teams.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 backdrop-blur-xl shadow-xl space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-cyan-400" />
                1. Remote Pre-AGM E-Voting
              </h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
                Opens at least 3 days before the AGM and closes at 5:00 PM on the preceding day. Shareholders cast weighted ballots on ordinary business (audited accounts, dividends, director appointments) and special business items.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 backdrop-blur-xl shadow-xl space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                <Users className="w-5 h-5 text-emerald-400" />
                2. Live Venue InstaPoll (Meeting Voting)
              </h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
                During the live AGM, attending shareholders who did not vote during the remote e-voting window can cast their ballots live on screen with immediate quorum verification and anti-duplicate protections.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 backdrop-blur-xl shadow-xl space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                <Lock className="w-5 h-5 text-purple-400" />
                3. Scrutinizer Unblocking with Witnesses
              </h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
                Post-meeting, the appointed independent Scrutinizer unblocks the digital tally in the presence of at least 2 independent witnesses who are not in the company&apos;s employment, in compliance with Rule 20(4)(xii).
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 backdrop-blur-xl shadow-xl space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                <FileCheck2 className="w-5 h-5 text-blue-400" />
                4. Automated Form MGT-13 Report Export
              </h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
                Instant generation of consolidated voting summaries and Form MGT-13 draft reports to assist the Scrutinizer and Company Secretary with official statutory reporting and stock exchange submissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AGM FAQ Section */}
      <section className="py-20 bg-[#020817]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-3">
              AGM E-Voting Frequently Asked Questions
            </h2>
            <p className="text-slate-300 text-sm">
              Answers to statutory timeline, quorum, and voting questions under the Companies Act, 2013.
            </p>
          </div>

          <div className="space-y-4">
            {agmFaqs.map((faq, index) => (
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

      {/* Internal Navigation */}
      <section className="py-16 bg-[#0d1b2a]/50 border-t border-white/10">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-xl font-bold text-white mb-6 text-center">Related Governance Resources</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <Link to="/remote-e-voting" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Remote E-Voting →
            </Link>
            <Link to="/egm-voting" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              EGM E-Voting →
            </Link>
            <Link to="/corporate-voting" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Corporate Governance →
            </Link>
            <Link to="/compliance" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Statutory Compliance →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AgmVoting;
