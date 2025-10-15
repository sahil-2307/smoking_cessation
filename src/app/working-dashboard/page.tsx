'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Target, TrendingUp } from 'lucide-react'

export default function WorkingDashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState('Starting...')

  useEffect(() => {
    const loadWithTimeout = async () => {
      try {
        setStep('Creating Supabase client...')
        const supabase = createClient()

        setStep('Checking auth state via session...')
        // Use getSession instead of getUser - more reliable
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Session error:', sessionError)
          setStep(`Session error: ${sessionError.message}`)
          setLoading(false)
          return
        }

        if (!session?.user) {
          setStep('No session found - redirecting to login...')
          setTimeout(() => {
            window.location.href = '/login'
          }, 2000)
          return
        }

        const userId = session.user.id
        setStep(`Found user: ${session.user.email}`)

        setStep('Getting profile data...')
        // Add timeout to profile fetch
        const profilePromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
        )

        const { data: profileData, error: profileError } = await Promise.race([
          profilePromise,
          timeoutPromise
        ]) as any

        if (profileError) {
          console.error('Profile error:', profileError)
          if (profileError.code === 'PGRST116') {
            setStep('No profile found - need to complete onboarding')
            setLoading(false)
            return
          }
          setStep(`Profile error: ${profileError.message}`)
          setLoading(false)
          return
        }

        setStep('Profile loaded, calculating stats...')
        setProfile(profileData)

        if (profileData.quit_date) {
          const quitDate = new Date(profileData.quit_date)
          const now = new Date()
          const diffTime = Math.abs(now.getTime() - quitDate.getTime())
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
          const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

          const cigarettesPerDay = profileData.cigarettes_per_day || 0
          const costPerPack = profileData.cost_per_pack || 0
          const cigarettesPerPack = profileData.cigarettes_per_pack || 20
          const costPerCigarette = costPerPack / cigarettesPerPack
          const cigarettesAvoided = cigarettesPerDay * diffDays
          const moneySaved = cigarettesAvoided * costPerCigarette

          setStats({
            days: diffDays,
            hours: diffHours,
            cigarettesAvoided,
            moneySaved: moneySaved
          })
        }

        setStep('Dashboard ready!')
        setLoading(false)

      } catch (error: any) {
        console.error('Dashboard error:', error)
        setStep(`Error: ${error.message}`)
        setLoading(false)
      }
    }

    // Add overall timeout
    const timeoutId = setTimeout(() => {
      setStep('Overall timeout - something is hanging')
      setLoading(false)
    }, 15000)

    loadWithTimeout().finally(() => {
      clearTimeout(timeoutId)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-lg">{step}</p>
          <p className="text-sm text-gray-600">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="mb-4">{step}</p>
            <div className="space-y-2">
              <Button onClick={() => window.location.reload()} className="w-full">
                Retry
              </Button>
              <Button onClick={() => window.location.href = '/onboarding'} variant="outline" className="w-full">
                Complete Onboarding
              </Button>
              <Button onClick={() => window.location.href = '/login'} variant="outline" className="w-full">
                Login Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile.onboarding_completed) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Welcome! 🎉</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Complete your onboarding to start tracking your progress!</p>
            <Button onClick={() => window.location.href = '/onboarding'} className="w-full">
              Complete Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Quit Journey</h1>
        <p className="text-gray-600 mt-1">Welcome back, {profile.full_name}!</p>
      </div>

      {stats && profile.quit_date ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Smoke-Free</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.days} days</div>
              <p className="text-xs text-muted-foreground">{stats.hours} hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Money Saved</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.moneySaved.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.cigarettesAvoided} cigarettes avoided
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.days} days</div>
              <p className="text-xs text-muted-foreground">Keep going!</p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button onClick={() => window.location.href = '/working-progress'}>
                <Calendar className="mr-2 h-4 w-4" />
                Log Progress
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/journal'}>
                Journal
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/community'}>
                Community
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/settings'}>
                Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Set Your Quit Date</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Set your quit date to start tracking your progress!</p>
            <Button onClick={() => window.location.href = '/onboarding'} className="mt-4">
              Set Quit Date
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Debug info */}
      <Card className="mt-6 bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm">Debug Info</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-1">
          <p>Profile ID: {profile.id}</p>
          <p>Onboarding: {profile.onboarding_completed ? 'Complete' : 'Incomplete'}</p>
          <p>Quit Date: {profile.quit_date || 'Not set'}</p>
          <p>Last Step: {step}</p>
        </CardContent>
      </Card>
    </div>
  )
}