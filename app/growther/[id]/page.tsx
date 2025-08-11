"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutHeader } from "@/components/layout-header"
import { mockGrowthers, mockTimelineEvents, getUserPosts } from "@/lib/mock-data"
import {
  Users,
  Zap,
  Heart,
  Share2,
  MessageCircle,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  GraduationCap,
  Briefcase,
  Calendar,
  Trophy,
  Target,
  Activity,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import type { Post } from "@/lib/types"

export default function GrowtherDetailPage() {
  const params = useParams()
  const id = params.id as string

  // Find growther by ID (in real app, this would be an API call)
  const growther = mockGrowthers.find((g) => g.id === id) || mockGrowthers[0]

  const [selectedTimeframe, setSelectedTimeframe] = useState("1W")
  const [investAmount, setInvestAmount] = useState(100)
  const [isInvesting, setIsInvesting] = useState(false)
  const [userPosts, setUserPosts] = useState<Post[]>([])

  // Mock price data for chart
  const priceHistory = {
    "1D": [0.42, 0.43, 0.41, 0.44, 0.45, 0.46, 0.45],
    "1W": [0.38, 0.4, 0.42, 0.41, 0.43, 0.44, 0.45],
    "1M": [0.32, 0.35, 0.38, 0.36, 0.4, 0.42, 0.45],
    "3M": [0.25, 0.28, 0.32, 0.3, 0.35, 0.4, 0.45],
  }

  const currentPrice = Number.parseFloat(growther.yoloPrice.replace(" YOLO", ""))
  const priceChange = Number.parseFloat(growther.growthRate.replace("+", "").replace("%", ""))
  const isPositive = priceChange > 0

  const supporters = [
    { name: "Alice Chen", avatar: "/placeholder.svg?height=32&width=32", amount: "50 YOLO", date: "2 days ago" },
    { name: "Bob Wilson", avatar: "/placeholder.svg?height=32&width=32", amount: "25 YOLO", date: "1 week ago" },
    { name: "Carol Davis", avatar: "/placeholder.svg?height=32&width=32", amount: "75 YOLO", date: "2 weeks ago" },
    { name: "David Kim", avatar: "/placeholder.svg?height=32&width=32", amount: "100 YOLO", date: "3 weeks ago" },
  ]

  const handleInvest = () => {
    setIsInvesting(true)
    // Simulate API call
    setTimeout(() => {
      setIsInvesting(false)
      // Show success message or update UI
    }, 2000)
  }

  // 加载用户帖子
  useEffect(() => {
    const posts = getUserPosts(id)
    setUserPosts(posts)
  }, [id])

  // 点赞功能
  const handleLike = (postId: string) => {
    const updatedPosts = userPosts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    )
    setUserPosts(updatedPosts)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <LayoutHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Left - Profile Info */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-8">
                <div className="flex items-start space-x-6">
                  <Avatar className="w-24 h-24 border-4 border-purple-500">
                    <AvatarImage src={growther.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-2xl">{growther.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h1 className="text-3xl font-bold text-white">{growther.name}</h1>
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Verified Growther</Badge>
                    </div>
                    <p className="text-lg text-slate-300 mb-4">{growther.tagline}</p>
                    <p className="text-slate-400 mb-4 leading-relaxed">{growther.bio}</p>

                    <div className="flex items-center space-x-6 text-sm text-slate-400 mb-4">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{growther.country}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <GraduationCap className="w-4 h-4" />
                        <span>{growther.school}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{growther.domain}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {new Date(growther.joinedDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {growther.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-slate-700 text-slate-300">
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        <span className="text-white font-semibold">{growther.gxp.toLocaleString()} GXP</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        <span className="text-slate-300">{growther.supporters} supporters</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-5 h-5 text-orange-500" />
                        <span className="text-slate-300">Rank #47</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right - Price & Trading */}
          <div>
            <Card className="bg-slate-800/50 border-slate-700 sticky top-24">
              <CardHeader>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">{growther.yoloPrice}</div>
                  <div
                    className={`flex items-center justify-center space-x-2 ${isPositive ? "text-green-400" : "text-red-400"}`}
                  >
                    {isPositive ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    <span className="text-lg font-semibold">{growther.growthRate}</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">24h change</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Investment Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Investment Amount</label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 bg-transparent"
                      onClick={() => setInvestAmount(Math.max(10, investAmount - 10))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 text-center">
                      <input
                        type="number"
                        value={investAmount}
                        onChange={(e) => setInvestAmount(Number(e.target.value))}
                        className="w-full bg-slate-700 text-white text-center py-2 rounded border border-slate-600 focus:border-purple-500 focus:outline-none"
                      />
                      <p className="text-xs text-slate-400 mt-1">≈ {(investAmount * currentPrice).toFixed(1)} YOLO</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 bg-transparent"
                      onClick={() => setInvestAmount(investAmount + 10)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Buy/Sell Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    onClick={handleInvest}
                    disabled={isInvesting}
                  >
                    {isInvesting ? "Investing..." : "Buy"}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white bg-transparent"
                  >
                    Sell
                  </Button>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 bg-transparent">
                    <Heart className="w-4 h-4 mr-1" />
                    Like
                  </Button>
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 bg-transparent">
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 bg-transparent">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Chat
                  </Button>
                </div>

                {/* Market Stats */}
                <div className="space-y-3 pt-4 border-t border-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400">市值</span>
                    <span className="text-white">{(currentPrice * 10000).toFixed(0)} YOLO</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">总发行量</span>
                    <span className="text-white">10,000 股</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">持有人数</span>
                    <span className="text-white">{growther.supporters}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Price Chart */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Price Chart</h2>
              <div className="flex space-x-2">
                {["1D", "1W", "1M", "3M"].map((timeframe) => (
                  <Button
                    key={timeframe}
                    variant={selectedTimeframe === timeframe ? "default" : "outline"}
                    size="sm"
                    className={
                      selectedTimeframe === timeframe
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "border-slate-600 text-slate-300 bg-transparent hover:bg-slate-700"
                    }
                    onClick={() => setSelectedTimeframe(timeframe)}
                  >
                    {timeframe}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Simple Chart Placeholder */}
            <div className="h-64 bg-slate-700/30 rounded-lg flex items-center justify-center relative overflow-hidden">
              <svg width="100%" height="100%" className="absolute inset-0">
                <defs>
                  <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polyline
                  fill="url(#priceGradient)"
                  stroke="#10b981"
                  strokeWidth="2"
                  points={priceHistory[selectedTimeframe as keyof typeof priceHistory]
                    .map((price, index) => {
                      const x =
                        (index / (priceHistory[selectedTimeframe as keyof typeof priceHistory].length - 1)) * 100
                      const y = 100 - ((price - 0.2) / (0.5 - 0.2)) * 80
                      return `${x},${y}`
                    })
                    .join(" ")}
                />
              </svg>
              <div className="text-slate-400 text-sm">
                Interactive chart will be implemented with Chart.js or TradingView
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="timeline" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-4 bg-slate-800 border-slate-700">
            <TabsTrigger value="timeline" className="data-[state=active]:bg-purple-600">
              <Activity className="w-4 h-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="posts" className="data-[state=active]:bg-purple-600">
              <MessageCircle className="w-4 h-4 mr-2" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="supporters" className="data-[state=active]:bg-purple-600">
              <Users className="w-4 h-4 mr-2" />
              Supporters
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-purple-600">
              <Target className="w-4 h-4 mr-2" />
              Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <h2 className="text-xl font-bold text-white">Growth Timeline</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockTimelineEvents.map((event) => (
                    <div key={event.id} className="flex items-start space-x-4 p-4 rounded-lg bg-slate-700/30">
                      <div className="text-2xl">{event.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{event.title}</h3>
                        <p className="text-slate-400 text-sm mt-1">{event.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-slate-500 text-xs">{new Date(event.date).toLocaleDateString()}</span>
                          {event.gxpEarned && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                              +{event.gxpEarned} GXP
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-semibold ${isPositive ? "text-green-400" : "text-red-400"}`}>
                          {isPositive ? "+" : ""}
                          {(Math.random() * 10).toFixed(1)}%
                        </div>
                        <div className="text-xs text-slate-400">Price impact</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <h2 className="text-xl font-bold text-white">Growth Posts</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {userPosts.length > 0 ? (
                    userPosts.map((post) => (
                      <div key={post.id} className="p-6 rounded-lg bg-slate-700/30 border border-slate-600/30">
                        <div className="flex items-start space-x-4">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={post.userAvatar} />
                            <AvatarFallback>{post.userName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-white font-semibold">{post.userName}</span>
                              {post.userBadge && (
                                <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full">
                                  {post.userBadge}
                                </span>
                              )}
                              <span className="text-slate-400 text-sm">•</span>
                              <span className="text-slate-400 text-sm">{new Date(post.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="text-slate-300 mb-4 relative z-20">{post.content}</p>
                            <div className="flex items-center space-x-6">
                              <button 
                                onClick={() => handleLike(post.id)}
                                className={`flex items-center space-x-2 text-sm transition-colors ${
                                  post.isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
                                }`}
                              >
                                <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                                <span>{post.likes}</span>
                              </button>
                              <div className="flex items-center space-x-2 text-slate-400 text-sm">
                                <MessageCircle className="w-4 h-4" />
                                <span>{post.comments}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-slate-400 text-sm">
                                <Share2 className="w-4 h-4" />
                                <span>{post.shares}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <MessageCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Posts Yet</h3>
                      <p className="text-slate-400">This growther hasn't shared any posts yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="supporters">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <h2 className="text-xl font-bold text-white">Supporters ({supporters.length})</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supporters.map((supporter, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10 border-2 border-purple-500/30">
                          <AvatarImage src={supporter.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{supporter.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-white font-medium">{supporter.name}</h3>
                          <p className="text-slate-400 text-sm">{supporter.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-purple-400 font-semibold">{supporter.amount}</div>
                        <div className="text-xs text-slate-400">Investment</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <h3 className="text-lg font-bold text-white">Performance Metrics</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total GXP Earned</span>
                    <span className="text-white font-semibold">{growther.gxp.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Missions Completed</span>
                    <span className="text-white font-semibold">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Circles Joined</span>
                    <span className="text-white font-semibold">5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Growth Streak</span>
                    <span className="text-white font-semibold">7 days</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <h3 className="text-lg font-bold text-white">Token Metrics</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">All-time High</span>
                    <span className="text-white font-semibold">0.52 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">All-time Low</span>
                    <span className="text-white font-semibold">0.18 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Volume (24h)</span>
                    <span className="text-white font-semibold">2.4 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Earned</span>
                    <span className="text-white font-semibold">{growther.totalEarned}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
