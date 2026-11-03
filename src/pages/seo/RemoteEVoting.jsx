import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, ArrowRight, ChevronRight, ChevronDown, Clock, Scale, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/layout/SEO";
import { createBreadcrumbSchema, createFaqSchema, createWebPageSchema } from "@/components/layout/StructuredData";
const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Remote E-Voting", url: "/remote-e-voting" }
]);
const remoteFaqs = [
    {
        q: "What is Remote E-Voting under Indian corporate law?",
        a: "Under Rule 20(2) of the Companies (Management and Administration) Rules, 2014, 'remote e-voting' is defined as the facility of casting votes by a shareholder using an electronic voting system from a place other than the venue of the general meeting, during a prescribed statutory window prior to the meeting."
    },
    {
        q: "What is the statutory timeline for Remote E-Voting?",
        a: "As prescribed under Rule 20(4)(vi), the facility for remote e-voting must remain open for not less than three days and must close at 5:00 PM on the day immediately preceding the date of the general meeting. Once closed, the system is locked against further remote submissions."
    },
    {
        q: "Can a shareholder modify their vote after casting it through remote e-voting?",
        a: "No. Rule 20(4)(vii) specifically mandates that once a vote on a resolution is cast by a shareholder, the shareholder shall not be allowed to change it subsequently."
    },
    {
        q: "Can a shareholder attend the AGM after casting a remote e-vote?",
        a: "Yes. A shareholder who has cast their vote through remote e-voting may attend the general meeting (in person or virtually), but they shall not be entitled to cast their vote again at the meeting. The platform maintains records to prevent duplicate voting."
    },
    {
        q: "How are remote e-votes unblocked and counted by the Scrutinizer?",
        a: "Under Rule 20(4)(xii), the designated Scrutinizer unblocks the remote e-voting portal after the conclusion of voting at the general meeting, in the presence of at least two witnesses who are not in the employment of the company, and prepares the statutory report in Form MGT-13."
    }
];
const remoteFaqSchema = createFaqSchema(remoteFaqs.map((f) => ({ question: f.q, answer: f.a })));
const webPageSchema = createWebPageSchema({
    name: "Remote E-Voting Under Rule 20 | Vote India Secure",
    description: "Remote e-voting platform for pre-meeting shareholder ballots under Rule 20(4). Three-day voting window, cut-off date validation and encrypted submissions.",
    url: "/remote-e-voting",
});
export const RemoteEVoting = () => {
    const [openFaq, setOpenFaq] = useState(null);
    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };
    return (<div className="min-h-screen bg-[#020817] text-white selection:bg-blue-500/30">
      <SEO title="Remote E-Voting Under Rule 20 | Vote India Secure" description="Remote e-voting platform for pre-meeting shareholder ballots under Rule 20(4). Three-day voting window, cut-off date validation and encrypted submissions." canonical="/remote-e-voting" schemas={[breadcrumbSchema, remoteFaqSchema, webPageSchema]}/>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[380px] bg-gradient-to-tr from-blue-600/20 via-cyan-500/15 to-transparent rounded-full blur-[140px]"/>
        </div>

        <div className="container mx-auto px-4 max-w-5xl text-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-6">
              <Scale className="w-4 h-4 text-cyan-400"/>
              <span>Rule 20(4) Statutory E-Voting Framework</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
              Remote E-Voting{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                Under Rule 20
              </span>{" "}
              in India
            </h1>

            <p className="text-base sm:text-xl text-slate-200 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
              A comprehensive technical and statutory platform for remote electronic voting under Rule 20 of Companies (Management and Administration) Rules, 2014 and Section 108 of the Companies Act, featuring 3-day pre-meeting voting windows, cut-off date validation, and scrutinizer unblocking.
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
                  Explore Compliance Hub
                  <ChevronRight className="w-4 h-4"/>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Statutory Definition & Legal Basis */}
      <section className="py-20 bg-[#0d1b2a]/50 border-y border-white/10 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-slate-200 text-xs font-bold uppercase tracking-wider mb-4">
                <FileText className="w-3.5 h-3.5 text-cyan-400"/>
                Statutory Definition
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-white mb-6">
                What is Remote E-Voting?
              </h2>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-4">
                Under <strong>Rule 20 of the Companies (Management and Administration) Rules, 2014</strong>, remote e-voting is the legal mechanism that allows equity shareholders to review resolutions and cast their ballots securely online before the date of the general meeting.
              </p>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
                Unlike venue voting or in-meeting polls (InstaPoll), remote e-voting operates over a multi-day pre-meeting window, enabling domestic and international investors to participate without geographical constraints.
              </p>
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-400/30 text-blue-200 text-xs space-y-2">
                <p><strong>Applicable Statutes:</strong></p>
                <ul className="list-disc pl-4 space-y-1 text-slate-300">
                  <li>Section 108 of the Companies Act, 2013</li>
                  <li>Rule 20, Companies (Management and Administration) Rules, 2014</li>
                  <li>Regulation 44, SEBI (LODR) Regulations, 2015</li>
                </ul>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 backdrop-blur-xl shadow-2xl space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <Clock className="w-5 h-5 text-cyan-400"/>
                Statutory Timeline Requirements
              </h3>
              <div className="space-y-4 text-xs md:text-sm text-slate-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5"/>
                  <div>
                    <strong className="text-white block">Cut-Off Date Eligibility:</strong>
                    Voting entitlement is determined strictly based on beneficial ownership records as on the cut-off date (not earlier than 7 days before the general meeting).
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5"/>
                  <div>
                    <strong className="text-white block">Voting Window Duration:</strong>
                    The remote e-voting window must remain open for a minimum of 3 days and close promptly at 5:00 PM on the day immediately preceding the meeting date.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5"/>
                  <div>
                    <strong className="text-white block">Irrevocable Balloting:</strong>
                    Once cast, a remote vote cannot be altered. The platform automatically blocks duplicate voting attempts at the general meeting.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparative Workflow Matrix */}
      <section className="py-20 bg-[#020817] relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-4">
              Comparing Corporate Voting Methods
            </h2>
            <p className="text-slate-300 text-sm md:text-base">
              A side-by-side comparison of Remote E-Voting, In-Meeting E-Voting (InstaPoll), and Postal Ballots under Indian corporate regulations.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-white/15 rounded-2xl overflow-hidden bg-[#0d1b2a]/90 text-xs md:text-sm">
              <thead>
                <tr className="bg-white/10 text-white font-bold border-b border-white/15">
                  <th className="p-4">Feature / Dimension</th>
                  <th className="p-4 text-cyan-300">Remote E-Voting</th>
                  <th className="p-4 text-blue-300">In-Meeting E-Voting (InstaPoll)</th>
                  <th className="p-4 text-purple-300">Postal Ballot E-Voting</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-slate-300">
                <tr>
                  <td className="p-4 font-semibold text-white">Governing Law</td>
                  <td className="p-4">Rule 20, Companies (M&amp;A) Rules</td>
                  <td className="p-4">Rule 20(4)(viii) &amp; MCA VC Circulars</td>
                  <td className="p-4">Section 110 &amp; Rule 22</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Voting Period</td>
                  <td className="p-4">$\ge$ 3 days (closes 5 PM prior day)</td>
                  <td className="p-4">During AGM / General Meeting session</td>
                  <td className="p-4">30 days from date of dispatch</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Eligibility</td>
                  <td className="p-4">All shareholders on Cut-Off Date</td>
                  <td className="p-4">Attending members who haven't voted remotely</td>
                  <td className="p-4">All members on Record Date</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Ballot Modification</td>
                  <td className="p-4">Strictly prohibited once cast</td>
                  <td className="p-4">Strictly prohibited once cast</td>
                  <td className="p-4">Strictly prohibited once cast</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Audit &amp; Scrutiny</td>
                  <td className="p-4">Unblocked with $\ge$ 2 independent witnesses</td>
                  <td className="p-4">Consolidated with remote votes</td>
                  <td className="p-4">Scrutinizer registers within 7 days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Scrutinizer Role & Unblocking Protocol */}
      <section className="py-20 bg-[#0d1b2a]/50 border-y border-white/10 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-4">
              Scrutinizer Verification &amp; Unblocking Protocol
            </h2>
            <p className="text-slate-300 text-sm md:text-base">
              How independent Scrutinizers access, unblock, verify, and report e-voting outcomes in accordance with Rule 20(4)(xii).
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 shadow-xl space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300 font-bold">
                1
              </div>
              <h3 className="text-lg font-bold text-white">Conclusion of Meeting</h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
                Remote e-voting remains locked until the general meeting has concluded, ensuring that preliminary vote distributions cannot influence live proceedings.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 shadow-xl space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold">
                2
              </div>
              <h3 className="text-lg font-bold text-white">Two-Witness Unblocking</h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
                The designated Scrutinizer unblocks the digital tally in the presence of at least two independent witnesses who are not in the company's employment.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 shadow-xl space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 font-bold">
                3
              </div>
              <h3 className="text-lg font-bold text-white">Form MGT-13 Reporting</h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
                The Scrutinizer consolidates remote and in-meeting votes to prepare the statutory report in Form MGT-13 for submission to the Chairman or authorized director.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Visible FAQ Section */}
      <section className="py-20 bg-[#020817]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-3">
              Remote E-Voting Frequently Asked Questions
            </h2>
            <p className="text-slate-300 text-sm">
              Answers to statutory and operational questions regarding remote electronic voting in India.
            </p>
          </div>

          <div className="space-y-4">
            {remoteFaqs.map((faq, index) => (<div key={index} className="rounded-2xl border border-white/15 bg-[#0d1b2a]/80 overflow-hidden backdrop-blur-xl transition-all">
                <button onClick={() => toggleFaq(index)} className="w-full flex items-center justify-between p-5 text-left text-sm md:text-base font-bold text-white hover:text-cyan-300 transition-colors">
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-cyan-400 shrink-0 ml-4 transition-transform duration-300 ${openFaq === index ? "rotate-180" : ""}`}/>
                </button>
                <AnimatePresence>
                  {openFaq === index && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                      <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-slate-300 leading-relaxed border-t border-white/10">
                        {faq.a}
                      </div>
                    </motion.div>)}
                </AnimatePresence>
              </div>))}
          </div>
        </div>
      </section>

      {/* Internal Navigation Links */}
      <section className="py-16 bg-[#0d1b2a]/50 border-t border-white/10">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-lg font-bold text-white mb-6 text-center">Related Governance Guides</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <Link to="/shareholder-voting" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Shareholder Guide →
            </Link>
            <Link to="/agm-voting" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              AGM E-Voting →
            </Link>
            <Link to="/compliance" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Statutory Compliance →
            </Link>
            <Link to="/security" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Security Architecture →
            </Link>
          </div>
        </div>
      </section>
    </div>);
};
export default RemoteEVoting;
