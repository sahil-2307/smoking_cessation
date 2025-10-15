'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import SOSButton from '@/components/cravings/SOSButton'
import CravingLog from '@/components/cravings/CravingLog'
import DistractionActivity from '@/components/cravings/DistractionActivity'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { useCravings } from '@/hooks/useCravings'
import { formatDate } from '@/lib/utils'
import { CRAVING_TRIGGERS } from '@/lib/constants'
import {
  Activity,
  TrendingUp,
  Target,
  AlertTriangle,
  Calendar,
  BarChart3
} from 'lucide-react'

export default function CravingsPage() {
  const searchParams = useSearchParams()
  const { cravings, stats, loading, error } = useCravings()
  const [showSOS, setShowSOS] = useState(false)
  const [showLog, setShowLog] = useState(false)

  useEffect(() => {
    // Check URL parameters for actions
    if (searchParams.get('sos') === 'true') {
      setShowSOS(true)
    }
    if (searchParams.get('action') === 'log') {
      setShowLog(true)
    }
  }, [searchParams])

  const handleEmergencyStart = () => {
    // Could integrate with push notifications or emergency contacts
    console.log('Emergency help started')
  }

  const handleCravingLogged = (craving: any) => {
    // Auto-show SOS if high intensity craving
    if (craving.intensity >= 8 && craving.resisted) {
      setShowSOS(true)
    }
  }

  const getTriggerData = () => {
    if (!stats || stats.totalCravings === 0) return []

    const triggerCounts: { [key: string]: number } = {}
    cravings.forEach(craving => {
      if (craving.trigger) {
        triggerCounts[craving.trigger] = (triggerCounts[craving.trigger] || 0) + 1
      }
    })

    return Object.entries(triggerCounts)
      .map(([trigger, count]) => {
        const triggerData = CRAVING_TRIGGERS.find(t => t.id === trigger)
        return {
          trigger,
          name: triggerData?.name || trigger,
          icon: triggerData?.icon || '❓',
          count,
          percentage: (count / stats.totalCravings) * 100
        }
      })
      .sort((a, b) => b.count - a.count)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>Error loading cravings: {error}</p>
        </div>
      </div>
    )
  }

  const triggerData = getTriggerData()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Craving Management</h1>
        <p className="text-gray-600">
          Track, understand, and overcome your cravings
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - SOS and Activities */}
        <div className="lg:col-span-2 space-y-6">
          {/* SOS Section */}
          {(showSOS || searchParams.get('sos') === 'true') && (
            <SOSButton onStartEmergencyHelp={handleEmergencyStart} />
          )}

          {/* Distraction Activities */}
          <DistractionActivity
            onActivityComplete={(activity) => {
              console.log('Activity completed:', activity)
            }}
          />

          {/* Statistics */}
          {stats && (
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Cravings</CardTitle>
                  <Activity className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.totalCravings}
                  </div>
                  <p className="text-xs text-gray-600">
                    Tracked and managed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <Target className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(stats.successRate)}%
                  </div>
                  <p className="text-xs text-gray-600">
                    Cravings resisted
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Intensity</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.averageIntensity.toFixed(1)}/10
                  </div>
                  <p className="text-xs text-gray-600">
                    Average craving strength
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Trigger Analysis */}
          {triggerData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <span>Your Craving Triggers</span>
                </CardTitle>
                <CardDescription>
                  Understanding your patterns helps you prepare
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {triggerData.slice(0, 5).map((item) => (
                    <div key={item.trigger} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{item.icon}</span>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{item.count}</div>
                        <div className="text-xs text-gray-600">
                          {item.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Cravings */}
          {stats && stats.recentCravings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Recent Cravings</span>
                </CardTitle>
                <CardDescription>Your latest logged cravings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentCravings.slice(0, 5).map((craving) => {
                    const trigger = CRAVING_TRIGGERS.find(t => t.id === craving.trigger)
                    return (
                      <div key={craving.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="text-lg">
                            {trigger?.icon || '❓'}
                          </div>
                          <div>
                            <div className="font-medium">
                              Intensity: {craving.intensity}/10
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatDate(craving.created_at, 'MMM d, h:mm a')}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {craving.resisted ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              Resisted ✓
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                              Gave in
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Craving Log */}
        <div className="space-y-6">
          <CravingLog onCravingLogged={handleCravingLogged} />

          {/* Emergency Resources */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                <span>Emergency Resources</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-red-700 space-y-2">
              <div>
                <strong>National Tobacco Cessation Helpline:</strong>
                <br />
                📞 1800-11-2356 (toll-free)
              </div>
              <div>
                <strong>Crisis Support:</strong>
                <br />
                📞 +91-9820466726 (iCall)
              </div>
              <p className="text-xs text-red-600 mt-3">
                Don't hesitate to reach out if you're struggling.
              </p>
            </CardContent>
          </Card>

          {/* Motivation */}
          <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl mb-2">🌟</div>
                <p className="text-green-800 font-medium mb-2">
                  Remember Your Why
                </p>
                <p className="text-green-700 text-sm">
                  Every craving you resist makes you stronger. You're not giving up something – you're gaining everything: health, freedom, and control.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}