"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LayoutHeader } from "@/components/layout-header"
import { mockTimelineEvents, mockMissions, mockCircles, getUserPosts } from "@/lib/mock-data"
import type { Post } from "@/lib/types"
import { shareUtils } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import {
  User,
  Zap,
  TrendingUp,
  Users,
  Trophy,
  Calendar,
  Target,
  Settings,
  Share2,
  Edit,
  MapPin,
  GraduationCap,
  Briefcase,
  Copy,
  Twitter,
  Facebook,
  ExternalLink
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [newPostContent, setNewPostContent] = useState("")

  // 从localStorage加载用户帖子
  useEffect(() => {
    const loadUserPosts = () => {
      try {
        const savedPosts = localStorage.getItem('userPosts_1')
        if (savedPosts) {
          const parsedPosts = JSON.parse(savedPosts)
          setUserPosts(parsedPosts)
        } else {
          // 如果没有保存的帖子，使用默认的mock数据
          const defaultPosts = getUserPosts("1")
          setUserPosts(defaultPosts)
          localStorage.setItem('userPosts_1', JSON.stringify(defaultPosts))
        }
      } catch (error) {
        console.error('Error loading user posts:', error)
        // 出错时使用默认数据
        const defaultPosts = getUserPosts("1")
        setUserPosts(defaultPosts)
      }
    }
    
    loadUserPosts()
  }, [])

  // 点赞功能
  const handleLike = (postId: string) => {
    const updatedPosts = userPosts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            dailyLikes: post.isLiked ? (post.dailyLikes || 0) - 1 : (post.dailyLikes || 0) + 1,
            weeklyLikes: post.isLiked ? (post.weeklyLikes || 0) - 1 : (post.weeklyLikes || 0) + 1
          }
        : post
    )
    setUserPosts(updatedPosts)
    // 保存到localStorage
    localStorage.setItem('userPosts_1', JSON.stringify(updatedPosts))
  }

  const handlePostSubmit = () => {
    if (!newPostContent.trim()) return
    
    const newPost: Post = {
       id: Date.now().toString(),
       userId: "1",
       userName: userProfile.name,
       userAvatar: userProfile.avatar,
       userBadge: "AI Pioneer",
       content: newPostContent,
       timestamp: new Date().toISOString(),
       likes: 0,
       comments: 0,
       shares: 0,
       isLiked: false,
       dailyLikes: 0,
       weeklyLikes: 0
     }
    
    const updatedPosts = [newPost, ...userPosts]
    setUserPosts(updatedPosts)
    // 保存到localStorage
    localStorage.setItem('userPosts_1', JSON.stringify(updatedPosts))
    setNewPostContent("")
    
    toast({
      title: "发布成功",
      description: "你的帖子已成功发布！",
    })
  }
  
  // 确保用户已登录
  useEffect(() => {
    // 检查是否已登录
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    if (!isLoggedIn) {
      // 如果未登录，先设置为已登录状态（模拟登录）
      localStorage.setItem("isLoggedIn", "true")
      // 刷新页面以应用登录状态
      window.location.reload()
    }
  }, [])

  // 分享功能处理函数
  const handleCopyLink = async () => {
    const currentUrl = shareUtils.getCurrentUrl()
    const success = await shareUtils.copyToClipboard(currentUrl)
    
    if (success) {
      toast({
        title: "链接已复制",
        description: "个人资料链接已复制到剪贴板",
      })
    } else {
      toast({
        title: "复制失败",
        description: "无法复制链接，请手动复制",
        variant: "destructive",
      })
    }
  }

  const handleTwitterShare = () => {
    const currentUrl = shareUtils.getCurrentUrl()
    const text = `查看 ${userProfile.name} 的个人资料 - ${userProfile.tagline}`
    const hashtags = ['YOLO', 'Web3', 'Growth']
    shareUtils.shareToTwitter(text, currentUrl, hashtags)
  }

  const handleFacebookShare = () => {
    const currentUrl = shareUtils.getCurrentUrl()
    shareUtils.shareToFacebook(currentUrl)
  }
  const userProfile = {
    name: "Alex Chen",
    avatar: "/placeholder.svg?height=120&width=120",
    tagline: "Building the future of decentralized AI",
    bio: "AI researcher and open-source contributor working on democratizing artificial intelligence through blockchain technology. Currently developing tools that make machine learning accessible to everyone.",
    gxp: 2840,
    yoloPrice: "1.2 YOLO",
    supporters: 127,
    rank: 47,
    joinedDate: "January 2024",
    location: "Singapore",
    school: "NUS",
    domain: "AI & Research",
    tags: ["AI", "OpenSource", "Web3", "Research"],
    totalEarned: "1.2 YOLO",
    completedMissions: 12,
    circlesJoined: 5,
  }

  const stats = [
    { label: "GXP", value: userProfile.gxp.toLocaleString(), icon: Zap, color: "text-yellow-500" },
    { label: "YOLO Price", value: userProfile.yoloPrice, icon: TrendingUp, color: "text-purple-500" },
    { label: "Supporters", value: userProfile.supporters.toString(), icon: Users, color: "text-blue-500" },
    { label: "Rank", value: `#${userProfile.rank}`, icon: Trophy, color: "text-orange-500" },
  ]

  const completedMissions = mockMissions.filter((m) => m.isCompleted)
  const joinedCircles = mockCircles.filter((c) => c.isJoined)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <LayoutHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
              <div className="flex items-center space-x-6">
                <Avatar className="w-32 h-32 border-4 border-purple-500">
                  <AvatarImage src={userProfile.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">{userProfile.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{userProfile.name}</h1>
                  <p className="text-lg text-slate-300 mb-3">{userProfile.tagline}</p>
                  <div className="flex items-center space-x-4 text-sm text-slate-400 mb-4">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{userProfile.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <GraduationCap className="w-4 h-4" />
                      <span>{userProfile.school}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{userProfile.domain}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-slate-700 text-slate-300">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1 lg:text-right">
                <div className="flex lg:justify-end space-x-3 mb-4">
                  <a href="/profile-setup" style={{ textDecoration: 'none' }}>
                    <Button 
                      variant="default" 
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </a>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                      <DropdownMenuItem 
                        onClick={handleCopyLink}
                        className="text-slate-300 hover:bg-slate-700 cursor-pointer"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        复制链接
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={handleTwitterShare}
                        className="text-slate-300 hover:bg-slate-700 cursor-pointer"
                      >
                        <Twitter className="w-4 h-4 mr-2" />
                        分享到 Twitter
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={handleFacebookShare}
                        className="text-slate-300 hover:bg-slate-700 cursor-pointer"
                      >
                        <Facebook className="w-4 h-4 mr-2" />
                        分享到 Facebook
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm">Member since {userProfile.joinedDate}</p>
                  <p className="text-slate-400 text-sm">Total earned: {userProfile.totalEarned}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bio */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <h2 className="text-xl font-bold text-white flex items-center">
              <User className="w-5 h-5 mr-3" />
              About
            </h2>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 leading-relaxed">{userProfile.bio}</p>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="timeline" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-5 bg-slate-800 border-slate-700">
            <TabsTrigger value="timeline" className="data-[state=active]:bg-purple-600">
              Timeline
            </TabsTrigger>
            <TabsTrigger value="posts" className="data-[state=active]:bg-purple-600">
              Posts
            </TabsTrigger>
            <TabsTrigger value="missions" className="data-[state=active]:bg-purple-600">
              Missions
            </TabsTrigger>
            <TabsTrigger value="circles" className="data-[state=active]:bg-purple-600">
              Circles
            </TabsTrigger>
            <TabsTrigger value="supporters" className="data-[state=active]:bg-purple-600">
              Supporters
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Calendar className="w-5 h-5 mr-3" />
                  Growth Timeline
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 时间线事件 */}
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
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <h2 className="text-xl font-bold text-white flex items-center">
                  <User className="w-5 h-5 mr-3" />
                  My Posts
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 发帖区域 */}
                  <div className="p-6 rounded-lg bg-slate-700/30 border border-slate-600/30">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={userProfile.avatar} />
                        <AvatarFallback>{userProfile.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <textarea
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          placeholder="分享你的想法..."
                          className="w-full bg-slate-800/50 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          rows={3}
                        />
                        <div className="flex justify-end mt-3">
                          <Button
                            onClick={handlePostSubmit}
                            disabled={!newPostContent.trim()}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            发布
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 帖子列表 */}
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
                            <div className="flex items-center">
                              <button 
                                onClick={() => handleLike(post.id)}
                                className={`flex items-center space-x-2 text-sm transition-colors ${
                                  post.isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
                                }`}
                              >
                                <span className="text-lg">{post.isLiked ? '❤️' : '🤍'}</span>
                                <span>{post.likes}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-slate-400 text-lg mb-2">📝</div>
                      <p className="text-slate-400">还没有发布任何帖子</p>
                      <p className="text-slate-500 text-sm mt-1">在上方发布你的第一篇帖子吧！</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="missions">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Target className="w-5 h-5 mr-3" />
                  Completed Missions ({completedMissions.length})
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedMissions.map((mission) => (
                    <div key={mission.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30">
                      <div>
                        <h3 className="text-white font-semibold">{mission.title}</h3>
                        <p className="text-slate-400 text-sm">{mission.description}</p>
                        <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                          Completed
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <span className="text-yellow-400 font-semibold">{mission.gxpReward} GXP</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="circles">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Users className="w-5 h-5 mr-3" />
                  Joined Circles ({joinedCircles.length})
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {joinedCircles.map((circle) => (
                    <div key={circle.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{circle.icon}</div>
                        <div>
                          <h3 className="text-white font-semibold">{circle.name}</h3>
                          <p className="text-slate-400 text-sm">{circle.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Users className="w-3 h-3 text-blue-500" />
                            <span className="text-slate-400 text-xs">
                              {circle.memberCount.toLocaleString()} members
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 bg-transparent">
                        View Circle
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="supporters">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Users className="w-5 h-5 mr-3" />
                  Supporters ({userProfile.supporters})
                </h2>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Supporter Details Coming Soon</h3>
                  <p className="text-slate-400">This feature will show who has invested in your growth</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
