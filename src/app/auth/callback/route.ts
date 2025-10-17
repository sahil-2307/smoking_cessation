import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      await supabase.auth.exchangeCodeForSession(code)
    } catch (error) {
      console.error('Error exchanging code for session:', error)
      // Redirect to login with error
      return NextResponse.redirect(new URL('/login?error=auth_error', requestUrl.origin))
    }
  }

  // If this is a password recovery, redirect to reset password page
  if (type === 'recovery') {
    return NextResponse.redirect(new URL('/auth/reset-password', requestUrl.origin))
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}