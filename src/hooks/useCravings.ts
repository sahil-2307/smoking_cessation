'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

interface Craving {
  id: string
  user_id: string
  intensity: number
  trigger: string | null
  coping_strategy: string | null
  resisted: boolean
  notes: string | null
  created_at: string
}

interface CravingStats {
  totalCravings: number
  resistedCravings: number
  successRate: number
  averageIntensity: number
  topTrigger: string | null
  recentCravings: Craving[]
}

export function useCravings() {
  const { user } = useAuth()
  const supabase = createClient()
  const [cravings, setCravings] = useState<Craving[]>([])
  const [stats, setStats] = useState<CravingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchCravings = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all cravings for the user
        const { data: cravingsData, error: cravingsError } = await supabase
          .from('cravings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (cravingsError) throw cravingsError

        setCravings(cravingsData || [])

        // Calculate stats
        if (cravingsData && cravingsData.length > 0) {
          const totalCravings = cravingsData.length
          const resistedCravings = cravingsData.filter(c => c.resisted).length
          const successRate = (resistedCravings / totalCravings) * 100

          const averageIntensity = cravingsData.reduce((sum, c) => sum + c.intensity, 0) / totalCravings

          // Find most common trigger
          const triggerCounts: { [key: string]: number } = {}
          cravingsData.forEach(c => {
            if (c.trigger) {
              triggerCounts[c.trigger] = (triggerCounts[c.trigger] || 0) + 1
            }
          })

          const topTrigger = Object.keys(triggerCounts).length > 0
            ? Object.keys(triggerCounts).reduce((a, b) => triggerCounts[a] > triggerCounts[b] ? a : b)
            : null

          const recentCravings = cravingsData.slice(0, 10) // Last 10 cravings

          setStats({
            totalCravings,
            resistedCravings,
            successRate,
            averageIntensity,
            topTrigger,
            recentCravings
          })
        } else {
          setStats({
            totalCravings: 0,
            resistedCravings: 0,
            successRate: 100,
            averageIntensity: 0,
            topTrigger: null,
            recentCravings: []
          })
        }

      } catch (error: any) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCravings()

    // Set up real-time subscription
    const channel = supabase
      .channel('cravings_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'cravings', filter: `user_id=eq.${user.id}` },
        () => {
          fetchCravings()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  const logCraving = async (cravingData: {
    intensity: number
    trigger?: string
    coping_strategy?: string
    resisted: boolean
    notes?: string
  }) => {
    if (!user) throw new Error('No user logged in')

    const { data, error } = await supabase
      .from('cravings')
      .insert({
        user_id: user.id,
        ...cravingData
      })
      .select()
      .single()

    if (error) throw error

    return data
  }

  const updateCraving = async (id: string, updates: Partial<Craving>) => {
    if (!user) throw new Error('No user logged in')

    const { data, error } = await supabase
      .from('cravings')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return data
  }

  const deleteCraving = async (id: string) => {
    if (!user) throw new Error('No user logged in')

    const { error } = await supabase
      .from('cravings')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
  }

  const getCravingsByDateRange = async (startDate: string, endDate: string) => {
    if (!user) throw new Error('No user logged in')

    const { data, error } = await supabase
      .from('cravings')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data || []
  }

  const getTriggerStats = () => {
    if (!cravings.length) return []

    const triggerCounts: { [key: string]: { total: number; resisted: number } } = {}

    cravings.forEach(craving => {
      if (craving.trigger) {
        if (!triggerCounts[craving.trigger]) {
          triggerCounts[craving.trigger] = { total: 0, resisted: 0 }
        }
        triggerCounts[craving.trigger].total++
        if (craving.resisted) {
          triggerCounts[craving.trigger].resisted++
        }
      }
    })

    return Object.entries(triggerCounts)
      .map(([trigger, counts]) => ({
        trigger,
        total: counts.total,
        resisted: counts.resisted,
        successRate: (counts.resisted / counts.total) * 100
      }))
      .sort((a, b) => b.total - a.total)
  }

  return {
    cravings,
    stats,
    loading,
    error,
    logCraving,
    updateCraving,
    deleteCraving,
    getCravingsByDateRange,
    getTriggerStats
  }
}