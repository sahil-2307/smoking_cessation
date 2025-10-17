'use client'

import { useAuth } from '@/hooks/useAuth'
import { LoadingPage } from '@/components/shared/LoadingSpinner'
import Navbar from '@/components/shared/Navbar'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, sessionInitialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (sessionInitialized && !user) {
      router.push('/login')
    }
  }, [user, sessionInitialized, router])

  if (!sessionInitialized || loading) {
    return <LoadingPage />
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
    </div>
  )
}