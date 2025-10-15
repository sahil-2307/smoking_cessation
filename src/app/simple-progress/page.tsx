'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, CheckCircle, XCircle } from 'lucide-react'

export default function SimpleProgressPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    is_smoke_free: true,
    cigarettes_smoked: 0,
    notes: '',
    mood: ''
  })

  useEffect(() => {
    const loadUser = async () => {
      try {
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()
        setUser(authUser)
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]

      console.log('Saving progress for date:', today)
      console.log('Form data:', formData)

      // Validate mood value against database constraint
      const validMoods = ['excellent', 'good', 'okay', 'difficult', 'terrible']
      const moodToSave = formData.mood && validMoods.includes(formData.mood) ? formData.mood : null

      console.log('Saving progress with mood:', moodToSave)
      console.log('Form mood value was:', formData.mood)

      const { data, error } = await supabase
        .from('quit_progress')
        .upsert({
          user_id: user.id,
          date: today,
          is_smoke_free: formData.is_smoke_free,
          cigarettes_smoked: formData.is_smoke_free ? 0 : formData.cigarettes_smoked,
          notes: formData.notes,
          mood: moodToSave
        }, {
          onConflict: 'user_id,date'
        })
        .select()

      if (error) throw error

      console.log('Progress saved:', data)
      alert('Progress logged successfully! 🎉')

      // Reset form
      setFormData({
        is_smoke_free: true,
        cigarettes_smoked: 0,
        notes: '',
        mood: ''
      })

    } catch (error: any) {
      console.error('Progress logging error:', error)
      alert('Error logging progress: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Please log in</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Daily Progress</h1>
        <p className="text-gray-600 mt-1">Log how you're doing today</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Progress - {new Date().toLocaleDateString()}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Smoke-free status */}
            <div className="space-y-3">
              <Label className="text-base font-medium">How did you do today?</Label>
              <div className="grid gap-3 md:grid-cols-2">
                <Button
                  type="button"
                  variant={formData.is_smoke_free ? "default" : "outline"}
                  className="h-16 flex items-center justify-center space-x-2"
                  onClick={() => setFormData(prev => ({ ...prev, is_smoke_free: true, cigarettes_smoked: 0 }))}
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Smoke-Free Day! 🎉</span>
                </Button>
                <Button
                  type="button"
                  variant={!formData.is_smoke_free ? "destructive" : "outline"}
                  className="h-16 flex items-center justify-center space-x-2"
                  onClick={() => setFormData(prev => ({ ...prev, is_smoke_free: false }))}
                >
                  <XCircle className="h-5 w-5" />
                  <span>I smoked today</span>
                </Button>
              </div>
            </div>

            {/* Cigarettes smoked (if not smoke-free) */}
            {!formData.is_smoke_free && (
              <div className="space-y-2">
                <Label htmlFor="cigarettes">How many cigarettes?</Label>
                <Input
                  id="cigarettes"
                  type="number"
                  min="0"
                  value={formData.cigarettes_smoked}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    cigarettes_smoked: parseInt(e.target.value) || 0
                  }))}
                  placeholder="Number of cigarettes"
                />
              </div>
            )}

            {/* Mood */}
            <div className="space-y-2">
              <Label htmlFor="mood">How are you feeling?</Label>
              <Select
                value={formData.mood}
                onValueChange={(value) => setFormData(prev => ({ ...prev, mood: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent! 😄</SelectItem>
                  <SelectItem value="good">Good 😊</SelectItem>
                  <SelectItem value="okay">Okay 😐</SelectItem>
                  <SelectItem value="difficult">Difficult 😔</SelectItem>
                  <SelectItem value="terrible">Very Difficult 😰</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="How was your day? Any challenges or victories?"
                rows={3}
              />
            </div>

            {/* Submit button */}
            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging Progress...' : 'Log Today\'s Progress'}
              </Button>

              <div className="text-center">
                <Button variant="outline" asChild>
                  <a href="/simple-dashboard">Back to Dashboard</a>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Motivational message */}
      <Card className="mt-6 bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="font-semibold text-green-800 mb-2">
              {formData.is_smoke_free ? "Keep up the great work! 🌟" : "Tomorrow is a new day! 💪"}
            </h3>
            <p className="text-green-700 text-sm">
              {formData.is_smoke_free
                ? "Every smoke-free day is a victory. You're building healthier habits!"
                : "Don't be discouraged. Each attempt brings you closer to your goal."
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}