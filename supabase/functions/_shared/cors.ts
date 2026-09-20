// Shared CORS and Origin Validation for Supabase Edge Functions

const ALLOWED_ORIGINS = [
  "https://www.shareholdervoting.in",
  "https://shareholdervoting.in",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
];

export function getCorsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get("origin") || "";
  const isAllowed = ALLOWED_ORIGINS.includes(origin);
  const allowOrigin = isAllowed ? origin : "https://www.shareholdervoting.in";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-csrf-token",
    "Access-Control-Allow-Credentials": "true",
  };
}

export function validateOrigin(req: Request): boolean {
  // Disallow requests from unexpected origins on state-changing methods
  if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
    const origin = req.headers.get("origin");
    if (!origin) {
      // In strict web environments, state-changing requests must have an origin
      const referer = req.headers.get("referer");
      if (!referer) return false;
      try {
        const refUrl = new URL(referer);
        return ALLOWED_ORIGINS.includes(refUrl.origin);
      } catch {
        return false;
      }
    }
    return ALLOWED_ORIGINS.includes(origin);
  }
  return true;
}
