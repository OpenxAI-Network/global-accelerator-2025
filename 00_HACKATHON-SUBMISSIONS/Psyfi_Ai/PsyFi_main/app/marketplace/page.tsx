"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Star, TrendingUp, Eye, ShoppingCart, User } from "lucide-react"

export default function MarketplacePage() {
  const aiModels = [
    {
      id: "NFT-001",
      name: "ETH Bull Predictor v2.1",
      creator: "0x742d...caAb",
      price: "50 PSY",
      rating: 4.8,
      accuracy: "91.2%",
      sales: 234,
      description: "Advanced ML model for ETH price predictions with 7-day accuracy",
      tags: ["prediction", "ethereum", "ml"],
      verified: true,
    },
    {
      id: "NFT-002",
      name: "DeFi Risk Analyzer",
      creator: "0x8ba1...01e3",
      price: "75 PSY",
      rating: 4.6,
      accuracy: "87.5%",
      sales: 156,
      description: "Comprehensive risk assessment for DeFi protocols and pools",
      tags: ["risk", "defi", "analysis"],
      verified: true,
    },
    {
      id: "NFT-003",
      name: "Rug Pull Detector Pro",
      creator: "0x1f98...F984",
      price: "100 PSY",
      rating: 4.9,
      accuracy: "96.8%",
      sales: 89,
      description: "State-of-the-art fraud detection for new token launches",
      tags: ["fraud", "security", "detection"],
      verified: true,
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wider flex items-center gap-2">
            <Zap className="w-8 h-8 text-pink-400" />
            AI MARKETPLACE
          </h1>
          <p className="text-sm text-neutral-400">Trade AI models and insights as NFTs</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white">
            <ShoppingCart className="w-4 h-4 mr-2" />
            My Collection
          </Button>
        </div>
      </div>

      {/* Marketplace Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-pink-900/20 to-black border-pink-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-pink-400 tracking-wider">TOTAL MODELS</p>
                <p className="text-2xl font-bold text-white font-mono">1,247</p>
              </div>
              <Zap className="w-8 h-8 text-pink-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-900/20 to-black border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-400 tracking-wider">VOLUME (24H)</p>
                <p className="text-2xl font-bold text-white font-mono">12.4K PSY</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-cyan-900/20 to-black border-cyan-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-400 tracking-wider">ACTIVE TRADERS</p>
                <p className="text-2xl font-bold text-white font-mono">892</p>
              </div>
              <User className="w-8 h-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-900/20 to-black border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-400 tracking-wider">AVG ACCURACY</p>
                <p className="text-2xl font-bold text-white font-mono">88.7%</p>
              </div>
              <Star className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Featured AI Models */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-wider">FEATURED AI MODELS</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {aiModels.map((model) => (
            <Card
              key={model.id}
              className="bg-gradient-to-r from-black to-pink-900/10 border-pink-500/30 hover:border-purple-500/50 transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-white tracking-wider">{model.name}</CardTitle>
                    <p className="text-sm text-neutral-400 font-mono">{model.id}</p>
                  </div>
                  {model.verified && <Badge className="bg-green-500/20 text-green-400">VERIFIED</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-neutral-300">{model.description}</p>

                <div className="flex flex-wrap gap-2">
                  {model.tags.map((tag) => (
                    <Badge key={tag} className="bg-purple-500/20 text-purple-400 text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-neutral-400">Accuracy</div>
                    <div className="text-green-400 font-mono">{model.accuracy}</div>
                  </div>
                  <div>
                    <div className="text-neutral-400">Rating</div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-white">{model.rating}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-neutral-400">Sales</div>
                    <div className="text-white font-mono">{model.sales}</div>
                  </div>
                  <div>
                    <div className="text-neutral-400">Creator</div>
                    <div className="text-cyan-400 font-mono text-xs">{model.creator}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-pink-500/30">
                  <div className="text-2xl font-bold text-pink-400 font-mono">{model.price}</div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-pink-500/50 text-pink-400 hover:bg-pink-900/20 bg-transparent"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Buy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Create & Sell */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-purple-400 tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4" />
            CREATE & SELL YOUR AI MODEL
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-bold text-white mb-4">Monetize Your AI</h4>
              <ul className="space-y-2 text-sm text-neutral-300">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Upload your trained AI model
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Set your price in PSY tokens
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Earn royalties on every sale
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Build your reputation as an AI creator
                </li>
              </ul>
            </div>
            <div className="flex items-center justify-center">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3">
                Start Creating
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
