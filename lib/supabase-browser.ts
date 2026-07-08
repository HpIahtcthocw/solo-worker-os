import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client for Client Components.
 * Uses the anon key + user session cookie.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
