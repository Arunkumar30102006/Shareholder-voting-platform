export const env = {
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY: (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY),
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY),
    IS_DEV: import.meta.env.DEV,
    APP_URL: typeof window !== 'undefined' ? window.location.origin : 'https://www.shareholdervoting.in',
};
if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    console.error("Missing Supabase Environment Variables");
}
