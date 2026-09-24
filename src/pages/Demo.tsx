import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User, FileText, Vote, CheckCircle2, AlertCircle, Loader2,
  ArrowRight, ArrowLeft, QrCode, Lock, Download, Home, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SEO } from "@/components/layout/SEO";
import { createBreadcrumbSchema } from "@/components/layout/StructuredData";

const breadcrumbSchema = createBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Demo", url: "/demo" }
]);

const DEMO_COMPANY = "Zenith Enterprises Limited — 42nd AGM";

const RESOLUTIONS = [
  {
    id: 1,
    type: "Ordinary",
    title: "Adoption of Financial Statements for FY 2025-26",
    description: "To receive, consider and adopt the Audited Financial Statements of the Company for the financial year ended March 31, 2026. This includes the Reports of the Board of Directors and the Auditors thereon.",
  },
  {
    id: 2,
    type: "Special",
    title: "Re-appointment of Managing Director & CEO",
    description: "To approve the re-appointment of the Managing Director and Chief Executive Officer for a further term of 5 years. The remuneration package has been reviewed and recommended by the Nomination & Remuneration Committee.",
  },
  {
    id: 3,
    type: "Ordinary",
    title: "Approval of Final Dividend of ₹22 per equity share",
    description: "To declare a final dividend of ₹22 per equity share of face value ₹5 each for the financial year ended March 31, 2026. The dividend will be paid within 30 days of the AGM.",
  },
];

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/i;

const maskPan = (pan: string) => {
  if (pan.length !== 10) return pan;
  return `${pan.slice(0, 3)}XX${pan.slice(5, 9)}X`.toUpperCase();
};

const generateVoteId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const random = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `VIS-2026-${random}`;
};

