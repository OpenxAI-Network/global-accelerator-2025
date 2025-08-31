"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { GrowtherCard } from "@/components/growther-card"
// TagPill removed as Hot Sectors module is no longer displayed
import { MarketStatsBar } from "@/components/market-stats-bar"
import { mockGrowthers, mockRankingData, getDailyHotPosts, getWeeklyHotPosts, mockPosts, getLatestPosts } from "@/lib/mock-data"
import type { Post } from "@/lib/types"
import { RankingTabs } from "@/components/ranking-tabs"
import { LayoutHeader } from "@/components/layout-header"
import { CreateYoloModal } from "@/components/create-yolo-modal"
import {
  // Removed unused icons for AI Market Insights and Hot Sectors
  Trophy,
  Calendar,
  Activity,
  ChevronRight,
  Sparkles,
  FlameIcon as Fire,
  MessageCircle,
  Heart,
  Share2,
  BarChart3,
  PenTool,
  Send,
  Image,
  Smile,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>(getLatestPosts(5))
  const [dailyHotPosts] = useState<Post[]>(getDailyHotPosts())
  const [weeklyHotPosts] = useState<Post[]>(getWeeklyHotPosts())
  

  
  const [newPost, setNewPost] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(true) // 模拟登录状态
  const [showCreateYoloModal, setShowCreateYoloModal] = useState(false)
  
  // 模拟用户状态
  const userStatus = {
    isLoggedIn: true,
    hasCompletedProfile: true,
    hasPostedGrowth: true,
    hasCreatedToken: false
  }
  
  const handleSubmitPost = () => {
    if (newPost.trim()) {
      const post: Post = {
         id: Date.now().toString(),
         userId: "current",
         userName: "Current User",
         userAvatar: "/placeholder.svg?height=40&width=40",
         userBadge: "New Member",
         content: newPost,
         timestamp: new Date().toISOString(),
         likes: 0,
         comments: 0,
         shares: 0,
         isLiked: false,
         dailyLikes: 0,
         weeklyLikes: 0
       }
      setPosts([post, ...posts])
      setNewPost("")
      
      // 发帖成功后显示创建股票模态框
      setShowCreateYoloModal(true)
    }
  }

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            dailyLikes: post.isLiked ? (post.dailyLikes || 0) - 1 : (post.dailyLikes || 0) + 1,
            weeklyLikes: post.isLiked ? (post.weeklyLikes || 0) - 1 : (post.weeklyLikes || 0) + 1
          }
        : post
    ))
  }
  const featuredGrowthers = [
    {
      id: "1",
      name: "Alex Chen",
      avatar: "/placeholder.svg?height=80&width=80",
      tagline: "Building the future of decentralized AI systems",
      gxp: 2840,
      supporters: 127,
      tags: ["AI", "OpenSource", "Web3", "Research"],
      yoloPrice: "1.45 YOLO",
      growthRate: "+23%",
      isRising: true,
      isPositive: true,
    },
    {
      id: "2",
      name: "Maya Rodriguez",
      avatar: "/placeholder.svg?height=80&width=80",
      tagline: "Design systems that change human behavior",
      gxp: 3120,
      supporters: 89,
      tags: ["Design", "Psychology", "ProductDesign", "UX"],
      yoloPrice: "1.82 YOLO",
      growthRate: "+31%",
      isRising: true,
      isPositive: true,
    },
    {
      id: "3",
      name: "David Kim",
      avatar: "/placeholder.svg?height=80&width=80",
      tagline: "Democratizing DeFi for everyone",
      gxp: 1950,
      supporters: 156,
      tags: ["DeFi", "Blockchain", "FinTech", "Accessibility"],
      yoloPrice: "1.08 YOLO",
      growthRate: "+18%",
      isRising: true,
      isPositive: true,
    },
    {
      id: "4",
      name: "Sarah Liu",
      avatar: "/placeholder.svg?height=80&width=80",
      tagline: "Climate tech solutions for sustainable future",
      gxp: 4250,
      supporters: 203,
      tags: ["ClimaTech", "Sustainability", "GreenTech", "Impact"],
      yoloPrice: "2.15 YOLO",
      growthRate: "+42%",
      isRising: true,
      isPositive: true,
    },
    {
      id: "5",
      name: "Ryan Patel",
      avatar: "/placeholder.svg?height=80&width=80",
      tagline: "Full-stack developer passionate about Web3",
      gxp: 1680,
      supporters: 94,
      tags: ["Frontend", "Backend", "Web3", "JavaScript"],
      yoloPrice: "0.95 YOLO",
      growthRate: "+15%",
      isRising: true,
      isPositive: true,
    },
    {
      id: "6",
      name: "Emma Johnson",
      avatar: "/placeholder.svg?height=80&width=80",
      tagline: "Data scientist turning insights into action",
      gxp: 2340,
      supporters: 142,
      tags: ["DataScience", "Analytics", "Python", "ML"],
      yoloPrice: "1.32 YOLO",
      growthRate: "+28%",
      isRising: true,
      isPositive: true,
    },
    {
      id: "7",
      name: "Lucas Brown",
      avatar: "/placeholder.svg?height=80&width=80",
      tagline: "Fintech innovator disrupting traditional banking",
      gxp: 3580,
      supporters: 178,
      tags: ["Fintech", "Trading", "Investment", "Banking"],
      yoloPrice: "1.89 YOLO",
      growthRate: "+35%",
      isRising: true,
      isPositive: true,
    },
    {
      id: "8",
      name: "Zoe Martinez",
      avatar: "/placeholder.svg?height=80&width=80",
      tagline: "Digital artist exploring NFT possibilities",
      gxp: 1420,
      supporters: 267,
      tags: ["Art", "NFT", "Digital", "Creative"],
      yoloPrice: "0.78 YOLO",
      growthRate: "+52%",
      isRising: true,
      isPositive: true,
    },
    {
      id: "9",
      name: "Ethan Davis",
      avatar: "/placeholder.svg?height=80&width=80",
      tagline: "EdTech pioneer making learning accessible",
      gxp: 2890,
      supporters: 134,
      tags: ["Education", "Learning", "EdTech", "Accessibility"],
      yoloPrice: "1.56 YOLO",
      growthRate: "+21%",
      isRising: true,
      isPositive: true,
    }
  ]

  const rankingData = {
    priceRising: [
      {
        id: "1",
        name: "Alex Chen",
        avatar: "/placeholder.svg?height=40&width=40",
        value: "2,840 GXP",
        change: "+45%",
        price: "1.45 YOLO",
        marketCap: "14.5K YOLO",
        badge: "AI Pioneer",
        country: "Singapore",
        school: "NUS",
      },
      {
        id: "2",
        name: "Maya Rodriguez",
        avatar: "/placeholder.svg?height=40&width=40",
        value: "3,120 GXP",
        change: "+31%",
        price: "1.82 YOLO",
        marketCap: "18.2K YOLO",
        badge: "Design Leader",
        country: "Mexico",
        school: "ITESM",
      },
      {
        id: "3",
        name: "David Kim",
        avatar: "/placeholder.svg?height=40&width=40",
        value: "1,950 GXP",
        change: "+28%",
        price: "1.08 YOLO",
        marketCap: "10.8K YOLO",
        badge: "DeFi Builder",
        country: "South Korea",
        school: "KAIST",
      },
      {
        id: "4",
        name: "Sarah Liu",
        avatar: "/placeholder.svg?height=40&width=40",
        value: "4,250 GXP",
        change: "+25%",
        price: "2.15 YOLO",
        marketCap: "21.5K YOLO",
        badge: "Climate Leader",
        country: "Canada",
        school: "UofT",
      },
    ],
    marketCap: [
      {
        id: "4",
        name: "Sarah Liu",
        avatar: "/placeholder.svg?height=40&width=40",
        value: "4,250 GXP",
        change: "+12%",
        price: "2.15 YOLO",
        marketCap: "21.5K YOLO",
        badge: "Climate Leader",
        country: "Canada",
        school: "UofT",
      },
      {
        id: "2",
        name: "Maya Rodriguez",
        avatar: "/placeholder.svg?height=40&width=40",
        value: "3,120 GXP",
        change: "+31%",
        price: "1.82 YOLO",
        marketCap: "18.2K YOLO",
        badge: "Design Leader",
        country: "Mexico",
        school: "ITESM",
      },
      {
        id: "1",
        name: "Alex Chen",
        avatar: "/placeholder.svg?height=40&width=40",
        value: "2,840 GXP",
        change: "+23%",
        price: "1.45 YOLO",
        marketCap: "14.5K YOLO",
        badge: "AI Pioneer",
        country: "Singapore",
        school: "NUS",
      },
      {
        id: "3",
        name: "David Kim",
        avatar: "/placeholder.svg?height=40&width=40",
        value: "1,950 GXP",
        change: "+18%",
        price: "1.08 YOLO",
        marketCap: "10.8K YOLO",
        badge: "DeFi Builder",
        country: "South Korea",
        school: "KAIST",
      },
    ],
    gxpLeaders: [
      {
        id: "4",
        name: "Sarah Liu",
        avatar: "/placeholder.svg?height=40&width=40",
        value: "4,250 GXP",
        change: "+12%",
        price: "2.15 YOLO",
        country: "Canada",
        school: "UofT",
      },
      {
        id: "2",
        name: "Maya Rodriguez",
        avatar: "/placeholder.svg?height=40&width=40",
        value: "3,120 GXP",
        change: "+8%",
        price: "1.82 YOLO",
        country: "Mexico",
        school: "ITESM",
      },
      {
        id: "1",
        name: "Alex Chen",
        avatar: "/placeholder.svg?height=40&width=40",
        value: "2,840 GXP",
        change: "+15%",
        price: "1.45 YOLO",
        country: "Singapore",
        school: "NUS",
      },
      {
        id: "3",
        name: "David Kim",
        avatar: "/placeholder.svg?height=40&width=40",
        value: "1,950 GXP",
        change: "+6%",
        price: "1.08 YOLO",
        country: "South Korea",
        school: "KAIST",
      },
    ],
    hotNewcomers: [
      {
        id: "5",
        name: "Emma Rising",
        avatar: "/placeholder.svg?height=40&width=40",
        value: "890 GXP",
        change: "+156%",
        price: "0.42 YOLO",
        badge: "New Talent",
        country: "USA",
        school: "MIT",
      },
      {
        id: "6",
        name: "Jake Potential",
        avatar: "/placeholder.svg?height=40&width=40",
        value: "1,240 GXP",
        change: "+89%",
        price: "0.68 YOLO",
        badge: "Fast Learner",
        country: "UK",
        school: "Oxford",
      },
      {
        id: "7",
        name: "Aria Blackhorse",
        avatar: "/placeholder.svg?height=40&width=40",
        value: "750 GXP",
        change: "+134%",
        price: "0.35 YOLO",
        badge: "Dark Horse",
        country: "Germany",
        school: "TUM",
      },
      {
        id: "8",
        name: "Leo Newcomer",
        avatar: "/placeholder.svg?height=40&width=40",
        value: "1,100 GXP",
        change: "+76%",
        price: "0.55 YOLO",
        badge: "Rising Star",
        country: "Japan",
        school: "Tokyo Tech",
      },
    ],
    topPerformers: [
      {
        id: "1",
        name: "Alex Chen",
        avatar: "/placeholder.svg?height=40&width=40",
        value: "2,840 GXP",
        change: "+45%",
        price: "1.45 YOLO",
        badge: "AI Pioneer",
        country: "Singapore",
        school: "NUS",
      },
      {
        id: "2",
        name: "Maya Rodriguez",
        avatar: "/placeholder.svg?height=40&width=40",
        value: "3,120 GXP",
        change: "+31%",
        price: "1.82 YOLO",
        badge: "Design Leader",
        country: "Mexico",
        school: "ITESM",
      },
    ],
    mostSupported: [
      {
        id: "3",
        name: "David Kim",
        avatar: "/placeholder.svg?height=40&width=40",
        value: "156 supporters",
        change: "+28%",
        price: "1.08 YOLO",
        badge: "Community Favorite",
        country: "South Korea",
        school: "KAIST",
      },
    ],
    innovators: [
      {
        id: "1",
        name: "Alex Chen",
        avatar: "/placeholder.svg?height=40&width=40",
        value: "12 projects",
        change: "+200%",
        price: "1.45 YOLO",
        badge: "Innovation Leader",
        country: "Singapore",
        school: "NUS",
      },
    ],
    globalRising: [
      {
        id: "5",
        name: "Emma Rising",
        avatar: "/placeholder.svg?height=40&width=40",
        value: "890 GXP",
        change: "+156%",
        price: "0.42 YOLO",
        badge: "Global Talent",
        country: "USA",
        school: "MIT",
      },
    ],
  }

  // hotTags removed as Hot Sectors module is no longer displayed

  const recentActivities = [
    {
      user: "Sarah Liu",
      avatar: "/placeholder.svg?height=32&width=32",
      action: "completed 'AI Model Optimization' challenge",
      reward: "100 GXP",
      time: "2 minutes ago",
      type: "challenge",
    },
    {
      user: "Maya Rodriguez",
      avatar: "/placeholder.svg?height=32&width=32",
      action: "received investment from @VentureCapital",
      reward: "150 YOLO",
      time: "5 minutes ago",
      type: "investment",
    },
    {
      user: "David Kim",
      avatar: "/placeholder.svg?height=32&width=32",
      action: "joined 'DeFi Innovators' circle",
      reward: "New connections",
      time: "8 minutes ago",
      type: "community",
    },
    {
      user: "Alex Chen",
      avatar: "/placeholder.svg?height=32&width=32",
      action: "published 'Smart Contract Audit Tool'",
      reward: "150 GXP",
      time: "12 minutes ago",
      type: "project",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <LayoutHeader />

      {/* Stock Ticker */}
      <div className="bg-gray-900/50 border-b border-gray-800 overflow-hidden font-mono">
        <div className="ticker-animation flex items-center space-x-8 py-2">
          <div className="flex items-center space-x-2 whitespace-nowrap">
            <span className="text-gray-400 text-sm">ALEX-YOLO</span>
            <span className="text-green-400 text-sm">1.45</span>
            <span className="text-green-400 text-sm">+23%</span>
          </div>
          <div className="flex items-center space-x-2 whitespace-nowrap">
            <span className="text-gray-400 text-sm">MAYA-YOLO</span>
            <span className="text-green-400 text-sm">1.82</span>
            <span className="text-green-400 text-sm">+31%</span>
          </div>
          <div className="flex items-center space-x-2 whitespace-nowrap">
            <span className="text-gray-400 text-sm">DAVID-YOLO</span>
            <span className="text-green-400 text-sm">1.08</span>
            <span className="text-green-400 text-sm">+18%</span>
          </div>
          <div className="flex items-center space-x-2 whitespace-nowrap">
            <span className="text-gray-400 text-sm">SARAH-YOLO</span>
            <span className="text-green-400 text-sm">2.15</span>
            <span className="text-green-400 text-sm">+12%</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="mb-8">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-6 text-sm px-4 py-2 tech-glow">
              <Sparkles className="w-4 h-4 mr-2" />
              Trade Growth. Invest in Potential.
            </Badge>
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight">
              Your Growth is a{" "}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Stock
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Transform your potential into tradeable assets.
              <br />
              Let the market discover and invest in your future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/explore">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 text-lg px-8 py-4 bg-transparent tech-glow"
                >
                  <BarChart3 className="mr-2 w-5 h-5" />
                  Explore Market
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Market Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <MarketStatsBar
          totalMarketCap="247.8K"
          totalUsers={2847}
          activeTraders={892}
          totalGXP={1247890}
          priceChangePercent={12.4}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Featured Stocks */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-bold text-white flex items-center">
              <Fire className="mr-4 w-10 h-10 text-orange-500" />
              Featured Growthers
            </h2>
            <Link href="/explore">
              <Button variant="ghost" className="text-blue-400 hover:text-white">
                View All <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {featuredGrowthers.slice(0, 6).map((grower) => (
              <GrowtherCard key={grower.id} {...grower} />
            ))}
          </div>
        </section>

        {/* Market Rankings */}
        <section className="mb-20">
          <div className="flex items-center mb-8">
            <Trophy className="mr-4 w-10 h-10 text-yellow-500" />
            <div>
              <h2 className="text-4xl font-bold text-white">Growth Leaderboards</h2>
              <p className="text-gray-400 mt-2">Discover top performers across different categories</p>
            </div>
          </div>

          <RankingTabs {...rankingData} />
        </section>

        {/* AI Insights & Hot Sectors - Hidden as requested */}

        {/* Hot Posts Section */}
        <section className="mb-20">
          <div className="flex items-center mb-8">
            <Fire className="mr-4 w-10 h-10 text-orange-500" />
            <div>
              <h2 className="text-4xl font-bold text-white">Hot Posts</h2>
              <p className="text-gray-400 mt-2">Trending posts from the community</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Daily Hot Posts */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Calendar className="mr-3 w-6 h-6 text-yellow-500" />
                Daily Hot
              </h3>
              <div className="space-y-4">
                {dailyHotPosts.map((post) => (
                  <Card key={post.id} className="bg-gray-900/50 border-gray-800 gradient-border tech-glow hover:bg-gray-800/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-10 h-10 border-2 border-yellow-500/30">
                           <AvatarImage src={post.userAvatar} />
                           <AvatarFallback>{post.userName[0]}</AvatarFallback>
                         </Avatar>
                         <div className="flex-1">
                           <div className="flex items-center space-x-2 mb-2">
                             <h4 className="font-medium text-white text-sm">{post.userName}</h4>
                             <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                               {post.userBadge}
                             </Badge>
                          </div>
                          <p className="text-gray-300 text-sm mb-3 line-clamp-2" style={{ color: '#d1d5db', fontSize: '14px', lineHeight: '1.6', zIndex: 20, position: 'relative' }}>{post.content}</p>
                          <div className="flex items-center space-x-4">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={`text-xs ${post.isLiked ? 'text-red-400' : 'text-gray-400'} hover:text-red-400 transition-colors`}
                              onClick={() => handleLike(post.id)}
                            >
                              <Heart className={`w-3 h-3 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                              {post.likes}
                            </Button>
                            <span className="text-gray-400 text-xs">{post.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Weekly Hot Posts */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Trophy className="mr-3 w-6 h-6 text-purple-500" />
                Weekly Hot
              </h3>
              <div className="space-y-4">
                {weeklyHotPosts.map((post) => (
                  <Card key={post.id} className="bg-gray-900/50 border-gray-800 gradient-border tech-glow hover:bg-gray-800/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-10 h-10 border-2 border-purple-500/30">
                           <AvatarImage src={post.userAvatar} />
                           <AvatarFallback>{post.userName[0]}</AvatarFallback>
                         </Avatar>
                         <div className="flex-1">
                           <div className="flex items-center space-x-2 mb-2">
                             <h4 className="font-medium text-white text-sm">{post.userName}</h4>
                             <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                               {post.userBadge}
                             </Badge>
                          </div>
                          <p className="text-gray-300 text-sm mb-3 line-clamp-2" style={{ color: '#d1d5db', fontSize: '14px', lineHeight: '1.6', zIndex: 10, position: 'relative' }}>{post.content}</p>
                          <div className="flex items-center space-x-4">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={`text-xs ${post.isLiked ? 'text-red-400' : 'text-gray-400'} hover:text-red-400 transition-colors`}
                              onClick={() => handleLike(post.id)}
                            >
                              <Heart className={`w-3 h-3 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                              {post.likes}
                            </Button>
                            <span className="text-gray-400 text-xs">{post.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Community Posts */}
        <section className="mb-20">
          <div className="flex items-center mb-8">
            <PenTool className="mr-4 w-10 h-10 text-cyan-500" />
            <div>
              <h2 className="text-4xl font-bold text-white">Community Posts</h2>
              <p className="text-gray-400 mt-2">Share your thoughts and connect with the community</p>
            </div>
          </div>

          {/* Post Creation Form */}
          {isLoggedIn && (
            <Card className="bg-gray-900/50 border-gray-800 mb-8 relative z-10">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="w-12 h-12 border-2 border-cyan-500/30">
                    <AvatarImage src="/placeholder.svg?height=48&width=48" />
                    <AvatarFallback>CU</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="What's on your mind? Share your latest project, insights, or thoughts..."
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 resize-none min-h-[100px] focus:border-cyan-500/50 relative z-20"
                      style={{ pointerEvents: 'auto' }}
                    />
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white relative z-20" style={{ pointerEvents: 'auto' }}>
                          <Image className="w-4 h-4 mr-2" />
                          Image
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white relative z-20" style={{ pointerEvents: 'auto' }}>
                          <Smile className="w-4 h-4 mr-2" />
                          Emoji
                        </Button>
                      </div>
                      <Button 
                        onClick={handleSubmitPost}
                        disabled={!newPost.trim()}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white relative z-20"
                        style={{ pointerEvents: 'auto' }}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Post
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Posts List */}
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="bg-gray-900/50 border-gray-800 gradient-border tech-glow hover:bg-gray-800/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-12 h-12 border-2 border-purple-500/30">
                       <AvatarImage src={post.userAvatar} />
                       <AvatarFallback>{post.userName[0]}</AvatarFallback>
                     </Avatar>
                     <div className="flex-1">
                       <div className="flex items-center space-x-2 mb-2">
                         <h3 className="font-medium text-white">{post.userName}</h3>
                         <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                           {post.userBadge}
                         </Badge>
                        <span className="text-gray-400 text-sm">•</span>
                        <span className="text-gray-400 text-sm">{new Date(post.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-300 mb-4 leading-relaxed" style={{ color: '#d1d5db', fontSize: '14px', lineHeight: '1.6', zIndex: 20, position: 'relative' }}>{post.content}</p>
                      <div className="flex items-center space-x-6">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`${post.isLiked ? 'text-red-400' : 'text-gray-400'} hover:text-red-400 transition-colors`}
                          onClick={() => handleLike(post.id)}
                        >
                          <Heart className={`w-4 h-4 mr-2 ${post.isLiked ? 'fill-current' : ''}`} />
                          {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-400 transition-colors">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          {post.comments}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-green-400 transition-colors">
                          <Share2 className="w-4 h-4 mr-2" />
                          {post.shares}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Market News + Live Feed */}
        <div className="grid lg:grid-cols-2 gap-8" style={{ display: 'none' }}>
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white flex items-center">
                <Calendar className="mr-4 w-8 h-8 text-green-500" />
                Market Updates
              </h2>
              <Link href="/missions">
                <Button variant="ghost" className="text-blue-400 hover:text-white">
                  View All
                </Button>
              </Link>
            </div>
            <Card className="bg-gray-900/50 border-gray-800 gradient-border tech-glow">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 mb-3">Market Alert</Badge>
                    <h3 className="text-white font-medium mb-2">AI Innovation Wave</h3>
                    <p className="text-gray-300 text-sm mb-3">AI sector growthers up 45% this week</p>
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-400 font-medium">High Impact</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-orange-500/30 text-orange-400 bg-transparent"
                      >
                        Read More
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-3">Partnership</Badge>
                    <h3 className="text-white font-medium mb-2">ETHGlobal Integration</h3>
                    <p className="text-gray-300 text-sm">YOLO partners with ETHGlobal for hackathon season</p>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mb-3">Platform Update</Badge>
                    <h3 className="text-white font-medium mb-2">Advanced Trading Features</h3>
                    <p className="text-gray-300 text-sm">New limit orders and portfolio analytics now live</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white flex items-center">
                <Activity className="mr-4 w-8 h-8 text-purple-500" />
                Live Activity Feed
              </h2>
              <Link href="/scout">
                <Button variant="ghost" className="text-blue-400 hover:text-white">
                  View More
                </Button>
              </Link>
            </div>
            <Card className="bg-gray-900/50 border-gray-800 gradient-border tech-glow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-4 rounded-lg hover:bg-gray-800/30 transition-colors border border-gray-800/50"
                    >
                      <Avatar className="w-10 h-10 border-2 border-purple-500/30">
                        <AvatarImage src={activity.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{activity.user[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-white text-sm">
                          <span className="font-medium text-blue-300">{activity.user}</span> {activity.action}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-green-400 text-xs font-medium">+{activity.reward}</span>
                          <span className="text-gray-400 text-xs">{activity.time}</span>
                        </div>
                        <div className="flex items-center space-x-4 mt-2">
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-400 hover:text-white">
                            <Heart className="w-3 h-3 mr-1" />
                            Like
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-400 hover:text-white">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Comment
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-400 hover:text-white">
                            <Share2 className="w-3 h-3 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          activity.type === "challenge"
                            ? "bg-green-500"
                            : activity.type === "investment"
                              ? "bg-purple-500"
                              : activity.type === "community"
                                ? "bg-blue-500"
                                : "bg-orange-500"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>,
      
      {/* Create YOLO Stock Modal */}
      <CreateYoloModal 
        isOpen={showCreateYoloModal}
        onClose={() => setShowCreateYoloModal(false)}
        userStatus={userStatus}
      />
    </div>
  )
}
