import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Laptop, ShieldCheck, ArrowRight, ChevronRight, ChevronDown, Zap, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/layout/SEO";
import { createBreadcrumbSchema, createFaqSchema } from "@/components/layout/StructuredData";
const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Online E-Voting", url: "/online-e-voting" }
]);
const onlineVotingFaqs = [
    {
        q: "What is online electronic voting for corporate general meetings?",
        a: "Online e-voting allows equity shareholders, institutional investors, and proxy holders to cast digital weighted ballots on corporate resolutions from any internet-connected device without physical ballot papers."
    },
    {
        q: "How does the platform ensure voting confidentiality during live sessions?",
        a: "Individual ballot selections remain cryptographically decoupled and sealed until the voting window closes. In accordance with Rule 20, tallies can only be unblocked post-meeting by the independent Scrutinizer in the presence of two witnesses."
    },
    {
        q: "Can shareholders modify their vote after submission?",
        a: "No. Under Rule 20(4)(viii) of the Companies (Management and Administration) Rules, 2014, once a shareholder has cast their vote on a resolution, they cannot change or modify it subsequently."
    },
    {
        q: "What reports are generated at the end of the online voting window?",
        a: "The system generates an official Form MGT-13 style consolidated audit report, detailing total affirmative, negative, and invalid votes with SHA-256 Merkle root verification."
    }
];
const onlineVotingFaqSchema = createFaqSchema(onlineVotingFaqs.map((f) => ({ question: f.q, answer: f.a })));
export const OnlineEVoting = () => {
    const [openFaq, setOpenFaq] = useState(null);
    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };
    return (<div className="min-h-screen bg-[#020817] text-white selection:bg-blue-500/30">
      <SEO title="Online E-Voting Platform for Corporate Meetings | Vote India Secure" description="Conduct secure online electronic voting for general meetings, AGMs, and corporate resolutions with depository Benpos integration, 2FA OTP, and Scrutinizer audit exports." canonical="/online-e-voting" schemas={[breadcrumbSchema, onlineVotingFaqSchema]}/>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-cyan-600/20 via-blue-500/15 to-transparent rounded-full blur-[140px]"/>
        </div>

        <div className="container mx-auto px-4 max-w-5xl text-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-6">
              <Laptop className="w-4 h-4 text-cyan-400"/>
              <span>Cloud E-Voting Engine</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
              Enterprise Online{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                E-Voting Platform
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-200 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
              Deliver friction-free, statutory electronic voting for your shareholders. Seamless depository synchronization, instant voter authentication, and automated Scrutinizer audit reporting.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/company-register" className="w-full sm:w-auto">
                <Button size="xl" className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-bold gap-2 px-8 py-6 rounded-xl shadow-lg shadow-blue-900/40 border border-blue-400/30">
                  Get Started
                  <ArrowRight className="w-4 h-4"/>
                </Button>
              </Link>
              <Link to="/features" className="w-full sm:w-auto">
                <Button variant="outline" size="xl" className="w-full border-white/20 hover:bg-white/10 text-white font-semibold gap-2 px-8 py-6 rounded-xl">
                  Explore Capabilities
                  <ChevronRight className="w-4 h-4"/>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Capabilities */}
      <section className="py-20 bg-[#0d1b2a]/50 border-y border-white/10 relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-4">
              Why Corporate Issuers Choose Online E-Voting
            </h2>
            <p className="text-slate-300 text-sm md:text-base">
              Move beyond manual paper ballots and complex legacy systems with an auditable cloud workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
            {
                icon: Zap,
                title: "Rapid Depository Ingestion",
                desc: "Upload NSDL/CDSL Benpos CSV records, configure ordinary and special resolutions, and schedule automated voting timers.",
                color: "text-amber-400"
            },
            {
                icon: ShieldCheck,
                title: "Cryptographic Vote Sealing",
                desc: "Ballots produce SHA-256 hash chains sealed in Merkle trees. Voter selections remain confidential until official Scrutinizer unblocking.",
                color: "text-cyan-400"
            },
            {
                icon: FileSpreadsheet,
                title: "Form MGT-13 Scrutinizer Reports",
                desc: "Automated calculation of weighted totals (For, Against, Invalid) with 1-click export formatted to assist Scrutinizers with official reporting.",
                color: "text-emerald-400"
            }
        ].map((f, i) => (<div key={i} className="p-8 rounded-3xl bg-[#0d1b2a]/80 border border-white/15 backdrop-blur-xl shadow-lg hover:border-cyan-400/40 transition-all">
                <f.icon className={`w-8 h-8 ${f.color} mb-4`}/>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">{f.desc}</p>
              </div>))}
          </div>
        </div>
      </section>

      {/* Online E-Voting FAQ Section */}
      <section className="py-20 bg-[#020817]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-3">
              Online E-Voting FAQs
            </h2>
            <p className="text-slate-300 text-sm">
              Answers regarding digital ballot casting, secrecy, and report generation.
            </p>
          </div>

          <div className="space-y-4">
            {onlineVotingFaqs.map((faq, index) => (<div key={index} className="rounded-2xl border border-white/15 bg-[#0d1b2a]/90 overflow-hidden backdrop-blur-xl transition-all shadow-lg">
                <button onClick={() => toggleFaq(index)} className="w-full flex items-center justify-between p-5 text-left text-sm md:text-base font-bold text-white hover:text-cyan-300 transition-colors">
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-cyan-400 shrink-0 ml-4 transition-transform duration-300 ${openFaq === index ? "rotate-180" : ""}`}/>
                </button>
                <AnimatePresence>
                  {openFaq === index && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                      <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-slate-200 leading-relaxed border-t border-white/10 font-normal">
                        {faq.a}
                      </div>
                    </motion.div>)}
                </AnimatePresence>
              </div>))}
          </div>
        </div>
      </section>

      {/* Internal Cross Links */}
      <section className="py-16 bg-[#0d1b2a]/50 border-t border-white/10">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-xl font-bold text-white mb-6 text-center">Explore Dedicated Governance Modules</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <Link to="/shareholder-voting" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Shareholder Voting →
            </Link>
            <Link to="/remote-e-voting" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Remote E-Voting →
            </Link>
            <Link to="/agm-voting" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              AGM E-Voting →
            </Link>
            <Link to="/faqs" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              E-Voting FAQs →
            </Link>
          </div>
        </div>
      </section>
    </div>);
};
export default OnlineEVoting;
