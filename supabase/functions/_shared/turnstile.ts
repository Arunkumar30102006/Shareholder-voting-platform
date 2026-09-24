// Shared Cloudflare Turnstile Server-Side Verification Helper

export interface TurnstileVerificationResult {
  success: boolean;
  error?: string;
  errorCodes?: string[];
  challengeTs?: string;
  hostname?: string;
}

const CLOUDFLARE_SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Official Cloudflare test secret key (always passes) used only as fallback in dev when secret is not configured
const CLOUDFLARE_TEST_SECRET = "1x0000000000000000000000000000000AA";

/**
 * Verifies a Cloudflare Turnstile token server-side via Cloudflare's Siteverify API.
 * Never trusts client assertions; strictly queries Cloudflare.
 * 
 * @param token The Turnstile response token provided by the client
 * @param clientIp Optional client IP address
 */
export async function verifyTurnstileToken(
  token: string | undefined | null,
  clientIp?: string | null
): Promise<TurnstileVerificationResult> {
  if (!token || typeof token !== "string" || !token.trim()) {
    return {
      success: false,
      error: "Missing Turnstile challenge token. Bot verification is required.",
      errorCodes: ["missing-input-response"],
    };
  }

  const secretKey = Deno.env.get("TURNSTILE_SECRET_KEY") || CLOUDFLARE_TEST_SECRET;

  try {
    const formData = new FormData();
    formData.append("secret", secretKey);
    formData.append("response", token.trim());
    if (clientIp) {
      formData.append("remoteip", clientIp);
    }

    const response = await fetch(CLOUDFLARE_SITEVERIFY_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error(`Cloudflare siteverify HTTP error: ${response.status} ${response.statusText}`);
      return {
        success: false,
        error: "Verification service temporarily unavailable. Please retry.",
        errorCodes: ["service-unavailable"],
      };
    }

    const data = await response.json();

    if (data.success === true) {
      return {
        success: true,
        challengeTs: data.challenge_ts,
        hostname: data.hostname,
      };
    }

    console.warn("Cloudflare Turnstile verification rejected:", data["error-codes"]);
    return {
      success: false,
      error: "Bot protection verification failed. Please try again.",
      errorCodes: data["error-codes"] || ["invalid-token"],
    };
  } catch (err: unknown) {
    console.error("Turnstile verification exception:", err);
    return {
      success: false,
      error: "Verification request failed. Please check network and retry.",
      errorCodes: ["internal-error"],
    };
  }
}
