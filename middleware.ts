import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check for Supabase auth cookie (sb-*-auth-token)
  const hasAuthCookie = request.cookies.getAll().some(
    (c) => c.name.includes('-auth-token')
  )

  // Allow auth pages, API routes, and static assets through
  const { pathname } = request.nextUrl
  if (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Redirect to auth if no session cookie
  if (!hasAuthCookie) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
