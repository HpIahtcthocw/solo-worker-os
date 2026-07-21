import { createServerClient as createSSRClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createMockClient } from './mock-supabase';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * User-scoped Supabase client for Server Components and Route Handlers.
 * Reads the auth session from cookies — respects RLS automatically.
 * Use this for all user-initiated data operations.
 *
 * When DEMO_MODE=true, returns an in-memory mock client pre-seeded with demo data.
 */
export function createSupabaseServerClient() {
  if (process.env.DEMO_MODE === 'true') {
    return createMockClient();
  }
  const cookieStore = cookies();
  return createSSRClient(supabaseUrl, supabaseAnon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // setAll from a Server Component — cookies are read-only,
          // this is fine; the middleware refreshes them.
        }
      },
    },
  });
}

// ─── Re-export service client for the few places that still need it ──────────
export { createServiceClient } from './supabase-service';

/** @deprecated Use createSupabaseServerClient() instead. Kept for backwards compat during migration. */
export { createServiceClient as createServerClient } from './supabase-service';
