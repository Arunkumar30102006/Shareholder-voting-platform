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
import AnimatedOtpVerification, { VerifyResult } from "@/components/auth/AnimatedOtpVerification";
import { TurnstileWidget, TurnstileWidgetRef } from "@/components/common/TurnstileWidget";

import { env } from "@/config/env";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const CompanyLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  
  // Cloudflare Turnstile Bot Protection
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      await handlePasswordLogin();
    }
  };

  const handlePasswordLogin = async () => {
    setIsLoading(true);
    setErrors({});

    if (!turnstileToken) {
      toast.error("Please complete the security challenge before signing in.");
      setIsLoading(false);
      return;
    }

    try {
      const validatedData = loginSchema.parse(formData);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (error) {
        turnstileRef.current?.reset();
        setTurnstileToken("");
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password");
        } else {
          toast.error(error.message);
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Check if user is a company admin
        const { data: adminData, error: adminError } = await (supabase
          .from("company_admins") as any)
          .select("company_id")
          .eq("user_id", data.user.id)
          .maybeSingle();

        if (adminError || !adminData) {
          turnstileRef.current?.reset();
          setTurnstileToken("");
          toast.error("You are not registered as a company administrator");
          await supabase.auth.signOut();
          setIsLoading(false);
          return;
        }

        // Fetch company name for UI display
        const { data: companyData } = await (supabase
          .from("companies") as any)
          .select("company_name")
          .eq("id", adminData.company_id)
          .maybeSingle();

        const cName = companyData?.company_name || "Vote India Secure";
        setCompanyName(cName);

        // Initiate Server-Side 2FA Challenge with Turnstile bot verification
        const { data: initData, error: initError } = await supabase.functions.invoke("initiate-company-2fa", {
          body: {
            turnstile_token: turnstileToken,
          }
        });

        if (initError || !initData?.success || !initData?.challenge_id) {
          turnstileRef.current?.reset();
          setTurnstileToken("");
          console.error("2FA initiation error:", initError || initData);
          toast.error("Failed to initiate two-factor authentication.", {
            description: initData?.error || "Please ensure the administrator email service is configured."
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
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string } = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as "email" | "password"] = error.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        const isFetchError = err instanceof TypeError && (err.message.includes("Failed to fetch") || err.message.includes("network error"));
        if (isFetchError) {
          toast.error("Network connection error. Please check your internet or if you are behind a restrictive firewall/VPN.", {
            description: `Detail: ${err.message}. Please try again in a moment.`,
            duration: 10000,
          });
          console.error("Fetch Error:", err);
        } else {
          toast.error(`Error: ${err.message || 'Unknown error'}`);
          console.error("Login Error:", err);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async (enteredOtp: string): Promise<VerifyResult> => {
    if (!challengeId) {
      return {
        success: false,
        error: "Verification challenge expired. Please sign in again.",
      };
    }

    try {
      // Server-Side Verification: Compare submitted OTP against stored hash in PostgreSQL
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-company-2fa", {
        body: {
          challenge_id: challengeId,
          otp: enteredOtp.trim(),
        }
      });

      if (verifyError || !verifyData?.success) {
        let serverMsg = verifyData?.error;
        if (!serverMsg && verifyError) {
          try {
            const errContext = await (verifyError as any)?.context?.json?.();
            serverMsg = errContext?.error || verifyError.message;
          } catch {
            serverMsg = verifyError.message;
          }
        }

        return {
          success: false,
          error: serverMsg || "Incorrect verification code. Please check your email.",
        };
      }

      return { success: true };
    } catch (err: unknown) {
      console.error("OTP verification error:", err);
      return {
        success: false,
        error: (err as Error).message || "Verification service error.",
      };
    }
  };

  const handleOtpResend = async (): Promise<boolean> => {
    try {
      const { data: initData, error: initError } = await supabase.functions.invoke("initiate-company-2fa", {
        body: {
          turnstile_token: turnstileToken,
        }
      });

      if (initError || !initData?.success || !initData?.challenge_id) {
        toast.error("Failed to resend verification code. Please try again.");
        return false;
      }

      setChallengeId(initData.challenge_id);
      toast.success("New verification code dispatched to your registered email");
      return true;
    } catch (err: unknown) {
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
    } catch {
      // non-fatal cleanup
    }
    await supabase.auth.signOut();
    setStep(1);
    setChallengeId(null);
  };


  return (
    <div className="min-h-screen bg-[#020817] flex flex-col justify-between selection:bg-orange-500/30">
      <SEO
        title="Company Administrator Login | Vote India Secure"
        description="Secure portal login for company administrators and general meeting managers."
        canonical="/company-login"
        noindex={true}
      />

      <main className="pt-24 pb-16 min-h-[calc(100vh-200px)] flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-6 shadow-sm">
                <Building2 className="w-4 h-4 text-orange-400" />
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
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-gradient-slow" />
              
              <Card className="relative shadow-2xl border-white/10 bg-[#020817]/90 backdrop-blur-xl">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl flex items-center justify-center gap-2">
                    <Shield className="w-5 h-5 text-orange-400" />
                    {t("company_login_secure")}
                  </CardTitle>
                  <CardDescription>
                    {t("company_login_creds")}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {step === 1 ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="email">{t("company_login_email")}</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-orange-400 transition-colors" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="username"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder={t("company_login_email_ph")}
                            className={`pl-11 bg-black/40 border-white/10 focus:border-orange-500/50 transition-all ${errors.email ? "border-destructive" : ""}`}
                            required
                            disabled={isLoading}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">{t("company_login_password")}</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-orange-400 transition-colors" />
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder={t("company_login_password_ph")}
                            className={`pl-11 pr-11 bg-black/40 border-white/10 focus:border-orange-500/50 transition-all ${errors.password ? "border-destructive" : ""}`}
                            required
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-orange-400 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-sm text-destructive">{errors.password}</p>
                        )}
                      </div>

                      {/* Cloudflare Turnstile Bot Protection */}
                      <TurnstileWidget
                        ref={turnstileRef}
                        action="company-login"
                        theme="dark"
                        onSuccess={(tok) => setTurnstileToken(tok)}
                        onError={() => setTurnstileToken("")}
                        onExpire={() => setTurnstileToken("")}
                      />

                      <Button
                        type="submit"
                        variant="hero"
                        className="w-full gap-2 mt-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 border-none shadow-lg shadow-orange-500/25"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            {t("company_login_signin")}
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  ) : (
                    <AnimatedOtpVerification
                      length={6}
                      recipientInfo={formData.email}
                      themeColor="orange"
                      title="Enter 2FA Code"
                      subtitle={`A 6-digit administrator verification code has been sent to ${formData.email}.`}
                      onVerify={handleOtpVerify}
                      onResend={handleOtpResend}
                      onSuccess={handleOtpSuccess}
                      onBack={handleBackToLogin}
                    />
                  )}

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
              <Shield className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
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
    </div>
  );
};

export default CompanyLogin;