export interface Growther {
  id: string
  name: string
  avatar: string
  tagline: string
  bio: string
  gxp: number
  supporters: number
  tags: string[]
  yoloPrice: string
  growthRate: string
  country?: string
  school?: string
  domain: string
  isRising?: boolean
  joinedDate: string
  totalEarned: string
}

export interface Mission {
  id: string
  title: string
  description: string
  gxpReward: number
  yoloReward?: string
  difficulty: "Easy" | "Medium" | "Hard"
  category: string
  progress?: number
  deadline: string
  participants: number
  isCompleted?: boolean
}

export interface Circle {
  id: string
  name: string
  description: string
  icon: string
  memberCount: number
  tags: string[]
  isJoined?: boolean
  isPublic: boolean
  recentActivity: string
}

export interface TokenPosition {
  growtherId: string
  growtherName: string
  amount: number
  avgPrice: string
  currentPrice: string
  gainLoss: string
  gainLossPercent: string
}

export interface TimelineEvent {
  id: string
  type: "mission" | "badge" | "circle" | "investment" | "milestone"
  title: string
  description: string
  date: string
  gxpEarned?: number
  icon: string
}

export interface Post {
  id: string
  userId: string
  userName: string
  userAvatar: string
  userBadge?: string
  content: string
  timestamp: string
  likes: number
  comments: number
  shares: number
  isLiked?: boolean
  dailyLikes?: number
  weeklyLikes?: number
}
