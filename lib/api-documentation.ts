// YOLO Platform API Documentation
// Complete API interface documentation for frontend integration

export const API_DOCUMENTATION = {
  baseUrl: "https://api.yolo-platform.com/v1",

  // Authentication Endpoints
  auth: {
    // POST /auth/login
    login: {
      endpoint: "/auth/login",
      method: "POST",
      description: "User login with email/password",
      request: {
        email: "string",
        password: "string",
      },
      response: {
        success: "boolean",
        user: {
          id: "string",
          email: "string",
          name: "string",
          avatar: "string?",
          isProfileComplete: "boolean",
          hasPostedGrowth: "boolean",
          hasCreatedStock: "boolean",
        },
        token: "string",
      },
      usedBy: ["AuthModal", "LayoutHeader"],
    },

    // POST /auth/signup
    signup: {
      endpoint: "/auth/signup",
      method: "POST",
      description: "User registration",
      request: {
        email: "string",
        password: "string",
        name: "string",
      },
      response: "Same as login",
      usedBy: ["AuthModal"],
    },

    // POST /auth/logout
    logout: {
      endpoint: "/auth/logout",
      method: "POST",
      description: "User logout",
      response: { success: "boolean" },
      usedBy: ["LayoutHeader"],
    },

    // GET /auth/me
    getCurrentUser: {
      endpoint: "/auth/me",
      method: "GET",
      description: "Get current authenticated user",
      response: "User object",
      usedBy: ["All protected pages"],
    },
  },

  // User Profile Endpoints
  users: {
    // GET /users/:id
    getProfile: {
      endpoint: "/users/:id",
      method: "GET",
      description: "Get user profile by ID",
      response: {
        id: "string",
        name: "string",
        avatar: "string?",
        bio: "string",
        tagline: "string",
        tags: "string[]",
        gxp: "number",
        supporters: "number",
        yoloPrice: "string",
        growthRate: "string",
        country: "string?",
        school: "string?",
        domain: "string",
        joinedDate: "string",
        totalEarned: "string",
      },
      usedBy: ["GrowtherCard", "ProfilePage", "GrowtherDetailPage"],
    },

    // PUT /users/profile
    updateProfile: {
      endpoint: "/users/profile",
      method: "PUT",
      description: "Update user profile",
      request: {
        name: "string?",
        bio: "string?",
        tagline: "string?",
        tags: "string[]?",
        avatar: "string?",
        school: "string?",
        domain: "string?",
        location: "string?",
      },
      response: "Updated user object",
      usedBy: ["ProfileSetupPage", "ProfileEditPage"],
    },
  },

  // Growth Stock/Token Endpoints
  stocks: {
    // GET /stocks/trending
    getTrending: {
      endpoint: "/stocks/trending",
      method: "GET",
      description: "Get trending growth stocks",
      response: {
        stocks: [
          {
            id: "string",
            userId: "string",
            userName: "string",
            userAvatar: "string",
            currentPrice: "string",
            priceChange24h: "string",
            marketCap: "string",
            volume24h: "string",
          },
        ],
      },
      usedBy: ["HomePage", "ExplorePage"],
    },

    // POST /stocks/create
    createStock: {
      endpoint: "/stocks/create",
      method: "POST",
      description: "Create new YOLO stock",
      request: {
        supply: "number",
        initialPrice: "number",
        tokenName: "string",
      },
      response: {
        success: "boolean",
        stock: "Stock object",
      },
      usedBy: ["CreateYoloModal"],
    },

    // GET /stocks/:id
    getStockDetails: {
      endpoint: "/stocks/:id",
      method: "GET",
      description: "Get detailed stock information",
      response: {
        stock: "Stock object",
        priceHistory: "PricePoint[]",
        holders: "Holder[]",
        recentTransactions: "Transaction[]",
      },
      usedBy: ["GrowtherDetailPage"],
    },
  },

  // Trading Endpoints
  trading: {
    // POST /trading/buy
    buyStock: {
      endpoint: "/trading/buy",
      method: "POST",
      description: "Buy growth stock",
      request: {
        stockId: "string",
        amount: "number",
        maxPrice: "string?",
      },
      response: {
        success: "boolean",
        transaction: "Transaction object",
      },
      usedBy: ["GrowtherDetailPage", "QuickInvestModal"],
    },

    // POST /trading/sell
    sellStock: {
      endpoint: "/trading/sell",
      method: "POST",
      description: "Sell growth stock",
      request: {
        stockId: "string",
        amount: "number",
        minPrice: "string?",
      },
      response: "Same as buy",
      usedBy: ["GrowtherDetailPage", "PortfolioPage"],
    },
  },

  // Portfolio Endpoints
  portfolio: {
    // GET /portfolio
    getPortfolio: {
      endpoint: "/portfolio",
      method: "GET",
      description: "Get user's investment portfolio",
      response: {
        totalValue: "string",
        totalGainLoss: "string",
        positions: [
          {
            stockId: "string",
            growtherName: "string",
            amount: "number",
            avgPrice: "string",
            currentPrice: "string",
            gainLoss: "string",
            gainLossPercent: "string",
          },
        ],
        watchlist: "string[]",
      },
      usedBy: ["ScoutPage", "PortfolioPage"],
    },

    // POST /portfolio/watchlist
    addToWatchlist: {
      endpoint: "/portfolio/watchlist",
      method: "POST",
      description: "Add stock to watchlist",
      request: { stockId: "string" },
      response: { success: "boolean" },
      usedBy: ["WatchlistButton", "GrowtherDetailPage"],
    },

    // DELETE /portfolio/watchlist/:id
    removeFromWatchlist: {
      endpoint: "/portfolio/watchlist/:id",
      method: "DELETE",
      description: "Remove from watchlist",
      response: { success: "boolean" },
      usedBy: ["WatchlistButton", "WatchlistPage"],
    },
  },

  // Growth Posts Endpoints
  growth: {
    // POST /growth/posts
    createPost: {
      endpoint: "/growth/posts",
      method: "POST",
      description: "Create growth post",
      request: {
        title: "string",
        content: "string",
        category: "string",
        tags: "string[]",
        images: "string[]?",
        links: "string[]?",
      },
      response: {
        success: "boolean",
        post: "GrowthPost object",
        gxpEarned: "number",
      },
      usedBy: ["GrowthPostPage"],
    },

    // GET /growth/posts
    getPosts: {
      endpoint: "/growth/posts",
      method: "GET",
      description: "Get growth posts feed",
      query: {
        page: "number?",
        limit: "number?",
        userId: "string?",
        category: "string?",
      },
      response: {
        posts: "GrowthPost[]",
        pagination: "PaginationInfo",
      },
      usedBy: ["HomePage", "ProfilePage", "FeedPage"],
    },
  },

  // Missions Endpoints
  missions: {
    // GET /missions
    getMissions: {
      endpoint: "/missions",
      method: "GET",
      description: "Get available missions",
      query: {
        category: "string?",
        difficulty: "string?",
        status: "string?",
      },
      response: {
        missions: [
          {
            id: "string",
            title: "string",
            description: "string",
            gxpReward: "number",
            yoloReward: "string?",
            difficulty: "Easy|Medium|Hard",
            category: "string",
            deadline: "string",
            participants: "number",
            isCompleted: "boolean?",
            progress: "number?",
          },
        ],
      },
      usedBy: ["MissionsPage"],
    },

    // POST /missions/:id/join
    joinMission: {
      endpoint: "/missions/:id/join",
      method: "POST",
      description: "Join a mission",
      response: { success: "boolean" },
      usedBy: ["MissionCard"],
    },

    // POST /missions/:id/submit
    submitMission: {
      endpoint: "/missions/:id/submit",
      method: "POST",
      description: "Submit mission completion",
      request: {
        content: "string",
        attachments: "string[]?",
      },
      response: {
        success: "boolean",
        gxpEarned: "number",
      },
      usedBy: ["MissionDetailPage"],
    },
  },

  // Circles Endpoints
  circles: {
    // GET /circles
    getCircles: {
      endpoint: "/circles",
      method: "GET",
      description: "Get growth circles",
      query: {
        category: "string?",
        search: "string?",
      },
      response: {
        circles: [
          {
            id: "string",
            name: "string",
            description: "string",
            icon: "string",
            memberCount: "number",
            tags: "string[]",
            isJoined: "boolean?",
            isPublic: "boolean",
            recentActivity: "string",
          },
        ],
      },
      usedBy: ["CirclesPage"],
    },

    // POST /circles/:id/join
    joinCircle: {
      endpoint: "/circles/:id/join",
      method: "POST",
      description: "Join a circle",
      response: { success: "boolean" },
      usedBy: ["CircleCard"],
    },
  },

  // Leaderboards Endpoints
  leaderboards: {
    // GET /leaderboards/price-rising
    getPriceRising: {
      endpoint: "/leaderboards/price-rising",
      method: "GET",
      description: "Get price rising leaderboard",
      response: {
        leaderboard: [
          {
            id: "string",
            name: "string",
            avatar: "string",
            value: "string",
            change: "string",
            price: "string",
            marketCap: "string?",
            badge: "string?",
            country: "string?",
            school: "string?",
          },
        ],
      },
      usedBy: ["RankingTabs", "HomePage"],
    },

    // GET /leaderboards/market-cap
    getMarketCap: {
      endpoint: "/leaderboards/market-cap",
      method: "GET",
      description: "Get market cap leaderboard",
      response: "Same as price-rising",
      usedBy: ["RankingTabs"],
    },

    // GET /leaderboards/gxp-leaders
    getGXPLeaders: {
      endpoint: "/leaderboards/gxp-leaders",
      method: "GET",
      description: "Get GXP leaders leaderboard",
      response: "Same as price-rising",
      usedBy: ["RankingTabs"],
    },

    // GET /leaderboards/newcomers
    getNewcomers: {
      endpoint: "/leaderboards/newcomers",
      method: "GET",
      description: "Get hot newcomers leaderboard",
      response: "Same as price-rising",
      usedBy: ["RankingTabs"],
    },

    // GET /leaderboards/top-performers
    getTopPerformers: {
      endpoint: "/leaderboards/top-performers",
      method: "GET",
      description: "Get top performers leaderboard",
      response: "Same as price-rising",
      usedBy: ["RankingTabs"],
    },

    // GET /leaderboards/most-supported
    getMostSupported: {
      endpoint: "/leaderboards/most-supported",
      method: "GET",
      description: "Get most supported leaderboard",
      response: "Same as price-rising",
      usedBy: ["RankingTabs"],
    },

    // GET /leaderboards/innovators
    getInnovators: {
      endpoint: "/leaderboards/innovators",
      method: "GET",
      description: "Get innovators leaderboard",
      response: "Same as price-rising",
      usedBy: ["RankingTabs"],
    },

    // GET /leaderboards/global-rising
    getGlobalRising: {
      endpoint: "/leaderboards/global-rising",
      method: "GET",
      description: "Get global rising leaderboard",
      response: "Same as price-rising",
      usedBy: ["RankingTabs"],
    },
  },

  // Market Data Endpoints
  market: {
    // GET /market/stats
    getStats: {
      endpoint: "/market/stats",
      method: "GET",
      description: "Get market overview statistics",
      response: {
        totalMarketCap: "string",
        totalUsers: "number",
        activeTraders: "number",
        totalGXP: "number",
        priceChangePercent: "number",
      },
      usedBy: ["MarketStatsBar", "HomePage"],
    },

    // GET /market/trending-tags
    getTrendingTags: {
      endpoint: "/market/trending-tags",
      method: "GET",
      description: "Get trending tags/sectors",
      response: {
        tags: [
          {
            tag: "string",
            count: "number",
            growth: "string?",
          },
        ],
      },
      usedBy: ["HomePage", "ExplorePage"],
    },

    // GET /market/insights
    getInsights: {
      endpoint: "/market/insights",
      method: "GET",
      description: "Get AI-powered market insights",
      response: {
        insights: [
          {
            type: "trending|opportunity|sentiment",
            title: "string",
            description: "string",
            impact: "high|medium|low",
          },
        ],
      },
      usedBy: ["HomePage"],
    },
  },

  // Search Endpoints
  search: {
    // GET /search
    search: {
      endpoint: "/search",
      method: "GET",
      description: "Search growthers, stocks, missions, circles",
      query: {
        q: "string",
        type: "users|stocks|missions|circles?",
        filters: "object?",
      },
      response: {
        users: "User[]",
        stocks: "Stock[]",
        missions: "Mission[]",
        circles: "Circle[]",
      },
      usedBy: ["SearchPage", "LayoutHeader"],
    },
  },

  // Activity Feed Endpoints
  activities: {
    // GET /activities/feed
    getFeed: {
      endpoint: "/activities/feed",
      method: "GET",
      description: "Get activity feed",
      query: {
        page: "number?",
        limit: "number?",
      },
      response: {
        activities: [
          {
            id: "string",
            user: "string",
            avatar: "string",
            action: "string",
            reward: "string?",
            time: "string",
            type: "challenge|investment|community|project",
          },
        ],
      },
      usedBy: ["HomePage", "ActivityFeedPage"],
    },
  },

  // File Upload Endpoints
  upload: {
    // POST /upload/image
    uploadImage: {
      endpoint: "/upload/image",
      method: "POST",
      description: "Upload image file",
      request: "FormData with file",
      response: {
        success: "boolean",
        url: "string",
        filename: "string",
      },
      usedBy: ["ProfileSetupPage", "GrowthPostPage"],
    },
  },
}

