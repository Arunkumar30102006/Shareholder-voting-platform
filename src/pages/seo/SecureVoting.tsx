import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight, 
  ChevronDown,
  FileCheck2, 
  Shield, 
  Fingerprint,
  FileCode2,
  Database,
  Sparkles,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/layout/SEO";
import { createBreadcrumbSchema, createFaqSchema } from "@/components/layout/StructuredData";

const breadcrumbSchema = createBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Secure Voting", url: "/secure-voting" }
]);

const secureVotingFaqs = [
  {
    q: "How does SHA-256 Merkle Tree hashing ensure ballot integrity?",
    a: "Every cast ballot generates an immutable SHA-256 cryptographic hash that is linked into a Merkle Tree. Any unauthorized modification, deletion, or insertion alters the root hash, making tampering immediately detectable by independent auditors."
  },
  {
    q: "How is voter confidentiality maintained during remote sessions?",
    a: "Individual ballot selections are cryptographically decoupled from voter identity tokens. Under Companies Act Rule 20, vote tallies remain locked and cannot be viewed by administrators until unblocked post-meeting by the Scrutinizer in the presence of two witnesses."
  },
  {
    q: "What database security measures isolate corporate tenant data?",
    a: "Our PostgreSQL database enforces strict Row-Level Security (RLS) policies. Multi-tenant corporate records and voter rosters are isolated so that companies and voters can only access their authorized data records."
  },
  {
    q: "How does 2FA OTP verification prevent unauthorized access?",
    a: "Each login attempt requires multi-factor authentication with a 6-digit one-time password delivered via email or SMS, coupled with DP ID/Client ID verification matching the depository record date benpos."
  }
];

const secureVotingFaqSchema = createFaqSchema(
  secureVotingFaqs.map((f) => ({ question: f.q, answer: f.a }))
);

export const SecureVoting = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white selection:bg-blue-500/30">
      <SEO
        title="Cryptographic Security & Ballot Sealing | Vote India Secure"
        description="Explore how Vote India Secure delivers ballot secrecy, tamper-evident SHA-256 Merkle audit trails, PostgreSQL RLS, and 2FA authentication for corporate meetings."
        canonical="/secure-voting"
        schemas={[breadcrumbSchema, secureVotingFaqSchema]}
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-emerald-600/20 via-blue-500/15 to-transparent rounded-full blur-[140px]" />
        </div>

        <div className="container mx-auto px-4 max-w-5xl text-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Cryptographic Security Architecture</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
              Cryptographically{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                Secure Voting
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-200 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
              Discover the engineering behind tamper-evident corporate balloting. Cryptographic ballot integrity hashing, SHA-256 Merkle audit chains, PostgreSQL Row-Level Security, and multi-witness Scrutinizer unblocking protocols.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/company-register" className="w-full sm:w-auto">
                <Button size="xl" className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-bold gap-2 px-8 py-6 rounded-xl shadow-lg shadow-blue-900/40 border border-blue-400/30">
                  Protect Your Meeting
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/security" className="w-full sm:w-auto">
                <Button variant="outline" size="xl" className="w-full border-white/20 hover:bg-white/10 text-white font-semibold gap-2 px-8 py-6 rounded-xl">
                  Full Security Specs
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Security */}
      <section className="py-20 bg-[#0d1b2a]/50 border-y border-white/10 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-4">
              The 4 Pillars of Ballot Sealing &amp; Integrity
            </h2>
            <p className="text-slate-300 text-sm md:text-base">
              Engineered with rigorous technical controls so unauthorized modifications are mathematically detectable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 backdrop-blur-xl shadow-xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300 mb-2">
                <Lock className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white">1. SHA-256 Ballot Hashing &amp; Secrecy Preservation</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Ballots are hashed with SHA-256 for cryptographic tamper evidence, protected in transit via TLS 1.3, and isolated in storage through PostgreSQL Row-Level Security so individual voter selections remain confidential until official unblocking.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 backdrop-blur-xl shadow-xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 mb-2">
                <FileCode2 className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white">2. SHA-256 Merkle Proof Audit Ledger</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Every cast vote produces a unique cryptographic hash linked into an auditable Merkle Tree, creating mathematical verification that no votes were inserted, deleted, or altered.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 backdrop-blur-xl shadow-xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 mb-2">
                <Fingerprint className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white">3. Secure OTP Shareholder Authentication</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Credential verification combined with time-sensitive keyed OTP delivery ensures only verified shareholders matching the official record date voter roster can access ballots.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 backdrop-blur-xl shadow-xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 mb-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white">4. Scrutinizer Multi-Witness Unblocking</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Only the designated independent Scrutinizer can unblock the vote tallies post-meeting in the presence of at least 2 independent witnesses, satisfying Rule 20(4)(xii).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Secure Voting FAQ Section */}
      <section className="py-20 bg-[#020817]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-3">
              Cryptographic Security FAQs
            </h2>
            <p className="text-slate-300 text-sm">
              Technical specifications regarding encryption, Merkle trees, and access controls.
            </p>
          </div>

          <div className="space-y-4">
            {secureVotingFaqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/15 bg-[#0d1b2a]/90 overflow-hidden backdrop-blur-xl transition-all shadow-lg"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm md:text-base font-bold text-white hover:text-emerald-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-emerald-400 shrink-0 ml-4 transition-transform duration-300 ${
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
          <h2 className="text-xl font-bold text-white mb-6 text-center">Explore Related Security Pages</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <Link to="/security" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Security Overview →
            </Link>
            <Link to="/compliance" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Statutory Compliance →
            </Link>
            <Link to="/remote-e-voting" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Remote E-Voting →
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

export default SecureVoting;
