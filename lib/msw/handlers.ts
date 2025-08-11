import { http, HttpResponse } from 'msw'
import { mockGrowthers, mockMissions, mockCircles, mockTimelineEvents, mockRankingData } from '../mock-data'
import { User } from '../auth'

// 模拟数据存储
let users: User[] = [
  {
    id: 'user-1',
    email: 'john@example.com',
    name: 'John Doe',
    avatar: '/placeholder.svg?height=80&width=80',
    bio: 'Full-stack developer passionate about growth and innovation',
    tags: ['AI', 'Web3', 'Design'],
    school: 'Stanford University',
    domain: 'Technology',
    location: 'San Francisco, CA',
    isProfileComplete: true,
    hasPostedGrowth: true,
    hasCreatedStock: false,
    createdAt: '2024-01-15',
  },
]

let posts: any[] = [
  {
    id: 'post-1',
    userId: 'user-1',
    content: '刚刚完成了一个AI项目的原型，感觉收获很大！',
    images: [],
    tags: ['AI', 'Project'],
    likes: 12,
    comments: 3,
    shares: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

let tokens: any[] = []
let transactions: any[] = []
let portfolios: any[] = []

// 获取当前用户
const getCurrentUser = (request?: Request) => {
  // 检查Authorization header
  if (request) {
    const authHeader = request.headers.get('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return users[0] // 模拟已认证用户
    }
  }
  
  // 模拟从localStorage获取用户信息（仅在浏览器环境）
  if (typeof window !== 'undefined') {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    return isLoggedIn ? users[0] : null
  }
  
  // 默认返回未认证状态
  return null
}

// API处理器
export const handlers = [
  // ==================== 认证相关 ====================
  
  // 获取当前用户
  http.get('/api/auth/me', ({ request }) => {
    const user = getCurrentUser(request)
    if (!user) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({ success: true, data: user })
  }),
  
  // 登录
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json() as any
    const user = users.find(u => u.email === email)
    
    if (!user) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // 模拟登录成功
    if (typeof window !== 'undefined') {
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('auth-token', 'mock-jwt-token')
    }
    
    return HttpResponse.json({
      success: true,
      data: { user, token: 'mock-jwt-token' }
    })
  }),
  
  // 登出
  http.post('/api/auth/logout', () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('auth-token')
    }
    return HttpResponse.json({ success: true })
  }),
  
  // ==================== 用户相关 ====================
  
  // 获取用户资料
  http.get('/api/users/:id', ({ params }) => {
    const { id } = params
    const user = users.find(u => u.id === id) || mockGrowthers.find(g => g.id === id)
    
    if (!user) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    return HttpResponse.json({ success: true, data: user })
  }),
  
  // 更新用户资料
  http.put('/api/users/profile', async ({ request }) => {
    const currentUser = getCurrentUser(request)
    if (!currentUser) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const updates = await request.json() as any
    const userIndex = users.findIndex(u => u.id === currentUser.id)
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates }
      return HttpResponse.json({ success: true, data: users[userIndex] })
    }
    
    return HttpResponse.json({ error: 'User not found' }, { status: 404 })
  }),
  
  // ==================== 帖子相关 ====================
  
  // 获取动态流
  http.get('/api/posts/feed', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedPosts = posts.slice(startIndex, endIndex).map(post => {
      const author = users.find(u => u.id === post.userId) || {
        id: post.userId,
        name: 'Unknown User',
        avatar: '/placeholder.svg?height=40&width=40'
      }
      return { ...post, author }
    })
    
    return HttpResponse.json({
      success: true,
      data: {
        posts: paginatedPosts,
        total: posts.length,
        page,
        limit,
        totalPages: Math.ceil(posts.length / limit)
      }
    })
  }),
  
  // 创建帖子
  http.post('/api/posts', async ({ request }) => {
    const currentUser = getCurrentUser(request)
    if (!currentUser) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { content, images = [], tags = [] } = await request.json() as any
    
    const newPost = {
      id: `post-${Date.now()}`,
      userId: currentUser.id,
      content,
      images,
      tags,
      likes: 0,
      comments: 0,
      shares: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    posts.unshift(newPost)
    
    // 检查是否是首次发帖，如果是则创建个人股票
    if (!currentUser.hasCreatedStock) {
      const newToken = {
        id: `token-${currentUser.id}`,
        userId: currentUser.id,
        tokenName: `${currentUser.name} Token`,
        symbol: currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        totalSupply: 1000000,
        currentPrice: '1.00',
        marketCap: '1000000',
        priceChange24h: '0.00',
        priceChangePercent24h: 0,
        volume24h: '0',
        holders: 1,
        createdAt: new Date().toISOString(),
        isActive: true,
      }
      
      tokens.push(newToken)
      
      // 更新用户状态
      const userIndex = users.findIndex(u => u.id === currentUser.id)
      if (userIndex !== -1) {
        users[userIndex].hasCreatedStock = true
      }
    }
    
    return HttpResponse.json({ success: true, data: newPost })
  }),
  
  // 点赞帖子
  http.post('/api/posts/:id/like', ({ params }) => {
    const { id } = params
    const postIndex = posts.findIndex(p => p.id === id)
    
    if (postIndex === -1) {
      return HttpResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    
    posts[postIndex].likes += 1
    return HttpResponse.json({ success: true, data: posts[postIndex] })
  }),
  
  // ==================== 股票相关 ====================
  
  // 获取热门股票
  http.get('/api/tokens/trending', () => {
    return HttpResponse.json({ success: true, data: tokens.slice(0, 10) })
  }),
  
  // 获取股票详情
  http.get('/api/tokens/:id', ({ params }) => {
    const { id } = params
    const token = tokens.find(t => t.id === id)
    
    if (!token) {
      return HttpResponse.json({ error: 'Token not found' }, { status: 404 })
    }
    
    const user = users.find(u => u.id === token.userId) || mockGrowthers.find(g => g.id === token.userId)
    
    return HttpResponse.json({
      success: true,
      data: {
        ...token,
        user,
        holders: [],
        priceHistory: [],
        recentTransactions: []
      }
    })
  }),
  
  // ==================== 交易相关 ====================
  
  // 买入股票
  http.post('/api/transactions/buy', async ({ request }) => {
    const currentUser = getCurrentUser(request)
    if (!currentUser) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { tokenId, amount, price } = await request.json() as any
    
    const transaction = {
      id: `tx-${Date.now()}`,
      type: 'buy' as const,
      tokenId,
      buyerId: currentUser.id,
      amount,
      price,
      totalValue: (amount * parseFloat(price)).toString(),
      timestamp: new Date().toISOString(),
      status: 'completed' as const,
    }
    
    transactions.push(transaction)
    
    return HttpResponse.json({ success: true, data: transaction })
  }),
  
  // 获取交易历史
  http.get('/api/transactions/history', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedTransactions = transactions.slice(startIndex, endIndex)
    
    return HttpResponse.json({
      success: true,
      data: {
        items: paginatedTransactions,
        total: transactions.length,
        page,
        limit,
        totalPages: Math.ceil(transactions.length / limit)
      }
    })
  }),
  
  // ==================== 任务相关 ====================
  
  // 获取任务列表
  http.get('/api/missions', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    
    let filteredMissions = mockMissions
    // Note: Mission type doesn't have status property, using all missions for now
    // if (status) {
    //   filteredMissions = mockMissions.filter(m => m.status === status)
    // }
    
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedMissions = filteredMissions.slice(startIndex, endIndex)
    
    return HttpResponse.json({
      success: true,
      data: {
        items: paginatedMissions,
        total: filteredMissions.length,
        page,
        limit,
        totalPages: Math.ceil(filteredMissions.length / limit)
      }
    })
  }),
  
  // ==================== 圈子相关 ====================
  
  // 获取圈子列表
  http.get('/api/circles', ({ request }) => {
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    
    let filteredCircles = mockCircles
    // Note: Circle type doesn't have category property, using all circles for now
    // if (category) {
    //   filteredCircles = mockCircles.filter(c => c.category === category)
    // }
    
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedCircles = filteredCircles.slice(startIndex, endIndex)
    
    return HttpResponse.json({
      success: true,
      data: {
        items: paginatedCircles,
        total: filteredCircles.length,
        page,
        limit,
        totalPages: Math.ceil(filteredCircles.length / limit)
      }
    })
  }),
  
  // ==================== 排行榜相关 ====================
  
  // 获取成长排行榜
  http.get('/api/rankings/growth', ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'week'
    
    return HttpResponse.json({
      success: true,
      data: mockRankingData
    })
  }),
]