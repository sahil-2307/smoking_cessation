'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useQuitProgress } from '@/hooks/useQuitProgress'
import { useUserSettings } from '@/hooks/useUserSettings'
import { useAchievements } from '@/hooks/useAchievements'
import { useNotifications } from '@/hooks/useNotifications'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, Target, TrendingUp, Heart, Award, Edit, Badge, Sparkles, Zap, Download, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'
import { downloadBadge, getBadgeData } from '@/utils/badgeGenerator'
import { formatCurrency } from '@/lib/utils'
import { InstallPWA } from '@/components/pwa/InstallPWA'
import { NotificationPrompt } from '@/components/notifications/NotificationPrompt'

export default function DashboardPage() {
  const { user, loading: authLoading, sessionInitialized } = useAuth()
  const { stats, loading: statsLoading, error } = useQuitProgress()
  const { settings, updateSettings } = useUserSettings()
  const { checkAndAwardAchievements, getDisplayableAchievements } = useAchievements()
  const { checkMilestones, checkHealthBenefits, scheduleDailyReminder } = useNotifications()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editForm, setEditForm] = useState({
    cigarettes_per_day: '',
    cost_per_pack: '',
    cigarettes_per_pack: '',
    currency: 'INR' as 'INR' | 'USD'
  })

  // Populate edit form when stats/profile data is available
  useEffect(() => {
    if (stats?.profile && settings) {
      setEditForm({
        cigarettes_per_day: stats.profile.cigarettes_per_day?.toString() || '',
        cost_per_pack: stats.profile.cost_per_pack?.toString() || '',
        cigarettes_per_pack: stats.profile.cigarettes_per_pack?.toString() || '20',
        currency: settings.currency
      })
    }
  }, [stats?.profile, settings])

  // Check and award achievements when stats update
  useEffect(() => {
    if (stats?.timeSinceQuit?.days && stats.timeSinceQuit.days > 0) {
      checkAndAwardAchievements(stats.timeSinceQuit.days)
    }
  }, [stats?.timeSinceQuit?.days, checkAndAwardAchievements])

  // Check milestones and send notifications
  useEffect(() => {
    if (stats?.timeSinceQuit?.days) {
      checkMilestones(stats.timeSinceQuit.days)
    }
  }, [stats?.timeSinceQuit?.days, checkMilestones])

  // Check health benefits and send notifications
  useEffect(() => {
    if (stats?.timeSinceQuit?.hours) {
      checkHealthBenefits(stats.timeSinceQuit.hours)
    }
  }, [stats?.timeSinceQuit?.hours, checkHealthBenefits])

  // Schedule daily reminders
  useEffect(() => {
    if (settings?.reminder_time) {
      const hour = parseInt(settings.reminder_time.split(':')[0])
      scheduleDailyReminder(hour)
    }
  }, [settings?.reminder_time, scheduleDailyReminder])

  const handleDownloadBadge = (achievementType: string, days: number) => {
    const username = user?.profile?.username || user?.email?.split('@')[0] || 'user'
    const badge = getBadgeData(achievementType, days, username)
    downloadBadge(badge)
  }

  const handleUpdateProfile = async () => {
    if (!user) return

    setIsUpdating(true)
    try {
      const supabase = createClient()

      // Update profile data
      const updateData: Database['public']['Tables']['profiles']['Update'] = {
        cigarettes_per_day: editForm.cigarettes_per_day ? parseInt(editForm.cigarettes_per_day) : null,
        cost_per_pack: editForm.cost_per_pack ? parseFloat(editForm.cost_per_pack) : null,
        cigarettes_per_pack: editForm.cigarettes_per_pack ? parseInt(editForm.cigarettes_per_pack) : 20
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData as any)
        .eq('id', user.id as any)

      if (error) throw error

      // Update currency setting if changed
      if (editForm.currency !== settings?.currency) {
        await updateSettings({ currency: editForm.currency })
      }

      alert('Profile updated successfully! 🎉')
      setIsEditDialogOpen(false)

      // Refresh the page to show updated calculations
      window.location.reload()
    } catch (error: any) {
      console.error('Error updating profile:', error)
      alert('Error updating profile: ' + error.message)
    } finally {
      setIsUpdating(false)
    }
  }

  if (!sessionInitialized || authLoading || statsLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Please log in</div>
  }

  // Show onboarding prompt if not completed
  if (!user.profile?.onboarding_completed) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Welcome to QuitSmoking! 🎉</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Let's get you started on your journey to a smoke-free life!</p>
            <Link href="/onboarding">
              <Button className="w-full">Start Onboarding</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }


  return (
    <div className="container mx-auto px-4 py-8">
      {/* PWA Install Prompt */}
      <InstallPWA />

      {/* Notification Permission Prompt */}
      <NotificationPrompt />

      {/* Show error message if there's an issue loading stats */}
      {error && (
        <Card className="border-red-200 mb-6">
          <CardContent className="p-4">
            <p className="text-red-600 text-sm">Error loading some data: {error}</p>
            <Button onClick={() => window.location.reload()} size="sm" className="mt-2">
              Refresh
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Journey</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user.profile?.full_name || user.email}!
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Smoking Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cigarettes_per_day">Cigarettes per Day (before quitting)</Label>
                  <Input
                    id="cigarettes_per_day"
                    type="number"
                    value={editForm.cigarettes_per_day}
                    onChange={(e) => setEditForm(prev => ({...prev, cigarettes_per_day: e.target.value}))}
                    placeholder="e.g., 10"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={editForm.currency}
                    onValueChange={(value) => setEditForm(prev => ({...prev, currency: value as 'INR' | 'USD'}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">₹ Indian Rupee (INR)</SelectItem>
                      <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cost_per_pack">
                    Cost per Pack ({editForm.currency === 'INR' ? '₹' : '$'})
                  </Label>
                  <Input
                    id="cost_per_pack"
                    type="number"
                    step="0.01"
                    value={editForm.cost_per_pack}
                    onChange={(e) => setEditForm(prev => ({...prev, cost_per_pack: e.target.value}))}
                    placeholder={editForm.currency === 'INR' ? 'e.g., 150' : 'e.g., 12.50'}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    {editForm.currency === 'INR'
                      ? 'Typical cigarette pack costs ₹100-200 in India'
                      : 'Typical cigarette pack costs $8-15 in US'
                    }
                  </p>
                </div>
                <div>
                  <Label htmlFor="cigarettes_per_pack">Cigarettes per Pack</Label>
                  <Input
                    id="cigarettes_per_pack"
                    type="number"
                    value={editForm.cigarettes_per_pack}
                    onChange={(e) => setEditForm(prev => ({...prev, cigarettes_per_pack: e.target.value}))}
                    placeholder="e.g., 20"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUpdateProfile} disabled={isUpdating}>
                    {isUpdating ? 'Updating...' : 'Update Profile'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button asChild>
            <Link href="/cravings">
              <Heart className="mr-2 h-4 w-4" />
              SOS Help
            </Link>
          </Button>
        </div>
      </div>

      {stats ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Time Since Quit */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Smoke-Free</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.timeSinceQuit?.days || 0} days
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.timeSinceQuit?.hours || 0} hours, {stats.timeSinceQuit?.minutes || 0} minutes
              </p>
            </CardContent>
          </Card>

          {/* Current Streak */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.current_streak} days</div>
              <p className="text-xs text-muted-foreground">Keep it going!</p>
            </CardContent>
          </Card>

          {/* Money Saved */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Money Saved</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.money_saved || 0, stats.currency)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.cigarettes_not_smoked || 0} cigarettes avoided
              </p>
            </CardContent>
          </Card>

          {/* Cravings Success Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Craving Success</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.success_rate?.toFixed(0) || 100}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.resisted_cravings || 0} of {stats.total_cravings || 0} resisted
              </p>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.achievement_count || 0}</div>
              <p className="text-xs text-muted-foreground">Milestones unlocked</p>
            </CardContent>
          </Card>

          {/* Health Benefits Timeline */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center">
                <Heart className="mr-2 h-4 w-4 text-red-500" />
                Your Health Recovery Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.timeSinceQuit?.hours >= 12 && (
                  <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div className="flex-1">
                      <p className="font-medium text-green-800">12 Hours: Carbon Monoxide Levels Normalize</p>
                      <p className="text-sm text-green-600">Your blood's carbon monoxide level has returned to normal, improving oxygen delivery to your organs.</p>
                    </div>
                  </div>
                )}
                {stats?.timeSinceQuit?.days >= 1 && (
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="flex-1">
                      <p className="font-medium text-blue-800">24 Hours: Heart Attack Risk Decreases</p>
                      <p className="text-sm text-blue-600">Your risk of heart attack has already started to decrease. Your circulation is improving!</p>
                    </div>
                  </div>
                )}
                {stats?.timeSinceQuit?.days >= 3 && (
                  <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                    <div className="flex-1">
                      <p className="font-medium text-purple-800">3 Days: Breathing Improves</p>
                      <p className="text-sm text-purple-600">Your lung function is increasing and you can breathe easier. Nicotine is completely out of your system!</p>
                    </div>
                  </div>
                )}
                {stats?.timeSinceQuit?.days >= 7 && (
                  <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                    <div className="flex-1">
                      <p className="font-medium text-orange-800">1 Week: Taste & Smell Return</p>
                      <p className="text-sm text-orange-600">Your senses of taste and smell are significantly improved. Food tastes better than ever!</p>
                    </div>
                  </div>
                )}
                {(!stats?.timeSinceQuit?.hours || stats?.timeSinceQuit?.hours < 12) && (
                  <div className="text-center py-6">
                    <Heart className="h-16 w-16 text-red-200 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">Your Health Recovery Starts Now!</p>
                    <p className="text-sm text-gray-500">Every minute without smoking is healing your body. The benefits begin immediately.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Achievement Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Latest Achievements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2">
                {stats?.timeSinceQuit?.days >= 1 && (
                  <div className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                    <Badge className="h-8 w-8 bg-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">First Day Warrior</p>
                      <p className="text-xs text-muted-foreground">24 hours smoke-free!</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadBadge('first_day', stats?.timeSinceQuit?.days || 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {stats?.timeSinceQuit?.days >= 3 && (
                  <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                    <Sparkles className="h-8 w-8 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nicotine Fighter</p>
                      <p className="text-xs text-muted-foreground">3 days - worst cravings behind you!</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadBadge('nicotine_fighter', stats?.timeSinceQuit?.days || 3)}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {stats?.timeSinceQuit?.days >= 7 && (
                  <div className="flex items-center space-x-3 p-2 bg-purple-50 rounded-lg">
                    <Award className="h-8 w-8 text-purple-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Week Champion</p>
                      <p className="text-xs text-muted-foreground">1 week smoke-free milestone!</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadBadge('week_champion', stats?.timeSinceQuit?.days || 7)}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {(!stats?.timeSinceQuit?.days || stats?.timeSinceQuit?.days < 1) && (
                  <div className="text-center py-4">
                    <Zap className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Start your journey to unlock achievements!</p>
                  </div>
                )}
              </div>
              <Button asChild className="w-full" variant="outline">
                <Link href="/journal">
                  <Heart className="mr-2 h-4 w-4" />
                  View Journal
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!user.profile?.quit_date ? (
              <>
                <p>Set your quit date to start tracking your progress!</p>
                <Button asChild className="mt-4">
                  <Link href="/onboarding">Set Quit Date</Link>
                </Button>
              </>
            ) : (
              <>
                <p>Start your smoke-free journey to unlock achievements and track your health improvements!</p>
                <Button asChild className="mt-4">
                  <Link href="/journal">Start Your Journal</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}