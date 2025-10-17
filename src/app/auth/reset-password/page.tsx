'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { Eye, EyeOff, Lock, Check, X, ArrowLeft } from 'lucide-react'
import { validatePassword } from '@/lib/utils'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(3)

  const { updatePassword, user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const passwordValidation = validatePassword(password)

  // Check for error or success messages from the auth callback
  useEffect(() => {
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (error) {
      let errorMessage = 'Invalid or expired reset link'

      if (error === 'session_error') {
        errorMessage = 'There was an error establishing your session. Please try requesting a new password reset link.'
      } else if (error === 'invalid_link') {
        errorMessage = 'The password reset link is invalid or has expired. Please request a new one.'
      } else if (errorDescription) {
        errorMessage = errorDescription
      }

      setError(errorMessage)
    }
  }, [searchParams])

  // Check if user has a valid session for password reset (but don't immediately error)
  useEffect(() => {
    // Give some time for the session to load after redirect
    const timer = setTimeout(() => {
      if (!loading && !user) {
        setError('Session expired. Please request a new password reset link.')
      }
    }, 2000) // Wait 2 seconds for session to establish

    return () => clearTimeout(timer)
  }, [user, loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0])
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      await updatePassword(password)
      setSuccess(true)

      // Start countdown and auto-redirect
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            router.push('/login')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error: any) {
      setError(error.message || 'An error occurred while updating your password')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">Password Updated Successfully!</CardTitle>
            <CardDescription>
              Your password has been updated and you can now sign in
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Redirecting you to the login page in <strong>{countdown}</strong> seconds...
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => router.push('/login')}
                className="w-full"
              >
                Continue to Login Now
              </Button>
              <p className="text-xs text-gray-500">
                Or wait for automatic redirect
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-600">Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              {password && (
                <div className="space-y-1 text-xs">
                  {passwordValidation.errors.map((error, index) => (
                    <div key={index} className="flex items-center space-x-1">
                      <X className="w-3 h-3 text-red-500" />
                      <span className="text-red-600">{error}</span>
                    </div>
                  ))}
                  {passwordValidation.isValid && (
                    <div className="flex items-center space-x-1">
                      <Check className="w-3 h-3 text-green-500" />
                      <span className="text-green-600">Password meets requirements</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              {confirmPassword && password !== confirmPassword && (
                <div className="flex items-center space-x-1 text-xs">
                  <X className="w-3 h-3 text-red-500" />
                  <span className="text-red-600">Passwords do not match</span>
                </div>
              )}

              {confirmPassword && password === confirmPassword && (
                <div className="flex items-center space-x-1 text-xs">
                  <Check className="w-3 h-3 text-green-500" />
                  <span className="text-green-600">Passwords match</span>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !passwordValidation.isValid}>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating Password...</span>
                </div>
              ) : (
                'Update Password'
              )}
            </Button>
          </form>

          <div className="text-center">
            <Link href="/login" className="inline-flex items-center text-sm text-primary hover:underline">
              <ArrowLeft className="mr-1 h-3 w-3" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}