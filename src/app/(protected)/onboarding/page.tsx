'use client'

import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, User, Target, DollarSign } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    quit_date: '',
    cigarettes_per_day: '',
    cost_per_pack: '',
    cigarettes_per_pack: '20',
    motivation: '',
    previous_attempts: '',
    support_system: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!user) return

    setIsSubmitting(true)
    try {
      console.log('Starting onboarding submission...')
      const supabase = createClient()

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database request timeout after 10 seconds')), 10000)
      )

      // Only include fields that exist in the database schema
      const profileData = {
        id: user.id,
        full_name: formData.full_name,
        quit_date: formData.quit_date ? new Date(formData.quit_date).toISOString() : null,
        cigarettes_per_day: parseInt(formData.cigarettes_per_day) || null,
        cost_per_pack: parseFloat(formData.cost_per_pack) || null,
        cigarettes_per_pack: parseInt(formData.cigarettes_per_pack) || 20,
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      }

      console.log('Profile data to save:', profileData)

      // Update or create profile with timeout
      const upsertPromise = supabase
        .from('profiles')
        .upsert(profileData as any)

      const result = await Promise.race([upsertPromise, timeoutPromise]) as any

      console.log('Database result:', result)

      if (result && result.error) {
        throw result.error
      }

      console.log('Profile saved successfully!')
      alert('Profile setup complete! Welcome to your quit journey! 🎉')

      // Small delay to ensure the success message is visible
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1500)

    } catch (error: any) {
      console.error('Onboarding error:', error)
      alert('Error saving profile: ' + error.message)

      // Even if there's an error, let them continue (maybe database issue)
      if (confirm('There was an error saving to the database. Continue to dashboard anyway?')) {
        window.location.href = '/dashboard'
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Please log in</div>
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to QuitSmoking!</h1>
        <p className="text-gray-600 mt-1">Let's set up your profile to start your journey</p>

        {/* Progress indicator */}
        <div className="mt-6">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-1 ${
                    step < currentStep ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Step {currentStep} of 4
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {currentStep === 1 && <><User className="mr-2 h-5 w-5" />Personal Info</>}
            {currentStep === 2 && <><Calendar className="mr-2 h-5 w-5" />Quit Details</>}
            {currentStep === 3 && <><DollarSign className="mr-2 h-5 w-5" />Smoking Habits</>}
            {currentStep === 4 && <><Target className="mr-2 h-5 w-5" />Motivation & Support</>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="quit_date">Your Quit Date</Label>
                <Input
                  id="quit_date"
                  type="date"
                  max={today}
                  value={formData.quit_date}
                  onChange={(e) => handleInputChange('quit_date', e.target.value)}
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  When did you quit or when will you quit smoking?
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Smoking Habits */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="cigarettes_per_day">Cigarettes per Day (before quitting)</Label>
                <Input
                  id="cigarettes_per_day"
                  type="number"
                  min="0"
                  value={formData.cigarettes_per_day}
                  onChange={(e) => handleInputChange('cigarettes_per_day', e.target.value)}
                  placeholder="e.g., 20"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cost_per_pack">Cost per Pack ($)</Label>
                <Input
                  id="cost_per_pack"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cost_per_pack}
                  onChange={(e) => handleInputChange('cost_per_pack', e.target.value)}
                  placeholder="e.g., 12.50"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cigarettes_per_pack">Cigarettes per Pack</Label>
                <Select
                  value={formData.cigarettes_per_pack}
                  onValueChange={(value) => handleInputChange('cigarettes_per_pack', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 3: Previous Attempts */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="previous_attempts">Previous Quit Attempts</Label>
                <Select
                  value={formData.previous_attempts}
                  onValueChange={(value) => handleInputChange('previous_attempts', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of previous attempts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">This is my first attempt</SelectItem>
                    <SelectItem value="1">1 time before</SelectItem>
                    <SelectItem value="2">2 times before</SelectItem>
                    <SelectItem value="3">3 times before</SelectItem>
                    <SelectItem value="4">4+ times before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="support_system">Support System</Label>
                <Select
                  value={formData.support_system}
                  onValueChange={(value) => handleInputChange('support_system', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Who's supporting you?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="friends">Friends</SelectItem>
                    <SelectItem value="family_friends">Family & Friends</SelectItem>
                    <SelectItem value="spouse_partner">Spouse/Partner</SelectItem>
                    <SelectItem value="support_group">Support Group</SelectItem>
                    <SelectItem value="going_solo">Going Solo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 4: Motivation */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="motivation">What motivates you to quit?</Label>
                <Textarea
                  id="motivation"
                  value={formData.motivation}
                  onChange={(e) => handleInputChange('motivation', e.target.value)}
                  placeholder="e.g., Better health, save money, be a good role model for my kids..."
                  rows={4}
                />
                <p className="text-sm text-gray-600 mt-1">
                  We'll remind you of this when things get tough!
                </p>
              </div>

              {/* Debug info */}
              <div className="p-3 bg-gray-50 rounded text-xs">
                <p><strong>Debug - Form Data:</strong></p>
                <p>Name: {formData.full_name || 'Not set'}</p>
                <p>Quit Date: {formData.quit_date || 'Not set'}</p>
                <p>Cigarettes/Day: {formData.cigarettes_per_day || 'Not set'}</p>
                <p>Cost/Pack: {formData.cost_per_pack || 'Not set'}</p>
                <p>User ID: {user?.id || 'Not set'}</p>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && (!formData.full_name || !formData.quit_date)) ||
                  (currentStep === 2 && (!formData.cigarettes_per_day || !formData.cost_per_pack))
                }
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={() => {
                  console.log('Complete Setup button clicked!')
                  handleSubmit()
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Completing Setup...' : 'Complete Setup 🎉'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}