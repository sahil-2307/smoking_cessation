'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, Clock, Heart, Zap, Wind, MessageSquare } from 'lucide-react'
import { MOTIVATIONAL_QUOTES } from '@/lib/constants'

interface SOSButtonProps {
  onStartEmergencyHelp: () => void
}

export default function SOSButton({ onStartEmergencyHelp }: SOSButtonProps) {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(300) // 5 minutes in seconds
  const [isTimerActive, setIsTimerActive] = useState(false)

  const emergencySteps = [
    {
      icon: Wind,
      title: 'Take Deep Breaths',
      description: 'Breathe in for 4 counts, hold for 4, breathe out for 4. Repeat 3 times.',
      duration: 60
    },
    {
      icon: Heart,
      title: 'Remember Your Why',
      description: 'Think about why you decided to quit smoking. Your health, family, freedom.',
      duration: 60
    },
    {
      icon: Zap,
      title: 'This Will Pass',
      description: 'Cravings are temporary. This feeling will peak and then fade away.',
      duration: 60
    },
    {
      icon: MessageSquare,
      title: 'Reach Out',
      description: 'Call a friend, family member, or support buddy. You don\'t have to do this alone.',
      duration: 120
    }
  ]

  const handleSOSClick = () => {
    setIsActive(true)
    setIsTimerActive(true)
    setCurrentStep(0)
    onStartEmergencyHelp()

    // Start 5-minute timer
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsTimerActive(false)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleNextStep = () => {
    if (currentStep < emergencySteps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleComplete = () => {
    setIsActive(false)
    setIsTimerActive(false)
    setTimeRemaining(300)
    setCurrentStep(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]

  if (!isActive) {
    return (
      <Card className="border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2 text-red-800">
            <AlertTriangle className="w-6 h-6" />
            <span>Emergency Support</span>
          </CardTitle>
          <CardDescription className="text-red-600">
            Having a strong craving? Get immediate help
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Button
            onClick={handleSOSClick}
            className="w-full h-16 text-lg font-semibold bg-red-600 hover:bg-red-700 pulse-emergency"
          >
            <div className="flex flex-col items-center">
              <AlertTriangle className="w-8 h-8 mb-1" />
              <span>SOS - I Need Help Now!</span>
            </div>
          </Button>

          <div className="text-sm text-red-700 bg-red-100 p-3 rounded-lg">
            <p className="font-medium mb-1">Quick reminder:</p>
            <p>"{randomQuote}"</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentStepData = emergencySteps[currentStep]
  const StepIcon = currentStepData.icon

  return (
    <Card className="border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Clock className="w-5 h-5 text-red-600" />
          <span className="text-xl font-bold text-red-800">
            {formatTime(timeRemaining)}
          </span>
        </div>
        <Progress value={((300 - timeRemaining) / 300) * 100} className="mb-2" />
        <CardTitle className="flex items-center justify-center space-x-2 text-red-800">
          <StepIcon className="w-6 h-6" />
          <span>{currentStepData.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-red-700 mb-4">{currentStepData.description}</p>

          <div className="flex items-center justify-center space-x-1 mb-4">
            {emergencySteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index <= currentStep ? 'bg-red-500' : 'bg-red-200'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex space-x-2">
          {currentStep < emergencySteps.length - 1 ? (
            <>
              <Button
                variant="outline"
                onClick={handleComplete}
                className="flex-1 border-red-300 text-red-700"
              >
                I'm Better
              </Button>
              <Button
                onClick={handleNextStep}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Next Step
              </Button>
            </>
          ) : (
            <Button
              onClick={handleComplete}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              I Made It Through!
            </Button>
          )}
        </div>

        <div className="text-xs text-center text-red-600">
          <p>If you're still struggling, consider calling a support helpline</p>
          <p className="font-medium">National Tobacco Cessation Helpline: 1800-11-2356</p>
        </div>
      </CardContent>
    </Card>
  )
}