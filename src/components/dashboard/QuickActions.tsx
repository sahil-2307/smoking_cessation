'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertTriangle,
  PlusCircle,
  BookOpen,
  Lightbulb,
  Heart,
  MessageSquare,
  CheckCircle2
} from 'lucide-react'

interface QuickActionsProps {
  onSOSClick?: () => void
}

export default function QuickActions({ onSOSClick }: QuickActionsProps) {
  const [isSOSActive, setIsSOSActive] = useState(false)

  const handleSOSClick = () => {
    setIsSOSActive(true)
    if (onSOSClick) {
      onSOSClick()
    }
    // Reset SOS state after animation
    setTimeout(() => setIsSOSActive(false), 2000)
  }

  const quickActionItems = [
    {
      title: 'Log Craving',
      description: 'Track a craving you experienced',
      icon: PlusCircle,
      href: '/cravings?action=log',
      color: 'border-orange-200 hover:bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Daily Check-in',
      description: 'Update your daily progress',
      icon: CheckCircle2,
      href: '/progress?action=checkin',
      color: 'border-green-200 hover:bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Write in Journal',
      description: 'Record your thoughts and feelings',
      icon: BookOpen,
      href: '/journal?action=write',
      color: 'border-blue-200 hover:bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Get Support',
      description: 'Connect with the community',
      icon: MessageSquare,
      href: '/community',
      color: 'border-purple-200 hover:bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <span>Quick Actions</span>
        </CardTitle>
        <CardDescription>
          Take action on your quit journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* SOS Button */}
        <Button
          onClick={handleSOSClick}
          className={`w-full h-16 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white transition-all duration-200 ${
            isSOSActive ? 'pulse-emergency' : ''
          }`}
          variant="destructive"
        >
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6" />
              <span>SOS - I Need Help!</span>
            </div>
            <span className="text-xs opacity-90">
              Having a strong craving
            </span>
          </div>
        </Button>

        {/* Quick Action Grid */}
        <div className="grid grid-cols-2 gap-3">
          {quickActionItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.title} href={item.href}>
                <div
                  className={`p-4 border rounded-lg transition-colors hover:shadow-md ${item.color}`}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <Icon className={`w-6 h-6 ${item.iconColor}`} />
                    <div>
                      <div className="font-medium text-sm">{item.title}</div>
                      <div className="text-xs text-gray-600">{item.description}</div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Motivational Tip */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Heart className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-yellow-800">Today's Tip</div>
              <div className="text-xs text-yellow-700 mt-1">
                Remember why you started. Every craving you resist makes you stronger!
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}