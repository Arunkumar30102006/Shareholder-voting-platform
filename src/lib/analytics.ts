/**
 * Privacy-Preserving Analytics Utility
 *
 * Enforces zero-PII and zero-ballot data leakage into client-side analytics streams.
 */

type EventParams = {
  [key: string]: string | number | boolean | null | undefined;
};

// Disallowed keys that could contain PII, credentials, or confidential voting data
const SENSITIVE_KEY_PATTERNS = [
  /pan/i,
  /password/i,
  /secret/i,
  /token/i,
  /cookie/i,
  /email/i,
  /phone/i,
  /mobile/i,
  /folio/i,
  /shareholder_id/i,
  /voter_id/i,
  /choice/i,
  /ballot/i,
  /vote_weight/i,
  /shares/i,
];

// Disallowed values matching PAN, email, or Indian phone numbers
const PAN_REGEX = /[A-Z]{5}[0-9]{4}[A-Z]{1}/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9]{10,13}$/;

function scrubParams(params?: EventParams): EventParams | undefined {
  if (!params) return undefined;

  const sanitized: EventParams = {};
  for (const [key, value] of Object.entries(params)) {
    // Drop keys matching sensitive patterns
    if (SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key))) {
      continue;
    }

    // Drop string values that look like sensitive data
    if (typeof value === "string") {
      if (PAN_REGEX.test(value) || EMAIL_REGEX.test(value) || PHONE_REGEX.test(value)) {
        continue;
      }
    }

    sanitized[key] = value;
  }

  return sanitized;
}

/**
 * Tracks a custom event in Google Analytics with automatic PII scrubbing
 */
export const trackEvent = (action: string, params?: EventParams) => {
  if (typeof window !== "undefined" && "gtag" in window && typeof window.gtag === "function") {
    const cleanParams = scrubParams(params);
    window.gtag("event", action, cleanParams);
  }
};

/**
 * Common event presets for the platform (sanitized navigation/conversion metrics)
 */
export const AnalyticsEvents = {
  // Conversion Events
  REGISTER_CLICK: "register_click",
  LOGIN_CLICK: "login_click",
  VOTE_SUBMITTED: "vote_submitted",
  AI_SUMMARY_REQUEST: "ai_summary_request",
  AI_CHAT_REQUEST: "ai_chat_request",

  // Navigation
  NAV_LINK_CLICK: "nav_link_click",
  FOOTER_LINK_CLICK: "footer_link_click",
};
