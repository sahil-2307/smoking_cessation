'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

export interface Achievement {
  id: string
  achievement_type: string
  earned_at: string
}

const ACHIEVEMENT_THRESHOLDS = {
  'first_day': 1,
  'nicotine_fighter': 3,
  'week_champion': 7,
  'two_weeks': 14,
  'month_master': 30,
  'three_months': 90,
  'half_year': 180,
  'year_hero': 365
}

const ACHIEVEMENT_DETAILS = {
  'first_day': {
    name: 'First Day Hero',
    description: '24 hours smoke-free!',
    icon: '🎉',
    color: 'text-green-500'
  },
  'nicotine_fighter': {
    name: 'Nicotine Fighter',
    description: '3 days - worst cravings behind you!',
    icon: '💪',
    color: 'text-blue-500'
  },
  'week_champion': {
    name: 'Week Champion',
    description: '1 week smoke-free milestone!',
    icon: '🏆',
    color: 'text-purple-500'
  },
  'two_weeks': {
    name: 'Two Week Warrior',
    description: '2 weeks of freedom!',
    icon: '⚔️',
    color: 'text-orange-500'
  },
  'month_master': {
    name: 'Month Master',
    description: '30 days of smoke-free living!',
    icon: '👑',
    color: 'text-yellow-500'
  },
  'three_months': {
    name: 'Quarter Champion',
    description: '3 months of healthy choices!',
    icon: '🌟',
    color: 'text-indigo-500'
  },
  'half_year': {
    name: 'Half Year Hero',
    description: '6 months smoke-free!',
    icon: '🎖️',
    color: 'text-pink-500'
  },
  'year_hero': {
    name: 'Year Hero',
    description: 'One full year of freedom!',
    icon: '🎆',
    color: 'text-red-500'
  }
}

export function useAchievements() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchAchievements = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false })

      if (error) throw error

      setAchievements(data || [])
    } catch (error: any) {
      setError(error.message)
      console.error('Error fetching achievements:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  const checkAndAwardAchievements = useCallback(async (daysSmokeFreee: number) => {
    if (!user || daysSmokeFreee < 1) return

    try {
      // Get existing achievements
      const { data: existingAchievements } = await supabase
        .from('achievements')
        .select('achievement_type')
        .eq('user_id', user.id)

      const existingTypes = new Set(existingAchievements?.map(a => a.achievement_type) || [])

      // Check which achievements should be awarded
      const newAchievements = []
      for (const [type, threshold] of Object.entries(ACHIEVEMENT_THRESHOLDS)) {
        if (daysSmokeFreee >= threshold && !existingTypes.has(type)) {
          newAchievements.push({
            user_id: user.id,
            achievement_type: type,
            earned_at: new Date().toISOString()
          })
        }
      }

      // Award new achievements
      if (newAchievements.length > 0) {
        const { error } = await supabase
          .from('achievements')
          .insert(newAchievements)

        if (error) throw error

        // Refresh achievements list
        await fetchAchievements()

        return newAchievements.length
      }

      return 0
    } catch (error: any) {
      console.error('Error checking achievements:', error)
      return 0
    }
  }, [user, fetchAchievements])

  const getAchievementDetails = (type: string) => {
    return ACHIEVEMENT_DETAILS[type as keyof typeof ACHIEVEMENT_DETAILS] || {
      name: type,
      description: 'Achievement unlocked!',
      icon: '🏅',
      color: 'text-gray-500'
    }
  }

  const getDisplayableAchievements = (daysSmokeFreee: number) => {
    const displayAchievements = []

    for (const [type, threshold] of Object.entries(ACHIEVEMENT_THRESHOLDS)) {
      if (daysSmokeFreee >= threshold) {
        const details = getAchievementDetails(type)
        const earned = achievements.find(a => a.achievement_type === type)

        displayAchievements.push({
          type,
          threshold,
          details,
          earned: !!earned,
          earnedAt: earned?.earned_at
        })
      }
    }

    return displayAchievements.sort((a, b) => b.threshold - a.threshold)
  }

  useEffect(() => {
    fetchAchievements()
  }, [fetchAchievements])

  return {
    achievements,
    loading,
    error,
    checkAndAwardAchievements,
    getAchievementDetails,
    getDisplayableAchievements,
    refreshAchievements: fetchAchievements
  }
}