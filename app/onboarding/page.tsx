"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { Rocket, Zap, Users, TrendingUp, ArrowRight, Sparkles } from "lucide-react"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [userType, setUserType] = useState<"growther" | "investor" | null>(null)

  const handleGetStarted = () => {
    // In a real app, this would create the user's YOLO token and redirect to their profile
    window.location.href = "/me"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {step === 1 && (
          <Card className="bg-slate-800/50 border-slate-700 text-center">
            <CardHeader className="pb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Welcome to YOLO</h1>
              <p className="text-xl text-slate-300 mb-2">Your Growth is also a Stock</p>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mx-auto">
                <Sparkles className="w-4 h-4 mr-2" />
                Web2.5 Growth Asset Platform
              </Badge>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <Card
                  className={`bg-slate-700/50 border-slate-600 cursor-pointer transition-all hover:border-purple-500/50 ${
                    userType === "growther" ? "border-purple-500 bg-purple-500/10" : ""
                  }`}
                  onClick={() => setUserType("growther")}
                >
                  <CardContent className="p-6 text-center">
                    <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">I'm a Growther</h3>
                    <p className="text-slate-400 text-sm">
                      I want to showcase my growth, complete missions, and let others invest in my potential
                    </p>
                    <div className="mt-4 space-y-2">
                      <div className="text-xs text-slate-500">• Create your YOLO token</div>
                      <div className="text-xs text-slate-500">• Complete growth missions</div>
                      <div className="text-xs text-slate-500">• Build your reputation</div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`bg-slate-700/50 border-slate-600 cursor-pointer transition-all hover:border-purple-500/50 ${
                    userType === "investor" ? "border-purple-500 bg-purple-500/10" : ""
                  }`}
                  onClick={() => setUserType("investor")}
                >
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">I'm an Investor</h3>
                    <p className="text-slate-400 text-sm">
                      I want to discover talent, invest in promising individuals, and track their growth
                    </p>
                    <div className="mt-4 space-y-2">
                      <div className="text-xs text-slate-500">• Discover rising talent</div>
                      <div className="text-xs text-slate-500">• Build investment portfolio</div>
                      <div className="text-xs text-slate-500">• Track growth metrics</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-500" />
                  Getting Started Bonus
                </h3>
                <p className="text-slate-300 text-sm mb-4">
                  Every new user receives <span className="text-purple-400 font-semibold">5,000 YOLO tokens</span> to
                  start investing in others or supporting the community.
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-purple-400">5,000</div>
                    <div className="text-xs text-slate-400">Starting YOLO</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">0</div>
                    <div className="text-xs text-slate-400">Initial GXP</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">Free</div>
                    <div className="text-xs text-slate-400">Platform Access</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  onClick={() => setStep(2)}
                  disabled={!userType}
                >
                  Continue
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="bg-slate-800/50 border-slate-700 text-center">
            <CardHeader>
              <h2 className="text-3xl font-bold text-white mb-4">
                {userType === "growther" ? "Create Your Growth Token" : "Start Investing"}
              </h2>
              <p className="text-slate-300">
                {userType === "growther"
                  ? "Your YOLO token represents your growth potential and allows others to invest in your journey."
                  : "Discover promising individuals and invest in their growth potential."}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {userType === "growther" && (
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Your Token Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Initial Price</label>
                      <div className="text-lg font-semibold text-purple-400">0.01 ETH</div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Total Supply</label>
                      <div className="text-lg font-semibold text-white">10,000 YOLO</div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Your Holdings</label>
                      <div className="text-lg font-semibold text-white">5,000 YOLO (50%)</div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Available for Sale</label>
                      <div className="text-lg font-semibold text-white">5,000 YOLO (50%)</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-left space-y-4">
                <h3 className="text-lg font-semibold text-white">What happens next?</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      1
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {userType === "growther" ? "Complete your profile" : "Explore growthers"}
                      </div>
                      <div className="text-slate-400 text-sm">
                        {userType === "growther"
                          ? "Add your bio, skills, and goals to attract supporters"
                          : "Browse through talented individuals and their growth journeys"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      2
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {userType === "growther" ? "Start completing missions" : "Make your first investment"}
                      </div>
                      <div className="text-slate-400 text-sm">
                        {userType === "growther"
                          ? "Earn GXP and increase your token value through challenges"
                          : "Use your 5,000 YOLO tokens to support promising growthers"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      3
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {userType === "growther" ? "Build your community" : "Track your portfolio"}
                      </div>
                      <div className="text-slate-400 text-sm">
                        {userType === "growther"
                          ? "Join circles and connect with like-minded individuals"
                          : "Monitor your investments and discover new opportunities"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-slate-600 text-slate-300 bg-transparent"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  onClick={handleGetStarted}
                >
                  {userType === "growther" ? "Create My Token" : "Start Exploring"}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
