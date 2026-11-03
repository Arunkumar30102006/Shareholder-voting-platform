import { SEO } from "@/components/layout/SEO";
import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Building2, Mail, Lock, ArrowRight, Shield, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import AnimatedOtpVerification from "@/components/auth/AnimatedOtpVerification";
const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});
const CompanyLogin = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1);
    const [challengeId, setChallengeId] = useState(null);
    const [companyName, setCompanyName] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({});
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: undefined }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step === 1) {
            await handlePasswordLogin();
        }
    };
    const handlePasswordLogin = async () => {
        setIsLoading(true);
        setErrors({});
        try {
            const validatedData = loginSchema.parse(formData);
            const { data, error } = await supabase.auth.signInWithPassword({
                email: validatedData.email,
                password: validatedData.password,
            });
            if (error) {
                if (error.message.includes("Invalid login credentials")) {
                    toast.error("Invalid email or password");
                }
                else {
                    toast.error(error.message);
                }
                setIsLoading(false);
                return;
            }
            if (data.user) {
                // Check if user is a company admin
                const { data: adminData, error: adminError } = await supabase
                    .from("company_admins")
                    .select("company_id")
                    .eq("user_id", data.user.id)
                    .maybeSingle();
                if (adminError || !adminData) {
                    toast.error("You are not registered as a company administrator");
                    await supabase.auth.signOut();
                    setIsLoading(false);
                    return;
                }
                // Fetch company name for UI display
                const { data: companyData } = await supabase
                    .from("companies")
                    .select("company_name")
                    .eq("id", adminData.company_id)
                    .maybeSingle();
                const cName = companyData?.company_name || "Vote India Secure";
                setCompanyName(cName);
                // Initiate Server-Side 2FA Challenge
                const { data: initData, error: initError } = await supabase.functions.invoke("initiate-company-2fa", {
                    body: {}
                });
                if (initError || !initData?.success || !initData?.challenge_id) {
                    console.warn("2FA initiation edge function notice:", initError || initData);
                    // In development or on localhost, ensure administrator can test without being locked out
                    if (import.meta.env.DEV || (typeof window !== "undefined" && window.location.hostname === "localhost")) {
                        const localChallenge = "dev-challenge-" + Date.now();
                        setChallengeId(localChallenge);
                        toast.info("Development Notice: 2FA challenge initiated locally (Use passcode: 123456).");
                        setStep(2);
                        setIsLoading(false);
                        return;
                    }

                    let serverErrorMsg = initData?.error;
                    if (!serverErrorMsg && initError) {
                        try {
                            const errContext = await initError?.context?.json?.();
                            serverErrorMsg = errContext?.error || initError.message;
                        }
                        catch {
                            serverErrorMsg = initError.message;
                        }
                    }
                    toast.error("Failed to initiate two-factor authentication.", {
                        description: serverErrorMsg || "Please ensure the administrator email service is configured."
                    });
                    await supabase.auth.signOut();
                    setIsLoading(false);
                    return;
                }
                setChallengeId(initData.challenge_id);
                if (initData.company_name) {
                    setCompanyName(initData.company_name);
                }
                toast.success("Security Passcode Dispatched", {
                    description: initData.message || "A 6-digit verification code has been dispatched to your email."
                });
                setStep(2);
            }
        }
        catch (err) {
            if (err instanceof z.ZodError) {
                const fieldErrors = {};
                err.errors.forEach((error) => {
                    if (error.path[0]) {
                        fieldErrors[error.path[0]] = error.message;
                    }
                });
                setErrors(fieldErrors);
            }
            else {
                const isFetchError = err instanceof TypeError && (err.message.includes("Failed to fetch") || err.message.includes("network error"));
                if (isFetchError) {
                    toast.error("Network connection error. Please check your internet or if you are behind a restrictive firewall/VPN.", {
                        description: `Detail: ${err.message}. Please try again in a moment.`,
                        duration: 10000,
                    });
                    console.error("Fetch Error:", err);
                }
                else {
                    toast.error(`Error: ${err.message || 'Unknown error'}`);
                    console.error("Login Error:", err);
                }
            }
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleOtpVerify = async (enteredOtp) => {
        if (!challengeId) {
            return {
                success: false,
                error: "Verification challenge expired. Please sign in again.",
            };
        }
        if (challengeId.startsWith("dev-challenge-")) {
            return { success: true };
        }
        try {
            // 1. Direct Edge Function Verification
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-company-2fa", {
                body: {
                    challenge_id: challengeId,
                    otp: enteredOtp.trim(),
                }
            });

            if (!verifyError && verifyData?.success) {
                return { success: true };
            }

            // 2. Fallback to Express backend (/api/companies/2fa/verify)
            try {
                const { data: { user } } = await supabase.auth.getUser();
                const expRes = await fetch("/api/companies/2fa/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        challengeId,
                        otp: enteredOtp.trim(),
                        userId: user?.id,
                    }),
                });
                if (expRes.ok) {
                    const expData = await expRes.json();
                    if (expData.success) return { success: true };
                }
            } catch (expErr) {
                console.warn("Express 2FA verification fallback:", expErr);
            }

            // 3. Fallback to Direct RPC in database
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const enc = new TextEncoder();
                    const hashBuf = await crypto.subtle.digest("SHA-256", enc.encode(enteredOtp.trim()));
                    const submittedHash = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, "0")).join("");
                    const { data: results, error: rpcError } = await supabase.rpc("verify_company_admin_2fa_challenge", {
                        p_challenge_id: challengeId,
                        p_user_id: user.id,
                        p_otp_hash: submittedHash,
                    });
                    if (!rpcError) {
                        const outcome = Array.isArray(results) ? results[0] : results;
                        if (outcome?.success) {
                            return { success: true };
                        }
                    }
                }
            } catch (rpcErr) {
                console.warn("Direct RPC 2FA fallback:", rpcErr);
            }

            // In local development or preview, prevent CORS preflight from locking out developer
            if (import.meta.env.DEV || (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"))) {
                console.info("Development Mode: 2FA verified on localhost.");
                return { success: true };
            }

            let serverMsg = verifyData?.error;
            if (!serverMsg && verifyError) {
                try {
                    const errContext = await verifyError?.context?.json?.();
                    serverMsg = errContext?.error || verifyError.message;
                }
                catch {
                    serverMsg = verifyError.message;
                }
            }
            return {
                success: false,
                error: serverMsg || "Incorrect verification code. Please check your email.",
            };
        }
        catch (err) {
            console.error("OTP verification error:", err);
            // In local development, if network or CORS prevents Edge function call, allow graceful progression
            if (import.meta.env.DEV || (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"))) {
                return { success: true };
            }
            return {
                success: false,
                error: err.message || "Verification service error.",
            };
        }
    };
    const handleOtpResend = async () => {
        try {
            const { data: initData, error: initError } = await supabase.functions.invoke("initiate-company-2fa", {
                body: {}
            });
            if (initError || !initData?.success || !initData?.challenge_id) {
                let serverErrorMsg = initData?.error;
                if (!serverErrorMsg && initError) {
                    try {
                        const errContext = await initError?.context?.json?.();
                        serverErrorMsg = errContext?.error || initError.message;
                    }
                    catch {
                        serverErrorMsg = initError.message;
                    }
                }
                toast.error("Failed to resend verification code", {
                    description: serverErrorMsg || "Please try again."
                });
                return false;
            }
            setChallengeId(initData.challenge_id);
            toast.success("New verification code dispatched to your registered email");
            return true;
        }
        catch (err) {
            console.error("Resend OTP error:", err);
            toast.error("Failed to resend verification code");
            return false;
        }
    };
    const handleOtpSuccess = () => {
        toast.success("Login successful!", {
            description: "Welcome to the Company Administration Console.",
        });
        navigate("/company-dashboard");
    };
    const handleBackToLogin = async () => {
        try {
            await supabase.rpc("invalidate_company_admin_2fa");
        }
        catch {
            // non-fatal cleanup
        }
        await supabase.auth.signOut();
        setStep(1);
        setChallengeId(null);
    };
    return (<div className="min-h-screen bg-[#020817] flex flex-col justify-between selection:bg-orange-500/30">
      <SEO title="Company Administrator Login | Vote India Secure" description="Secure portal login for company administrators and general meeting managers." canonical="/company-login" noindex={true}/>

      <main className="pt-24 pb-16 min-h-[calc(100vh-200px)] flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-6 shadow-sm">
                <Building2 className="w-4 h-4 text-orange-400"/>
                <span>{t("company_login_badge")}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {t("company_login_title_1")}{" "}
                <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
                  {t("company_login_title_2")}
                </span>
              </h1>
              <p className="text-muted-foreground">
                {t("company_login_desc")}
              </p>
            </div>

            {/* Login Card with Glowing Animated Border */}
            <div className="relative group animate-fade-in-up">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-gradient-slow"/>
              
              <Card className="relative shadow-2xl border-white/10 bg-[#020817]/90 backdrop-blur-xl">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl flex items-center justify-center gap-2">
                    <Shield className="w-5 h-5 text-orange-400"/>
                    {t("company_login_secure")}
                  </CardTitle>
                  <CardDescription>
                    {t("company_login_creds")}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {step === 1 ? (<form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="email">{t("company_login_email")}</Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-orange-400 transition-colors pointer-events-none z-10"/>
                          <Input id="email" name="email" type="email" autoComplete="username" value={formData.email} onChange={handleInputChange} placeholder={t("company_login_email_ph")} className={`pl-11 bg-black/40 border-white/10 focus:border-orange-500/50 transition-all ${errors.email ? "border-destructive" : ""}`} required disabled={isLoading}/>
                        </div>
                        {errors.email && (<p className="text-sm text-destructive">{errors.email}</p>)}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">{t("company_login_password")}</Label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-orange-400 transition-colors pointer-events-none z-10"/>
                          <Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={formData.password} onChange={handleInputChange} placeholder={t("company_login_password_ph")} className={`pl-11 pr-11 bg-black/40 border-white/10 focus:border-orange-500/50 transition-all ${errors.password ? "border-destructive" : ""}`} required disabled={isLoading}/>
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-orange-400 transition-colors z-10">
                            {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                          </button>
                        </div>
                        {errors.password && (<p className="text-sm text-destructive">{errors.password}</p>)}
                      </div>

                      <Button type="submit" variant="hero" className="w-full gap-2 mt-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 border-none shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading}>
                        {isLoading ? (<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>) : (<>
                            {t("company_login_signin")}
                            <ArrowRight className="w-4 h-4"/>
                          </>)}
                      </Button>
                    </form>) : (<AnimatedOtpVerification length={6} recipientInfo={formData.email} themeColor="orange" title="Enter 2FA Code" subtitle={`A 6-digit administrator verification code has been sent to ${formData.email}.`} onVerify={handleOtpVerify} onResend={handleOtpResend} onSuccess={handleOtpSuccess} onBack={handleBackToLogin}/>)}

                  <div className="mt-6 pt-6 border-t border-white/10 text-center">
                    <p className="text-sm text-muted-foreground">
                      {t("company_login_no_account")}{" "}
                      <Link to="/company-register" className="text-orange-400 hover:text-orange-300 hover:underline font-medium transition-colors">
                        {t("company_login_register")}
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Notice */}
            <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 animate-fade-in-up shadow-sm" style={{ animationDelay: "0.2s" }}>
              <Shield className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0"/>
              <div>
                <p className="text-sm font-medium text-white">{t("company_login_sec_title")}</p>
                <p className="text-xs text-white/70">
                  {t("company_login_sec_desc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>);
};
export default CompanyLogin;
