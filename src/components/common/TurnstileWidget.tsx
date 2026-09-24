import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { env } from "@/config/env";
import { ShieldCheck, RefreshCw } from "lucide-react";

export interface TurnstileWidgetRef {
  reset: () => void;
  remove: () => void;
  getResponse: () => string | undefined;
}

export interface TurnstileWidgetProps {
  siteKey?: string;
  action?: string;
  theme?: "dark" | "light" | "auto";
  size?: "normal" | "compact" | "flexible";
  onSuccess: (token: string) => void;
  onError?: (error?: string) => void;
  onExpire?: () => void;
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          action?: string;
          theme?: "dark" | "light" | "auto";
          size?: "normal" | "compact" | "flexible";
          callback?: (token: string) => void;
          "error-callback"?: (error?: string) => void;
          "expired-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      getResponse: (widgetId: string) => string | undefined;
    };
    onTurnstileLoaded?: () => void;
  }
}

let scriptLoadingPromise: Promise<void> | null = null;

const loadTurnstileScript = (): Promise<void> => {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.turnstile) {
    return Promise.resolve();
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById("cloudflare-turnstile-script");
    if (existingScript) {
      if (window.turnstile) {
        resolve();
      } else {
        existingScript.addEventListener("load", () => resolve());
        existingScript.addEventListener("error", (e) => reject(e));
      }
      return;
    }

    const script = document.createElement("script");
    script.id = "cloudflare-turnstile-script";
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve();
    };

    script.onerror = (err) => {
      scriptLoadingPromise = null;
      console.error("Failed to load Cloudflare Turnstile script:", err);
      reject(new Error("Failed to load Cloudflare Turnstile script"));
    };

    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
};

export const TurnstileWidget = forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(
  (
    {
      siteKey = env.TURNSTILE_SITE_KEY,
      action,
      theme = "dark",
      size = "normal",
      onSuccess,
      onError,
      onExpire,
      className = "",
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Keep callbacks fresh in refs to avoid re-rendering Turnstile unnecessarily
    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);
    const onExpireRef = useRef(onExpire);

    useEffect(() => {
      onSuccessRef.current = onSuccess;
      onErrorRef.current = onError;
      onExpireRef.current = onExpire;
    }, [onSuccess, onError, onExpire]);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (typeof window !== "undefined" && window.turnstile && widgetIdRef.current) {
          try {
            window.turnstile.reset(widgetIdRef.current);
          } catch (e) {
            console.warn("Turnstile reset error:", e);
          }
        }
      },
      remove: () => {
        if (typeof window !== "undefined" && window.turnstile && widgetIdRef.current) {
          try {
            window.turnstile.remove(widgetIdRef.current);
            widgetIdRef.current = null;
          } catch (e) {
            console.warn("Turnstile remove error:", e);
          }
        }
      },
      getResponse: () => {
        if (typeof window !== "undefined" && window.turnstile && widgetIdRef.current) {
          return window.turnstile.getResponse(widgetIdRef.current);
        }
        return undefined;
      },
    }));

    useEffect(() => {
      let isMounted = true;

      // Skip in SSR/SSG environments
      if (typeof window === "undefined" || !containerRef.current) {
        return;
      }

      loadTurnstileScript()
        .then(() => {
          if (!isMounted || !containerRef.current || !window.turnstile) return;

          // Clean up any previously rendered widget in this container
          if (widgetIdRef.current) {
            try {
              window.turnstile.remove(widgetIdRef.current);
              widgetIdRef.current = null;
            } catch {
              // Ignore cleanup error
            }
          }

          try {
            const widgetId = window.turnstile.render(containerRef.current, {
              sitekey: siteKey,
              action: action,
              theme: theme,
              size: size,
              callback: (token: string) => {
                if (!isMounted) return;
                setIsLoading(false);
                setHasError(false);
                onSuccessRef.current?.(token);
              },
              "error-callback": (err?: string) => {
                if (!isMounted) return;
                setIsLoading(false);
                setHasError(true);
                onErrorRef.current?.(err);
              },
              "expired-callback": () => {
                if (!isMounted) return;
                onExpireRef.current?.();
              },
            });

            widgetIdRef.current = widgetId;
            setIsLoading(false);
          } catch (renderError) {
            console.error("Turnstile render error:", renderError);
            if (isMounted) {
              setIsLoading(false);
              setHasError(true);
            }
          }
        })
        .catch((err) => {
          console.error("Turnstile loader error:", err);
          if (isMounted) {
            setIsLoading(false);
            setHasError(true);
          }
        });

      return () => {
        isMounted = false;
        if (typeof window !== "undefined" && window.turnstile && widgetIdRef.current) {
          try {
            window.turnstile.remove(widgetIdRef.current);
            widgetIdRef.current = null;
          } catch {
            // Ignore unmount error
          }
        }
      };
    }, [siteKey, action, theme, size]);

    const handleManualRetry = () => {
      setHasError(false);
      setIsLoading(true);
      if (typeof window !== "undefined" && window.turnstile && widgetIdRef.current) {
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch {
          // If reset fails, re-render
          window.location.reload();
        }
      }
    };

    return (
      <div className={`flex flex-col items-center justify-center my-3 ${className}`}>
        {/* Turnstile Container */}
        <div ref={containerRef} className="min-h-[65px] flex items-center justify-center" />

        {/* Loading State Placeholder */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Verifying secure connection...</span>
          </div>
        )}

        {/* Error Fallback */}
        {hasError && (
          <div className="flex flex-col items-center gap-1.5 py-1 text-xs text-red-400">
            <span>Security challenge could not load.</span>
            <button
              type="button"
              onClick={handleManualRetry}
              className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 underline font-medium"
            >
              <RefreshCw className="w-3 h-3" /> Retry challenge
            </button>
          </div>
        )}
      </div>
    );
  }
);

TurnstileWidget.displayName = "TurnstileWidget";
export default TurnstileWidget;
