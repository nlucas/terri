import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Middleware: ensure every visitor has a Supabase session.
 *
 * If no session exists, we silently sign the user in anonymously so they
 * can use the entire app — browse curriculum, log bottles, view their
 * journal — without ever seeing a login screen.
 *
 * Anonymous users get a real `auth.users` row with `is_anonymous = true`
 * and a stable UUID. Later, the /login page can convert that anonymous
 * account into a real one (via updateUser({ email }) or linkIdentity)
 * which preserves the same UUID — so all of their bottles stay.
 *
 * IMPORTANT: requires Anonymous Sign-Ins to be enabled in your
 * Supabase project (Authentication → Providers → Anonymous Sign-Ins).
 */
export async function middleware(request: NextRequest) {
  // Default response — middleware will mutate cookies on this object.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write to BOTH the incoming request (so server components in
          // this same request see the new session) AND the outgoing
          // response (so the browser receives the cookies).
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Touch the session — refreshes if expired, no-op if valid.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If there's no user at all, create an anonymous session.
  // signInAnonymously() will trigger setAll() above, which propagates
  // cookies onto both request and response.
  if (!user) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      // Anonymous sign-in failed (e.g. provider not enabled in Supabase).
      // Don't block the request — let pages render their existing
      // unauthenticated fallbacks. Log so the issue is visible.
      console.error('[middleware] Anonymous sign-in failed:', error.message);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Skip static assets and the auth callback (which handles its own
    // session via exchangeCodeForSession).
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
