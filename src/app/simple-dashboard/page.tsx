'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Target, TrendingUp, Heart, Award } from 'lucide-react'
import Link from 'next/link'

export default function SimpleDashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading dashboard data...')
        const supabase = createClient()

        // Get current user
        console.log('Getting user...')
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          setError('Not authenticated')
          setLoading(false)
          return
        }

        console.log('User found:', authUser.email)
        setUser(authUser)

        // Get profile
        console.log('Getting profile...')
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (profileError) {
          console.error('Profile error:', profileError)
          setError('Profile not found')
          setLoading(false)
          return
        }

        console.log('Profile found:', profileData)
        setProfile(profileData)

        if (profileData.quit_date) {
          // Calculate basic stats
          const quitDate = new Date(profileData.quit_date)
          const now = new Date()
          const diffTime = Math.abs(now.getTime() - quitDate.getTime())
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
          const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60))

          // Calculate money saved
          const cigarettesPerDay = profileData.cigarettes_per_day || 0
          const costPerPack = profileData.cost_per_pack || 0
          const cigarettesPerPack = profileData.cigarettes_per_pack || 20
          const costPerCigarette = costPerPack / cigarettesPerPack
          const cigarettesAvoided = cigarettesPerDay * diffDays
          const moneySaved = cigarettesAvoided * costPerCigarette

          setStats({
            days: diffDays,
            hours: diffHours,
            minutes: diffMinutes,
            cigarettesAvoided,
            moneySaved,
            currentStreak: diffDays
          })
        }

        console.log('Data loaded successfully')
        setLoading(false)

      } catch (err: any) {
        console.error('Error loading data:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading your quit journey...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="p-6 text-center">
            <p>Please log in to view your dashboard</p>
            <Button asChild className="mt-4">
              <Link href="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile?.onboarding_completed) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Welcome! 🎉</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Complete your onboarding to start tracking your progress!</p>
            <Button asChild className="w-full">
              <Link href="/onboarding">Complete Onboarding</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Quit Journey</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {profile?.full_name || user.email}!
          </p>
        </div>
        <Button asChild>
          <Link href="/cravings">
            <Heart className="mr-2 h-4 w-4" />
            SOS Help
          </Link>
        </Button>
      </div>

      {stats && profile?.quit_date ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Time Since Quit */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Smoke-Free</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.days} days</div>
              <p className="text-xs text-muted-foreground">
                {stats.hours} hours, {stats.minutes} minutes
              </p>
            </CardContent>
          </Card>

          {/* Current Streak */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.currentStreak} days</div>
              <p className="text-xs text-muted-foreground">Keep it going!</p>
            </CardContent>
          </Card>

          {/* Money Saved */}
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

          {/* Motivation */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.days}</div>
                    <div className="text-sm text-gray-600">Days Smoke-Free</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">${stats.moneySaved.toFixed(0)}</div>
                    <div className="text-sm text-gray-600">Money Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.cigarettesAvoided}</div>
                    <div className="text-sm text-gray-600">Cigarettes Not Smoked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">🏆</div>
                    <div className="text-sm text-gray-600">You're Doing Great!</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button asChild className="w-full" variant="outline">
                  <Link href="/simple-progress">
                    <Calendar className="mr-2 h-4 w-4" />
                    Log Today
                  </Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/journal">
                    View Journal
                  </Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/community">
                    Community
                  </Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/settings">
                    Settings
                  </Link>
                </Button>
              </div>
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
            <Button asChild className="mt-4">
              <Link href="/onboarding">Set Quit Date</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}