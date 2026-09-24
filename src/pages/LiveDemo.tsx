import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield, Lock, CheckCircle2, ArrowRight, ArrowLeft, Vote,
  User, KeyRound, ShieldCheck, FileText, ThumbsUp, ThumbsDown,
  MinusCircle, QrCode, Hash, Clock, Sparkles, Play, X, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SEO } from "@/components/layout/SEO";
import { createBreadcrumbSchema } from "@/components/layout/StructuredData";
import React, { Suspense } from "react";
import { ClientOnly } from "vite-react-ssg";
import AnimatedOtpVerification from "@/components/auth/AnimatedOtpVerification";

const breadcrumbSchema = createBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Live Demo", url: "/live-demo" }
]);

// --- Demo Data ---
const DEMO_COMPANY = "Zenith Enterprises Ltd.";
const DEMO_AGM = "42nd Annual General Meeting (2026)";
const DEMO_USER = { name: "Rajesh Kumar Sharma", userId: "SH-ZEN-2026-04821", shares: 1250, dpid: "IN302201", clientId: "10847523" };

const DEMO_RESOLUTIONS = [
  {
    id: 1,
    type: "Ordinary",
    title: "Adoption of Financial Statements",
    description: "To receive, consider and adopt the Audited Financial Statements of the Company for the financial year ended March 31, 2026, together with the Reports of the Board of Directors and the Auditors thereon.",
    recommendation: "FOR",
  },
  {
    id: 2,
    type: "Special",
    title: "Appointment of Statutory Auditor",
    description: "To appoint an independent peer-reviewed firm of Chartered Accountants as the Statutory Auditors of the Company for a term of 5 years.",
    recommendation: "FOR",
  },
  {
    id: 3,
    type: "Ordinary",
    title: "Declaration of Final Dividend",
    description: "To declare a final dividend of ₹18.50 per equity share (face value ₹5 each) for the financial year 2025-26.",
    recommendation: "FOR",
  },
];

// --- Step Components ---

