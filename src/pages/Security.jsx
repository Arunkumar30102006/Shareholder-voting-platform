import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, Lock, ArrowRight, ChevronRight, ChevronDown, Fingerprint, Database, FileCode2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/layout/SEO";
import { createBreadcrumbSchema, createFaqSchema } from "@/components/layout/StructuredData";
const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Security Architecture", url: "/security" }
]);
const securityFaqs = [
    {
        q: "How does Vote India Secure protect voter secrecy?",
        a: "In accordance with Rule 20(4)(xii) of the Companies (Management and Administration) Rules, 2014, our architecture decouples shareholder identity tokens from recorded voting choices in database storage. Individual voting selections remain cryptographically sealed until the designated Scrutinizer unblocks the aggregated tally."
    },
    {
        q: "What makes the SHA-256 Merkle audit trail tamper-evident?",
        a: "Every cast ballot generates an immutable SHA-256 cryptographic hash that is chained into a Merkle Tree data structure. If any historical vote record is altered, inserted, or removed, the computed Merkle Root changes immediately, allowing auditors to mathematically detect any unauthorized modifications."
    },
    {
        q: "How does two-factor authentication (2FA) protect shareholder accounts?",
        a: "Shareholders must authenticate using their DP ID / Client ID or Folio Number paired with a dynamic, time-limited OTP sent to their registered email or phone number. OTP codes are hashed with SHA-256 and subject to rate limiting to prevent brute-force attacks."
    },
    {
        q: "What database security measures protect corporate tenant data?",
        a: "The PostgreSQL database enforces granular Row-Level Security (RLS) policies. Tenant data is strictly isolated so that corporate administrators can only access records from their own company, and voters can only access resolutions tied to their verified folio records."
    }
];
const securityFaqSchema = createFaqSchema(securityFaqs.map((f) => ({ question: f.q, answer: f.a })));
export const Security = () => {
    const [openFaq, setOpenFaq] = useState(null);
    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };
    return (<div className="min-h-screen bg-[#020817] text-white selection:bg-blue-500/30">
      <SEO title="Security Architecture & Cryptographic Integrity | Vote India Secure" description="Technical security architecture: SHA-256 Merkle audit trails, 2FA OTP verification, PostgreSQL Row-Level Security, secret ballot preservation, and scrutinizer access." canonical="/security" schemas={[breadcrumbSchema, securityFaqSchema]}/>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-cyan-500/15 to-transparent rounded-full blur-[140px]"/>
        </div>

        <div className="container mx-auto px-4 max-w-5xl text-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-6">
              <ShieldCheck className="w-4 h-4 text-cyan-400"/>
              <span>Technical Security Specification</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
              Technical Security &amp;{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                Cryptographic Integrity
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-200 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
              A transparent breakdown of Vote India Secure&apos;s cryptographic integrity model: SHA-256 Merkle audit trees, 2FA OTP authentication, PostgreSQL Row-Level Security, and statutory secret ballot preservation.
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
                  Statutory Compliance Guide
                  <ChevronRight className="w-4 h-4"/>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Security Architecture Grid */}
      <section className="py-20 bg-[#0d1b2a]/50 border-y border-white/10 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-4">
              Core Security Controls &amp; Mechanisms
            </h2>
            <p className="text-slate-300 text-sm md:text-base">
              Verified security mechanisms implemented across our application stack.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 backdrop-blur-xl shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300">
                <Lock className="w-6 h-6 text-cyan-400"/>
              </div>
              <h3 className="text-xl font-bold text-white">Ballot Secrecy &amp; Token Decoupling</h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
                Voter identity records are architecturally separated from stored resolution choices. Under Rule 20(4)(xii), individual voter selections cannot be viewed by the company or third parties prior to official unblocking by the Scrutinizer.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 backdrop-blur-xl shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <FileCode2 className="w-6 h-6 text-emerald-400"/>
              </div>
              <h3 className="text-xl font-bold text-white">SHA-256 Merkle Audit Proofs</h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
                Every cast ballot produces an immutable SHA-256 hash mathematically linked into a hierarchical Merkle Tree. If any ballot record in the session is modified, the resulting Merkle root alters, providing verifiable tamper evidence.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 backdrop-blur-xl shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                <Fingerprint className="w-6 h-6 text-purple-400"/>
              </div>
              <h3 className="text-xl font-bold text-white">2FA OTP Authentication</h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
                Time-limited one-time passwords (OTP) sent directly to registered email and phone contacts protect user sessions. Client-side SHA-256 hashing and server-side rate limits prevent credential stuffing and brute-force attacks.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 backdrop-blur-xl shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <Database className="w-6 h-6 text-amber-400"/>
              </div>
              <h3 className="text-xl font-bold text-white">PostgreSQL Row-Level Security (RLS)</h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
                Database records are guarded by strict PostgreSQL RLS policies. Companies can only access data belonging to their own meetings, and shareholders can only access resolutions tied to their registered folio entitlement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Security & Compliance Trust Table */}
      <section className="py-20 bg-[#020817] relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-4">
              Security &amp; Compliance Trust Matrix
            </h2>
            <p className="text-slate-300 text-sm md:text-base">
              A transparent comparison between legal frameworks, platform technical controls, and certification status.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-xs md:text-sm leading-relaxed mb-8">
            <strong>Transparency Notice:</strong> Vote India Secure is an independent software project. It is not currently accredited by NSDL/CDSL or certified by STQC. All cryptographic mechanisms described above are implemented directly in the open-source application codebase.
          </div>

          <div className="overflow-x-auto rounded-3xl border border-white/15 shadow-xl bg-[#0d1b2a]/90">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-white/10 text-white font-bold border-b border-white/15">
                  <th className="p-4">Category</th>
                  <th className="p-4">Regulatory Standard</th>
                  <th className="p-4">Platform Implementation</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-slate-300">
                <tr>
                  <td className="p-4 font-semibold text-white">Voter Authentication</td>
                  <td className="p-4">Rule 20(4)(iv)</td>
                  <td className="p-4">2FA OTP verification via email &amp; SMS</td>
                  <td className="p-4 text-right text-cyan-300 font-bold">Implemented</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Ballot Secrecy</td>
                  <td className="p-4">Rule 20(4)(xii)</td>
                  <td className="p-4">Decoupled voter tokens &amp; sealed tally vault</td>
                  <td className="p-4 text-right text-cyan-300 font-bold">Implemented</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Audit Trail Integrity</td>
                  <td className="p-4">Rule 20(4)(xv)</td>
                  <td className="p-4">SHA-256 Merkle Tree mathematical ledger</td>
                  <td className="p-4 text-right text-cyan-300 font-bold">Implemented</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Scrutinizer Export</td>
                  <td className="p-4">Form MGT-13</td>
                  <td className="p-4">Automated PDF audit report generation</td>
                  <td className="p-4 text-right text-cyan-300 font-bold">Implemented</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Agency Accreditation</td>
                  <td className="p-4">Depository / STQC</td>
                  <td className="p-4">Independent software demonstration</td>
                  <td className="p-4 text-right text-amber-300 font-bold">Not Certified</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Security FAQ Section */}
      <section className="py-20 bg-[#0d1b2a]/50 border-t border-white/10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-3">
              Security Frequently Asked Questions
            </h2>
            <p className="text-slate-300 text-sm">
              Detailed answers on our cryptographic protocols, access controls, and data privacy.
            </p>
          </div>

          <div className="space-y-4">
            {securityFaqs.map((faq, index) => (<div key={index} className="rounded-2xl border border-white/15 bg-[#0d1b2a]/90 overflow-hidden backdrop-blur-xl transition-all shadow-lg">
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
      <section className="py-16 bg-[#020817]">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-xl font-bold text-white mb-6 text-center">Related Governance Resources</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <Link to="/compliance" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Statutory Compliance →
            </Link>
            <Link to="/remote-e-voting" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Remote E-Voting Guide →
            </Link>
            <Link to="/how-it-works" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              How It Works →
            </Link>
            <Link to="/faqs" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              E-Voting FAQs →
            </Link>
          </div>
        </div>
      </section>
    </div>);
};
export default Security;
