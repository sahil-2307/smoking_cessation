'use client'

import { useAuth } from '@/hooks/useAuth'
import { useQuitProgress } from '@/hooks/useQuitProgress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProfileDebugPage() {
  const { user, loading: authLoading } = useAuth()
  const { stats, loading: statsLoading, error } = useQuitProgress()

  if (authLoading) {
    return <div className="p-8">Loading auth...</div>
  }

  if (!user) {
    return <div className="p-8">Not logged in</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Profile Debug Info</h1>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>User Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Has Profile:</strong> {user.profile ? 'Yes' : 'No'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent>
            {user.profile ? (
              <div className="space-y-2 text-sm">
                <p><strong>Profile ID:</strong> {user.profile.id}</p>
                <p><strong>Full Name:</strong> {user.profile.full_name || 'Not set'}</p>
                <p><strong>Onboarding Complete:</strong> {user.profile.onboarding_completed ? 'Yes' : 'No'}</p>
                <p><strong>Quit Date:</strong> {user.profile.quit_date || 'Not set'}</p>
                <p><strong>Cigarettes per Day:</strong> {(user.profile as any).cigarettes_per_day || 'Not set'}</p>
                <p><strong>Cost per Pack:</strong> {(user.profile as any).cost_per_pack || 'Not set'}</p>
                <p><strong>Cigarettes per Pack:</strong> {(user.profile as any).cigarettes_per_pack || 'Not set'}</p>
              </div>
            ) : (
              <p className="text-red-600">No profile data found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stats Loading</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Stats Loading:</strong> {statsLoading ? 'Yes' : 'No'}</p>
              <p><strong>Stats Error:</strong> {error || 'None'}</p>
              <p><strong>Has Stats:</strong> {stats ? 'Yes' : 'No'}</p>
            </div>
          </CardContent>
        </Card>

        {stats && (
          <Card>
            <CardHeader>
              <CardTitle>Stats Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Current Streak:</strong> {stats.current_streak}</p>
                <p><strong>Days Since Quit:</strong> {stats.timeSinceQuit?.days}</p>
                <p><strong>Money Saved:</strong> ${stats.money_saved?.toFixed(2)}</p>
                <p><strong>Cigarettes Avoided:</strong> {stats.cigarettes_avoided}</p>
                <p><strong>Total Cravings:</strong> {stats.total_cravings}</p>
                <p><strong>Resisted Cravings:</strong> {stats.resisted_cravings}</p>
                <p><strong>Success Rate:</strong> {stats.success_rate?.toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}