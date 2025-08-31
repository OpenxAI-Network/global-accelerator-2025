"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { TrendingUp, DollarSign, Zap, Star, ArrowUpRight, Trophy, Users, Crown, Rocket } from "lucide-react"
import Link from "next/link"

interface RankingUser {
  id: string
  name: string
  avatar: string
  value: string | number
  change: string
  price: string
  marketCap?: string
  badge?: string
  country?: string
  school?: string
}

interface RankingTabsProps {
  priceRising: RankingUser[]
  marketCap: RankingUser[]
  gxpLeaders: RankingUser[]
  hotNewcomers: RankingUser[]
  topPerformers: RankingUser[]
  mostSupported: RankingUser[]
  innovators: RankingUser[]
  globalRising: RankingUser[]
}

export function RankingTabs({
  priceRising = [],
  marketCap = [],
  gxpLeaders = [],
  hotNewcomers = [],
  topPerformers = [],
  mostSupported = [],
  innovators = [],
  globalRising = [],
}: RankingTabsProps) {
  const renderRankingItem = (user: RankingUser, index: number, showPrice = true) => (
    <div
      key={user.id || index}
      className="flex items-center justify-between p-4 rounded-lg bg-gray-900/50 hover:bg-gray-900/70 transition-colors group"
    >
      <div className="flex items-center space-x-4">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
            index === 0
              ? "bg-gradient-to-r from-yellow-500 to-orange-500"
              : index === 1
                ? "bg-gradient-to-r from-gray-300 to-gray-400"
                : index === 2
                  ? "bg-gradient-to-r from-orange-600 to-yellow-600"
                  : "bg-gray-800"
          }`}
        >
          {index + 1}
        </div>
        <Avatar className="w-12 h-12 border-2 border-purple-500/30">
          <AvatarImage src={user.avatar || "/placeholder.svg"} />
          <AvatarFallback>{user.name?.[0] || "?"}</AvatarFallback>
        </Avatar>
        <div>
          <Link href={`/growther/${user.id}`}>
            <span className="text-slate-100 font-medium hover:text-purple-300 transition-colors cursor-pointer">
              {user.name}
            </span>
          </Link>
          {user.country && (
            <div className="flex items-center text-xs text-slate-300 mt-1">
              <span>{user.country}</span>
              {user.school && <span className="ml-2">• {user.school}</span>}
            </div>
          )}
          {user.badge && (
            <Badge className="mt-1 bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">{user.badge}</Badge>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-right">
          <div className="text-slate-100 font-bold">{user.value}</div>
          {showPrice && user.price && <div className="text-purple-300 text-sm font-mono">{user.price}</div>}
          {user.marketCap && <div className="text-slate-300 text-xs">Cap: {user.marketCap}</div>}
        </div>

        <div className="flex items-center space-x-2">
          <Badge
            className={`${
              user.change?.startsWith("+")
                ? "bg-green-500/20 text-green-300 border-green-500/30"
                : "bg-red-500/20 text-red-300 border-red-500/30"
            }`}
          >
            {user.change || "0%"}
          </Badge>

          <Link href={`/growther/${user.id}`}>
            <Button
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ArrowUpRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <Tabs defaultValue="price-rising" className="w-full">
      <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-gray-900 border-gray-800">
        <TabsTrigger value="price-rising" className="data-[state=active]:bg-purple-600 text-xs text-slate-200">
          <TrendingUp className="w-3 h-3 mr-1" />📈 Rising
        </TabsTrigger>
        <TabsTrigger value="market-cap" className="data-[state=active]:bg-purple-600 text-xs text-slate-200">
          <DollarSign className="w-3 h-3 mr-1" />💰 Market Cap
        </TabsTrigger>
        <TabsTrigger value="gxp-leaders" className="data-[state=active]:bg-purple-600 text-xs text-slate-200">
          <Zap className="w-3 h-3 mr-1" />⚡ GXP Leaders
        </TabsTrigger>
        <TabsTrigger value="newcomers" className="data-[state=active]:bg-purple-600 text-xs text-slate-200">
          <Star className="w-3 h-3 mr-1" />🔥 Hot Newcomers
        </TabsTrigger>
        <TabsTrigger value="top-performers" className="data-[state=active]:bg-purple-600 text-xs text-slate-200">
          <Trophy className="w-3 h-3 mr-1" />🏆 Top Performers
        </TabsTrigger>
        <TabsTrigger value="most-supported" className="data-[state=active]:bg-purple-600 text-xs text-slate-200">
          <Users className="w-3 h-3 mr-1" />👥 Most Supported
        </TabsTrigger>
        <TabsTrigger value="innovators" className="data-[state=active]:bg-purple-600 text-xs text-slate-200">
          <Rocket className="w-3 h-3 mr-1" />🚀 Innovators
        </TabsTrigger>
        <TabsTrigger value="global-rising" className="data-[state=active]:bg-purple-600 text-xs text-slate-200">
          <Crown className="w-3 h-3 mr-1" />🌍 Global Rising
        </TabsTrigger>
      </TabsList>

      <TabsContent value="price-rising">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="space-y-4">
              {priceRising.length > 0 ? (
                priceRising.map((user, index) => renderRankingItem(user, index, true))
              ) : (
                <div className="text-center py-8 text-slate-400">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="market-cap">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="space-y-4">
              {marketCap.length > 0 ? (
                marketCap.map((user, index) => renderRankingItem(user, index, true))
              ) : (
                <div className="text-center py-8 text-slate-400">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="gxp-leaders">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="space-y-4">
              {gxpLeaders.length > 0 ? (
                gxpLeaders.map((user, index) => renderRankingItem(user, index, false))
              ) : (
                <div className="text-center py-8 text-slate-400">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="newcomers">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="space-y-4">
              {hotNewcomers.length > 0 ? (
                hotNewcomers.map((user, index) => renderRankingItem(user, index, true))
              ) : (
                <div className="text-center py-8 text-slate-400">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="top-performers">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="space-y-4">
              {topPerformers.length > 0 ? (
                topPerformers.map((user, index) => renderRankingItem(user, index, true))
              ) : (
                <div className="text-center py-8 text-slate-400">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="most-supported">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="space-y-4">
              {mostSupported.length > 0 ? (
                mostSupported.map((user, index) => renderRankingItem(user, index, true))
              ) : (
                <div className="text-center py-8 text-slate-400">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="innovators">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="space-y-4">
              {innovators.length > 0 ? (
                innovators.map((user, index) => renderRankingItem(user, index, true))
              ) : (
                <div className="text-center py-8 text-slate-400">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="global-rising">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="space-y-4">
              {globalRising.length > 0 ? (
                globalRising.map((user, index) => renderRankingItem(user, index, true))
              ) : (
                <div className="text-center py-8 text-slate-400">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
