'use client'

import { useAuth } from '@/hooks/useAuth'
import { LoadingPage } from '@/components/shared/LoadingSpinner'
import Navbar from '@/components/shared/Navbar'
import { AppDataProvider } from '@/contexts/AppDataContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <LoadingPage />
  }

  if (!user) {
    return null
  }

  return (
    <AppDataProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>{children}</main>
      </div>
    </AppDataProvider>
  )
}