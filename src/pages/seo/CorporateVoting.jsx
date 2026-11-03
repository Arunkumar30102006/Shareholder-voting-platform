import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Building, ArrowRight, ChevronRight, ChevronDown, Layers, FileSpreadsheet, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/layout/SEO";
import { createBreadcrumbSchema, createFaqSchema, createWebPageSchema } from "@/components/layout/StructuredData";
const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Corporate Voting", url: "/corporate-voting" }
]);
const webPageSchema = createWebPageSchema({
    name: "Corporate Governance Voting Platform | Vote India Secure",
    description: "Board election and resolution voting software with tamper-evident audit logs, SEBI LODR Regulation 44 mapping and institutional governance workflows.",
    url: "/corporate-voting",
});
const corporateFaqs = [
    {
        q: "How does the platform handle depository Benpos records from CDSL and NSDL?",
        a: "Corporate administrators upload standardized Benpos (Beneficial Position) rosters as on the cut-off date. The system parses DP ID, Client ID, PAN, email, and equity shareholding counts to configure voter entitlements accurately."
    },
    {
        q: "What maker-checker controls exist for corporate resolution setup?",
        a: "The platform supports multi-tier administrative permissions. Draft resolutions and explanatory statements under Section 102 can be created by secretarial operators and must be verified and authorized by the Company Secretary or Lead Admin before publication."
    },
    {
        q: "How does the platform assist independent Scrutinizers?",
        a: "Scrutinizers receive designated independent access to view meeting metadata, unblock digital ballots with witnesses post-meeting, review mathematical Merkle proofs, and export consolidated Form MGT-13 draft reports."
    },
    {
        q: "Can private companies and unlisted entities use Vote India Secure?",
        a: "Yes. Unlisted public companies with 1,000+ members mandated under Rule 20, as well as private entities, startups, and cooperative federations seeking transparent member balloting can utilize the platform."
    }
];
const corporateFaqSchema = createFaqSchema(corporateFaqs.map((f) => ({ question: f.q, answer: f.a })));
export const CorporateVoting = () => {
    const [openFaq, setOpenFaq] = useState(null);
    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };
    return (<div className="min-h-screen bg-[#020817] text-white selection:bg-blue-500/30">
      <SEO title="Corporate Governance Voting Platform | Vote India Secure" description="Board election and resolution voting software with tamper-evident audit logs, SEBI LODR Regulation 44 mapping and institutional governance workflows." canonical="/corporate-voting" schemas={[breadcrumbSchema, corporateFaqSchema, webPageSchema]}/>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-purple-600/20 via-blue-500/15 to-transparent rounded-full blur-[140px]"/>
        </div>

        <div className="container mx-auto px-4 max-w-5xl text-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-6">
              <Building className="w-4 h-4 text-purple-400"/>
              <span>SEBI LODR Regulation 44 &amp; Board Governance</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
              Corporate Governance &amp;{" "}
              <span className="bg-gradient-to-r from-purple-400 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
                Board Voting Platform
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-200 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
              A comprehensive corporate governance platform for board elections, director appointments, and shareholder resolutions—featuring SEBI LODR Regulation 44 compliance, CDSL/NSDL Benpos ingestion, and institutional voting workflows.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/company-register" className="w-full sm:w-auto">
                <Button size="xl" className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-bold gap-2 px-8 py-6 rounded-xl shadow-lg shadow-blue-900/40 border border-blue-400/30">
                  Register Your Organization
                  <ArrowRight className="w-4 h-4"/>
                </Button>
              </Link>
              <Link to="/compliance" className="w-full sm:w-auto">
                <Button variant="outline" size="xl" className="w-full border-white/20 hover:bg-white/10 text-white font-semibold gap-2 px-8 py-6 rounded-xl">
                  Statutory Compliance Hub
                  <ChevronRight className="w-4 h-4"/>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-20 bg-[#0d1b2a]/50 border-y border-white/10 relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-4">
              Corporate Governance Capabilities
            </h2>
            <p className="text-slate-300 text-sm md:text-base">
              Engineered for seamless compliance and mathematical auditability across all meeting types.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl bg-[#0d1b2a]/80 border border-white/15 backdrop-blur-xl shadow-lg space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300">
                <FileSpreadsheet className="w-5 h-5 text-cyan-400"/>
              </div>
              <h3 className="text-lg font-bold text-white">Depository Roster Ingestion</h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
                Upload Benpos rosters from CDSL/NSDL or RTA registers. Automatically calculate weighted voting rights based on paid-up equity capital.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#0d1b2a]/80 border border-white/15 backdrop-blur-xl shadow-lg space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <Layers className="w-5 h-5 text-emerald-400"/>
              </div>
              <h3 className="text-lg font-bold text-white">Resolution Configuration</h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
                Configure Ordinary and Special resolutions with explanatory statements under Section 102 and director candidate profiles.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#0d1b2a]/80 border border-white/15 backdrop-blur-xl shadow-lg space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                <FileCheck2 className="w-5 h-5 text-purple-400"/>
              </div>
              <h3 className="text-lg font-bold text-white">Scrutinizer Export &amp; Reporting</h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
                Provide independent Scrutinizers with dedicated audit tools and export official Form MGT-13 reports for statutory filing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate FAQ Section */}
      <section className="py-20 bg-[#020817]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-3">
              Corporate Issuer FAQs
            </h2>
            <p className="text-slate-300 text-sm">
              Operational details for Company Secretaries, RTAs, and Board Administrators.
            </p>
          </div>

          <div className="space-y-4">
            {corporateFaqs.map((faq, index) => (<div key={index} className="rounded-2xl border border-white/15 bg-[#0d1b2a]/90 overflow-hidden backdrop-blur-xl transition-all shadow-lg">
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

      {/* Internal Navigation */}
      <section className="py-16 bg-[#0d1b2a]/50 border-t border-white/10">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-xl font-bold text-white mb-6 text-center">Related Governance Modules</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <Link to="/shareholder-voting" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Shareholder Guide →
            </Link>
            <Link to="/remote-e-voting" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Remote E-Voting →
            </Link>
            <Link to="/agm-voting" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              AGM E-Voting →
            </Link>
            <Link to="/compliance" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Compliance Hub →
            </Link>
          </div>
        </div>
      </section>
    </div>);
};
export default CorporateVoting;
