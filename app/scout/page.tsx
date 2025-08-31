"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LayoutHeader } from "@/components/layout-header"
import { mockTokenPositions, mockGrowthers } from "@/lib/mock-data"
import { Eye, TrendingUp, TrendingDown, DollarSign, Users, Bell, Plus, Activity } from "lucide-react"
import Link from "next/link"

export default function ScoutPage() {
  const portfolioValue = "12.4 ETH"
  const totalGainLoss = "+3.2 ETH"
  const gainLossPercent = "+34.7%"

  const watchedGrowthers = mockGrowthers.slice(0, 3)

  const recentActivity = [
    {
      id: 1,
      growther: "Alex Chen",
      avatar: "/placeholder.svg?height=32&width=32",
      action: "completed AI Model Optimization challenge",
      impact: "GXP +500, Price impact: +8%",
      time: "2 hours ago",
      type: "achievement",
    },
    {
      id: 2,
      growther: "Maya Rodriguez",
      avatar: "/placeholder.svg?height=32&width=32",
      action: "joined Design Leadership Circle",
      impact: "New collaboration opportunities",
      time: "5 hours ago",
      type: "community",
    },
    {
      id: 3,
      growther: "David Kim",
      avatar: "/placeholder.svg?height=32&width=32",
      action: "received investment from @TechVC",
      impact: "Price impact: +12%",
      time: "1 day ago",
      type: "investment",
    },
  ]

  const marketInsights = [
    {
      title: "AI Sector Trending",
      description: "AI-focused growthers showing 23% average growth this week",
      trend: "up",
      impact: "High",
    },
    {
      title: "New Talent Emerging",
      description: "15 new growthers joined with strong potential indicators",
      trend: "up",
      impact: "Medium",
    },
    {
      title: "DeFi Consolidation",
      description: "DeFi sector showing slower growth, potential buying opportunity",
      trend: "down",
      impact: "Low",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <LayoutHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">Scout Dashboard</h1>
            <p className="text-slate-400 text-lg">Track your investments and discover emerging talent</p>
          </div>
          <div className="flex space-x-3" style={{ display: 'none' }}>
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent">
              <Bell className="w-4 h-4 mr-2" />
              Alerts
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              Add to Watchlist
            </Button>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Portfolio Value</p>
                  <p className="text-2xl font-bold text-white">{portfolioValue}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-xs text-green-400 mt-4">↑ 12% this month</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Gain/Loss</p>
                  <p className="text-2xl font-bold text-green-400">{totalGainLoss}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-xs text-green-400 mt-4">{gainLossPercent}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Positions</p>
                  <p className="text-2xl font-bold text-white">{mockTokenPositions.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-xs text-slate-400 mt-4">Active investments</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700" style={{ display: 'none' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Watchlist</p>
                  <p className="text-2xl font-bold text-white">{watchedGrowthers.length}</p>
                </div>
                <Eye className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-xs text-slate-400 mt-4">Tracked growthers</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Portfolio & Watchlist */}
          <div className="lg:col-span-2 space-y-8">
            {/* Portfolio Positions */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <DollarSign className="w-6 h-6 mr-3 text-green-500" />
                Portfolio Positions
              </h2>
              <div className="space-y-4">
                {mockTokenPositions.map((position) => (
                  <Card key={position.growtherId} className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-12 h-12 border-2 border-purple-500">
                            <AvatarImage src="/placeholder.svg?height=48&width=48" />
                            <AvatarFallback>{position.growtherName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <Link href={`/growther/${position.growtherId}`}>
                              <h3 className="text-white font-semibold hover:text-purple-300 transition-colors cursor-pointer">
                                {position.growtherName}
                              </h3>
                            </Link>
                            <p className="text-slate-400 text-sm">{position.amount} tokens</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="text-slate-400 text-xs">Avg Price</p>
                              <p className="text-white text-sm">{position.avgPrice}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 text-xs">Current</p>
                              <p className="text-white text-sm">{position.currentPrice}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 text-xs">Gain/Loss</p>
                              <div className="flex items-center space-x-2">
                                <p className="text-green-400 text-sm font-semibold">{position.gainLoss}</p>
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                  {position.gainLossPercent}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Watchlist */}
            <div style={{ display: 'none' }}>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Eye className="w-6 h-6 mr-3 text-purple-500" />
                Watchlist
              </h2>
              <div className="space-y-4">
                {watchedGrowthers.map((growther) => (
                  <Card
                    key={growther.id}
                    className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-12 h-12 border-2 border-purple-500">
                            <AvatarImage src={growther.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{growther.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <Link href={`/growther/${growther.id}`}>
                              <h3 className="text-white font-semibold hover:text-purple-300 transition-colors cursor-pointer">
                                {growther.name}
                              </h3>
                            </Link>
                            <p className="text-slate-400 text-sm">{growther.tagline}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-yellow-400 text-sm">{growther.gxp} GXP</span>
                              <span className="text-blue-400 text-sm">{growther.supporters} supporters</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-purple-400 font-bold text-lg">{growther.yoloPrice}</p>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            {growther.growthRate}
                          </Badge>
                          <div className="flex space-x-2 mt-3">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                              Invest
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-600 text-slate-300 bg-transparent"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Activity & Insights */}
          <div className="space-y-8">
            {/* Recent Activity */}
            <div>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <Activity className="w-5 h-5 mr-3 text-green-500" />
                Recent Activity
              </h2>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-700/30 transition-colors"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={activity.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{activity.growther[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-white text-sm">
                            <span className="font-medium text-purple-300">{activity.growther}</span> {activity.action}
                          </p>
                          <p className="text-green-400 text-xs mt-1">{activity.impact}</p>
                          <p className="text-slate-400 text-xs mt-1">{activity.time}</p>
                        </div>
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            activity.type === "achievement"
                              ? "bg-green-500"
                              : activity.type === "community"
                                ? "bg-blue-500"
                                : "bg-purple-500"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Market Insights */}
            <div>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-3 text-blue-500" />
                Market Insights
              </h2>
              <div className="space-y-4">
                {marketInsights.map((insight, index) => (
                  <Card key={index} className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-medium text-sm mb-1">{insight.title}</h3>
                          <p className="text-slate-400 text-xs">{insight.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {insight.trend === "up" ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                          <Badge
                            className={`text-xs ${
                              insight.impact === "High"
                                ? "bg-red-500/20 text-red-400 border-red-500/30"
                                : insight.impact === "Medium"
                                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                  : "bg-green-500/20 text-green-400 border-green-500/30"
                            }`}
                          >
                            {insight.impact}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
