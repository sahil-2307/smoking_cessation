'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { calculateQuitStats, getTimeSinceQuit } from '@/lib/utils'

export function useQuitProgress() {
  const { user } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
      try {
        setLoading(true)
        setError(null)

        // Get user profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError

        if (!profile.quit_date) {
          setStats(null)
          setLoading(false)
          return
        }

        // Calculate basic quit statistics
        console.log('Profile data for calculation:', {
          quit_date: profile.quit_date,
          cigarettes_per_day: profile.cigarettes_per_day,
          cost_per_pack: profile.cost_per_pack,
          cigarettes_per_pack: profile.cigarettes_per_pack
        })

        const quitStats = calculateQuitStats(
          profile.quit_date,
          profile.cigarettes_per_day || 0,
          profile.cost_per_pack || 0,
          profile.cigarettes_per_pack || 20
        )

        console.log('Calculated quit stats:', quitStats)

        // Get time since quit
        const timeSinceQuit = getTimeSinceQuit(profile.quit_date)

        // Get recent progress data for streak calculation
        const { data: progressData, error: progressError } = await supabase
          .from('quit_progress')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(30)

        if (progressError) throw progressError

        // Calculate current streak
        let currentStreak = 0
        if (progressData && progressData.length > 0) {
          // Sort by date descending and count consecutive smoke-free days
          const sortedData = progressData.sort((a, b) =>
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
          // If no progress data but quit date is today or past, assume current streak
          currentStreak = timeSinceQuit.days + 1
        }

        // Get total cravings and resisted cravings
        const { data: cravingsData, error: cravingsError } = await supabase
          .from('cravings')
          .select('resisted')
          .eq('user_id', user.id)

        if (cravingsError) throw cravingsError

        const totalCravings = cravingsData?.length || 0
        const resistedCravings = cravingsData?.filter(c => c.resisted).length || 0

        // Get achievements count
        const { data: achievementsData, error: achievementsError } = await supabase
          .from('achievements')
          .select('id')
          .eq('user_id', user.id)

        if (achievementsError) throw achievementsError

        const achievementCount = achievementsData?.length || 0

        setStats({
          ...quitStats,
          current_streak: currentStreak,
          total_cravings: totalCravings,
          resisted_cravings: resistedCravings,
          success_rate: totalCravings > 0 ? (resistedCravings / totalCravings) * 100 : 100,
          achievement_count: achievementCount,
          profile,
          timeSinceQuit
        })

      } catch (error: any) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
  }, [user])

  useEffect(() => {
    fetchStats()

    if (!user) return

    // Set up real-time updates
    const channel = supabase
      .channel('quit_progress_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'quit_progress', filter: `user_id=eq.${user.id}` },
        () => fetchStats()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'cravings', filter: `user_id=eq.${user.id}` },
        () => fetchStats()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'achievements', filter: `user_id=eq.${user.id}` },
        () => fetchStats()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchStats])

  const logProgress = async (data: {
    date: string
    is_smoke_free: boolean
    cigarettes_smoked?: number
    notes?: string
    mood?: string
  }) => {
    if (!user) throw new Error('No user logged in')

    console.log('logProgress: Starting to save data:', data)
    console.log('logProgress: User ID:', user.id)

    const dataToSave = {
      user_id: user.id,
      ...data
    }

    console.log('logProgress: Final data to upsert:', dataToSave)

    const { error } = await supabase
      .from('quit_progress')
      .upsert(dataToSave, {
        onConflict: 'user_id,date'
      })

    console.log('logProgress: Upsert completed, error:', error)

    if (error) {
      console.error('logProgress: Database error:', error)
      throw error
    }

    console.log('logProgress: Success!')
  }

  const getTodayProgress = async () => {
    if (!user) return null

    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('quit_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return data
  }

  return {
    stats,
    loading,
    error,
    logProgress,
    getTodayProgress
  }
}