'use client'

import { useEffect, useState } from 'react'

export default function DebugTestPage() {
  const [step, setStep] = useState('Starting...')
  const [error, setError] = useState<string | null>(null)
  const [supabaseTest, setSupabaseTest] = useState<any>(null)

  useEffect(() => {
    const runTests = async () => {
      try {
        setStep('1. Testing basic component mount...')
        await new Promise(resolve => setTimeout(resolve, 100))

        setStep('2. Testing Supabase import...')
        const { createClient } = await import('@/lib/supabase/client')

        setStep('3. Creating Supabase client...')
        const supabase = createClient()
        setSupabaseTest({ created: true })

        setStep('4. Testing environment variables...')
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        setSupabaseTest((prev: any) => ({
          ...prev,
          hasUrl: !!url,
          hasKey: !!key,
          urlValue: url ? `${url.substring(0, 30)}...` : 'Missing',
          keyValue: key ? `${key.substring(0, 30)}...` : 'Missing'
        }))

        setStep('5. Testing basic auth call...')

        // Add timeout to catch hanging calls
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth call timeout after 5 seconds')), 5000)
        )

        const authPromise = supabase.auth.getSession()

        const result = await Promise.race([authPromise, timeoutPromise]) as any

        setStep('6. Auth call completed!')
        setSupabaseTest((prev: any) => ({
          ...prev,
          authCallSuccess: true,
          hasSession: !!result?.data?.session,
          userId: result?.data?.session?.user?.id || 'No user'
        }))

        if (result?.data?.session) {
          setStep('7. Testing profile query...')

          const profilePromise = supabase
            .from('profiles')
            .select('*')
            .eq('id', result.data.session.user.id)
            .single()

          const profileTimeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Profile query timeout after 5 seconds')), 5000)
          )

          const profileResult = await Promise.race([profilePromise, profileTimeoutPromise]) as any

          setStep('8. Profile query completed!')
          setSupabaseTest((prev: any) => ({
            ...prev,
            profileQuerySuccess: true,
            hasProfile: !!profileResult?.data,
            profileData: profileResult?.data ? 'Found' : 'Not found',
            onboardingComplete: profileResult?.data?.onboarding_completed || false
          }))
        }

      } catch (err: any) {
        setError(err.message)
        setStep(`Error at step: ${err.message}`)
      }
    }

    runTests()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Debug Test Page (No Middleware)</h1>

      <div className="space-y-4">
        <div className="p-4 bg-blue-100 rounded">
          <h3 className="font-bold">Current Step:</h3>
          <p className="text-lg">{step}</p>
          <p className="text-sm text-gray-600">Time: {new Date().toLocaleTimeString()}</p>
        </div>

        {error && (
          <div className="p-4 bg-red-100 rounded">
            <h3 className="font-bold text-red-800">Error:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {supabaseTest && (
          <div className="p-4 bg-green-100 rounded">
            <h3 className="font-bold">Supabase Test Results:</h3>
            <p>Client Created: {supabaseTest.created ? '✅' : '❌'}</p>
            <p>Has URL: {supabaseTest.hasUrl ? '✅' : '❌'} ({supabaseTest.urlValue})</p>
            <p>Has Key: {supabaseTest.hasKey ? '✅' : '❌'} ({supabaseTest.keyValue})</p>
            <p>Auth Call: {supabaseTest.authCallSuccess ? '✅' : '⏳'}</p>
            <p>Has Session: {supabaseTest.hasSession ? '✅' : '❌'}</p>
            <p>User ID: {supabaseTest.userId}</p>
            {supabaseTest.profileQuerySuccess && (
              <>
                <p>Profile Query: {supabaseTest.profileQuerySuccess ? '✅' : '❌'}</p>
                <p>Has Profile: {supabaseTest.hasProfile ? '✅' : '❌'}</p>
                <p>Profile Data: {supabaseTest.profileData}</p>
                <p>Onboarding Complete: {supabaseTest.onboardingComplete ? '✅' : '❌'}</p>
              </>
            )}
          </div>
        )}

        <div className="p-4 bg-yellow-100 rounded">
          <h3 className="font-bold">About This Test:</h3>
          <p>This page bypasses middleware to test Supabase connection directly.</p>
          <p>If this works but /dashboard doesn't, the issue is in the middleware.</p>
        </div>

        <div className="space-x-2">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Test
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Try Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}