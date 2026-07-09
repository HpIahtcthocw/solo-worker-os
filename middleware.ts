import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value } of cookiesToSet) {
              request.cookies.set(name, value);
            }
          } catch {}
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value);
          }
        },
      },
    },
  );

  // NOTE: auth.getUser() makes a network call to Supabase on EVERY request.
  // Commented out because auth redirects are disabled in demo mode.
  // Uncomment only when you need server-side session validation.
  //
  // const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

