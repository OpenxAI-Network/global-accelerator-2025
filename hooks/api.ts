import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { queryKeys, commonQueryOptions } from '@/lib/query-client'
import { useAppStore } from '@/lib/store'

// ==================== 认证相关Hooks ====================

// 获取当前用户
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: api.auth.me,
    ...commonQueryOptions.static,
    retry: false,
  })
}

// 登录
export const useLogin = () => {
  const queryClient = useQueryClient()
  const { login } = useAppStore()
  
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      api.auth.login(email, password),
    onSuccess: (data: any) => {
      // 更新全局状态
      login(data.user)
      // 更新查询缓存
      queryClient.setQueryData(queryKeys.users.me(), data.user)
      // 清除所有查询缓存，重新获取用户相关数据
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
  })
}

// 登出
export const useLogout = () => {
  const queryClient = useQueryClient()
  const { logout } = useAppStore()
  
  return useMutation({
    mutationFn: api.auth.logout,
    onSuccess: () => {
      // 更新全局状态
      logout()
      // 清除所有查询缓存
      queryClient.clear()
    },
  })
}

// ==================== 用户相关Hooks ====================

// 获取用户资料
export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.users.profile(userId),
    queryFn: () => api.user.getProfile(userId),
    ...commonQueryOptions.static,
    enabled: !!userId,
  })
}

// 更新用户资料
export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.user.updateProfile,
    onSuccess: (data: any) => {
      // 更新当前用户缓存
      queryClient.setQueryData(queryKeys.users.me(), data)
      // 更新用户资料缓存
      queryClient.setQueryData(queryKeys.users.profile(data.id), data)
    },
  })
}

// ==================== 帖子相关Hooks ====================

// 获取动态流
export const useFeed = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: queryKeys.posts.feed(page),
    queryFn: () => api.post.getFeed(page, limit),
    ...commonQueryOptions.frequent,
  })
}

// 获取用户帖子
export const useUserPosts = (userId: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: queryKeys.posts.user(userId, page),
    queryFn: () => api.post.getUserPosts(userId, page, limit),
    ...commonQueryOptions.frequent,
    enabled: !!userId,
  })
}

// 创建帖子
export const useCreatePost = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.post.create,
    onSuccess: () => {
      // 刷新动态流
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.feed() })
      // 刷新用户帖子
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all })
      // 刷新股票数据（可能创建了新股票）
      queryClient.invalidateQueries({ queryKey: queryKeys.tokens.all })
    },
  })
}

// 点赞帖子
export const useLikePost = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.post.like,
    onSuccess: () => {
      // 刷新相关帖子数据
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all })
    },
  })
}

// ==================== 股票相关Hooks ====================

// 获取热门股票
export const useTrendingTokens = () => {
  return useQuery({
    queryKey: queryKeys.tokens.trending(),
    queryFn: api.token.getTrending,
    ...commonQueryOptions.realtime,
  })
}

// 获取股票详情
export const useTokenDetail = (tokenId: string) => {
  return useQuery({
    queryKey: queryKeys.tokens.detail(tokenId),
    queryFn: () => api.token.getDetail(tokenId),
    ...commonQueryOptions.realtime,
    enabled: !!tokenId,
  })
}

// 获取我的股票
export const useMyToken = () => {
  return useQuery({
    queryKey: queryKeys.tokens.my(),
    queryFn: api.token.getMy,
    ...commonQueryOptions.static,
  })
}

// 获取股票价格历史
export const useTokenPriceHistory = (tokenId: string, period = '7d') => {
  return useQuery({
    queryKey: queryKeys.tokens.priceHistory(tokenId, period),
    queryFn: () => api.token.getPriceHistory(tokenId, period),
    ...commonQueryOptions.frequent,
    enabled: !!tokenId,
  })
}

// ==================== 交易相关Hooks ====================

