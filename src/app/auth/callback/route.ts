import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')

  console.log('Auth callback - code:', !!code, 'type:', type, 'full URL:', requestUrl.toString())

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      console.log('Session exchange result:', { data: !!data.session, error })

      if (error) throw error

      // If this is a password recovery, redirect to reset password page after session exchange
      if (type === 'recovery') {
        console.log('Password recovery detected - redirecting to reset password page')
        return NextResponse.redirect(new URL('/auth/reset-password', requestUrl.origin))
      }

    } catch (error) {
      console.error('Error exchanging code for session:', error)

      // If it's a password recovery that failed, still redirect to reset page with error
      if (type === 'recovery') {
        console.log('Password recovery session exchange failed - redirecting to reset page with error')
        return NextResponse.redirect(new URL('/auth/reset-password?error=session_error', requestUrl.origin))
      }

      // For other auth errors, redirect to login
      return NextResponse.redirect(new URL('/login?error=auth_error', requestUrl.origin))
    }
  }

  // If no code but type is recovery, handle expired/invalid links
  if (type === 'recovery') {
    console.log('Password recovery without code - redirecting to reset page with error')
    return NextResponse.redirect(new URL('/auth/reset-password?error=invalid_link', requestUrl.origin))
  }

  // URL to redirect to after sign in process completes
  console.log('Redirecting to dashboard')
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}