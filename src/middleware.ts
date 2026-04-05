import { NextResponse, type NextRequest } from 'next/server';

// Minimal middleware — session refresh is handled per-page via
// createClient() in server components. Auth redirects happen in
// each page's own getUser() check.
export function middleware(request: NextRequest) {
  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