const StepLogin = ({ onNext }: { onNext: () => void }) => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

  const handleCredentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setShowOtp(true);
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="max-w-lg mx-auto"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Shareholder Login</h2>
        <p className="text-slate-400 text-sm">
          Enter your credentials to access the voting portal
        </p>
      </div>

      {/* Demo credentials hint */}
      <div className="mb-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
        <p className="text-xs text-emerald-400 font-medium mb-2 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" /> Demo Credentials (pre-filled)
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
          <span>User ID: <code className="text-emerald-300">SH-INF-2026-04821</code></span>
          <span>Password: <code className="text-emerald-300">••••••••</code></span>
        </div>
      </div>

      <div className="bg-[#0d1b2a]/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl">
        <AnimatePresence mode="wait">
          {!showOtp && (
            <motion.form
              key="creds"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleCredentialSubmit}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> User ID
                </label>
                <input
                  type="text"
                  value={userId || "SH-INF-2026-04821"}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-white/10 bg-[#020817]/40 text-sm text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 backdrop-blur-sm transition-all font-mono"
                  placeholder="Enter your User ID"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5" /> Password
                </label>
                <input
                  type="password"
                  value={password || "demo12345"}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-white/10 bg-[#020817]/40 text-sm text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 backdrop-blur-sm transition-all"
                  placeholder="Enter your password"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <Lock className="w-3 h-3" />
                <span>256-bit encrypted connection</span>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold gap-2" size="lg" disabled={isVerifying}>
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Securely Verifying...
                  </>
                ) : (
                  <>
                    Proceed to Verify <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </motion.form>
          )}

          {showOtp && (
            <AnimatedOtpVerification
              length={6}
              recipientInfo="r****@gmail.com"
              themeColor="cyan"
              title="Shareholder Verification"
              subtitle="Enter the 6-digit OTP sent to your registered email (e.g. 482916)"
              onVerify={async (code) => {
                await new Promise((r) => setTimeout(r, 1200));
                return { success: true };
              }}
              onResend={async () => {
                await new Promise((r) => setTimeout(r, 800));
                return true;
              }}
              onSuccess={onNext}
              onBack={() => setShowOtp(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const StepResolutions = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => {
  const [votes, setVotes] = useState<Record<number, string>>({});
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const allVoted = Object.keys(votes).length === DEMO_RESOLUTIONS.length;

  const castVote = (id: number, decision: string) => {
    setConfirmingId(id);
    setTimeout(() => {
      setVotes((prev) => ({ ...prev, [id]: decision }));
      setConfirmingId(null);
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="text-right">
          <p className="text-xs text-slate-500">Logged in as</p>
          <p className="text-sm text-white font-semibold">{DEMO_USER.name}</p>
        </div>
      </div>

      {/* Meeting Info Bar */}
      <div className="bg-[#0d1b2a]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-lg font-bold text-white">{DEMO_COMPANY}</p>
            <p className="text-xs text-slate-400">{DEMO_AGM}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-primary">{DEMO_USER.shares.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500 uppercase">Shares</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-400">{Object.keys(votes).length}/{DEMO_RESOLUTIONS.length}</p>
              <p className="text-[10px] text-slate-500 uppercase">Voted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resolution Cards */}
      <div className="space-y-4 mb-8">
        {DEMO_RESOLUTIONS.map((res) => {
          const voted = votes[res.id];
          const isConfirming = confirmingId === res.id;

          return (
            <motion.div
              key={res.id}
              layout
              className={`bg-[#0d1b2a]/40 backdrop-blur-xl border rounded-2xl p-6 transition-all ${voted ? "border-emerald-500/30 bg-emerald-500/3" : "border-white/10"}`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${res.type === "Special" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"}`}>
                      {res.type}
                    </span>
                    <span className="text-[10px] text-slate-500">Resolution #{res.id}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{res.title}</h3>
                </div>
                {voted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${voted === "FOR" ? "bg-emerald-500/20 text-emerald-400" :
                        voted === "AGAINST" ? "bg-red-500/20 text-red-400" :
                          "bg-slate-500/20 text-slate-400"
                      }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {voted === "FOR" ? "Voted FOR" : voted === "AGAINST" ? "Voted AGAINST" : "ABSTAINED"}
                  </motion.div>
                )}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-4">{res.description}</p>

              {!voted && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => castVote(res.id, "FOR")}
                    disabled={isConfirming}
                  >
                    {isConfirming ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ThumbsUp className="w-3.5 h-3.5" />}
                    Vote For
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={() => castVote(res.id, "AGAINST")}
                    disabled={isConfirming}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" /> Vote Against
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-white/10 text-slate-400 hover:bg-white/5"
                    onClick={() => castVote(res.id, "ABSTAIN")}
                    disabled={isConfirming}
                  >
                    <MinusCircle className="w-3.5 h-3.5" /> Abstain
                  </Button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Submit All */}
      <div className="text-center">
        <Button
          variant="hero"
          size="xl"
          className="gap-2"
          disabled={!allVoted}
          onClick={onNext}
        >
          {allVoted ? (
            <>Submit All Votes <ArrowRight className="w-5 h-5" /></>
          ) : (
            <>Vote on All Resolutions to Continue</>
          )}
        </Button>
        {!allVoted && (
          <p className="text-xs text-slate-500 mt-3">
            {DEMO_RESOLUTIONS.length - Object.keys(votes).length} resolution(s) remaining
          </p>
        )}
      </div>
    </motion.div>
  );
};

const StepThankYou = () => {
  const [hash] = useState(() => {
    const chars = "abcdef0123456789";
    return Array.from({ length: 64 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  });
  const [sessionId] = useState(() => `AGM-INF-${Date.now().toString(36).toUpperCase()}`);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto text-center"
    >
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-emerald-500/30"
      >
        <CheckCircle2 className="w-12 h-12 text-emerald-400" />
      </motion.div>

      <h2 className="text-3xl font-bold text-white mb-3">Voting Complete!</h2>
      <p className="text-slate-400 mb-8 max-w-md mx-auto">
        All your votes have been cryptographically signed, encrypted, and recorded on the immutable ledger.
      </p>

      {/* Vote Summary */}
      <div className="bg-[#0d1b2a]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6 text-left">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" /> Vote Receipt
        </h3>
        <div className="space-y-3">
          {DEMO_RESOLUTIONS.map((res) => (
            <div key={res.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <span className="text-xs text-slate-400">Resolution #{res.id}: {res.title}</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> FOR
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Crypto Hash */}
      <div className="bg-[#020817]/60 border border-white/5 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Hash className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] text-slate-500 uppercase font-medium tracking-wider">Cryptographic Hash (SHA-256)</span>
        </div>
        <p className="font-mono text-[10px] text-emerald-400/80 break-all leading-relaxed" title={hash}>
          {hash.substring(0, 12)}...{hash.substring(hash.length - 12)}
        </p>
      </div>

      {/* Session Info */}
      <div className="flex flex-wrap justify-center gap-6 mb-8 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date().toLocaleString("en-IN")}</span>
        <span className="flex items-center gap-1.5"><QrCode className="w-3.5 h-3.5" /> Session: {sessionId}</span>
        <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-500" /> Blockchain Verified</span>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/company-register">
          <Button variant="hero" size="xl" className="w-full sm:w-auto gap-2">
            <Building2 className="w-5 h-5" /> Register Your Company
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
        <Link to="/contact">
          <Button variant="outline" size="xl" className="w-full sm:w-auto gap-2">
            Request Full Demo
          </Button>
        </Link>
      </div>

      <p className="text-[11px] text-slate-600 mt-6 max-w-sm mx-auto">
        This was a simulated demo. No real votes were cast. All data shown is fictional and for demonstration purposes only.
      </p>
    </motion.div>
  );
};

// --- Progress Bar ---
const ProgressBar = ({ step }: { step: number }) => {
  const steps = [
    { label: "Login", icon: User },
    { label: "Vote", icon: Vote },
    { label: "Complete", icon: CheckCircle2 },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${i < step ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
              i === step ? "bg-primary/20 text-primary border border-primary/30" :
                "bg-white/5 text-slate-500 border border-white/10"
            }`}>
            <s.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-8 h-px transition-all duration-300 ${i < step ? "bg-emerald-500/50" : "bg-white/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
};

// --- Main Demo Page ---
const LiveDemo = () => {
  const [step, setStep] = useState(0);

  return (
    <div className="min-h-screen relative">
      <SEO
        title="Live E-Voting Demo | Interactive Simulated AGM Experience"
        description="Try a simulated AGM voting experience. Login as a demo shareholder, view resolutions, cast votes, and explore the complete e-voting flow."
        canonical="/live-demo"
        schemas={[breadcrumbSchema]}
      />
      <main className="container mx-auto px-4 pt-28 pb-16 md:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            <Play className="w-4 h-4" />
            <span>Interactive Demo</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
            Experience{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              E-Voting in Action
            </span>
          </h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Walk through a simulated AGM for {DEMO_COMPANY} — login, review resolutions, and cast your votes.
          </p>
        </motion.div>

        {/* Demo Notice */}
        <div className="max-w-3xl mx-auto mb-6">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            <span>Vote India Secure is an independent technology platform engineered in architectural alignment with SEBI LODR Regulation 44 and Companies Act 2013 Section 108. Not affiliated with CDSL, NSDL, or SEBI.</span>
          </div>
        </div>

        {/* Progress */}
        <ProgressBar step={step} />

        {/* Steps */}
        <AnimatePresence mode="wait">
          {step === 0 && <StepLogin key="login" onNext={() => setStep(1)} />}
          {step === 1 && <StepResolutions key="resolutions" onNext={() => setStep(2)} onBack={() => setStep(0)} />}
          {step === 2 && <StepThankYou key="thankyou" />}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default LiveDemo;
