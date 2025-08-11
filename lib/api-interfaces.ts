// YOLO平台 API接口文档
// 根据前端功能设计的完整API接口

// ==================== 基础类型定义 ====================

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  code?: number
  timestamp: string
}

export interface PaginationParams {
  page: number
  limit: number
  sort?: string
  order?: "asc" | "desc"
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ==================== 用户相关接口 ====================

export interface User {
  id: string
  username: string
  displayName: string
  avatar?: string
  bio?: string
  tagline?: string
  location?: string
  school?: string
  domain: string
  tags: string[]
  gxp: number
  supporters: number
  rank: number
  joinedDate: string
  totalEarned: string
  isVerified: boolean
  walletAddress?: string
}

export interface UserProfile extends User {
  completedMissions: number
  circlesJoined: number
  growthGoals: string[]
  achievements: Achievement[]
  socialLinks: SocialLink[]
}

export interface SocialLink {
  platform: string
  url: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: string
  category: string
}

// ==================== 认证相关接口 ====================

// POST /api/auth/connect-wallet
export interface ConnectWalletRequest {
  walletAddress: string
  signature: string
  message: string
}

export interface ConnectWalletResponse {
  user: User
  token: string
  isNewUser: boolean
}

// POST /api/auth/logout
export interface LogoutResponse {
  success: boolean
}

// GET /api/auth/me
export interface GetCurrentUserResponse extends User {}

// ==================== 用户资料相关接口 ====================

// GET /api/users/:id
export interface GetUserProfileResponse extends UserProfile {}

// PUT /api/users/profile
export interface UpdateProfileRequest {
  displayName?: string
  bio?: string
  tagline?: string
  location?: string
  school?: string
  domain?: string
  tags?: string[]
  avatar?: string
  socialLinks?: SocialLink[]
}

export interface UpdateProfileResponse extends UserProfile {}

// POST /api/users/profile/setup
export interface ProfileSetupRequest {
  displayName: string
  bio: string
  location?: string
  school?: string
  domain: string
  interests: string[]
  growthGoals: string[]
  avatar?: string
}

export interface ProfileSetupResponse extends UserProfile {}

// ==================== YOLO股票相关接口 ====================

export interface YoloToken {
  id: string
  userId: string
  tokenName: string
  symbol: string
  totalSupply: number
  currentPrice: string
  marketCap: string
  priceChange24h: string
  priceChangePercent24h: number
  volume24h: string
  holders: number
  createdAt: string
  isActive: boolean
}

export interface TokenHolder {
  userId: string
  username: string
  avatar?: string
  amount: number
  percentage: number
  investedAt: string
  avgPrice: string
  currentValue: string
  gainLoss: string
  gainLossPercent: string
}

export interface PriceHistory {
  timestamp: string
  price: number
  volume: number
}

// POST /api/tokens/create
export interface CreateTokenRequest {
  supply: number
  initialPrice: number
  tokenName: string
}

export interface CreateTokenResponse extends YoloToken {}

// GET /api/tokens/:tokenId
export interface GetTokenDetailsResponse extends YoloToken {
  user: User
  holders: TokenHolder[]
  priceHistory: PriceHistory[]
  recentTransactions: Transaction[]
}

// GET /api/tokens/trending
export interface GetTrendingTokensResponse {
  tokens: YoloToken[]
}

// GET /api/tokens/my
export interface GetMyTokenResponse extends YoloToken {}

// ==================== 交易相关接口 ====================

export interface Transaction {
  id: string
  type: "buy" | "sell"
  tokenId: string
  buyerId: string
  sellerId?: string
  amount: number
  price: string
  totalValue: string
  timestamp: string
  status: "pending" | "completed" | "failed"
}

// POST /api/trading/buy
export interface BuyTokenRequest {
  tokenId: string
  amount: number
  maxPrice?: string
}

export interface BuyTokenResponse extends Transaction {}

// POST /api/trading/sell
export interface SellTokenRequest {
  tokenId: string
  amount: number
  minPrice?: string
}

export interface SellTokenResponse extends Transaction {}

// GET /api/trading/history
export interface GetTradingHistoryResponse extends PaginatedResponse<Transaction> {}

// ==================== 投资组合相关接口 ====================

export interface Portfolio {
  totalValue: string
  totalGainLoss: string
  totalGainLossPercent: string
  positions: TokenPosition[]
  watchlist: string[]
}

export interface TokenPosition {
  tokenId: string
  growtherName: string
  growtherAvatar?: string
  amount: number
  avgPrice: string
  currentPrice: string
  currentValue: string
  gainLoss: string
  gainLossPercent: string
  investedAt: string
}

// GET /api/portfolio
export interface GetPortfolioResponse extends Portfolio {}

// POST /api/portfolio/watchlist/add
export interface AddToWatchlistRequest {
  tokenId: string
}

// DELETE /api/portfolio/watchlist/:tokenId
export interface RemoveFromWatchlistResponse {
  success: boolean
}

// ==================== 成长记录相关接口 ====================

export interface GrowthPost {
  id: string
  userId: string
  title: string
  content: string
  category: "achievement" | "learning" | "project" | "milestone" | "reflection" | "challenge"
  tags: string[]
  images?: string[]
  links?: string[]
  gxpEarned: number
  likes: number
  comments: number
  shares: number
  createdAt: string
  isLiked?: boolean
}

export interface Comment {
  id: string
  postId: string
  userId: string
  username: string
  avatar?: string
  content: string
  createdAt: string
}

// POST /api/growth/post
export interface CreateGrowthPostRequest {
  title: string
  content: string
  category: string
  tags: string[]
  images?: string[]
  links?: string[]
}

export interface CreateGrowthPostResponse extends GrowthPost {}

// GET /api/growth/posts
export interface GetGrowthPostsResponse extends PaginatedResponse<GrowthPost> {}

// GET /api/growth/posts/:id
export interface GetGrowthPostResponse extends GrowthPost {
  user: User
  comments: Comment[]
}

// POST /api/growth/posts/:id/like
export interface LikePostResponse {
  liked: boolean
  likesCount: number
}

// POST /api/growth/posts/:id/comment
export interface CreateCommentRequest {
  content: string
}

export interface CreateCommentResponse extends Comment {}

// ==================== 任务相关接口 ====================

export interface Mission {
  id: string
  title: string
  description: string
  category: string
  difficulty: "Easy" | "Medium" | "Hard"
  gxpReward: number
  yoloReward?: string
  deadline: string
  participants: number
  maxParticipants?: number
  requirements: string[]
  isCompleted?: boolean
  progress?: number
  createdBy: string
  createdAt: string
}

export interface MissionSubmission {
  id: string
  missionId: string
  userId: string
  content: string
  attachments?: string[]
  submittedAt: string
  status: "pending" | "approved" | "rejected"
  feedback?: string
}

// GET /api/missions
export interface GetMissionsResponse extends PaginatedResponse<Mission> {}

// GET /api/missions/:id
export interface GetMissionDetailsResponse extends Mission {
  submissions: MissionSubmission[]
  isJoined: boolean
  mySubmission?: MissionSubmission
}

// POST /api/missions/:id/join
export interface JoinMissionResponse {
  success: boolean
  mission: Mission
}

// POST /api/missions/:id/submit
export interface SubmitMissionRequest {
  content: string
  attachments?: string[]
}

export interface SubmitMissionResponse extends MissionSubmission {}

// POST /api/missions/create
export interface CreateMissionRequest {
  title: string
  description: string
  category: string
  difficulty: "Easy" | "Medium" | "Hard"
  gxpReward: number
  yoloReward?: string
  deadline: string
  maxParticipants?: number
  requirements: string[]
}

export interface CreateMissionResponse extends Mission {}

// ==================== 圈子相关接口 ====================

export interface Circle {
  id: string
  name: string
  description: string
  icon: string
  memberCount: number
  tags: string[]
  isPublic: boolean
  isJoined?: boolean
  createdBy: string
  createdAt: string
  recentActivity: string
}

export interface CircleMember {
  userId: string
  username: string
  avatar?: string
  role: "owner" | "admin" | "member"
  joinedAt: string
}

export interface CirclePost {
  id: string
  circleId: string
  userId: string
  username: string
  avatar?: string
  content: string
  images?: string[]
  likes: number
  comments: number
  createdAt: string
  isLiked?: boolean
}

// GET /api/circles
export interface GetCirclesResponse extends PaginatedResponse<Circle> {}

// GET /api/circles/:id
export interface GetCircleDetailsResponse extends Circle {
  members: CircleMember[]
  recentPosts: CirclePost[]
}

// POST /api/circles/:id/join
export interface JoinCircleResponse {
  success: boolean
  circle: Circle
}

// DELETE /api/circles/:id/leave
export interface LeaveCircleResponse {
  success: boolean
}

// POST /api/circles/create
export interface CreateCircleRequest {
  name: string
  description: string
  icon: string
  tags: string[]
  isPublic: boolean
}

export interface CreateCircleResponse extends Circle {}

// ==================== 排行榜相关接口 ====================

export interface LeaderboardEntry {
  userId: string
  username: string
  avatar?: string
  value: string | number
  change: string
  price?: string
  marketCap?: string
  badge?: string
  country?: string
  school?: string
  rank: number
}

// GET /api/leaderboard/gxp
export interface GetGXPLeaderboardResponse {
  leaderboard: LeaderboardEntry[]
}

// GET /api/leaderboard/price-rising
export interface GetPriceRisingLeaderboardResponse {
  leaderboard: LeaderboardEntry[]
}

// GET /api/leaderboard/market-cap
export interface GetMarketCapLeaderboardResponse {
  leaderboard: LeaderboardEntry[]
}

// GET /api/leaderboard/newcomers
export interface GetNewcomersLeaderboardResponse {
  leaderboard: LeaderboardEntry[]
}

// ==================== 市场数据相关接口 ====================

export interface MarketStats {
  totalMarketCap: string
  totalUsers: number
  activeTraders: number
  totalGXP: number
  priceChangePercent: number
  volume24h: string
}

export interface TrendingTag {
  tag: string
  count: number
  growth: string
}

export interface MarketInsight {
  type: "trending" | "opportunity" | "sentiment"
  title: string
  description: string
  impact: "high" | "medium" | "low"
  data?: any
}

// GET /api/market/stats
export interface GetMarketStatsResponse extends MarketStats {}

// GET /api/market/trending-tags
export interface GetTrendingTagsResponse {
  tags: TrendingTag[]
}

// GET /api/market/insights
export interface GetMarketInsightsResponse {
  insights: MarketInsight[]
}

// ==================== 搜索相关接口 ====================

export interface SearchFilters {
  query?: string
  category?: string
  country?: string
  school?: string
  domain?: string
  tags?: string[]
  priceRange?: {
    min: number
    max: number
  }
  gxpRange?: {
    min: number
    max: number
  }
}

export interface SearchResult {
  users: User[]
  tokens: YoloToken[]
  missions: Mission[]
  circles: Circle[]
  posts: GrowthPost[]
}

// GET /api/search
export interface SearchRequest extends SearchFilters, PaginationParams {}

export interface SearchResponse extends SearchResult {}

// ==================== 通知相关接口 ====================

export interface Notification {
  id: string
  userId: string
  type: "investment" | "mission" | "circle" | "achievement" | "system"
  title: string
  message: string
  data?: any
  isRead: boolean
  createdAt: string
}

// GET /api/notifications
export interface GetNotificationsResponse extends PaginatedResponse<Notification> {}

// PUT /api/notifications/:id/read
export interface MarkNotificationReadResponse {
  success: boolean
}

// PUT /api/notifications/read-all
export interface MarkAllNotificationsReadResponse {
  success: boolean
}

// ==================== 活动动态相关接口 ====================

export interface Activity {
  id: string
  userId: string
  username: string
  avatar?: string
  type: "investment" | "mission" | "circle" | "post" | "achievement"
  action: string
  reward?: string
  timestamp: string
  data?: any
}

// GET /api/activities/feed
export interface GetActivityFeedResponse extends PaginatedResponse<Activity> {}

// GET /api/activities/user/:userId
export interface GetUserActivitiesResponse extends PaginatedResponse<Activity> {}

// ==================== 文件上传相关接口 ====================

// POST /api/upload/image
export interface UploadImageRequest {
  file: File
  type: "avatar" | "post" | "mission" | "circle"
}

export interface UploadImageResponse {
  url: string
  filename: string
}

// ==================== 统计分析相关接口 ====================

export interface UserStats {
  totalGXP: number
  completedMissions: number
  circlesJoined: number
  postsCreated: number
  tokensHeld: number
  portfolioValue: string
  rank: number
  growthRate: string
}

export interface TokenAnalytics {
  priceHistory: PriceHistory[]
  volumeHistory: { timestamp: string; volume: number }[]
  holderGrowth: { timestamp: string; holders: number }[]
  performanceMetrics: {
    roi: string
    volatility: string
    sharpeRatio: string
  }
}

// GET /api/analytics/user/:userId
export interface GetUserStatsResponse extends UserStats {}

// GET /api/analytics/token/:tokenId
export interface GetTokenAnalyticsResponse extends TokenAnalytics {}

// ==================== WebSocket 事件类型 ====================

export interface WebSocketEvent {
  type: string
  data: any
  timestamp: string
}

export interface PriceUpdateEvent extends WebSocketEvent {
  type: "price_update"
  data: {
    tokenId: string
    price: string
    change: string
    volume: string
  }
}

export interface NewTransactionEvent extends WebSocketEvent {
  type: "new_transaction"
  data: Transaction
}

export interface NotificationEvent extends WebSocketEvent {
  type: "notification"
  data: Notification
}

// ==================== 错误响应类型 ====================

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
}

