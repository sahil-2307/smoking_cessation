import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, TrendingUp, Users, Shield, Smartphone, BarChart } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Journey to a
            <span className="text-green-600 block">Smoke-Free Life</span>
            Starts Here
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands who have successfully quit smoking with our comprehensive support system,
            progress tracking, and community encouragement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/signup">Start Your Journey</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link href="/login">I Have an Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Everything You Need to Quit Successfully
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Progress Tracking</CardTitle>
              <CardDescription>
                Real-time statistics on your smoke-free journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Live quit timer</li>
                <li>• Money saved calculator</li>
                <li>• Health improvements timeline</li>
                <li>• Streak counters and achievements</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle>Craving Support</CardTitle>
              <CardDescription>
                Immediate help when cravings hit hardest
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• SOS button for emergencies</li>
                <li>• Breathing exercises</li>
                <li>• Distraction activities</li>
                <li>• Craving pattern analysis</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Community Support</CardTitle>
              <CardDescription>
                Connect with others on the same journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Support forums</li>
                <li>• Accountability buddies</li>
                <li>• Success stories</li>
                <li>• Expert advice</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Privacy First</CardTitle>
              <CardDescription>
                Your data is secure and private
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• End-to-end encryption</li>
                <li>• Anonymous posting options</li>
                <li>• GDPR compliant</li>
                <li>• No data selling</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-6 h-6 text-yellow-600" />
              </div>
              <CardTitle>Mobile Ready</CardTitle>
              <CardDescription>
                Access your support anywhere, anytime
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Progressive Web App</li>
                <li>• Works offline</li>
                <li>• Push notifications</li>
                <li>• Install on home screen</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle>Smart Analytics</CardTitle>
              <CardDescription>
                Insights to improve your quit strategy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Trigger pattern analysis</li>
                <li>• Mood tracking</li>
                <li>• Success rate metrics</li>
                <li>• Personalized recommendations</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Join Our Success Stories
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">10,000+</div>
              <p className="text-gray-600">People Helped</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">₹50M+</div>
              <p className="text-gray-600">Money Saved</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">95%</div>
              <p className="text-gray-600">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Quit Smoking for Good?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Start your journey today with our proven system and supportive community.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/signup">Get Started Free</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}