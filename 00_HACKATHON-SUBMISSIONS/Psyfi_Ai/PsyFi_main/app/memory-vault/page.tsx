"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Database, Clock, TrendingUp, Eye, Download, Zap } from "lucide-react"

export default function MemoryVaultPage() {
  const memories = [
    {
      id: "MEM-001",
      type: "AI Strategy",
      title: "ETH Bull Run Prediction",
      date: "2025-06-15",
      performance: "+24.5%",
      arweaveHash: "mem_abc123...def456",
      description: "AI predicted ETH surge 3 days before it happened",
      confidence: 94,
      outcome: "success",
    },
    {
      id: "MEM-002",
      type: "Portfolio Decision",
      title: "DeFi Rebalancing",
      date: "2025-06-10",
      performance: "+12.3%",
      arweaveHash: "mem_xyz789...uvw012",
      description: "Automated rebalancing into stablecoins before market dip",
      confidence: 87,
      outcome: "success",
    },
    {
      id: "MEM-003",
      type: "Risk Assessment",
      title: "Rug Pull Prevention",
      date: "2025-06-08",
      performance: "Saved $5,000",
      arweaveHash: "mem_mno345...pqr678",
      description: "FRAI-M detected suspicious token contract",
      confidence: 99,
      outcome: "prevented_loss",
    },
  ]

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case "success":
        return "bg-green-500/20 text-green-400"
      case "prevented_loss":
        return "bg-blue-500/20 text-blue-400"
      case "partial":
        return "bg-orange-500/20 text-orange-400"
      case "failed":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-neutral-500/20 text-neutral-400"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wider flex items-center gap-2">
            <Database className="w-8 h-8 text-orange-400" />
            MEMORY VAULT
          </h1>
          <p className="text-sm text-neutral-400">Permanent record of AI decisions and performance</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600 text-white">
            <Download className="w-4 h-4 mr-2" />
            Export History
          </Button>
        </div>
      </div>

      {/* Vault Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-orange-900/20 to-black border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-400 tracking-wider">TOTAL MEMORIES</p>
                <p className="text-2xl font-bold text-white font-mono">1,247</p>
              </div>
              <Database className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-900/20 to-black border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-400 tracking-wider">SUCCESS RATE</p>
                <p className="text-2xl font-bold text-white font-mono">89.3%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-900/20 to-black border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-400 tracking-wider">ARWEAVE SIZE</p>
                <p className="text-2xl font-bold text-white font-mono">2.4GB</p>
              </div>
              <Zap className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-cyan-900/20 to-black border-cyan-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-400 tracking-wider">UPTIME</p>
                <p className="text-2xl font-bold text-white font-mono">99.9%</p>
              </div>
              <Clock className="w-8 h-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Memory Timeline */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-wider">AI DECISION HISTORY</h2>
        {memories.map((memory, index) => (
          <Card
            key={memory.id}
            className="bg-gradient-to-r from-black to-orange-900/10 border-orange-500/30 hover:border-purple-500/50 transition-colors"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-orange-400" />
                  <div>
                    <CardTitle className="text-lg font-bold text-white tracking-wider">{memory.title}</CardTitle>
                    <p className="text-sm text-neutral-400">
                      {memory.type} • {memory.id}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400 font-mono">{memory.performance}</div>
                  <div className="text-xs text-neutral-400">{memory.date}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-orange-400 mb-2">DESCRIPTION</h4>
                  <p className="text-white text-sm">{memory.description}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-purple-400 mb-2">AI CONFIDENCE</h4>
                  <p className="text-cyan-400 font-mono">{memory.confidence}%</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-orange-500/30">
                <div className="flex items-center gap-4">
                  <Badge className={getOutcomeColor(memory.outcome)}>
                    {memory.outcome.replace("_", " ").toUpperCase()}
                  </Badge>
                  <div className="text-xs text-neutral-400">
                    Arweave: <span className="text-cyan-400 font-mono">{memory.arweaveHash}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-orange-500/50 text-orange-400 hover:bg-orange-900/20 bg-transparent"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                  <Button size="sm" className="bg-gradient-to-r from-orange-500 to-purple-500 text-white">
                    Verify on Arweave
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 3D Timeline Visualization */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-orange-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-purple-400 tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4" />
            PERFORMANCE TIMELINE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 relative bg-black/50 rounded border border-purple-500/30">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Database className="w-8 h-8 text-white" />
                </div>
                <p className="text-white font-bold">3D Timeline Visualization</p>
                <p className="text-neutral-400 text-sm">Interactive memory exploration coming soon</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
