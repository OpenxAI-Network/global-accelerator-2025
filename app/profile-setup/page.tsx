"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LayoutHeader } from "@/components/layout-header"
import { User, Upload, ArrowRight, ArrowLeft, Check, Sparkles, Target } from "lucide-react"
import { useRouter } from "next/navigation"
import { getAuthState } from "@/lib/auth"

export default function ProfileSetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    avatar: "",
    displayName: "",
    bio: "",
    location: "",
    school: "",
    domain: "",
    interests: [] as string[],
    growthGoals: [] as string[],
  })
  
  // 获取用户数据并预填充表单
  useEffect(() => {
    const authState = getAuthState()
    if (authState.isAuthenticated && authState.user) {
      setFormData(prev => ({
        ...prev,
        avatar: authState.user.avatar || "",
        displayName: authState.user.name || "",
        bio: authState.user.bio || "",
        location: authState.user.location || "",
        school: authState.user.school || "",
        domain: authState.user.domain || "",
        interests: authState.user.tags || [],
      }))
    }
  }, [])

  const domains = [
    { id: "ai", label: "AI & Research", icon: "🤖" },
    { id: "design", label: "Design & UX", icon: "🎨" },
    { id: "blockchain", label: "Blockchain & DeFi", icon: "⛓️" },
    { id: "climate", label: "Climate & Impact", icon: "🌱" },
    { id: "entrepreneurship", label: "Entrepreneurship", icon: "🚀" },
    { id: "education", label: "Education", icon: "📚" },
  ]

  const interests = [
    "AI",
    "Web3",
    "Design",
    "DeFi",
    "OpenSource",
    "ClimaTech",
    "Research",
    "UX",
    "Entrepreneurship",
    "Community",
    "Art",
    "Music",
  ]

  const growthGoals = [
    "Build innovative products",
    "Lead a team",
    "Start a company",
    "Publish research",
    "Create art",
    "Make social impact",
    "Learn new skills",
    "Build community",
    "Mentor others",
  ]

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const handleGoalToggle = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      growthGoals: prev.growthGoals.includes(goal)
        ? prev.growthGoals.filter((g) => g !== goal)
        : [...prev.growthGoals, goal],
    }))
  }

  const handleSubmit = async () => {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    // 更新localStorage中的用户信息
    const authState = getAuthState()
    if (authState.isAuthenticated && authState.user) {
      // 在实际应用中，这里应该调用API更新用户信息
      // 这里只是模拟更新本地存储
      localStorage.setItem("isProfileComplete", "true")
    }
    
    // 跳转到成长记录页面或回到主页
    router.push("/growth-post")
  }

  const canProceedStep1 = formData.displayName && formData.bio && formData.domain
  const canProceedStep2 = formData.interests.length >= 3
  const canSubmit = formData.growthGoals.length >= 2

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <LayoutHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Complete Your Profile</h1>
          <p className="text-slate-400 text-lg">
            Tell us about yourself to create your YOLO stock and connect with the right community
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= stepNum ? "bg-purple-600 text-white" : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {step > stepNum ? <Check className="w-5 h-5" /> : stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-16 h-1 mx-2 ${step > stepNum ? "bg-purple-600" : "bg-slate-700"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-slate-400 text-sm">
            Step {step} of 3: {step === 1 ? "Basic Information" : step === 2 ? "Interests & Skills" : "Growth Goals"}
          </div>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-8">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Basic Information</h2>
                  <p className="text-slate-400">Help others understand who you are</p>
                </div>

                {/* Avatar Upload */}
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-24 h-24 border-4 border-purple-500">
                    <AvatarImage src={formData.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-2xl">
                      {formData.displayName ? formData.displayName[0] : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Avatar
                  </Button>
                </div>

                {/* Form Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Display Name *</label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
                      placeholder="Your name or handle"
                      className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="City, Country"
                      className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">School/University</label>
                    <input
                      type="text"
                      value={formData.school}
                      onChange={(e) => setFormData((prev) => ({ ...prev, school: e.target.value }))}
                      placeholder="Your educational institution"
                      className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Primary Domain *</label>
                    <select
                      value={formData.domain}
                      onChange={(e) => setFormData((prev) => ({ ...prev, domain: e.target.value }))}
                      className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none"
                    >
                      <option value="">Select your main focus area</option>
                      {domains.map((domain) => (
                        <option key={domain.id} value={domain.id}>
                          {domain.icon} {domain.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Bio & Introduction *</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself, your background, and what you're working on..."
                    rows={4}
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none resize-none"
                  />
                  <div className="text-xs text-slate-400 mt-1">{formData.bio.length}/500 characters</div>
                </div>

                <div className="flex justify-end">
                  <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => setStep(2)}
                    disabled={!canProceedStep1}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Interests & Skills */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Interests & Skills</h2>
                  <p className="text-slate-400">Select at least 3 areas you're passionate about</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                    Your Interests ({formData.interests.length}/12)
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {interests.map((interest) => (
                      <Button
                        key={interest}
                        variant="outline"
                        size="sm"
                        onClick={() => handleInterestToggle(interest)}
                        className={`transition-all ${
                          formData.interests.includes(interest)
                            ? "border-purple-500 bg-purple-500/20 text-purple-300"
                            : "border-slate-600 text-slate-300 hover:bg-purple-600 hover:border-purple-500 hover:text-white bg-transparent"
                        }`}
                      >
                        #{interest}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Selected Interests</h4>
                  {formData.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.interests.map((interest) => (
                        <Badge key={interest} className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                          #{interest}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">No interests selected yet</p>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300 bg-transparent"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => setStep(3)}
                    disabled={!canProceedStep2}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Growth Goals */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Growth Goals</h2>
                  <p className="text-slate-400">What do you want to achieve? Select at least 2 goals</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-green-400" />
                    Your Goals ({formData.growthGoals.length}/9)
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {growthGoals.map((goal) => (
                      <Button
                        key={goal}
                        variant="outline"
                        onClick={() => handleGoalToggle(goal)}
                        className={`justify-start h-auto p-4 transition-all ${
                          formData.growthGoals.includes(goal)
                            ? "border-green-500 bg-green-500/20 text-green-300"
                            : "border-slate-600 text-slate-300 hover:bg-green-600 hover:border-green-500 hover:text-white bg-transparent"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              formData.growthGoals.includes(goal) ? "border-green-500 bg-green-500" : "border-slate-400"
                            }`}
                          >
                            {formData.growthGoals.includes(goal) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span>{goal}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Your Growth Path</h4>
                  {formData.growthGoals.length > 0 ? (
                    <div className="space-y-2">
                      {formData.growthGoals.map((goal) => (
                        <div key={goal} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-slate-300 text-sm">{goal}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">No goals selected yet</p>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300 bg-transparent"
                    onClick={() => setStep(2)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                  >
                    Complete Profile
                    <Check className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
