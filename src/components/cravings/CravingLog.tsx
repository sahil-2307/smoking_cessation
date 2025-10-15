'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCravings } from '@/hooks/useCravings'
import { CRAVING_TRIGGERS } from '@/lib/constants'
import { PlusCircle, Save, Star, CheckCircle, XCircle } from 'lucide-react'

interface CravingLogProps {
  onCravingLogged?: (craving: any) => void
}

export default function CravingLog({ onCravingLogged }: CravingLogProps) {
  const [isLogging, setIsLogging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { logCraving } = useCravings()

  const [formData, setFormData] = useState({
    intensity: 5,
    trigger: '',
    coping_strategy: '',
    resisted: true,
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const craving = await logCraving({
        intensity: formData.intensity,
        trigger: formData.trigger || undefined,
        coping_strategy: formData.coping_strategy || undefined,
        resisted: formData.resisted,
        notes: formData.notes || undefined
      })

      // Reset form
      setFormData({
        intensity: 5,
        trigger: '',
        coping_strategy: '',
        resisted: true,
        notes: ''
      })
      setIsLogging(false)

      if (onCravingLogged) {
        onCravingLogged(craving)
      }

    } catch (error: any) {
      setError(error.message || 'Failed to log craving')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setIsLogging(false)
    setFormData({
      intensity: 5,
      trigger: '',
      coping_strategy: '',
      resisted: true,
      notes: ''
    })
    setError(null)
  }

  const intensityColors = [
    'text-green-600',   // 1-2
    'text-green-600',
    'text-yellow-600',  // 3-4
    'text-yellow-600',
    'text-orange-600',  // 5-6
    'text-orange-600',
    'text-red-600',     // 7-8
    'text-red-600',
    'text-red-800',     // 9-10
    'text-red-800'
  ]

  if (!isLogging) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-green-600" />
            <span>Log a Craving</span>
          </CardTitle>
          <CardDescription>
            Track your cravings to understand patterns and celebrate victories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsLogging(true)} className="w-full">
            <PlusCircle className="w-4 h-4 mr-2" />
            Log New Craving
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PlusCircle className="w-5 h-5 text-green-600" />
          <span>Log a Craving</span>
        </CardTitle>
        <CardDescription>
          Be honest about your experience - every data point helps
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Craving Intensity */}
          <div>
            <Label htmlFor="intensity">
              Craving Intensity (1 = mild, 10 = overwhelming)
            </Label>
            <div className="flex items-center space-x-4 mt-2">
              <Input
                id="intensity"
                type="range"
                min="1"
                max="10"
                value={formData.intensity}
                onChange={(e) => setFormData(prev => ({ ...prev, intensity: parseInt(e.target.value) }))}
                className="flex-1"
              />
              <div className={`flex items-center space-x-1 min-w-[60px] ${intensityColors[formData.intensity - 1]}`}>
                <Star className="w-4 h-4" />
                <span className="font-bold text-lg">{formData.intensity}</span>
              </div>
            </div>
          </div>

          {/* Trigger */}
          <div>
            <Label htmlFor="trigger">What triggered this craving?</Label>
            <Select
              value={formData.trigger}
              onValueChange={(value) => setFormData(prev => ({ ...prev, trigger: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a trigger (optional)" />
              </SelectTrigger>
              <SelectContent>
                {CRAVING_TRIGGERS.map((trigger) => (
                  <SelectItem key={trigger.id} value={trigger.id}>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{trigger.icon}</span>
                      <span>{trigger.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Did you resist? */}
          <div>
            <Label>Did you resist this craving?</Label>
            <div className="flex space-x-2 mt-2">
              <Button
                type="button"
                variant={formData.resisted ? "default" : "outline"}
                onClick={() => setFormData(prev => ({ ...prev, resisted: true }))}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Yes, I resisted!
              </Button>
              <Button
                type="button"
                variant={!formData.resisted ? "destructive" : "outline"}
                onClick={() => setFormData(prev => ({ ...prev, resisted: false }))}
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                No, I gave in
              </Button>
            </div>
          </div>

          {/* Coping Strategy */}
          <div>
            <Label htmlFor="coping_strategy">
              What did you do to cope? {formData.resisted ? '(How did you resist?)' : '(What happened?)'}
            </Label>
            <Input
              id="coping_strategy"
              placeholder="e.g., took a walk, chewed gum, called a friend"
              value={formData.coping_strategy}
              onChange={(e) => setFormData(prev => ({ ...prev, coping_strategy: e.target.value }))}
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Additional notes (optional)</Label>
            <Input
              id="notes"
              placeholder="How are you feeling? Any other details?"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                'Saving...'
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Log Craving
                </>
              )}
            </Button>
          </div>
        </form>

        {formData.resisted && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-center">
            <p className="text-green-800 font-medium">🎉 Great job resisting that craving!</p>
            <p className="text-green-600 text-sm">Every victory makes you stronger.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}