// Mock Data Structures for Development
export const MOCK_DATA_STRUCTURES = {
  user: {
    id: "user-123",
    email: "john@example.com",
    name: "John Doe",
    avatar: "/placeholder.svg?height=80&width=80",
    bio: "Full-stack developer passionate about growth",
    tagline: "Building the future of Web3",
    tags: ["AI", "Web3", "Design"],
    gxp: 2840,
    supporters: 127,
    yoloPrice: "1.45 YOLO",
    growthRate: "+23%",
    country: "Singapore",
    school: "NUS",
    domain: "Technology",
    joinedDate: "2024-01-15",
    totalEarned: "1.8 YOLO",
    isProfileComplete: true,
    hasPostedGrowth: true,
    hasCreatedStock: false,
  },

  stock: {
    id: "stock-123",
    userId: "user-123",
    tokenName: "JOHN-YOLO",
    symbol: "JOHN",
    totalSupply: 10000,
    currentPrice: "1.45 YOLO",
    marketCap: "14.5K YOLO",
    priceChange24h: "+0.23 YOLO",
    priceChangePercent24h: 18.7,
    volume24h: "2.4K YOLO",
    holders: 89,
    createdAt: "2024-01-15T10:00:00Z",
  },

  mission: {
    id: "mission-123",
    title: "AI Model Optimization Challenge",
    description: "Build and optimize a machine learning model",
    gxpReward: 500,
    yoloReward: "0.2 YOLO",
    difficulty: "Hard",
    category: "AI",
    deadline: "2024-02-15T23:59:59Z",
    participants: 23,
    isCompleted: false,
    progress: 75,
  },

  circle: {
    id: "circle-123",
    name: "AI Innovators",
    description: "Community of AI researchers and engineers",
    icon: "🤖",
    memberCount: 1247,
    tags: ["AI", "MachineLearning", "Research"],
    isJoined: false,
    isPublic: true,
    recentActivity: "15 new discussions this week",
  },
}

