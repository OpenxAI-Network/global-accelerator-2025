"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LayoutHeader } from "@/components/layout-header"
import { PenTool, ImageIcon, LinkIcon, Zap, Target, Trophy, ArrowRight, Sparkles, Calendar, Tag } from "lucide-react"
import { useRouter } from "next/navigation"

export default function GrowthPostPage() {
  const router = useRouter()
  const [postData, setPostData] = useState({
    title: "",
    content: "",
    category: "",
    tags: [] as string[],
    images: [] as string[],
    links: [] as string[],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = [
    { id: "achievement", label: "Achievement", icon: "🏆", color: "text-yellow-400" },
    { id: "learning", label: "Learning", icon: "📚", color: "text-blue-400" },
    { id: "project", label: "Project", icon: "🚀", color: "text-purple-400" },
    { id: "milestone", label: "Milestone", icon: "🎯", color: "text-green-400" },
    { id: "reflection", label: "Reflection", icon: "💭", color: "text-slate-400" },
    { id: "challenge", label: "Challenge", icon: "⚡", color: "text-orange-400" },
  ]

  const suggestedTags = [
    "AI",
    "Web3",
    "Design",
    "DeFi",
    "OpenSource",
    "Research",
    "Startup",
    "Learning",
    "Community",
    "Innovation",
    "Growth",
    "Success",
  ]

  const postTemplates = [
    {
      title: "🎯 Completed My First AI Project",
      content:
        "Just finished building my first machine learning model! Here's what I learned and the challenges I overcame...",
      category: "achievement",
      tags: ["AI", "Learning", "Success"],
    },
    {
      title: "📚 Learning Journey Update",
      content: "Week 3 of my blockchain development course. Today I deployed my first smart contract on testnet...",
      category: "learning",
      tags: ["Web3", "Learning", "Growth"],
    },
    {
      title: "🚀 Launching My Side Project",
      content: "After months of planning and development, I'm excited to share my new project with the community...",
      category: "project",
      tags: ["Startup", "Innovation", "Community"],
    },
  ]

  const handleTagToggle = (tag: string) => {
    setPostData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  const useTemplate = (template: (typeof postTemplates)[0]) => {
    setPostData((prev) => ({
      ...prev,
      title: template.title,
      content: template.content,
      category: template.category,
      tags: template.tags,
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    // 跳转回主页或显示成功消息
    router.push("/?post-created=true")
  }

  const canSubmit = postData.title && postData.content && postData.category

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <LayoutHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <PenTool className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Share Your Growth</h1>
          <p className="text-slate-400 text-lg">
            Document your journey and inspire others. Your first post unlocks the ability to create your YOLO stock!
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium">Almost Ready to Launch!</h3>
                <p className="text-slate-400 text-sm">Complete this step to unlock your YOLO stock creation</p>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Final Step</Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <h2 className="text-2xl font-bold text-white">Create Your Growth Post</h2>
                <p className="text-slate-400">Share an achievement, learning, or milestone from your journey</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Post Category *</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant="outline"
                        onClick={() => setPostData((prev) => ({ ...prev, category: category.id }))}
                        className={`h-auto p-4 transition-all ${
                          postData.category === category.id
                            ? "border-purple-500 bg-purple-500/20 text-purple-300"
                            : "border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">{category.icon}</div>
                          <div className="text-sm font-medium">{category.label}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Post Title *</label>
                  <input
                    type="text"
                    value={postData.title}
                    onChange={(e) => setPostData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="What's your growth story about?"
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Your Story *</label>
                  <textarea
                    value={postData.content}
                    onChange={(e) => setPostData((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="Share your experience, what you learned, challenges you overcame, or milestones you achieved..."
                    rows={8}
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none resize-none"
                  />
                  <div className="text-xs text-slate-400 mt-1">{postData.content.length}/1000 characters</div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Tags ({postData.tags.length}/5)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.map((tag) => (
                      <Button
                        key={tag}
                        variant="outline"
                        size="sm"
                        onClick={() => handleTagToggle(tag)}
                        disabled={!postData.tags.includes(tag) && postData.tags.length >= 5}
                        className={`transition-all ${
                          postData.tags.includes(tag)
                            ? "border-purple-500 bg-purple-500/20 text-purple-300"
                            : "border-slate-600 text-slate-300 hover:bg-purple-600 hover:border-purple-500 hover:text-white bg-transparent"
                        }`}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Media Upload */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-24 border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent border-dashed"
                  >
                    <div className="text-center">
                      <ImageIcon className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm">Add Images</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent border-dashed"
                  >
                    <div className="text-center">
                      <LinkIcon className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm">Add Links</div>
                    </div>
                  </Button>
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-slate-700">
                  <Button
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                  >
                    {isSubmitting ? "Publishing..." : "Publish Growth Post"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Templates */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <h3 className="text-lg font-bold text-white flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                  Quick Templates
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {postTemplates.map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => useTemplate(template)}
                    className="w-full h-auto p-3 text-left border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                  >
                    <div>
                      <div className="font-medium text-sm mb-1">{template.title}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <h3 className="text-lg font-bold text-white flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-400" />
                  Growth Post Tips
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <span className="text-slate-300">Be specific about what you learned or achieved</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <span className="text-slate-300">Share challenges you overcame</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <span className="text-slate-300">Include relevant tags to reach the right audience</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <span className="text-slate-300">Add images or links to showcase your work</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rewards */}
            <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <h4 className="text-white font-medium">First Post Rewards</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-slate-300">+50 GXP for your first post</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-slate-300">Unlock YOLO stock creation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-slate-300">Join the growth community</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
