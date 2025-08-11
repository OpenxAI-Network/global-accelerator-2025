import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TrendingUp, Trophy, Star, Globe, GraduationCap } from "lucide-react"

interface LeaderboardUser {
  name: string
  avatar: string
  value: string | number
  change: string
  badge?: string
  country?: string
  school?: string
}

interface LeaderboardTabsProps {
  gxpRankers: LeaderboardUser[]
  yoloSurge: LeaderboardUser[]
  risingStars: LeaderboardUser[]
  newcomers: LeaderboardUser[]
  bySchool: LeaderboardUser[]
}

export function LeaderboardTabs({ gxpRankers, yoloSurge, risingStars, newcomers, bySchool }: LeaderboardTabsProps) {
  const renderLeaderboardItem = (user: LeaderboardUser, index: number, type: string) => (
    <div
      key={index}
      className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
            index === 0
              ? "bg-gradient-to-r from-yellow-500 to-orange-500"
              : index === 1
                ? "bg-gradient-to-r from-gray-400 to-gray-500"
                : index === 2
                  ? "bg-gradient-to-r from-orange-600 to-yellow-600"
                  : "bg-slate-600"
          }`}
        >
          {index + 1}
        </div>
        <Avatar className="w-10 h-10">
          <AvatarImage src={user.avatar || "/placeholder.svg"} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <span className="text-white font-medium">{user.name}</span>
          {user.country && (
            <div className="flex items-center text-xs text-slate-400 mt-1">
              <Globe className="w-3 h-3 mr-1" />
              {user.country}
            </div>
          )}
          {user.school && (
            <div className="flex items-center text-xs text-slate-400 mt-1">
              <GraduationCap className="w-3 h-3 mr-1" />
              {user.school}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <span
            className={`font-bold ${
              type === "gxp"
                ? "text-yellow-400"
                : type === "yolo"
                  ? "text-purple-400"
                  : type === "rising"
                    ? "text-green-400"
                    : type === "newcomer"
                      ? "text-blue-400"
                      : "text-indigo-400"
            }`}
          >
            {user.value}
          </span>
          {user.badge && <div className="text-xs text-slate-400 mt-1">{user.badge}</div>}
        </div>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{user.change}</Badge>
      </div>
    </div>
  )

  return (
    <Tabs defaultValue="gxp" className="w-full">
      <TabsList className="grid w-full grid-cols-5 bg-slate-800 border-slate-700">
        <TabsTrigger value="gxp" className="data-[state=active]:bg-purple-600 text-xs">
          <Trophy className="w-4 h-4 mr-1" />
          GXP Rank
        </TabsTrigger>
        <TabsTrigger value="yolo" className="data-[state=active]:bg-purple-600 text-xs">
          <TrendingUp className="w-4 h-4 mr-1" />
          YOLO Surge
        </TabsTrigger>
        <TabsTrigger value="rising" className="data-[state=active]:bg-purple-600 text-xs">
          <Star className="w-4 h-4 mr-1" />
          Rising Stars
        </TabsTrigger>
        <TabsTrigger value="newcomers" className="data-[state=active]:bg-purple-600 text-xs">
          Newcomers
        </TabsTrigger>
        <TabsTrigger value="school" className="data-[state=active]:bg-purple-600 text-xs">
          <GraduationCap className="w-4 h-4 mr-1" />
          By School
        </TabsTrigger>
      </TabsList>

      <TabsContent value="gxp">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="space-y-4">
              {gxpRankers.map((user, index) => renderLeaderboardItem(user, index, "gxp"))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="yolo">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="space-y-4">
              {yoloSurge.map((user, index) => renderLeaderboardItem(user, index, "yolo"))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="rising">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="space-y-4">
              {risingStars.map((user, index) => renderLeaderboardItem(user, index, "rising"))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="newcomers">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="space-y-4">
              {newcomers.map((user, index) => renderLeaderboardItem(user, index, "newcomer"))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="school">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="space-y-4">
              {bySchool.map((user, index) => renderLeaderboardItem(user, index, "school"))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
