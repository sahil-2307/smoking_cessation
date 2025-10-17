'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Medal, Award, Crown, Flame, Calendar, DollarSign, Target } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface LeaderboardEntry {
  id: string
  username: string
  full_name: string
  avatar_url: string | null
  days_smoke_free: number
  money_saved: number
  current_streak: number
  quit_date: string
  cigarettes_not_smoked: number
}

interface LeaderboardCategory {
  id: string
  title: string
  icon: React.ReactNode
  description: string
  getData: (data: LeaderboardEntry[]) => LeaderboardEntry[]
}

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('days_smoke_free')
  const [error, setError] = useState<string | null>(null)

  const categories: LeaderboardCategory[] = [
    {
      id: 'days_smoke_free',
      title: 'Most Days Smoke-Free',
      icon: <Calendar className="h-4 w-4" />,
      description: 'Users with the longest smoke-free streaks',
      getData: (data) => [...data].sort((a, b) => b.days_smoke_free - a.days_smoke_free)
    },
    {
      id: 'money_saved',
      title: 'Money Saved',
      icon: <DollarSign className="h-4 w-4" />,
      description: 'Users who have saved the most money',
      getData: (data) => [...data].sort((a, b) => b.money_saved - a.money_saved)
    },
    {
      id: 'current_streak',
      title: 'Current Streak',
      icon: <Flame className="h-4 w-4" />,
      description: 'Users with the longest current streaks',
      getData: (data) => [...data].sort((a, b) => b.current_streak - a.current_streak)
    },
    {
      id: 'cigarettes_avoided',
      title: 'Cigarettes Avoided',
      icon: <Target className="h-4 w-4" />,
      description: 'Users who have avoided the most cigarettes',
      getData: (data) => [...data].sort((a, b) => b.cigarettes_not_smoked - a.cigarettes_not_smoked)
    }
  ]

  useEffect(() => {
    fetchLeaderboardData()
  }, [])

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      // Get users who have opted into leaderboard and have quit dates
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .not('quit_date', 'is', null)
        .not('days_smoke_free', 'is', null)
        .gte('days_smoke_free', 0)
        .order('days_smoke_free', { ascending: false })
        .limit(50)

      if (error) throw error

      // Transform the data to match our interface
      const transformedData: LeaderboardEntry[] = (data || []).map((item: any) => ({
        id: item.id || '',
        username: item.username || `User${item.id?.slice(0, 8)}` || 'Anonymous',
        full_name: item.full_name || '',
        avatar_url: item.avatar_url,
        days_smoke_free: item.days_smoke_free || 0,
        money_saved: calculateMoneySaved(item.days_smoke_free || 0, item.cost_per_pack || 0, item.cigarettes_per_day || 0, item.cigarettes_per_pack || 20),
        current_streak: item.current_streak || item.days_smoke_free || 0,
        quit_date: item.quit_date || '',
        cigarettes_not_smoked: calculateCigarettesAvoided(item.days_smoke_free || 0, item.cigarettes_per_day || 0)
      }))

      setLeaderboardData(transformedData)
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const calculateMoneySaved = (days: number, costPerPack: number, cigarettesPerDay: number, cigarettesPerPack: number): number => {
    if (!costPerPack || !cigarettesPerDay || !cigarettesPerPack) return 0
    const packsPerDay = cigarettesPerDay / cigarettesPerPack
    return days * packsPerDay * costPerPack
  }

  const calculateCigarettesAvoided = (days: number, cigarettesPerDay: number): number => {
    return days * (cigarettesPerDay || 0)
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />
      default:
        return <Award className="h-5 w-5 text-gray-300" />
    }
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white'
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getCurrentUserRank = (data: LeaderboardEntry[]) => {
    if (!user) return null
    const userIndex = data.findIndex(entry => entry.id === user.id)
    return userIndex >= 0 ? userIndex + 1 : null
  }

  const formatValue = (category: string, value: number) => {
    switch (category) {
      case 'money_saved':
        return `$${value.toFixed(2)}`
      case 'days_smoke_free':
      case 'current_streak':
        return `${value} days`
      case 'cigarettes_avoided':
        return `${value} cigarettes`
      default:
        return value.toString()
    }
  }

  if (authLoading || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Please log in</div>
  }

  const activeData = categories.find(cat => cat.id === activeCategory)?.getData(leaderboardData) || []
  const userRank = getCurrentUserRank(activeData)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-gray-600 mt-1">See how you compare with other quitters in our community</p>
      </div>

      {error && (
        <Card className="border-red-200 mb-6">
          <CardContent className="p-4">
            <p className="text-red-600 text-sm">Error loading leaderboard: {error}</p>
            <Button onClick={fetchLeaderboardData} size="sm" className="mt-2">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Your Rank */}
      {userRank && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge className={`px-3 py-1 ${getRankBadgeColor(userRank)}`}>
                  #{userRank}
                </Badge>
                <div>
                  <p className="font-medium">Your Current Rank</p>
                  <p className="text-sm text-gray-600">Keep it up! 🎉</p>
                </div>
              </div>
              {getRankIcon(userRank)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "outline"}
            onClick={() => setActiveCategory(category.id)}
            className="flex items-center space-x-2"
          >
            {category.icon}
            <span className="hidden sm:inline">{category.title}</span>
          </Button>
        ))}
      </div>

      {/* Active Category Info */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            {categories.find(cat => cat.id === activeCategory)?.icon}
            <div>
              <h3 className="font-medium">{categories.find(cat => cat.id === activeCategory)?.title}</h3>
              <p className="text-sm text-gray-600">{categories.find(cat => cat.id === activeCategory)?.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          {activeData.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No data available yet. Be the first to appear on the leaderboard!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeData.slice(0, 20).map((entry, index) => {
                const rank = index + 1
                const isCurrentUser = entry.id === user.id

                return (
                  <div
                    key={entry.id}
                    className={`p-3 sm:p-4 rounded-lg border ${
                      isCurrentUser
                        ? 'border-green-300 bg-green-50'
                        : rank <= 3
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-gray-200 bg-white'
                    }`}
                  >
                    {/* Mobile Layout */}
                    <div className="flex flex-col space-y-3 sm:hidden">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={`px-2 py-1 text-xs ${getRankBadgeColor(rank)}`}>
                            #{rank}
                          </Badge>
                          {getRankIcon(rank)}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-base">
                            {formatValue(activeCategory,
                              activeCategory === 'money_saved' ? entry.money_saved :
                              activeCategory === 'current_streak' ? entry.current_streak :
                              activeCategory === 'cigarettes_avoided' ? entry.cigarettes_not_smoked :
                              entry.days_smoke_free
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={entry.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {entry.full_name ? entry.full_name.charAt(0).toUpperCase() : entry.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {entry.full_name || entry.username}
                            {isCurrentUser && <span className="text-green-600 text-xs ml-1">(You)</span>}
                          </p>
                          <p className="text-xs text-gray-500 truncate">@{entry.username}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">
                          Since {new Date(entry.quit_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Badge className={`px-2 py-1 ${getRankBadgeColor(rank)}`}>
                            #{rank}
                          </Badge>
                          {getRankIcon(rank)}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={entry.avatar_url || undefined} />
                          <AvatarFallback>
                            {entry.full_name ? entry.full_name.charAt(0).toUpperCase() : entry.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {entry.full_name || entry.username}
                            {isCurrentUser && <span className="text-green-600 text-sm ml-2">(You)</span>}
                          </p>
                          <p className="text-sm text-gray-500">@{entry.username}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {formatValue(activeCategory,
                            activeCategory === 'money_saved' ? entry.money_saved :
                            activeCategory === 'current_streak' ? entry.current_streak :
                            activeCategory === 'cigarettes_avoided' ? entry.cigarettes_not_smoked :
                            entry.days_smoke_free
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          Since {new Date(entry.quit_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="text-center text-sm text-blue-700">
            <p className="font-medium mb-1">Privacy Information</p>
            <p>Only users who have completed onboarding and set a quit date appear on the leaderboard. Your real name and personal information remain private.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}