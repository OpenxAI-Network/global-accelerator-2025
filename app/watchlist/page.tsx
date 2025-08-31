"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GrowtherCard } from "@/components/growther-card"
import { LayoutHeader } from "@/components/layout-header"
import { mockGrowthers } from "@/lib/mock-data"
import { Eye, TrendingUp, Users, Search } from "lucide-react"
import Link from "next/link"

export default function WatchlistPage() {
  // Mock watchlist data - in real app, this would come from API
  const watchedGrowthers = mockGrowthers.slice(0, 2)

  const watchlistStats = {
    totalWatched: watchedGrowthers.length,
    avgGrowthRate: "+24.5%",
    totalValue: "4.2 YOLO",
    topPerformer: "Maya Rodriguez",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <LayoutHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-4 flex items-center">
              <Eye className="w-10 h-10 mr-4 text-purple-500" />
              My Watchlist
            </h1>
            <p className="text-slate-400 text-lg">Track the growthers you're interested in</p>
          </div>
          <Link href="/explore">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Search className="w-4 h-4 mr-2" />
              Discover More
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Watching</p>
                  <p className="text-2xl font-bold text-white">{watchlistStats.totalWatched}</p>
                </div>
                <Eye className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-xs text-slate-400 mt-4">Growthers tracked</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Avg Growth</p>
                  <p className="text-2xl font-bold text-green-400">{watchlistStats.avgGrowthRate}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-xs text-green-400 mt-4">↑ 5% this week</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Value</p>
                  <p className="text-2xl font-bold text-white">{watchlistStats.totalValue}</p>
                </div>
                <div className="text-2xl">💰</div>
              </div>
              <p className="text-xs text-slate-400 mt-4">If invested equally</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Top Performer</p>
                  <p className="text-lg font-bold text-white">{watchlistStats.topPerformer}</p>
                </div>
                <Users className="w-8 h-8 text-yellow-500" />
              </div>
              <p className="text-xs text-yellow-400 mt-4">+31% this week</p>
            </CardContent>
          </Card>
        </div>

        {/* Watchlist Content */}
        {watchedGrowthers.length > 0 ? (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {watchedGrowthers.map((growther) => (
              <GrowtherCard key={growther.id} {...growther} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Eye className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Your Watchlist is Empty</h3>
            <p className="text-slate-400 mb-4">Start following growthers to track their progress</p>
            <Link href="/explore">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Explore Growthers
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
