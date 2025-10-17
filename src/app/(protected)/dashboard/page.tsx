'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useQuitProgress } from '@/hooks/useQuitProgress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar, Clock, Target, TrendingUp, Heart, Award, Edit } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

export default function DashboardPage() {
  const { user, loading: authLoading, sessionInitialized } = useAuth()
  const { stats, loading: statsLoading, error } = useQuitProgress()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editForm, setEditForm] = useState({
    cigarettes_per_day: '',
    cost_per_pack: '',
    cigarettes_per_pack: ''
  })

  // Populate edit form when stats/profile data is available
  useEffect(() => {
    if (stats?.profile) {
      setEditForm({
        cigarettes_per_day: stats.profile.cigarettes_per_day?.toString() || '',
        cost_per_pack: stats.profile.cost_per_pack?.toString() || '',
        cigarettes_per_pack: stats.profile.cigarettes_per_pack?.toString() || '20'
      })
    }
  }, [stats?.profile])

  const handleUpdateProfile = async () => {
    if (!user) return

    setIsUpdating(true)
    try {
      const supabase = createClient()

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
                  <Label htmlFor="cost_per_pack">Cost per Pack ($)</Label>
                  <Input
                    id="cost_per_pack"
                    type="number"
                    step="0.01"
                    value={editForm.cost_per_pack}
                    onChange={(e) => setEditForm(prev => ({...prev, cost_per_pack: e.target.value}))}
                    placeholder="e.g., 12.50"
                  />
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
              <div className="text-2xl font-bold">${stats.money_saved?.toFixed(2) || '0.00'}</div>
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

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full" variant="outline">
                <Link href="/progress">
                  <Calendar className="mr-2 h-4 w-4" />
                  Log Today
                </Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/journal">
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
                <p>Start logging your daily progress to see your stats!</p>
                <Button asChild className="mt-4">
                  <Link href="/progress">Log Today's Progress</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}