/**
 * Whether Supabase env vars are present. Used to show a setup screen
 * instead of crashing when `.env.local` hasn't been filled in yet
 * (see README.md for setup steps).
 */
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
