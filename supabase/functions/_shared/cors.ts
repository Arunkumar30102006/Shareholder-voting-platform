// Shared CORS and Origin Validation for Supabase Edge Functions

const ALLOWED_ORIGINS = [
  "https://www.shareholdervoting.in",
  "https://shareholdervoting.in",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:4173",
];

export function getCorsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get("origin") || "";
  const isAllowed =
    ALLOWED_ORIGINS.includes(origin) ||
    origin.includes("localhost") ||
    origin.includes("127.0.0.1") ||
    origin.endsWith(".vercel.app") ||
    origin.includes("shareholdervoting.in");
  const allowOrigin = isAllowed ? origin : "*";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE, PATCH",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-csrf-token, x-session-token",
    "Access-Control-Allow-Credentials": "true",
  };
}

export function validateOrigin(req: Request): boolean {
  if (req.method === "OPTIONS") return true;

  const origin = req.headers.get("origin");
  if (!origin) {
    const referer = req.headers.get("referer");
    if (!referer) return true;
    try {
      const refUrl = new URL(referer);
      return (
        refUrl.hostname.includes("localhost") ||
        refUrl.hostname.includes("127.0.0.1") ||
        refUrl.hostname.endsWith(".vercel.app") ||
        refUrl.hostname.includes("shareholdervoting.in") ||
        ALLOWED_ORIGINS.includes(refUrl.origin)
      );
    } catch {
      return true;
    }
  }

  if (
    origin.includes("localhost") ||
    origin.includes("127.0.0.1") ||
    origin.endsWith(".vercel.app") ||
    origin.includes("shareholdervoting.in")
  ) {
    return true;
  }

  return ALLOWED_ORIGINS.includes(origin);
}
