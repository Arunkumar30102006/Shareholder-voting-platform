import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  ShieldCheck,
  RotateCcw,
  ArrowLeft,
  AlertCircle,
  Clock,
  Lock,
  Sparkles,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type OtpPhase =
  | "idle"
  | "typing"
  | "verifying"
  | "success"
  | "error"
  | "expired"
  | "resending"
  | "disabled";

export interface VerifyResult {
  success: boolean;
  error?: string;
  isExpired?: boolean;
}

export interface AnimatedOtpVerificationProps {
  /** Total number of digits (default: 6) */
  length?: number;
  /** Masked email or phone to display */
  recipientInfo?: string;
  /** Component header title */
  title?: string;
  /** Component header subtitle */
  subtitle?: string;
  /** Accent theme color matching the page */
  themeColor?: "cyan" | "orange" | "emerald" | "blue";
  /** Asynchronous verification handler calling real backend */
  onVerify: (otp: string) => Promise<VerifyResult | boolean>;
  /** Asynchronous resend handler calling real backend */
  onResend?: () => Promise<boolean>;
  /** Callback fired after success animation completes */
  onSuccess?: () => void;
  /** Back button handler */
  onBack?: () => void;
  /** Resend cooldown in seconds (default: 30) */
  resendCooldownSeconds?: number;
  /** Automatically trigger verification once all boxes are filled (default: true) */
  autoSubmit?: boolean;
  /** Whether the component is disabled */
  disabled?: boolean;
}

