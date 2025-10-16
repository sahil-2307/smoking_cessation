'use client'

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { calculateQuitStats, getTimeSinceQuit } from '@/lib/utils'

interface AppDataContextType {
  quitStats: any
  loading: boolean
  error: string | null
  refreshData: () => void
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined)

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const [quitStats, setQuitStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  const fetchAllData = async () => {
    if (!user || authLoading) {
      console.log('AppDataContext: Skipping fetch - no user or auth loading')
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log('AppDataContext: Starting data fetch for user:', user.id)

      // Add timeout protection
      const fetchTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Data fetch timeout after 10 seconds')), 10000)
      )

      // Use the profile data from useAuth instead of fetching again
      const profile = user.profile
      if (!profile) {
        console.log('AppDataContext: No profile found')
        setQuitStats(null)
        setInitialized(true)
        setLoading(false)
        return
      }

      if (!profile.quit_date) {
        console.log('AppDataContext: No quit date set')
        setQuitStats(null)
        setInitialized(true)
        setLoading(false)
        return
      }

      console.log('AppDataContext: Fetching quit progress, cravings, and achievements')

      // Fetch all related data in parallel with timeout protection
      const dataFetchPromise = Promise.all([
        supabase
          .from('quit_progress')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(30),

        supabase
          .from('cravings')
          .select('resisted')
          .eq('user_id', user.id),

        supabase
          .from('achievements')
          .select('id')
          .eq('user_id', user.id)
      ])

      const [progressResult, cravingsResult, achievementsResult] = await Promise.race([dataFetchPromise, fetchTimeout]) as any

      // Calculate basic quit statistics
      const quitStatsData = calculateQuitStats(
        profile.quit_date,
        (profile as any).cigarettes_per_day || 0,
        (profile as any).cost_per_pack || 0,
        (profile as any).cigarettes_per_pack || 20
      )

      // Get time since quit
      const timeSinceQuit = getTimeSinceQuit(profile.quit_date)

      // Calculate current streak
      let currentStreak = 0
      const progressData = progressResult.data
      if (progressData && progressData.length > 0) {
        const sortedData = progressData.sort((a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )

        for (const day of sortedData) {
          if (day.is_smoke_free) {
            currentStreak++
          } else {
            break
          }
        }
      } else if (timeSinceQuit.days >= 0) {
        currentStreak = timeSinceQuit.days + 1
      }

      // Process cravings data
      const totalCravings = cravingsResult.data?.length || 0
      const resistedCravings = cravingsResult.data?.filter((c: any) => c.resisted).length || 0

      // Process achievements
      const achievementCount = achievementsResult.data?.length || 0

      const finalStats = {
        ...quitStatsData,
        current_streak: currentStreak,
        total_cravings: totalCravings,
        resisted_cravings: resistedCravings,
        success_rate: totalCravings > 0 ? (resistedCravings / totalCravings) * 100 : 100,
        achievement_count: achievementCount,
        profile,
        timeSinceQuit
      }

      console.log('AppDataContext: Data fetch completed successfully')
      setQuitStats(finalStats)
      setInitialized(true)

    } catch (error: any) {
      console.error('AppDataContext: Error fetching data:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Reset initialization when user changes (including on auth state changes)
  useEffect(() => {
    console.log('AppDataContext: User effect triggered', { user: !!user, authLoading, initialized })
    setInitialized(false)
    setQuitStats(null)
    setError(null)
  }, [user?.id]) // Only reset when user ID changes

  useEffect(() => {
    console.log('AppDataContext: Auth effect triggered', { authLoading, user: !!user, initialized })

    if (!authLoading) {
      if (!user) {
        // User is not logged in, reset everything
        console.log('AppDataContext: No user, resetting state')
        setQuitStats(null)
        setLoading(false)
        setInitialized(true)
        setError(null)
      } else if (!initialized) {
        // User is logged in and we haven't initialized yet
        console.log('AppDataContext: User available, fetching data...')
        fetchAllData()
      } else {
        // User is available and already initialized
        setLoading(false)
      }
    }
  }, [user, authLoading, initialized])

  const refreshData = () => {
    setInitialized(false)
    fetchAllData()
  }

  const value = {
    quitStats,
    loading: authLoading || loading,
    error,
    refreshData
  }

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  )
}

export function useAppData() {
  const context = useContext(AppDataContext)
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider')
  }
  return context
}