// ==================== API端点常量 ====================

export const API_ENDPOINTS = {
  // 认证
  AUTH: {
    CONNECT_WALLET: "/api/auth/connect-wallet",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
  },

  // 用户
  USERS: {
    PROFILE: (id: string) => `/api/users/${id}`,
    UPDATE_PROFILE: "/api/users/profile",
    SETUP_PROFILE: "/api/users/profile/setup",
  },

  // YOLO股票
  TOKENS: {
    CREATE: "/api/tokens/create",
    DETAILS: (id: string) => `/api/tokens/${id}`,
    TRENDING: "/api/tokens/trending",
    MY_TOKEN: "/api/tokens/my",
  },

  // 交易
  TRADING: {
    BUY: "/api/trading/buy",
    SELL: "/api/trading/sell",
    HISTORY: "/api/trading/history",
  },

  // 投资组合
  PORTFOLIO: {
    GET: "/api/portfolio",
    ADD_WATCHLIST: "/api/portfolio/watchlist/add",
    REMOVE_WATCHLIST: (tokenId: string) => `/api/portfolio/watchlist/${tokenId}`,
  },

  // 成长记录
  GROWTH: {
    CREATE_POST: "/api/growth/post",
    GET_POSTS: "/api/growth/posts",
    GET_POST: (id: string) => `/api/growth/posts/${id}`,
    LIKE_POST: (id: string) => `/api/growth/posts/${id}/like`,
    COMMENT_POST: (id: string) => `/api/growth/posts/${id}/comment`,
  },

  // 任务
  MISSIONS: {
    GET_ALL: "/api/missions",
    GET_DETAILS: (id: string) => `/api/missions/${id}`,
    JOIN: (id: string) => `/api/missions/${id}/join`,
    SUBMIT: (id: string) => `/api/missions/${id}/submit`,
    CREATE: "/api/missions/create",
  },

  // 圈子
  CIRCLES: {
    GET_ALL: "/api/circles",
    GET_DETAILS: (id: string) => `/api/circles/${id}`,
    JOIN: (id: string) => `/api/circles/${id}/join`,
    LEAVE: (id: string) => `/api/circles/${id}/leave`,
    CREATE: "/api/circles/create",
  },

  // 排行榜
  LEADERBOARD: {
    GXP: "/api/leaderboard/gxp",
    PRICE_RISING: "/api/leaderboard/price-rising",
    MARKET_CAP: "/api/leaderboard/market-cap",
    NEWCOMERS: "/api/leaderboard/newcomers",
  },

  // 市场数据
  MARKET: {
    STATS: "/api/market/stats",
    TRENDING_TAGS: "/api/market/trending-tags",
    INSIGHTS: "/api/market/insights",
  },

  // 搜索
  SEARCH: "/api/search",

  // 通知
  NOTIFICATIONS: {
    GET_ALL: "/api/notifications",
    MARK_READ: (id: string) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: "/api/notifications/read-all",
  },

  // 活动动态
  ACTIVITIES: {
    FEED: "/api/activities/feed",
    USER: (userId: string) => `/api/activities/user/${userId}`,
  },

  // 文件上传
  UPLOAD: {
    IMAGE: "/api/upload/image",
  },

  // 统计分析
  ANALYTICS: {
    USER_STATS: (userId: string) => `/api/analytics/user/${userId}`,
    TOKEN_ANALYTICS: (tokenId: string) => `/api/analytics/token/${tokenId}`,
  },
} as const
