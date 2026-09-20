/**
 * Deferred, Consent-Aware Analytics Loader
 *
 * Ensures third-party analytics scripts (GA4 / GTM) do not block initial rendering,
 * hydration, or degrade Core Web Vitals (LCP, FCP, TBT).
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const CONSENT_STORAGE_KEY = "vote_india_analytics_consent";
const GTM_ID = "GTM-5PWZGCBR";

export function getAnalyticsConsent(): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored === "granted") return true;
    if (stored === "denied") return false;
  } catch {
    return null;
  }
  return null;
}

export function setAnalyticsConsent(granted: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, granted ? "granted" : "denied");
  } catch {
    // Ignore localStorage failures (e.g. incognito)
  }

  if (granted) {
    loadAnalytics();
  }
}

let isLoaded = false;

export function loadAnalytics(): void {
  if (typeof window === "undefined" || isLoaded) return;

  // Defer script injection until the browser is idle to safeguard Core Web Vitals
  const inject = () => {
    if (isLoaded) return;
    isLoaded = true;

    // Window dataLayer initialization
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function (...args: unknown[]) {
      window.dataLayer.push(args);
    };

    window.gtag("js", new Date());
    window.gtag("config", GTM_ID, {
      anonymize_ip: true,
      send_page_view: true,
      restricted_data_processing: true,
    });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    script.onerror = () => {
      console.warn("Analytics script failed to load (e.g. ad-blocker enabled)");
    };
    document.head.appendChild(script);
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(inject, { timeout: 3000 });
  } else {
    setTimeout(inject, 2000);
  }
}

// Auto-initialize if consent previously granted or if default non-PII telemetry is permitted
export function initAnalyticsIfConsented(): void {
  if (typeof window === "undefined") return;
  const consent = getAnalyticsConsent();
  // If user hasn't explicitly denied, load deferred with IP anonymization
  if (consent !== false) {
    loadAnalytics();
  }
}
