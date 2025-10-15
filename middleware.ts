import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createMiddlewareClient({ req: request, res: response })

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/onboarding',
    '/progress',
    '/cravings',
    '/journal',
    '/community',
    '/settings'
  ]

  // Auth routes that should redirect if already authenticated
  const authRoutes = ['/login', '/signup']

  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  const isAuthRoute = authRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Redirect to login if trying to access protected route without session
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect to dashboard if trying to access auth routes while authenticated
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Skip onboarding check for now to prevent redirect loops
  // We'll handle onboarding flow in the components instead
  // if (session && request.nextUrl.pathname === '/dashboard') {
  //   try {
  //     const { data: profile } = await supabase
  //       .from('profiles')
  //       .select('onboarding_completed')
  //       .eq('id', session.user.id)
  //       .single()

  //     if (profile && !profile.onboarding_completed) {
  //       return NextResponse.redirect(new URL('/onboarding', request.url))
  //     }
  //   } catch (error) {
  //     console.error('Error checking onboarding status:', error)
  //     // If we can't check onboarding status, let them through
  //   }
  // }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - sw.js (service worker)
     * - workbox-* (workbox files)
     * - icons/ (app icons)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-*|icons/).*)',
  ],
}