export const AnimatedOtpVerification: React.FC<AnimatedOtpVerificationProps> = ({
  length = 6,
  recipientInfo,
  title = "Enter Verification Code",
  subtitle,
  themeColor = "cyan",
  onVerify,
  onResend,
  onSuccess,
  onBack,
  resendCooldownSeconds = 30,
  autoSubmit = true,
  disabled = false,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [digits, setDigits] = useState<string[]>(Array(length).fill(""));
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [phase, setPhase] = useState<OtpPhase>(disabled ? "disabled" : "idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [cooldown, setCooldown] = useState<number>(resendCooldownSeconds);
  const [canResend, setCanResend] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isVerifyingRef = useRef<boolean>(false);

  // Theme styling configuration
  const theme = {
    cyan: {
      accent: "cyan",
      focusBorder: "border-cyan-400",
      focusGlow: "shadow-[0_0_20px_rgba(6,182,212,0.45)]",
      activeText: "text-cyan-400",
      gradientBtn: "from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-cyan-500/25",
      badgeBg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-300",
      sweepColor: "from-transparent via-cyan-400/30 to-transparent",
    },
    orange: {
      accent: "orange",
      focusBorder: "border-orange-400",
      focusGlow: "shadow-[0_0_20px_rgba(249,115,22,0.45)]",
      activeText: "text-orange-400",
      gradientBtn: "from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/25",
      badgeBg: "bg-orange-500/10 border-orange-500/20 text-orange-300",
      sweepColor: "from-transparent via-orange-400/30 to-transparent",
    },
    emerald: {
      accent: "emerald",
      focusBorder: "border-emerald-400",
      focusGlow: "shadow-[0_0_20px_rgba(16,185,129,0.45)]",
      activeText: "text-emerald-400",
      gradientBtn: "from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-emerald-500/25",
      badgeBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
      sweepColor: "from-transparent via-emerald-400/30 to-transparent",
    },
    blue: {
      accent: "blue",
      focusBorder: "border-blue-400",
      focusGlow: "shadow-[0_0_20px_rgba(59,130,246,0.45)]",
      activeText: "text-blue-400",
      gradientBtn: "from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25",
      badgeBg: "bg-blue-500/10 border-blue-500/20 text-blue-300",
      sweepColor: "from-transparent via-blue-400/30 to-transparent",
    },
  }[themeColor];

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      setCanResend(false);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setCanResend(true);
    }
  }, [cooldown]);

  // Initial focus on mount
  useEffect(() => {
    if (!disabled && phase !== "success" && phase !== "verifying") {
      const firstEmptyIndex = digits.findIndex((d) => !d);
      const indexToFocus = firstEmptyIndex === -1 ? 0 : firstEmptyIndex;
      inputRefs.current[indexToFocus]?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  // Handle actual verification execution
  const executeVerification = useCallback(
    async (codeToVerify: string) => {
      if (isVerifyingRef.current || phase === "success") return;
      isVerifyingRef.current = true;
      setPhase("verifying");
      setErrorMessage("");

      try {
        const result = await onVerify(codeToVerify);
        const isSuccess = typeof result === "boolean" ? result : result.success;

        if (isSuccess) {
          setPhase("success");
          // Hold success state for smooth checkmark drawing before triggering navigation
          setTimeout(() => {
            if (onSuccess) onSuccess();
          }, 1800);
        } else {
          const errorText =
            typeof result === "object" && result.error
              ? result.error
              : "Invalid verification code. Please try again.";
          const isExpired = typeof result === "object" && Boolean(result.isExpired);

          setPhase(isExpired ? "expired" : "error");
          setErrorMessage(errorText);
          isVerifyingRef.current = false;

          // Re-focus the first slot or keep selection
          setTimeout(() => {
            inputRefs.current[0]?.focus();
            setFocusedIndex(0);
          }, 450);
        }
      } catch (err: unknown) {
        console.error("OTP verification error:", err);
        setPhase("error");
        setErrorMessage(
          (err as Error)?.message || "A network error occurred. Please try again."
        );
        isVerifyingRef.current = false;
      }
    },
    [onVerify, onSuccess, phase]
  );

  // Auto-submit when all boxes are populated
  useEffect(() => {
    const fullCode = digits.join("");
    if (
      autoSubmit &&
      fullCode.length === length &&
      phase !== "verifying" &&
      phase !== "success" &&
      !isVerifyingRef.current
    ) {
      // Small pause before triggering verification for natural UX feel
      const timeout = setTimeout(() => {
        executeVerification(fullCode);
      }, 250);
      return () => clearTimeout(timeout);
    }
  }, [digits, autoSubmit, length, phase, executeVerification]);

  // Handle single digit input
  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const cleanDigits = rawVal.replace(/\D/g, "");

    if (!cleanDigits) {
      const newDigits = [...digits];
      newDigits[index] = "";
      setDigits(newDigits);
      setPhase("typing");
      return;
    }

    if (cleanDigits.length > 1) {
      // Multi-digit paste or autofill through input
      handlePasteDigits(cleanDigits, index);
      return;
    }

    const singleDigit = cleanDigits.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = singleDigit;
    setDigits(newDigits);
    setPhase("typing");
    setErrorMessage("");

    // Move to next input box if available
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  // Keyboard navigation & backspace handling
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (phase === "verifying" || phase === "success") return;

    if (e.key === "Backspace") {
      e.preventDefault();
      const newDigits = [...digits];

      if (digits[index]) {
        // Clear current digit
        newDigits[index] = "";
        setDigits(newDigits);
        setPhase("typing");
      } else if (index > 0) {
        // Move to previous box and clear
        newDigits[index - 1] = "";
        setDigits(newDigits);
        setPhase("typing");
        inputRefs.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const fullCode = digits.join("");
      if (fullCode.length === length) {
        executeVerification(fullCode);
      }
    }
  };

  // Paste handler
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    if (phase === "verifying" || phase === "success") return;
    const pastedData = e.clipboardData.getData("text/plain");
    const cleanDigits = pastedData.replace(/\D/g, "");
    if (cleanDigits) {
      handlePasteDigits(cleanDigits, 0);
    }
  };

  const handlePasteDigits = (cleanDigits: string, startIndex: number) => {
    const newDigits = [...digits];
    let insertIndex = startIndex;

    for (let i = 0; i < cleanDigits.length && insertIndex < length; i++) {
      newDigits[insertIndex] = cleanDigits[i];
      insertIndex++;
    }

    setDigits(newDigits);
    setPhase("typing");
    setErrorMessage("");

    const targetFocus = Math.min(insertIndex, length - 1);
    inputRefs.current[targetFocus]?.focus();
    setFocusedIndex(targetFocus);

    const fullCode = newDigits.join("");
    if (fullCode.length === length && autoSubmit) {
      executeVerification(fullCode);
    }
  };

  // Resend OTP handler
  const handleResend = async () => {
    if (!canResend || phase === "resending" || phase === "verifying") return;

    setPhase("resending");
    setErrorMessage("");

    try {
      if (onResend) {
        const ok = await onResend();
        if (ok) {
          setDigits(Array(length).fill(""));
          setPhase("idle");
          setCooldown(resendCooldownSeconds);
          setCanResend(false);
          setTimeout(() => {
            inputRefs.current[0]?.focus();
            setFocusedIndex(0);
          }, 100);
        } else {
          setPhase("error");
          setErrorMessage("Failed to resend verification code. Please try again.");
        }
      }
    } catch (err: unknown) {
      setPhase("error");
      setErrorMessage((err as Error)?.message || "Failed to resend verification code.");
    }
  };

  const isFormLocked = phase === "verifying" || phase === "success" || disabled;
  const isComplete = digits.join("").length === length;

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Ambient Success Glow */}
      <AnimatePresence>
        {phase === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute -inset-4 bg-radial from-emerald-500/30 via-emerald-500/10 to-transparent rounded-3xl blur-xl pointer-events-none z-0"
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 space-y-6">
        {/* Heading Area */}
        <div className="text-center min-h-[80px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {phase === "success" ? (
              <motion.div
                key="heading-success"
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="space-y-1.5"
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Authenticated</span>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
                  Verified Successfully
                </h2>
                <p className="text-xs text-slate-300">
                  Your credentials have been securely confirmed. Redirecting...
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="heading-normal"
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-1.5"
              >
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  {title}
                </h2>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  {subtitle ||
                    (recipientInfo
                      ? `Enter the ${length}-digit verification code sent to your registered account.`
                      : `Enter the ${length}-digit code to complete authentication.`)}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Recipient Badge */}
        {recipientInfo && phase !== "success" && (
          <div className="flex justify-center">
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium backdrop-blur-md transition-all ${theme.badgeBg}`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>
                Sent to <strong className="font-mono text-white">{recipientInfo}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Central Animated OTP Area */}
        <div className="relative py-2">
          <AnimatePresence mode="wait">
            {phase === "success" ? (
              /* Success State: Morphed Circular Badge with Animated Drawing Checkmark */
              <motion.div
                key="success-circle"
                initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 22,
                }}
                className="flex flex-col items-center justify-center py-4"
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.55)] border-2 border-emerald-300">
                  {/* Subtle radiating shockwave ring */}
                  <motion.div
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full border border-emerald-400"
                  />

                  {/* SVG Checkmark Drawing */}
                  <svg
                    viewBox="0 0 52 52"
                    className="w-10 h-10 sm:w-12 sm:h-12 text-white fill-none"
                    aria-hidden="true"
                  >
                    <motion.path
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 27 L23 36 L38 18"
                      initial={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.45, ease: "easeOut", delay: 0.15 }}
                    />
                  </svg>
                </div>
              </motion.div>
            ) : (
              /* Standard Input Boxes with Typing & Shimmer Sweep */
              <motion.div
                key="otp-boxes"
                layout
                animate={
                  phase === "error" || phase === "expired"
                    ? shouldReduceMotion
                      ? {}
                      : { x: [0, -10, 10, -8, 8, -4, 4, 0] }
                    : {}
                }
                transition={{ duration: 0.4 }}
                className="relative overflow-hidden rounded-2xl p-1"
              >
                {/* Glow sweep during verification */}
                {phase === "verifying" && (
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.2,
                      ease: "easeInOut",
                    }}
                    className={`absolute inset-0 z-20 pointer-events-none bg-gradient-to-r ${theme.sweepColor}`}
                  />
                )}

                {/* Individual Digit Slots */}
                <div
                  className="flex items-center justify-center gap-1.5 sm:gap-2.5 md:gap-3"
                  role="group"
                  aria-label="One-Time Password Input"
                  onPaste={handlePaste}
                >
                  {Array.from({ length }).map((_, index) => {
                    const digit = digits[index] || "";
                    const isFocused = focusedIndex === index && !isFormLocked;
                    const hasError = phase === "error" || phase === "expired";

                    let borderStyle = "border-white/10";
                    let glowStyle = "";

                    if (hasError) {
                      borderStyle = "border-rose-500/80";
                      glowStyle = "shadow-[0_0_16px_rgba(244,63,94,0.35)]";
                    } else if (isFocused) {
                      borderStyle = theme.focusBorder;
                      glowStyle = theme.focusGlow;
                    } else if (digit) {
                      borderStyle = "border-white/30";
                    }

                    return (
                      <div
                        key={index}
                        className={`relative flex items-center justify-center w-11 h-13 sm:w-12 sm:h-14 md:w-14 md:h-16 rounded-xl md:rounded-2xl bg-[#020817]/70 backdrop-blur-xl border ${borderStyle} ${glowStyle} transition-all duration-200`}
                      >
                        {/* Hidden Real Input */}
                        <input
                          ref={(el) => (inputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          autoComplete={index === 0 ? "one-time-code" : "off"}
                          maxLength={1}
                          value={digit}
                          disabled={isFormLocked}
                          onChange={(e) => handleChange(index, e)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onFocus={() => setFocusedIndex(index)}
                          aria-label={`Digit ${index + 1} of ${length}`}
                          aria-invalid={hasError}
                          className="absolute inset-0 w-full h-full text-transparent bg-transparent caret-transparent cursor-pointer disabled:cursor-not-allowed opacity-0 z-10"
                        />

                        {/* Animated Digit Rendering */}
                        <AnimatePresence mode="wait">
                          {digit ? (
                            <motion.span
                              key={`digit-${digit}-${index}`}
                              initial={
                                shouldReduceMotion
                                  ? { opacity: 0 }
                                  : { opacity: 0, y: -10, scale: 0.6 }
                              }
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={
                                shouldReduceMotion
                                  ? { opacity: 0 }
                                  : { opacity: 0, y: 10, scale: 0.6 }
                              }
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 25,
                              }}
                              className="text-2xl sm:text-3xl font-bold font-mono text-white select-none pointer-events-none"
                            >
                              {digit}
                            </motion.span>
                          ) : isFocused && !isFormLocked ? (
                            <motion.span
                              key="cursor"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{
                                repeat: Infinity,
                                duration: 0.9,
                                ease: "easeInOut",
                              }}
                              className={`w-0.5 h-6 rounded-full bg-${theme.accent}-400 select-none pointer-events-none`}
                              style={{
                                backgroundColor:
                                  themeColor === "orange"
                                    ? "#fb923c"
                                    : themeColor === "emerald"
                                    ? "#34d399"
                                    : themeColor === "blue"
                                    ? "#60a5fa"
                                    : "#22d3ee",
                              }}
                            />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-white/10 select-none pointer-events-none" />
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status / Error Message Area */}
        <div className="min-h-[28px] text-center" aria-live="polite">
          <AnimatePresence mode="wait">
            {phase === "verifying" && (
              <motion.div
                key="verifying-status"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2 text-xs font-medium text-slate-300"
              >
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying code with secure server...</span>
              </motion.div>
            )}

            {phase === "resending" && (
              <motion.div
                key="resending-status"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2 text-xs font-medium text-slate-300"
              >
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Sending fresh verification code...</span>
              </motion.div>
            )}

            {errorMessage && (phase === "error" || phase === "expired") && (
              <motion.div
                key="error-status"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-1.5 text-xs text-rose-400 font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Controls */}
        {phase !== "success" && (
          <div className="space-y-3 pt-2">
            {/* Primary Verify Button */}
            <Button
              type="button"
              variant="hero"
              size="lg"
              onClick={() => executeVerification(digits.join(""))}
              disabled={isFormLocked || !isComplete}
              className={`w-full gap-2 text-base font-bold bg-gradient-to-r ${theme.gradientBtn} border-none shadow-lg transition-all`}
            >
              {phase === "verifying" ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Verify Code</span>
                </>
              )}
            </Button>

            {/* Resend Code & Back Buttons */}
            <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
              {onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  disabled={isFormLocked}
                  className="inline-flex items-center gap-1 hover:text-white transition-colors disabled:opacity-50 py-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </button>
              ) : (
                <div />
              )}

              {onResend && (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!canResend || isFormLocked}
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors disabled:text-slate-600 disabled:cursor-not-allowed py-1"
                >
                  <RotateCcw
                    className={`w-3.5 h-3.5 ${phase === "resending" ? "animate-spin" : ""}`}
                  />
                  {canResend ? (
                    <span className={`font-medium ${theme.activeText} hover:underline`}>
                      Resend code
                    </span>
                  ) : (
                    <span>
                      Resend in <strong className="font-mono text-slate-300">{cooldown}s</strong>
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimatedOtpVerification;
