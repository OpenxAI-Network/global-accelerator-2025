"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CircleCard } from "@/components/circle-card"
import { LayoutHeader } from "@/components/layout-header"
import { mockCircles } from "@/lib/mock-data"
import { Users, Plus, TrendingUp, Star, Search } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function CirclesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const myCircles = mockCircles.filter((c) => c.isJoined)
  const recommendedCircles = mockCircles.filter((c) => !c.isJoined)

  const filteredCircles = mockCircles.filter(
    (circle) =>
      circle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      circle.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      circle.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const popularTags = [
    "AI",
    "Web3",
    "Design",
    "Blockchain",
    "DeFi",
    "OpenSource",
    "Research",
    "UX",
    "Community",
    "Innovation",
  ]

  const circleStats = {
    totalMembers: 2773,
    activeDiscussions: 47,
    weeklyEvents: 12,
    newConnections: 23,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <LayoutHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">Growth Circles</h1>
            <p className="text-slate-400 text-lg">
              Join communities of like-minded growthers and accelerate your journey
            </p>
          </div>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Circle
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Members</p>
                  <p className="text-2xl font-bold text-white">{circleStats.totalMembers.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-xs text-slate-400 mt-4">Across all circles</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Discussions</p>
                  <p className="text-2xl font-bold text-white">{circleStats.activeDiscussions}</p>
                </div>
                <div className="text-2xl">💬</div>
              </div>
              <p className="text-xs text-green-400 mt-4">↑ 15% this week</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Weekly Events</p>
                  <p className="text-2xl font-bold text-white">{circleStats.weeklyEvents}</p>
                </div>
                <div className="text-2xl">📅</div>
              </div>
              <p className="text-xs text-slate-400 mt-4">Upcoming this week</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">New Connections</p>
                  <p className="text-2xl font-bold text-white">{circleStats.newConnections}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-xs text-slate-400 mt-4">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Popular Tags */}
        <div className="mb-8 space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search circles by name, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-700 text-white pl-12 pr-4 py-3 rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              Popular Topics
            </h2>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-purple-600 hover:border-purple-500 hover:text-white bg-transparent"
                  onClick={() => setSearchQuery(tag)}
                >
                  #{tag}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Circles Tabs */}
        <Tabs defaultValue="recommended" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-slate-800 border-slate-700">
            <TabsTrigger value="recommended" className="data-[state=active]:bg-purple-600">
              Recommended
            </TabsTrigger>
            <TabsTrigger value="my-circles" className="data-[state=active]:bg-purple-600">
              My Circles ({myCircles.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">
              All Circles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommended">
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {recommendedCircles.map((circle) => (
                <CircleCard key={circle.id} circle={circle} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-circles">
            {myCircles.length > 0 ? (
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {myCircles.map((circle) => (
                  <CircleCard key={circle.id} circle={circle} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Circles Joined Yet</h3>
                <p className="text-slate-400 mb-4">
                  Join your first circle to start connecting with like-minded growthers
                </p>
                <Link href="/circles">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Explore Circles
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="all">
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {(searchQuery ? filteredCircles : mockCircles).map((circle) => (
                <CircleCard key={circle.id} circle={circle} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* No Results */}
        {searchQuery && filteredCircles.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Circles Found</h3>
            <p className="text-slate-400 mb-4">Try adjusting your search terms or explore popular topics</p>
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
