import { createBrowserClient } from '@supabase/ssr';
import { createMockClient } from './mock-supabase';

/**
 * Browser-side Supabase client for Client Components.
 * Uses the anon key + user session cookie.
 *
 * When NEXT_PUBLIC_DEMO_MODE=true, returns an in-memory mock client.
 */
export function createSupabaseBrowserClient() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return createMockClient();
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
