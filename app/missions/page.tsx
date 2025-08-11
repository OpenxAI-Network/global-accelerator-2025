"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MissionCard } from "@/components/mission-card"
import { LayoutHeader } from "@/components/layout-header"
import { mockMissions } from "@/lib/mock-data"
import { Target, Trophy, Zap, Plus, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function MissionsPage() {
  const activeMissions = mockMissions.filter((m) => !m.isCompleted)
  const completedMissions = mockMissions.filter((m) => m.isCompleted)

  const weeklyStats = {
    totalGXP: 1200,
    missionsCompleted: 3,
    currentStreak: 7,
    weeklyGoal: 2000,
  }

  const achievements = [
    { id: 1, name: "First Steps", description: "Complete your first mission", unlocked: true, icon: "🎯" },
    { id: 2, name: "AI Pioneer", description: "Complete 5 AI-related missions", unlocked: true, icon: "🤖" },
    { id: 3, name: "Design Master", description: "Complete 10 design missions", unlocked: false, icon: "🎨" },
    { id: 4, name: "Community Builder", description: "Help 50 other growthers", unlocked: false, icon: "👥" },
    { id: 5, name: "Streak Master", description: "Maintain a 30-day streak", unlocked: false, icon: "🔥" },
    { id: 6, name: "Innovation Leader", description: "Create 3 original missions", unlocked: false, icon: "💡" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <LayoutHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">Growth Missions</h1>
            <p className="text-slate-400 text-lg">Challenge yourself and earn GXP through meaningful tasks</p>
          </div>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Mission
          </Button>
        </div>

        {/* Weekly Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Weekly GXP</p>
                  <p className="text-2xl font-bold text-white">{weeklyStats.totalGXP}</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="mt-4">
                <Progress value={(weeklyStats.totalGXP / weeklyStats.weeklyGoal) * 100} className="h-2" />
                <p className="text-xs text-slate-400 mt-2">Goal: {weeklyStats.weeklyGoal} GXP</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-white">{weeklyStats.missionsCompleted}</p>
                </div>
                <Target className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-xs text-slate-400 mt-4">This week</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Current Streak</p>
                  <p className="text-2xl font-bold text-white">{weeklyStats.currentStreak}</p>
                </div>
                <div className="text-2xl">🔥</div>
              </div>
              <p className="text-xs text-slate-400 mt-4">Days active</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Rank</p>
                  <p className="text-2xl font-bold text-white">#47</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-xs text-green-400 mt-4">↑ 12 this week</p>
            </CardContent>
          </Card>
        </div>

        {/* Achievement Badges */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Trophy className="w-6 h-6 mr-3 text-yellow-500" />
            Achievement Badges
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`bg-slate-800/50 border-slate-700 transition-all duration-300 ${
                  achievement.unlocked
                    ? "hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/20"
                    : "opacity-50"
                }`}
              >
                <CardContent className="p-4 text-center">
                  <div className={`text-3xl mb-2 ${achievement.unlocked ? "" : "grayscale"}`}>{achievement.icon}</div>
                  <h3
                    className={`font-semibold text-sm mb-1 ${achievement.unlocked ? "text-white" : "text-slate-500"}`}
                  >
                    {achievement.name}
                  </h3>
                  <p className={`text-xs ${achievement.unlocked ? "text-slate-400" : "text-slate-600"}`}>
                    {achievement.description}
                  </p>
                  {achievement.unlocked && (
                    <Badge className="mt-2 bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                      Unlocked
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Missions Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-slate-800 border-slate-700">
            <TabsTrigger value="active" className="data-[state=active]:bg-purple-600">
              Active ({activeMissions.length})
            </TabsTrigger>
            <TabsTrigger value="suggested" className="data-[state=active]:bg-purple-600">
              Suggested
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-purple-600">
              Completed ({completedMissions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {activeMissions.map((mission) => (
                <MissionCard key={mission.id} mission={mission} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="suggested">
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {mockMissions.map((mission) => (
                <MissionCard key={mission.id} mission={mission} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {completedMissions.map((mission) => (
                <MissionCard key={mission.id} mission={mission} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Join Challenge Button */}
        <div className="mt-8">
          <Link href="/missions">
            <Button size="sm" variant="outline" className="border-orange-500/30 text-orange-400 bg-transparent">
              Join Challenge
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
