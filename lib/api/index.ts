// API服务层 - 封装所有API调用

// 基础API配置
const API_BASE_URL = '/api'

// 通用请求函数
const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }
  
  // 添加认证token（如果存在）
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth-token')
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    if (token || isLoggedIn) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token || 'mock-token'}`,
      }
    }
  }
  
  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }))
      throw new Error(errorData.message || `HTTP ${response.status}`)
    }
    
    const data = await response.json()
    return data.data || data
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error)
    throw error
  }
}

// ==================== 认证API ====================
export const authAPI = {
  // 获取当前用户
  me: () => request('/auth/me'),
  
  // 登录
  login: (email: string, password: string) => 
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  // 登出
  logout: () => request('/auth/logout', { method: 'POST' }),
}

// ==================== 用户API ====================
export const userAPI = {
  // 获取用户资料
  getProfile: (id: string) => request(`/users/${id}`),
  
  // 更新用户资料
  updateProfile: (data: any) => 
    request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// ==================== 帖子API ====================
export const postAPI = {
  // 获取动态流
  getFeed: (page = 1, limit = 10) => 
    request(`/posts/feed?page=${page}&limit=${limit}`),
  
  // 获取用户帖子
  getUserPosts: (userId: string, page = 1, limit = 10) => 
    request(`/posts/user/${userId}?page=${page}&limit=${limit}`),
  
  // 创建帖子
  create: (data: { content: string; images?: string[]; tags?: string[] }) => 
    request('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // 点赞帖子
  like: (postId: string) => 
    request(`/posts/${postId}/like`, { method: 'POST' }),
  
  // 获取帖子评论
  getComments: (postId: string) => 
    request(`/posts/${postId}/comments`),
}

// ==================== 股票API ====================
export const tokenAPI = {
  // 获取热门股票
  getTrending: () => request('/tokens/trending'),
  
  // 获取股票详情
  getDetail: (tokenId: string) => request(`/tokens/${tokenId}`),
  
  // 获取我的股票
  getMy: () => request('/tokens/my'),
  
  // 获取股票持有者
  getHolders: (tokenId: string) => request(`/tokens/${tokenId}/holders`),
  
  // 获取价格历史
  getPriceHistory: (tokenId: string, period = '7d') => 
    request(`/tokens/${tokenId}/price-history?period=${period}`),
}

// ==================== 交易API ====================
export const transactionAPI = {
  // 买入股票
  buy: (data: { tokenId: string; amount: number; price: string }) => 
    request('/transactions/buy', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // 卖出股票
  sell: (data: { tokenId: string; amount: number; price: string }) => 
    request('/transactions/sell', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // 获取交易历史
  getHistory: (page = 1, limit = 10) => 
    request(`/transactions/history?page=${page}&limit=${limit}`),
  
  // 获取待处理交易
  getPending: () => request('/transactions/pending'),
}

// ==================== 投资组合API ====================
export const portfolioAPI = {
  // 获取持仓
  getPositions: () => request('/portfolio/positions'),
  
  // 获取收益表现
  getPerformance: (period = '7d') => 
    request(`/portfolio/performance?period=${period}`),
}

// ==================== 任务API ====================
export const missionAPI = {
  // 获取任务列表
  getList: (status?: string, page = 1, limit = 10) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
    if (status) params.append('status', status)
    return request(`/missions?${params.toString()}`)
  },
  
  // 获取任务详情
  getDetail: (missionId: string) => request(`/missions/${missionId}`),
  
  // 获取我的任务
  getMy: () => request('/missions/my'),
  
  // 参与任务
  join: (missionId: string) => 
    request(`/missions/${missionId}/join`, { method: 'POST' }),
  
  // 创建任务
  create: (data: any) => 
    request('/missions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// ==================== 圈子API ====================
export const circleAPI = {
  // 获取圈子列表
  getList: (category?: string, page = 1, limit = 10) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
    if (category) params.append('category', category)
    return request(`/circles?${params.toString()}`)
  },
  
  // 获取圈子详情
  getDetail: (circleId: string) => request(`/circles/${circleId}`),
  
  // 获取圈子帖子
  getPosts: (circleId: string, page = 1, limit = 10) => 
    request(`/circles/${circleId}/posts?page=${page}&limit=${limit}`),
  
  // 获取圈子成员
  getMembers: (circleId: string) => request(`/circles/${circleId}/members`),
  
  // 获取我的圈子
  getMy: () => request('/circles/my'),
  
  // 加入圈子
  join: (circleId: string) => 
    request(`/circles/${circleId}/join`, { method: 'POST' }),
  
  // 创建圈子
  create: (data: any) => 
    request('/circles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// ==================== 排行榜API ====================
export const rankingAPI = {
  // 获取成长排行榜
  getGrowth: (period = 'week') => 
    request(`/rankings/growth?period=${period}`),
  
  // 获取股票排行榜
  getTokens: (period = 'week') => 
    request(`/rankings/tokens?period=${period}`),
  
  // 获取用户排行榜
  getUsers: (period = 'week') => 
    request(`/rankings/users?period=${period}`),
}

// 导出所有API
export const api = {
  auth: authAPI,
  user: userAPI,
  post: postAPI,
  token: tokenAPI,
  transaction: transactionAPI,
  portfolio: portfolioAPI,
  mission: missionAPI,
  circle: circleAPI,
  ranking: rankingAPI,
}