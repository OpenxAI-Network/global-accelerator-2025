'use client'

import { useCurrentUser, useLogin, useTrendingTokens, useFeed } from '@/hooks/api'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestMockPage() {
  const { user, isAuthenticated } = useAppStore()
  const { data: currentUser, isLoading: userLoading } = useCurrentUser()
  const { data: trendingTokens, isLoading: tokensLoading } = useTrendingTokens()
  const { data: feed, isLoading: feedLoading } = useFeed()
  const loginMutation = useLogin()

  const handleLogin = () => {
    loginMutation.mutate({
      email: 'test@example.com',
      password: 'password123'
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Mock 基座测试页面</h1>
      
      {/* 认证状态 */}
      <Card>
        <CardHeader>
          <CardTitle>认证状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>全局状态认证: {isAuthenticated ? '已登录' : '未登录'}</p>
            <p>当前用户: {userLoading ? '加载中...' : currentUser ? (currentUser as any).name : '无'}</p>
            <p>用户ID: {user?.id || '无'}</p>
            {!isAuthenticated && (
              <Button onClick={handleLogin} disabled={loginMutation.isPending}>
                {loginMutation.isPending ? '登录中...' : '测试登录'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 热门股票 */}
      <Card>
        <CardHeader>
          <CardTitle>热门股票 (MSW Mock)</CardTitle>
        </CardHeader>
        <CardContent>
          {tokensLoading ? (
            <p>加载中...</p>
          ) : trendingTokens ? (
            <div className="space-y-2">
              {(trendingTokens as any[]).map((token: any) => (
                <div key={token.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <span className="font-medium">{token.symbol}</span>
                    <span className="text-sm text-muted-foreground ml-2">{token.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${token.price}</div>
                    <div className={`text-sm ${
                      token.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>暂无数据</p>
          )}
        </CardContent>
      </Card>

      {/* 动态流 */}
      <Card>
        <CardHeader>
          <CardTitle>动态流 (MSW Mock)</CardTitle>
        </CardHeader>
        <CardContent>
          {feedLoading ? (
            <p>加载中...</p>
          ) : feed ? (
            <div className="space-y-4">
              {(feed as any)?.posts?.map((post: any) => (
                <div key={post.id} className="p-4 border rounded">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm">
                      {post.author.name.charAt(0)}
                    </div>
                    <span className="font-medium">{post.author.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(post.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="mb-2 relative z-20">{post.content}</p>
                  <div className="flex space-x-4 text-sm text-muted-foreground">
                    <span>👍 {post.likes}</span>
                    <span>💬 {post.comments}</span>
                    <span>🔄 {post.shares}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>暂无数据</p>
          )}
        </CardContent>
      </Card>

      {/* 技术栈信息 */}
      <Card>
        <CardHeader>
          <CardTitle>技术栈状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">状态管理</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>✅ Zustand (全局状态)</li>
                <li>✅ TanStack Query (数据状态)</li>
                <li>✅ React Query DevTools</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">数据模拟</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>✅ MSW (API拦截)</li>
                <li>✅ LocalStorage (持久化)</li>
                <li>✅ Mock数据生成</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}