// 买入股票
export const useBuyToken = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.transaction.buy,
    onSuccess: () => {
      // 刷新投资组合
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolio.all })
      // 刷新交易历史
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })
      // 刷新股票数据
      queryClient.invalidateQueries({ queryKey: queryKeys.tokens.all })
    },
  })
}

// 获取交易历史
export const useTransactionHistory = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: queryKeys.transactions.history(page),
    queryFn: () => api.transaction.getHistory(page, limit),
    ...commonQueryOptions.frequent,
  })
}

// ==================== 投资组合相关Hooks ====================

// 获取持仓
export const usePortfolioPositions = () => {
  return useQuery({
    queryKey: queryKeys.portfolio.positions(),
    queryFn: api.portfolio.getPositions,
    ...commonQueryOptions.realtime,
  })
}

// 获取收益表现
export const usePortfolioPerformance = (period = '7d') => {
  return useQuery({
    queryKey: queryKeys.portfolio.performance(period),
    queryFn: () => api.portfolio.getPerformance(period),
    ...commonQueryOptions.realtime,
  })
}

// ==================== 任务相关Hooks ====================

// 获取任务列表
export const useMissions = (status?: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: queryKeys.missions.list(status, page),
    queryFn: () => api.mission.getList(status, page, limit),
    ...commonQueryOptions.frequent,
  })
}

// 获取任务详情
export const useMissionDetail = (missionId: string) => {
  return useQuery({
    queryKey: queryKeys.missions.detail(missionId),
    queryFn: () => api.mission.getDetail(missionId),
    ...commonQueryOptions.static,
    enabled: !!missionId,
  })
}

// 参与任务
export const useJoinMission = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.mission.join,
    onSuccess: () => {
      // 刷新任务列表
      queryClient.invalidateQueries({ queryKey: queryKeys.missions.all })
      // 刷新我的任务
      queryClient.invalidateQueries({ queryKey: queryKeys.missions.my() })
    },
  })
}

// ==================== 圈子相关Hooks ====================

// 获取圈子列表
export const useCircles = (category?: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: queryKeys.circles.list(category, page),
    queryFn: () => api.circle.getList(category, page, limit),
    ...commonQueryOptions.frequent,
  })
}

// 获取圈子详情
export const useCircleDetail = (circleId: string) => {
  return useQuery({
    queryKey: queryKeys.circles.detail(circleId),
    queryFn: () => api.circle.getDetail(circleId),
    ...commonQueryOptions.static,
    enabled: !!circleId,
  })
}

// 获取圈子帖子
export const useCirclePosts = (circleId: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: queryKeys.circles.posts(circleId, page),
    queryFn: () => api.circle.getPosts(circleId, page, limit),
    ...commonQueryOptions.frequent,
    enabled: !!circleId,
  })
}

// 加入圈子
export const useJoinCircle = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.circle.join,
    onSuccess: () => {
      // 刷新圈子列表
      queryClient.invalidateQueries({ queryKey: queryKeys.circles.all })
      // 刷新我的圈子
      queryClient.invalidateQueries({ queryKey: queryKeys.circles.my() })
    },
  })
}

// ==================== 排行榜相关Hooks ====================

// 获取成长排行榜
export const useGrowthRanking = (period = 'week') => {
  return useQuery({
    queryKey: queryKeys.rankings.growth(period),
    queryFn: () => api.ranking.getGrowth(period),
    ...commonQueryOptions.frequent,
  })
}

// 获取股票排行榜
export const useTokenRanking = (period = 'week') => {
  return useQuery({
    queryKey: queryKeys.rankings.tokens(period),
    queryFn: () => api.ranking.getTokens(period),
    ...commonQueryOptions.frequent,
  })
}

// 获取用户排行榜
export const useUserRanking = (period = 'week') => {
  return useQuery({
    queryKey: queryKeys.rankings.users(period),
    queryFn: () => api.ranking.getUsers(period),
    ...commonQueryOptions.frequent,
  })
}