'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { DISTRACTION_ACTIVITIES } from '@/lib/constants'
import { Play, Pause, RotateCcw, CheckCircle, Wind, Activity, Brain, Palette } from 'lucide-react'

interface DistractionActivityProps {
  onActivityComplete?: (activity: string) => void
}

type ActivityType = (typeof DISTRACTION_ACTIVITIES)[number]

export default function DistractionActivity({ onActivityComplete }: DistractionActivityProps) {
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const activityIcons = {
    breathing: Wind,
    physical: Activity,
    mental: Brain,
    creative: Palette
  }

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isActive && !isPaused && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsActive(false)
            if (selectedActivity && onActivityComplete) {
              onActivityComplete(selectedActivity.title)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isActive, isPaused, timeRemaining, selectedActivity, onActivityComplete])

  const startActivity = (activity: ActivityType) => {
    setSelectedActivity(activity)
    setTimeRemaining(activity.duration * 60) // Convert minutes to seconds
    setIsActive(true)
    setIsPaused(false)
  }

  const pauseResume = () => {
    setIsPaused(!isPaused)
  }

  const resetActivity = () => {
    setIsActive(false)
    setIsPaused(false)
    setTimeRemaining(0)
    setSelectedActivity(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getProgress = () => {
    if (!selectedActivity) return 0
    const totalTime = selectedActivity.duration * 60
    return ((totalTime - timeRemaining) / totalTime) * 100
  }

  if (!isActive && !selectedActivity) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span>Distraction Activities</span>
          </CardTitle>
          <CardDescription>
            Choose a quick activity to help you through a craving
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {DISTRACTION_ACTIVITIES.map((activity) => {
              const Icon = activityIcons[activity.type]
              return (
                <Button
                  key={activity.id}
                  variant="outline"
                  onClick={() => startActivity(activity)}
                  className="h-auto p-4 text-left justify-start"
                >
                  <div className="flex items-start space-x-3">
                    <Icon className="w-5 h-5 mt-1 text-blue-600" />
                    <div>
                      <div className="font-medium">{activity.title}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        {activity.duration} min
                      </div>
                    </div>
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (timeRemaining === 0 && selectedActivity) {
    return (
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-100">
        <CardHeader className="text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
          <CardTitle className="text-green-800">Activity Completed!</CardTitle>
          <CardDescription className="text-green-600">
            Great job completing "{selectedActivity.title}"
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-green-700">
            How are you feeling now? Often, cravings pass during these activities.
          </p>

          <div className="flex space-x-2">
            <Button
              onClick={resetActivity}
              variant="outline"
              className="flex-1 border-green-300 text-green-700"
            >
              Try Another Activity
            </Button>
            <Button
              onClick={() => {
                resetActivity()
                if (onActivityComplete) {
                  onActivityComplete(selectedActivity.title)
                }
              }}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              I Feel Better!
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (selectedActivity) {
    const Icon = activityIcons[selectedActivity.type]

    return (
      <Card>
        <CardHeader className="text-center">
          <Icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <CardTitle>{selectedActivity.title}</CardTitle>
          <CardDescription>{selectedActivity.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatTime(timeRemaining)}
            </div>
            <Progress value={getProgress()} className="mb-4" />
          </div>

          {/* Breathing Exercise Guide */}
          {selectedActivity.type === 'breathing' && (
            <div className="text-center space-y-2">
              <div className="text-lg font-medium text-blue-800">
                4-7-8 Breathing
              </div>
              <div className="text-sm text-blue-600 space-y-1">
                <p>• Breathe in through nose for 4 counts</p>
                <p>• Hold your breath for 7 counts</p>
                <p>• Exhale through mouth for 8 counts</p>
                <p className="font-medium">Repeat this cycle</p>
              </div>
            </div>
          )}

          {/* Activity-specific content */}
          {selectedActivity && selectedActivity.type === 'mental' && selectedActivity.title.includes('Memory') && (
            <div className="text-center space-y-2">
              <div className="text-lg font-medium text-blue-800">
                Memory Challenge
              </div>
              <div className="text-sm text-blue-600 space-y-1">
                <p>• Name 5 things you can see</p>
                <p>• Name 4 things you can touch</p>
                <p>• Name 3 things you can hear</p>
                <p>• Name 2 things you can smell</p>
                <p>• Name 1 thing you can taste</p>
              </div>
            </div>
          )}

          {selectedActivity && selectedActivity.type === 'mental' && selectedActivity.title.includes('Affirmations') && (
            <div className="text-center space-y-2">
              <div className="text-lg font-medium text-blue-800">
                Positive Affirmations
              </div>
              <div className="text-sm text-blue-600 space-y-1">
                <p>"I am stronger than my cravings"</p>
                <p>"I choose health over habit"</p>
                <p>"This craving will pass"</p>
                <p>"I am in control of my choices"</p>
                <p>"Every moment smoke-free is a victory"</p>
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={resetActivity}
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Stop
            </Button>
            <Button
              onClick={pauseResume}
              className="flex-1"
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}