// Component-API Mapping
export const COMPONENT_API_MAPPING = {
  HomePage: [
    "market.getStats",
    "stocks.getTrending",
    "leaderboards.getPriceRising",
    "leaderboards.getMarketCap",
    "leaderboards.getGXPLeaders",
    "leaderboards.getNewcomers",
    "market.getTrendingTags",
    "market.getInsights",
    "activities.getFeed",
  ],

  ExplorePage: ["users.getProfile", "search.search", "market.getTrendingTags"],

  MissionsPage: ["missions.getMissions", "missions.joinMission"],

  CirclesPage: ["circles.getCircles", "circles.joinCircle"],

  ScoutPage: ["portfolio.getPortfolio", "activities.getFeed"],

  GrowtherDetailPage: [
    "users.getProfile",
    "stocks.getStockDetails",
    "trading.buyStock",
    "trading.sellStock",
    "portfolio.addToWatchlist",
  ],

  ProfilePage: ["users.getProfile", "growth.getPosts", "missions.getMissions", "circles.getCircles"],

  WatchlistPage: ["portfolio.getPortfolio", "users.getProfile"],

  AuthModal: ["auth.login", "auth.signup"],

  CreateYoloModal: ["stocks.createStock"],

  LayoutHeader: ["auth.getCurrentUser", "auth.logout", "search.search"],
}
