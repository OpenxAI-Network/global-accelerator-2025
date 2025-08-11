"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Image, Smile } from "lucide-react"

export default function TestInputPage() {
  const [inputValue, setInputValue] = useState("")
  const [posts, setPosts] = useState<any[]>([])

  const handleSubmit = () => {
    if (inputValue.trim()) {
      const newPost = {
        id: Date.now().toString(),
        content: inputValue,
        timestamp: "Just now"
      }
      setPosts([newPost, ...posts])
      setInputValue("")
      alert("发帖成功！")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">输入测试页面</h1>
        
        {/* 测试输入表单 */}
        <Card className="bg-gray-900/50 border-gray-800 mb-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar className="w-12 h-12 border-2 border-cyan-500/30">
                <AvatarImage src="/placeholder.svg?height=48&width=48" />
                <AvatarFallback>TU</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="测试输入框...请在这里输入文字"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 resize-none min-h-[100px] focus:border-cyan-500/50"
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Image className="w-4 h-4 mr-2" />
                      图片
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Smile className="w-4 h-4 mr-2" />
                      表情
                    </Button>
                  </div>
                  <Button 
                    onClick={handleSubmit}
                    disabled={!inputValue.trim()}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    发布
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 显示当前输入值 */}
        <Card className="bg-gray-900/50 border-gray-800 mb-8">
          <CardContent className="p-4">
            <h3 className="text-white font-semibold mb-2">当前输入值：</h3>
            <p className="text-gray-300 break-words">{inputValue || "(空)"}</p>
            <p className="text-gray-400 text-sm mt-2">字符数：{inputValue.length}</p>
          </CardContent>
        </Card>

        {/* 显示已发布的帖子 */}
        {posts.length > 0 && (
          <div>
            <h3 className="text-white font-semibold mb-4">已发布的帖子：</h3>
            {posts.map((post) => (
              <Card key={post.id} className="bg-gray-900/50 border-gray-800 mb-4">
                <CardContent className="p-4">
                  <p className="text-white">{post.content}</p>
                  <p className="text-gray-400 text-sm mt-2">{post.timestamp}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}