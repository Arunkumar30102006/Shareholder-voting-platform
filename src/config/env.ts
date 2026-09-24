export const env = {
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL as string,
    SUPABASE_ANON_KEY: (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string,
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL as string,
    VITE_SUPABASE_ANON_KEY: (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string,
    IS_DEV: import.meta.env.DEV,
    APP_URL: typeof window !== 'undefined' ? window.location.origin : 'https://www.shareholdervoting.in',
    TURNSTILE_SITE_KEY: (import.meta.env.VITE_TURNSTILE_SITE_KEY as string) || "1x00000000000000000000AA",
};

if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    console.error("Missing Supabase Environment Variables");
}
