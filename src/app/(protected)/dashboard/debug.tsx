'use client'

import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function DebugDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [dbTest, setDbTest] = useState<any>(null)
  const [dbError, setDbError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const testDatabase = async () => {
      if (!user) return

      console.log('Testing database connection for user:', user.id)

      try {
        const supabase = createClient()

        // Test simple query
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        console.log('Database test result:', { data, error })

        if (error) {
          setDbError(error.message)
        } else {
          setDbTest(data)
        }
      } catch (err: any) {
        console.error('Database test error:', err)
        setDbError(err.message)
      }
    }

    if (user && mounted) {
      testDatabase()
    }
  }, [user, mounted])

  if (!mounted) {
    return <div>Mounting...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Debug Dashboard</h1>

      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-bold">Auth Status:</h3>
          <p>Loading: {authLoading ? 'Yes' : 'No'}</p>
          <p>User ID: {user?.id || 'None'}</p>
          <p>User Email: {user?.email || 'None'}</p>
          <p>Has Profile: {user?.profile ? 'Yes' : 'No'}</p>
          {user?.profile && (
            <div>
              <p>Profile ID: {user.profile.id}</p>
              <p>Onboarding Complete: {user.profile.onboarding_completed ? 'Yes' : 'No'}</p>
              <p>Quit Date: {user.profile.quit_date || 'Not Set'}</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-bold">Database Test:</h3>
          {dbError && <p className="text-red-600">Error: {dbError}</p>}
          {dbTest && (
            <div>
              <p>Profile Found: Yes</p>
              <p>Full Name: {dbTest.full_name || 'Not Set'}</p>
              <p>Onboarding: {dbTest.onboarding_completed ? 'Complete' : 'Incomplete'}</p>
              <p>Quit Date: {dbTest.quit_date || 'Not Set'}</p>
            </div>
          )}
          {!dbTest && !dbError && user && <p>Testing...</p>}
        </div>

        <div className="p-4 bg-blue-100 rounded">
          <h3 className="font-bold">Next Steps:</h3>
          {!user && <p>❌ User not authenticated</p>}
          {user && !user.profile && <p>❌ No profile loaded</p>}
          {user?.profile && !user.profile.onboarding_completed && (
            <p>➡️ Needs onboarding</p>
          )}
          {user?.profile?.onboarding_completed && !user.profile.quit_date && (
            <p>➡️ Needs quit date</p>
          )}
          {user?.profile?.quit_date && <p>✅ Ready for full dashboard</p>}
        </div>

        <div className="space-x-2">
          <button
            onClick={() => window.location.href = '/onboarding'}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Go to Onboarding
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  )
}