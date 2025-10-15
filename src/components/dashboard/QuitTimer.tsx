'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getTimeSinceQuit, generateMotivationalMessage } from '@/lib/utils'
import { Clock, Trophy, Star } from 'lucide-react'

interface QuitTimerProps {
  quitDate: string
  currentStreak: number
}

export default function QuitTimer({ quitDate, currentStreak }: QuitTimerProps) {
  const [timeData, setTimeData] = useState(getTimeSinceQuit(quitDate))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeData(getTimeSinceQuit(quitDate))
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [quitDate])

  const { days, hours, minutes, isInFuture } = timeData

  if (isInFuture) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
        <CardHeader className="text-center">
          <Clock className="w-12 h-12 text-blue-600 mx-auto mb-2" />
          <CardTitle className="text-2xl text-blue-800">Quit Date Set!</CardTitle>
          <CardDescription className="text-blue-600">
            Your journey starts in {days} days
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-4xl font-bold text-blue-800 mb-2">
            {days}
          </div>
          <p className="text-blue-600">
            Days until your quit date
          </p>
          <p className="text-sm text-blue-500 mt-4">
            Use this time to prepare mentally and gather your support system!
          </p>
        </CardContent>
      </Card>
    )
  }

  const motivationalMessage = generateMotivationalMessage(days)

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Trophy className="w-8 h-8 text-green-600" />
          <Star className="w-6 h-6 text-yellow-500" />
        </div>
        <CardTitle className="text-2xl text-green-800">Smoke-Free Timer</CardTitle>
        <CardDescription className="text-green-600">
          {motivationalMessage}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center mb-6">
          <div className="bg-white/60 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-700">{days}</div>
            <div className="text-sm text-green-600">Days</div>
          </div>
          <div className="bg-white/60 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-700">{hours}</div>
            <div className="text-sm text-green-600">Hours</div>
          </div>
          <div className="bg-white/60 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-700">{minutes}</div>
            <div className="text-sm text-green-600">Minutes</div>
          </div>
        </div>

        {currentStreak > 0 && (
          <div className="text-center bg-white/60 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-green-800">Current Streak</span>
            </div>
            <div className="text-2xl font-bold text-green-700">
              {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}