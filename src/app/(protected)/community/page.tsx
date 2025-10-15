'use client'

import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, MessageCircle, Heart, Trophy, Calendar } from 'lucide-react'

export default function CommunityPage() {
  const { user } = useAuth()

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Please log in</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Users className="mr-3 h-8 w-8" />
          Community
        </h1>
        <p className="text-gray-600 mt-1">Connect with others on their quit smoking journey</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Support Groups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <MessageCircle className="mr-2 h-5 w-5" />
              Support Groups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm mb-4">
              Join discussion groups with people at similar stages of their quit journey.
            </p>
            <Button className="w-full">Browse Groups</Button>
          </CardContent>
        </Card>

        {/* Success Stories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Trophy className="mr-2 h-5 w-5" />
              Success Stories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm mb-4">
              Read inspiring stories from people who successfully quit smoking.
            </p>
            <Button className="w-full" variant="outline">Read Stories</Button>
          </CardContent>
        </Card>

        {/* Buddy System */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Heart className="mr-2 h-5 w-5" />
              Quit Buddy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm mb-4">
              Find a quit buddy to support each other through the journey.
            </p>
            <Button className="w-full" variant="outline">Find a Buddy</Button>
          </CardContent>
        </Card>

        {/* Community Challenges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Calendar className="mr-2 h-5 w-5" />
              Challenges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm mb-4">
              Join community challenges to stay motivated and accountable.
            </p>
            <Button className="w-full" variant="outline">View Challenges</Button>
          </CardContent>
        </Card>

        {/* Weekly Meetings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Users className="mr-2 h-5 w-5" />
              Weekly Meetings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm mb-4">
              Attend virtual support meetings every week.
            </p>
            <Button className="w-full" variant="outline">Join Meeting</Button>
          </CardContent>
        </Card>

        {/* Forum */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <MessageCircle className="mr-2 h-5 w-5" />
              Discussion Forum
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm mb-4">
              Ask questions, share experiences, and get advice from the community.
            </p>
            <Button className="w-full" variant="outline">Visit Forum</Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Community Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <p className="font-medium">Sarah completed 30 days smoke-free! 🎉</p>
              <p className="text-sm text-gray-600">2 hours ago</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="font-medium">New discussion: "Tips for handling work stress"</p>
              <p className="text-sm text-gray-600">5 hours ago</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="font-medium">Weekly challenge: "Exercise instead of smoking"</p>
              <p className="text-sm text-gray-600">1 day ago</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}