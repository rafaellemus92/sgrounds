import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Allow auth routes (login + callback) and API routes
  const isAuthRoute = req.nextUrl.pathname.startsWith('/auth')
  const isApiRoute = req.nextUrl.pathname.startsWith('/api')

  if (!session && !isAuthRoute && !isApiRoute) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  // Redirect authenticated users away from /auth (but not /auth/callback)
  if (session && req.nextUrl.pathname === '/auth') {
    return NextResponse.redirect(new URL('/thread', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-.*\\.png).*)'],
}
