'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import type { User } from '@supabase/supabase-js'

export interface AuthUser extends User {
  profile?: {
    id: string
    username?: string
    full_name?: string
    avatar_url?: string
    quit_date?: string
    onboarding_completed: boolean
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionInitialized, setSessionInitialized] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            setUser({ ...session.user, profile: profile || undefined })
          } catch (profileError) {
            console.error('Error fetching profile:', profileError)
            setUser({ ...session.user, profile: undefined })
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error getting session:', error)
        setUser(null)
      } finally {
        setSessionInitialized(true)
        setLoading(false)
      }
    }

    loadSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)

        // Only handle SIGNED_IN during active sign-in process
        if (event === 'SIGNED_IN' && session?.user && isSigningIn) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            setUser({ ...session.user, profile: profile || undefined })
            setLoading(false)
            setIsSigningIn(false)

            // Redirect to dashboard after successful sign in
            router.push('/dashboard')
          } catch (profileError) {
            console.error('Error fetching profile after sign in:', profileError)
            setUser({ ...session.user, profile: undefined })
            setLoading(false)
            setIsSigningIn(false)
            router.push('/dashboard')
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setLoading(false)
          setIsSigningIn(false)
        }
        // Ignore other events including INITIAL_SESSION to prevent loops
      }
    )

    return () => subscription.unsubscribe()
  }, [router, isSigningIn])

  const signIn = async (email: string, password: string) => {
    setIsSigningIn(true)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setIsSigningIn(false)
        setLoading(false)
        throw error
      }

      return data
    } catch (error) {
      setIsSigningIn(false)
      setLoading(false)
      throw error
    }
  }

  const signUp = async (email: string, password: string, metadata?: { full_name?: string }) => {
    const isProduction = process.env.NODE_ENV === 'production'
    const baseUrl = isProduction
      ? process.env.NEXT_PUBLIC_SITE_URL || 'https://smokingcessation-3sacqmuoo-sahils-projects-3df0c739.vercel.app'
      : window.location.origin

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${baseUrl}/auth/callback`,
      },
    })

    if (error) throw error
    return data
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    setUser(null)
    router.push('/login')
  }

  const resetPassword = async (email: string) => {
    const isProduction = process.env.NODE_ENV === 'production'
    const baseUrl = isProduction
      ? process.env.NEXT_PUBLIC_SITE_URL || 'https://smokingcessation-3sacqmuoo-sahils-projects-3df0c739.vercel.app'
      : window.location.origin

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/auth/reset-password`,
    })

    if (error) throw error
    return data
  }

  const updatePassword = async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password,
    })

    if (error) throw error
    return data
  }

  const updateProfile = async (updates: {
    username?: string
    full_name?: string
    avatar_url?: string
  }) => {
    if (!user) throw new Error('No user logged in')

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error

    // Update local user state
    setUser(prev => prev ? { ...prev, profile: { ...prev.profile, ...data } } : null)

    return data
  }

  return {
    user,
    loading,
    sessionInitialized,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
  }
}