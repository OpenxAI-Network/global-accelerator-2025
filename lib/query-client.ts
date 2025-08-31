import { QueryClient } from '@tanstack/react-query'

// 创建Query Client实例
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 数据缓存时间 (5分钟)
      staleTime: 1000 * 60 * 5,
      // 缓存保持时间 (10分钟)
      gcTime: 1000 * 60 * 10,
      // 重试次数
      retry: 3,
      // 重试延迟
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // 窗口聚焦时重新获取
      refetchOnWindowFocus: false,
      // 网络重连时重新获取
      refetchOnReconnect: true,
    },
    mutations: {
      // 重试次数
      retry: 1,
      // 重试延迟
      retryDelay: 1000,
    },
  },
})

// Query Keys 常量
export const queryKeys = {
  // 用户相关
  users: {
    all: ['users'] as const,
    profile: (id: string) => ['users', 'profile', id] as const,
    me: () => ['users', 'me'] as const,
    followers: (id: string) => ['users', 'followers', id] as const,
    following: (id: string) => ['users', 'following', id] as const,
  },
  
  // 帖子相关
  posts: {
    all: ['posts'] as const,
    feed: (page?: number) => ['posts', 'feed', page] as const,
    user: (userId: string, page?: number) => ['posts', 'user', userId, page] as const,
    detail: (id: string) => ['posts', 'detail', id] as const,
    comments: (postId: string) => ['posts', 'comments', postId] as const,
  },
  
  // 股票相关
  tokens: {
    all: ['tokens'] as const,
    trending: () => ['tokens', 'trending'] as const,
    detail: (id: string) => ['tokens', 'detail', id] as const,
    holders: (id: string) => ['tokens', 'holders', id] as const,
    priceHistory: (id: string, period?: string) => ['tokens', 'price-history', id, period] as const,
    my: () => ['tokens', 'my'] as const,
  },
  
  // 交易相关
  transactions: {
    all: ['transactions'] as const,
    history: (page?: number) => ['transactions', 'history', page] as const,
    pending: () => ['transactions', 'pending'] as const,
  },
  
  // 投资组合相关
  portfolio: {
    all: ['portfolio'] as const,
    positions: () => ['portfolio', 'positions'] as const,
    performance: (period?: string) => ['portfolio', 'performance', period] as const,
  },
  
  // 任务相关
  missions: {
    all: ['missions'] as const,
    list: (status?: string, page?: number) => ['missions', 'list', status, page] as const,
    detail: (id: string) => ['missions', 'detail', id] as const,
    my: () => ['missions', 'my'] as const,
  },
  
  // 圈子相关
  circles: {
    all: ['circles'] as const,
    list: (category?: string, page?: number) => ['circles', 'list', category, page] as const,
    detail: (id: string) => ['circles', 'detail', id] as const,
    posts: (id: string, page?: number) => ['circles', 'posts', id, page] as const,
    members: (id: string) => ['circles', 'members', id] as const,
    my: () => ['circles', 'my'] as const,
  },
  
  // 排行榜相关
  rankings: {
    all: ['rankings'] as const,
    growth: (period?: string) => ['rankings', 'growth', period] as const,
    tokens: (period?: string) => ['rankings', 'tokens', period] as const,
    users: (period?: string) => ['rankings', 'users', period] as const,
  },
} as const

// 查询选项类型
export type QueryKey = typeof queryKeys[keyof typeof queryKeys]

// 常用查询选项
export const commonQueryOptions = {
  // 实时数据 (股票价格等)
  realtime: {
    staleTime: 1000 * 30, // 30秒
    gcTime: 1000 * 60 * 2, // 2分钟
    refetchInterval: 1000 * 30, // 30秒自动刷新
  },
  
  // 静态数据 (用户资料等)
  static: {
    staleTime: 1000 * 60 * 30, // 30分钟
    gcTime: 1000 * 60 * 60, // 1小时
  },
  
  // 频繁更新数据 (动态流等)
  frequent: {
    staleTime: 1000 * 60, // 1分钟
    gcTime: 1000 * 60 * 5, // 5分钟
  },
} as const