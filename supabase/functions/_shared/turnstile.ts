// Cloudflare Turnstile disabled across project
export interface TurnstileVerificationResult {
  success: boolean;
  error?: string;
  errorCodes?: string[];
  challengeTs?: string;
  hostname?: string;
}

export async function verifyTurnstileToken(
  _token?: string | undefined | null,
  _clientIp?: string | null
): Promise<TurnstileVerificationResult> {
  return { success: true };
}
