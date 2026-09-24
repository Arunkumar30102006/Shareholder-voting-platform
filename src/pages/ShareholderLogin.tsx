import { SEO } from "@/components/layout/SEO";
import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Lock,
  Vote,
  ArrowRight,
  Eye,
  EyeOff,
  User,
  KeyRound,
  CreditCard,
  Building2,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Clock,
  Server,
  Fingerprint,
  ChevronDown,
  Info,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { env } from "@/config/env";
import { useTranslation } from "react-i18next";
import { votingApi } from "@/services/api/voting";
import AnimatedOtpVerification, { VerifyResult } from "@/components/auth/AnimatedOtpVerification";
import { TurnstileWidget, TurnstileWidgetRef } from "@/components/common/TurnstileWidget";
import { createBreadcrumbSchema } from "@/components/layout/StructuredData";

const breadcrumbSchema = createBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Shareholder Login", url: "/shareholder-login" }
]);

export const ShareholderLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"credentials" | "demat" | "demo">("credentials");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginStep, setLoginStep] = useState<"CREDENTIALS" | "OTP">("CREDENTIALS");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Cloudflare Turnstile Bot Protection State
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  // Secure Server Challenge State
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [lastIdentifier, setLastIdentifier] = useState<string>("");
  const [lastPan, setLastPan] = useState<string>("");

  // Form State - Standard Credentials
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  });

  // Form State - Demat / Folio
  const [dematData, setDematData] = useState({
    depositoryType: "NSDL_CDSL", // NSDL_CDSL | PHYSICAL_FOLIO
    dpIdClientId: "",
    panNumber: "",
  });

  const [shareholderInfo, setShareholderInfo] = useState<{
    id: string;
    email: string;
    name: string;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDematChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDematData(prev => ({ ...prev, [name]: value }));
  };

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  };

  const warmEdgeFunction = async () => {
    try {
      await fetch(`${env.SUPABASE_URL}/functions/v1/send-shareholder-otp-email`, {
        method: "OPTIONS",
        headers: {
          "Content-Type": "application/json",
          "apikey": env.SUPABASE_ANON_KEY
        }
      });
    } catch {
      // Silently ignore preflight warmup errors
    }
  };

  // Prefill Quick Demo Credentials
  const handlePrefillDemo = () => {
    setActiveTab("credentials");
    setFormData({
      userId: "SH-ZEN-2026-04821",
      password: "DemoVoter@2026",
    });
    toast.info("Demo Credentials Loaded", {
      description: "Click 'Authenticate & Send OTP' to test the full voting flow.",
    });
  };

  // 1. Submit Credentials Flow
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (activeTab === "credentials") {
        await handleCredentialsSubmit();
      } else if (activeTab === "demat") {
        await handleDematSubmit();
      }
    } catch (err) {
      console.error("Login exception:", err);
      toast.error("An unexpected error occurred during authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Voting ID & Password Check
  const handleCredentialsSubmit = async () => {
    const cleanId = formData.userId.trim();
    const cleanPass = formData.password.trim();

    if (!cleanId || !cleanPass) {
      toast.error("Please enter both User ID and Password");
      return;
    }

    if (!turnstileToken) {
      toast.error("Security verification required. Please complete the security challenge below.");
      return;
    }

    try {
      const res = await votingApi.initiateAuth(cleanId, cleanPass, turnstileToken);
      setChallengeId(res.challenge_id);
      setLastIdentifier(cleanId);
      setLastPan(cleanPass);
      setLoginStep("OTP");
      toast.success("Security Passcode Dispatched", {
        description: res.message,
      });
    } catch (err: unknown) {
      turnstileRef.current?.reset();
      setTurnstileToken("");
      const msg = err instanceof Error ? err.message : "Authentication failed";
      toast.error("Authentication Notice", { description: msg });
    }
  };

  // Handle Demat / PAN Check
  const handleDematSubmit = async () => {
    const cleanDemat = dematData.dpIdClientId.trim();
    const cleanPan = dematData.panNumber.trim().toUpperCase();

    if (!cleanDemat || !cleanPan) {
      toast.error("Please enter both Demat/Folio details and PAN");
      return;
    }

    if (!turnstileToken) {
      toast.error("Security verification required. Please complete the security challenge below.");
      return;
    }

    try {
      const res = await votingApi.initiateAuth(cleanDemat, cleanPan, turnstileToken);
      setChallengeId(res.challenge_id);
      setLastIdentifier(cleanDemat);
      setLastPan(cleanPan);
      setLoginStep("OTP");
      toast.success("Security Passcode Dispatched", {
        description: res.message,
      });
    } catch (err: unknown) {
      turnstileRef.current?.reset();
      setTurnstileToken("");
      const msg = err instanceof Error ? err.message : "Authentication failed";
      toast.error("Authentication Notice", { description: msg });
    }
  };

  // 2. Verify OTP via secure server challenge
  const handleOtpVerify = async (enteredOtp: string): Promise<VerifyResult> => {
    if (!challengeId) {
      return {
        success: false,
        error: "Session expired. Please enter your identification details again.",
      };
    }

    try {
      const res = await votingApi.verifyOtp(challengeId, enteredOtp.trim());
      if (res.success) {
        return { success: true };
      }
      return {
        success: false,
        error: "Incorrect 6-digit verification code. Please check your inbox.",
      };
    } catch (err: unknown) {
      console.error("OTP verification error:", err);
      return {
        success: false,
        error: (err as Error).message || "Passcode verification failed.",
      };
    }
  };

  // Resend OTP Handler via secure server challenge
  const handleOtpResend = async (): Promise<boolean> => {
    if (!lastIdentifier || !lastPan) {
      toast.error("Session expired. Please sign in again.");
      setLoginStep("CREDENTIALS");
      return false;
    }

    try {
      const res = await votingApi.initiateAuth(lastIdentifier, lastPan);
      setChallengeId(res.challenge_id);
      toast.success("Fresh Code Sent", {
        description: res.message,
      });
      return true;
    } catch (err: unknown) {
      console.error("Resend OTP error:", err);
      toast.error("Failed to resend code. Please try again shortly.");
      return false;
    }
  };

  const handleOtpSuccess = () => {
    toast.success("Identity Verified", {
      description: "Redirecting to your secure voting ballot...",
    });
    navigate("/voting-dashboard");
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white flex flex-col selection:bg-blue-500/30">
      <SEO
        title="Shareholder E-Voting Portal Login | Vote India Secure"
        description="Secure 2FA shareholder portal login for Annual General Meetings (AGM), EGMs, and postal ballots under Section 108 of Companies Act 2013 and SEBI LODR Regulation 44."
        canonical="/shareholder-login"
        keywords="shareholder login e-voting, AGM voting login India, Demat voting portal, NSDL CDSL shareholder login, secure corporate ballot"
        schemas={[breadcrumbSchema]}
        noindex={true}
      />

      <main className="flex-grow pt-28 pb-20 flex items-center">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Governance Context & Trust Signals */}
            <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
              
              {/* Statutory Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider shadow-sm">
                <Vote className="w-4 h-4 text-cyan-400" />
                <span>Statutory Shareholder E-Voting Portal</span>
              </div>

              {/* Title & Headline */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15]">
                  Exercise Your <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent drop-shadow-sm">
                    Shareholder Democracy
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl">
                  Cast your weighted vote on corporate resolutions for Annual General Meetings (AGM), EGMs, and statutory postal ballots with bank-grade cryptographic security.
                </p>
              </div>

              {/* Core Security & Compliance Pillars */}
              <div className="grid sm:grid-cols-2 gap-4 text-left">
                {[
                  {
                    icon: Lock,
                    title: "Ballot Secrecy Rule 20(4)(xii)",
                    desc: "Individual vote choices are encrypted with AES-256 and decoupled from voter identity.",
                    color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
                  },
                  {
                    icon: Fingerprint,
                    title: "2-Factor Authentication",
                    desc: "One-time verification code dispatched to your depository registered email/SMS.",
                    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
                  },
                  {
                    icon: Server,
                    title: "Sovereign In-Country Hosting",
                    desc: "100% Indian data residency (Mumbai/Bengaluru) compliant with DPDP Act 2023.",
                    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                  },
                  {
                    icon: Shield,
                    title: "SHA-256 Audit Trail",
                    desc: "Every cast ballot generates an immutable cryptographic receipt for verification.",
                    color: "text-purple-400 bg-purple-500/10 border-purple-500/20"
                  }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#0d1b2a]/80 border border-white/10 space-y-2 backdrop-blur-md">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${item.color}`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-white text-xs sm:text-sm">{item.title}</h4>
                    </div>
                    <p className="text-xs text-slate-300 font-normal leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Live Evaluation Demo Link */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-cyan-950/60 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-cyan-300 flex-shrink-0" />
                  <span className="text-slate-200">Evaluating the platform or testing a sample resolution?</span>
                </div>
                <button
                  type="button"
                  onClick={handlePrefillDemo}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  Load Demo Credentials
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* Right Column: Interactive Login Container */}
            <div className="lg:col-span-6 relative">
              
              {/* Dynamic Cyber Glow Effect */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600 rounded-3xl blur-xl opacity-30 animate-pulse pointer-events-none" />

              <Card className="relative bg-[#0d1b2a]/95 border-white/15 backdrop-blur-2xl shadow-2xl rounded-3xl overflow-hidden">
                
                {/* Card Header */}
                <CardHeader className="text-center pb-4 pt-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/25">
                    <Vote className="w-7 h-7 text-slate-950" />
                  </div>
                  <CardTitle className="text-2xl sm:text-3xl font-black text-white">
                    Shareholder Authentication
                  </CardTitle>
                  <CardDescription className="text-slate-300 text-xs sm:text-sm">
                    {loginStep === "CREDENTIALS" 
                      ? "Enter your depository credentials or voting tokens to begin."
                      : "Complete two-factor verification to unseal your ballot."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-6 sm:px-8 pb-8">
                  {loginStep === "CREDENTIALS" ? (
                    <div className="space-y-6">
                      
                      {/* Authentication Mode Tabs */}
                      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "credentials" | "demat" | "demo")}>
                        <TabsList className="grid grid-cols-2 bg-black/50 border border-white/10 p-1 rounded-xl">
                          <TabsTrigger 
                            value="credentials"
                            className="rounded-lg text-xs font-semibold data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-1.5 py-2"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            Voting User ID
                          </TabsTrigger>
                          <TabsTrigger 
                            value="demat"
                            className="rounded-lg text-xs font-semibold data-[state=active]:bg-cyan-600 data-[state=active]:text-white flex items-center gap-1.5 py-2"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Demat / Folio &amp; PAN
                          </TabsTrigger>
                        </TabsList>

                        {/* TAB 1: Standard Voting User ID */}
                        <TabsContent value="credentials" className="mt-5 space-y-4">
                          <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="userId" className="text-xs font-bold text-slate-200">
                                  Voting User ID / Token
                                </Label>
                                <button
                                  type="button"
                                  onClick={() => setShowHelpModal(!showHelpModal)}
                                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                                >
                                  <HelpCircle className="w-3 h-3" /> Where is my ID?
                                </button>
                              </div>
                              <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                  id="userId"
                                  name="userId"
                                  value={formData.userId}
                                  onChange={handleInputChange}
                                  onFocus={warmEdgeFunction}
                                  placeholder="e.g. SH-ZEN-2026-04821"
                                  className="pl-10 bg-black/40 border-white/15 text-white placeholder:text-slate-500 rounded-xl focus:border-cyan-400 text-sm h-11"
                                  required
                                />
                              </div>
                              <p className="text-[11px] text-slate-400">
                                Dispatched to your depository registered email/SMS with the AGM notice.
                              </p>
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor="password" className="text-xs font-bold text-slate-200">
                                Security PIN / Password
                              </Label>
                              <div className="relative">
                                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                  id="password"
                                  name="password"
                                  type={showPassword ? "text" : "password"}
                                  value={formData.password}
                                  onChange={handleInputChange}
                                  onFocus={warmEdgeFunction}
                                  placeholder="Enter your security PIN"
                                  className="pl-10 pr-10 bg-black/40 border-white/15 text-white placeholder:text-slate-500 rounded-xl focus:border-cyan-400 text-sm h-11"
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                  aria-label="Toggle password visibility"
                                >
                                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>

                            {/* Live Telemetry Notice */}
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-200">
                              <Shield className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                              <span>Protected by 256-Bit SSL • Depository Benpos Synchronized</span>
                            </div>

                            {/* Cloudflare Turnstile Bot Protection */}
                            <TurnstileWidget
                              ref={turnstileRef}
                              action="shareholder-login"
                              theme="dark"
                              onSuccess={(tok) => setTurnstileToken(tok)}
                              onError={() => setTurnstileToken("")}
                              onExpire={() => setTurnstileToken("")}
                            />

                            <Button
                              type="submit"
                              size="lg"
                              disabled={isLoading}
                              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold rounded-xl h-12 shadow-lg shadow-cyan-500/20 mt-2"
                            >
                              {isLoading ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  <span>Verifying Benpos Record...</span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-2">
                                  <span>Authenticate &amp; Send OTP</span>
                                  <ArrowRight className="w-4 h-4" />
                                </div>
                              )}
                            </Button>
                          </form>
                        </TabsContent>

                        {/* TAB 2: Demat & PAN Mode */}
                        <TabsContent value="demat" className="mt-5 space-y-4">
                          <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-bold text-slate-200">Depository Record Type</Label>
                              <select
                                name="depositoryType"
                                value={dematData.depositoryType}
                                onChange={handleDematChange}
                                className="w-full bg-black/40 border border-white/15 text-white rounded-xl h-11 px-3 text-xs focus:border-cyan-400"
                              >
                                <option value="NSDL_CDSL">Demat Account (NSDL / CDSL — 16 Digits)</option>
                                <option value="PHYSICAL_FOLIO">Physical Folio Account</option>
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor="dpIdClientId" className="text-xs font-bold text-slate-200">
                                {dematData.depositoryType === "NSDL_CDSL" ? "DP ID / Client ID (16 Digits)" : "Physical Folio Number"}
                              </Label>
                              <div className="relative">
                                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                  id="dpIdClientId"
                                  name="dpIdClientId"
                                  value={dematData.dpIdClientId}
                                  onChange={handleDematChange}
                                  placeholder={dematData.depositoryType === "NSDL_CDSL" ? "e.g. IN30012612345678 or 1201090000123456" : "e.g. FOL-98231"}
                                  className="pl-10 bg-black/40 border-white/15 text-white placeholder:text-slate-500 rounded-xl focus:border-cyan-400 text-sm h-11"
                                  required
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor="panNumber" className="text-xs font-bold text-slate-200">
                                Permanent Account Number (PAN)
                              </Label>
                              <div className="relative">
                                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                  id="panNumber"
                                  name="panNumber"
                                  maxLength={10}
                                  value={dematData.panNumber}
                                  onChange={handleDematChange}
                                  placeholder="e.g. ABCDE1234F"
                                  className="pl-10 bg-black/40 border-white/15 text-white placeholder:text-slate-500 rounded-xl focus:border-cyan-400 text-sm uppercase h-11"
                                  required
                                />
                              </div>
                            </div>

                            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-200">
                              <Info className="w-3.5 h-3.5 inline mr-1 text-cyan-400" />
                              PAN is matched against the RTA register as on the statutory Record Date.
                            </div>

                            {/* Cloudflare Turnstile Bot Protection */}
                            <TurnstileWidget
                              action="shareholder-login"
                              theme="dark"
                              onSuccess={(tok) => setTurnstileToken(tok)}
                              onError={() => setTurnstileToken("")}
                              onExpire={() => setTurnstileToken("")}
                            />

                            <Button
                              type="submit"
                              size="lg"
                              disabled={isLoading}
                              className="w-full bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-700 hover:to-teal-600 text-white font-bold rounded-xl h-12 shadow-lg shadow-cyan-500/20 mt-2"
                            >
                              {isLoading ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  <span>Searching Benpos Database...</span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-2">
                                  <span>Verify Folio &amp; Request OTP</span>
                                  <ArrowRight className="w-4 h-4" />
                                </div>
                              )}
                            </Button>
                          </form>
                        </TabsContent>
                      </Tabs>

                      {/* Help Guidance Accordion / Popup */}
                      {showHelpModal && (
                        <div className="p-4 rounded-2xl bg-black/60 border border-cyan-500/30 text-xs text-slate-300 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="font-bold text-white flex items-center justify-between">
                            <span>How to locate your credentials:</span>
                            <button 
                              type="button" 
                              onClick={() => setShowHelpModal(false)}
                              className="text-slate-400 hover:text-white"
                            >
                              ✕
                            </button>
                          </div>
                          <ul className="list-disc pl-4 space-y-1 text-slate-300">
                            <li><strong>AGM Notice Email:</strong> The company sends an electronic notice containing your unique User ID and initial PIN 21 days before the meeting.</li>
                            <li><strong>Demat Statement:</strong> Your 16-digit DP ID + Client ID is visible in your Zerodha, Groww, Upstox, or HDFC Securities holding statement.</li>
                            <li><strong>Physical Shares:</strong> Use the Folio Number printed on your physical share certificate along with your PAN.</li>
                          </ul>
                        </div>
                      )}

                    </div>
                  ) : (
                    /* STEP 2: Animated 2FA OTP Screen */
                    <AnimatedOtpVerification
                      length={6}
                      recipientInfo={maskedEmail}
                      themeColor="cyan"
                      title="Two-Factor Security Verification"
                      subtitle="Enter the 6-digit one-time passcode dispatched to your depository registered email to access your voting ballot."
                      onVerify={handleOtpVerify}
                      onResend={handleOtpResend}
                      onSuccess={handleOtpSuccess}
                      onBack={() => setLoginStep("CREDENTIALS")}
                    />
                  )}

                  {/* Card Footer Links */}
                  <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                    <Link to="/live-demo" className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      Try Interactive Live Demo
                    </Link>
                    <Link to="/contact" className="hover:text-slate-200 hover:underline">
                      Need Technical Support?
                    </Link>
                  </div>

                  <div className="mt-3 text-center text-[11px] text-slate-400">
                    Are you a company administrator?{" "}
                    <Link to="/company-register" className="text-blue-400 hover:underline font-semibold">
                      Register Company Portal →
                    </Link>
                  </div>

                </CardContent>
              </Card>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ShareholderLogin;