const ProgressBar = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { label: "Step 1 of 4", title: "Login" },
    { label: "Step 2 of 4", title: "Resolutions" },
    { label: "Step 3 of 4", title: "Cast Vote" },
    { label: "Step 4 of 4", title: "Receipt" },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-10 overflow-x-auto pb-4">
      {steps.map((s, i) => {
        const isCompleted = i < currentStep;
        const isActive = i === currentStep;
        const isFuture = i > currentStep;

        let bgColor = "bg-white/5 border-white/10 text-slate-500";
        if (isActive) bgColor = "bg-blue-500/20 border-blue-500/40 text-blue-400";
        if (isCompleted) bgColor = "bg-emerald-500/20 border-emerald-500/40 text-emerald-400";

        return (
          <div key={s.label} className="flex items-center gap-2">
            <div className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl border backdrop-blur-md transition-all duration-300 min-w-[120px] ${bgColor}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider mb-1">{s.label}</span>
              <span className="text-sm font-semibold">{s.title}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 h-px ${isCompleted ? "bg-emerald-500/50" : "bg-white/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default function Demo() {
  const [step, setStep] = useState(0);
  const [pan, setPan] = useState("");
  const [dpid, setDpid] = useState("");
  const [folio, setFolio] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [votes, setVotes] = useState<Record<number, string>>({});
  const [showSummary, setShowSummary] = useState(false);
  
  const [receiptData, setReceiptData] = useState<{ voteId: string, timestamp: string } | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!PAN_REGEX.test(pan)) {
      setError("Invalid PAN format. Please use format: ABCDE1234F");
      return;
    }
    if (!dpid && !folio) {
      setError("Please enter either DPID/Client ID or Folio Number");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(1);
    }, 1500);
  };

  const allVoted = Object.keys(votes).length === RESOLUTIONS.length;

  const handleVoteSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setReceiptData({
        voteId: generateVoteId(),
        timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'medium' })
      });
      setStep(3);
    }, 1500);
  };

  return (
    <div className="min-h-screen relative">
      <SEO
        title="Interactive E-Voting Demo | Simulated AGM Balloting"
        description="Experience a live simulated shareholder AGM electronic voting workflow with instant OTP authentication and ballot receipts."
        canonical="/demo"
        schemas={[breadcrumbSchema]}
      />
      <main className="container mx-auto px-4 pt-28 pb-16 md:py-20">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Interactive Voting Demo
          </h1>
          <p className="text-sm text-slate-400">
            A simulated 4-step AGM voting experience. No real data is stored.
          </p>
        </div>

        <ProgressBar currentStep={step} />

        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: LOGIN */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-[#0d1b2a]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Shareholder Login</h2>
                    <p className="text-sm text-slate-400">Authenticate to access the AGM portal</p>
                  </div>
                </div>

                <div className="mb-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-sm text-blue-300">
                  <strong>Hint:</strong> Try using PAN: <code>ABCDE1234F</code>, DPID: <code>IN12345678</code>, or Folio: <code>F001234</code>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">PAN Number *</label>
                    <input
                      type="text"
                      className="w-full h-12 px-4 rounded-xl bg-[#020817]/50 border border-white/10 text-white uppercase focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      placeholder="ABCDE1234F"
                      value={pan}
                      onChange={(e) => setPan(e.target.value.toUpperCase())}
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">DPID / Client ID</label>
                      <input
                        type="text"
                        className="w-full h-12 px-4 rounded-xl bg-[#020817]/50 border border-white/10 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        placeholder="IN12345678"
                        value={dpid}
                        onChange={(e) => setDpid(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Folio Number</label>
                      <input
                        type="text"
                        className="w-full h-12 px-4 rounded-xl bg-[#020817]/50 border border-white/10 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        placeholder="F001234"
                        value={folio}
                        onChange={(e) => setFolio(e.target.value)}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <Button type="submit" size="lg" className="w-full mt-4 gap-2" disabled={isLoading}>
                    {isLoading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Authenticating...</>
                    ) : (
                      <>Login to Vote <ArrowRight className="w-5 h-5" /></>
                    )}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* STEP 2: ACTIVE RESOLUTIONS */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-[#0d1b2a]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white">{DEMO_COMPANY}</h2>
                  <p className="text-sm text-slate-400">Please review the resolutions before proceeding to vote.</p>
                </div>

                <div className="space-y-4">
                  {RESOLUTIONS.map((res) => (
                    <div key={res.id} className="bg-[#0d1b2a]/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${res.type === 'Special' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {res.type} Resolution
                        </span>
                        <span className="text-sm text-slate-400 font-medium">#{res.id}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{res.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{res.description}</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <Button variant="ghost" onClick={() => setStep(0)} className="text-slate-400 hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button size="lg" onClick={() => setStep(2)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                    Proceed to Vote <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: CAST YOUR VOTE */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-[#0d1b2a]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-1">Cast Your Vote</h2>
                  <p className="text-sm text-slate-400">Select one option for each resolution.</p>
                </div>

                {!showSummary ? (
                  <>
                    <div className="space-y-4">
                      {RESOLUTIONS.map((res) => (
                        <div key={res.id} className="bg-[#0d1b2a]/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                          <h3 className="text-base font-bold text-white mb-4">#{res.id}: {res.title}</h3>
                          <div className="grid grid-cols-3 gap-3">
                            <button
                              onClick={() => setVotes({ ...votes, [res.id]: 'FOR' })}
                              className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                                votes[res.id] === 'FOR' 
                                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                                  : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20'
                              }`}
                            >
                              FOR
                            </button>
                            <button
                              onClick={() => setVotes({ ...votes, [res.id]: 'AGAINST' })}
                              className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                                votes[res.id] === 'AGAINST' 
                                  ? 'bg-red-500 text-white border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                                  : 'bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20'
                              }`}
                            >
                              AGAINST
                            </button>
                            <button
                              onClick={() => setVotes({ ...votes, [res.id]: 'ABSTAIN' })}
                              className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                                votes[res.id] === 'ABSTAIN' 
                                  ? 'bg-slate-500 text-white border-slate-500 shadow-[0_0_15px_rgba(100,116,139,0.3)]' 
                                  : 'bg-slate-500/10 text-slate-400 border-slate-500/30 hover:bg-slate-500/20'
                              }`}
                            >
                              ABSTAIN
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mt-6">
                      <Button variant="ghost" onClick={() => setStep(1)} className="text-slate-400 hover:text-white">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                      </Button>
                      <Button 
                        size="lg" 
                        onClick={() => setShowSummary(true)} 
                        disabled={!allVoted}
                        className="gap-2 bg-blue-600 hover:bg-blue-700"
                      >
                        Review Votes <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="bg-[#020817]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-4">Review Your Choices</h3>
                      <div className="space-y-4">
                        {RESOLUTIONS.map((res) => (
                          <div key={res.id} className="flex items-center justify-between">
                            <span className="text-sm text-slate-300 flex-1 pr-4">#{res.id} {res.title}</span>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                              votes[res.id] === 'FOR' ? 'bg-emerald-500/20 text-emerald-400' :
                              votes[res.id] === 'AGAINST' ? 'bg-red-500/20 text-red-400' :
                              'bg-slate-500/20 text-slate-400'
                            }`}>
                              {votes[res.id]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <Button variant="outline" onClick={() => setShowSummary(false)} className="border-white/10 text-white">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Edit Votes
                      </Button>
                      <Button 
                        size="lg" 
                        onClick={handleVoteSubmit} 
                        disabled={isLoading}
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {isLoading ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                        ) : (
                          <><Lock className="w-4 h-4" /> Confirm & Submit</>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* STEP 4: SUCCESS / RECEIPT */}
            {step === 3 && receiptData && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-24 h-24 mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                  <div className="relative w-full h-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center rounded-full">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-white mb-2">Vote Submitted Successfully</h2>
                <p className="text-slate-400 mb-8">Your votes have been securely recorded on the encrypted ledger.</p>

                <div className="bg-[#0d1b2a]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 text-left mb-8 max-w-xl mx-auto">
                  <div className="flex justify-between items-start mb-6 pb-6 border-b border-white/10">
                    <div>
                      <h3 className="text-lg font-bold text-white">Vote Receipt</h3>
                      <p className="text-sm text-slate-400">{DEMO_COMPANY}</p>
                    </div>
                    <Shield className="w-8 h-8 text-emerald-500 opacity-50" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Receipt ID</p>
                      <p className="text-sm font-mono text-white font-semibold">{receiptData.voteId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Shareholder PAN</p>
                      <p className="text-sm font-mono text-white font-semibold">{maskPan(pan)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Timestamp</p>
                      <p className="text-sm text-white">{receiptData.timestamp}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-[#020817]/50 p-4 rounded-xl border border-white/5">
                    <div className="w-16 h-16 bg-white flex items-center justify-center p-1 rounded-lg">
                      <QrCode className="w-full h-full text-black" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-1">Verification Code</p>
                      <p className="text-xs text-slate-400">Scan to verify cryptographic integrity</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={() => alert("Receipt downloaded successfully (Demo Mode)")}
                    className="border-white/10 text-white gap-2"
                  >
                    <Download className="w-4 h-4" /> Download Receipt
                  </Button>
                  <Link to="/">
                    <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
                      <Home className="w-4 h-4" /> Back to Home
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>
    </div>
  );
}
