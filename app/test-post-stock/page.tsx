"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { CreateYoloModal } from "@/components/create-yolo-modal"
import { LayoutHeader } from "@/components/layout-header"

export default function TestPostStockPage() {
  const [newPost, setNewPost] = useState("")
  const [showCreateYoloModal, setShowCreateYoloModal] = useState(false)
  const [posts, setPosts] = useState<any[]>([])
  
  // 模拟用户状态
  const userStatus = {
    isLoggedIn: true,
    hasCompletedProfile: true,
    hasPostedGrowth: true,
    hasCreatedToken: false
  }
  
  const handleSubmitPost = () => {
    if (newPost.trim()) {
      const post = {
        id: Date.now().toString(),
        user: "Test User",
        content: newPost,
        timestamp: "Just now",
        likes: 0,
        comments: 0,
        shares: 0
      }
      setPosts([post, ...posts])
      setNewPost("")
      
      // 发帖成功后显示创建股票模态框
      setShowCreateYoloModal(true)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <LayoutHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">测试发帖后弹出创建股票功能</h1>
          <p className="text-slate-400">在下方发布一个帖子，发帖成功后会自动弹出创建股票的界面</p>
        </div>
        
        {/* 发帖表单 */}
        <Card className="bg-gray-900/50 border-gray-800 mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Textarea
                placeholder="分享你的想法..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 resize-none min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmitPost}
                  disabled={!newPost.trim()}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  发布帖子
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* 帖子列表 */}
        {posts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">已发布的帖子:</h2>
            {posts.map((post) => (
              <Card key={post.id} className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-white">{post.user}</span>
                    <span className="text-sm text-gray-400">{post.timestamp}</span>
                  </div>
                  <p className="text-gray-300 relative z-20">{post.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Create YOLO Stock Modal */}
      <CreateYoloModal 
        isOpen={showCreateYoloModal}
        onClose={() => setShowCreateYoloModal(false)}
        userStatus={userStatus}
      />
    </div>
  )
}