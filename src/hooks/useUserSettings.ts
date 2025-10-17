'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

export interface UserSettings {
  currency: 'INR' | 'USD'
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'hi'
  notifications: {
    daily_reminders: boolean
    milestone_alerts: boolean
    craving_support: boolean
    community_updates: boolean
    buddy_messages: boolean
  }
  privacy_level: 'public' | 'friends' | 'private'
}

const defaultSettings: UserSettings = {
  currency: 'INR',
  theme: 'light',
  language: 'en',
  notifications: {
    daily_reminders: true,
    milestone_alerts: true,
    craving_support: true,
    community_updates: true,
    buddy_messages: true
  },
  privacy_level: 'public'
}

export function useUserSettings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchSettings = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        // If no settings exist, create default ones
        if (error.code === 'PGRST116') {
          await createDefaultSettings()
          return
        }
        throw error
      }

      setSettings({
        currency: data.currency || 'INR',
        theme: data.theme || 'light',
        language: data.language || 'en',
        notifications: data.notifications || defaultSettings.notifications,
        privacy_level: data.privacy_level || 'public'
      })
    } catch (error: any) {
      setError(error.message)
      console.error('Error fetching user settings:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  const createDefaultSettings = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
          ...defaultSettings
        })

      if (error) throw error

      setSettings(defaultSettings)
    } catch (error: any) {
      setError(error.message)
      console.error('Error creating default settings:', error)
    }
  }

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user) throw new Error('No user logged in')

    try {
      setError(null)

      const { error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user.id)

      if (error) throw error

      setSettings(prev => ({ ...prev, ...updates }))
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return {
    settings,
    loading,
    error,
    updateSettings,
    refreshSettings: fetchSettings
  }
}