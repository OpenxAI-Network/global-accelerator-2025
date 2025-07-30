"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Bot, TrendingUp, Brain, Zap, Target, Send, Sparkles, Download } from "lucide-react"

export default function AIInsightsPage() {
  const [selectedInsight, setSelectedInsight] = useState<any>(null)
  const [chatMessage, setChatMessage] = useState("")
  const [chatHistory, setChatHistory] = useState<any[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedInsight, setGeneratedInsight] = useState<any>(null)
  const [showGeneratedInsight, setShowGeneratedInsight] = useState(false)

  const [insights, setInsights] = useState([
    {
      id: "AI-001",
      title: "ETHEREUM BULLISH MOMENTUM",
      confidence: 94,
      type: "prediction",
      timeframe: "7 days",
      prediction: "+15.2% price increase expected",
      reasoning:
        "Technical indicators show strong support at $2,800 with increasing volume and institutional accumulation patterns",
      arweaveHash: "abc123...def456",
      timestamp: "2025-06-17 14:23 UTC",
      impact: "high",
      accuracy: 91.2,
    },
    {
      id: "AI-002",
      title: "PORTFOLIO REBALANCING SIGNAL",
      confidence: 87,
      type: "recommendation",
      timeframe: "immediate",
      prediction: "Reduce BTC allocation by 10%",
      reasoning: "Risk-adjusted returns favor diversification into stablecoins due to upcoming market volatility",
      arweaveHash: "xyz789...uvw012",
      timestamp: "2025-06-17 13:45 UTC",
      impact: "medium",
      accuracy: 89.5,
    },
    {
      id: "AI-003",
      title: "DEFI YIELD OPPORTUNITY",
      confidence: 91,
      type: "opportunity",
      timeframe: "3 days",
      prediction: "AAVE lending pool APY spike to 18%",
      reasoning: "Increased borrowing demand detected, supply shortage imminent based on on-chain analytics",
      arweaveHash: "mno345...pqr678",
      timestamp: "2025-06-17 12:30 UTC",
      impact: "high",
      accuracy: 93.1,
    },
    {
      id: "AI-004",
      title: "MARKET SENTIMENT SHIFT",
      confidence: 82,
      type: "alert",
      timeframe: "24 hours",
      prediction: "Bearish sentiment incoming",
      reasoning: "Social media sentiment analysis and whale movement patterns indicate potential market correction",
      arweaveHash: "def789...ghi012",
      timestamp: "2025-06-17 11:15 UTC",
      impact: "medium",
      accuracy: 86.7,
    },
  ])

  const aiStats = [
    { label: "AI MODELS ACTIVE", value: "12", icon: Brain, color: "purple" },
    { label: "PREDICTIONS TODAY", value: "47", icon: Target, color: "cyan" },
    { label: "ACCURACY RATE", value: "89.3%", icon: TrendingUp, color: "green" },
  ]

  const generationStages = [
    "Initializing AI models...",
    "Scanning blockchain data...",
    "Analyzing market patterns...",
    "Processing social sentiment...",
    "Evaluating technical indicators...",
    "Cross-referencing historical data...",
    "Running predictive algorithms...",
    "Calculating confidence scores...",
    "Generating recommendations...",
    "Validating insights...",
    "Storing on Arweave...",
    "Finalizing report...",
  ]

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-400"
    if (confidence >= 80) return "text-cyan-400"
    if (confidence >= 70) return "text-orange-400"
    return "text-red-400"
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "prediction":
        return "bg-purple-500/20 text-purple-400 border-purple-500/50"
      case "recommendation":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
      case "opportunity":
        return "bg-green-500/20 text-green-400 border-green-500/50"
      case "alert":
        return "bg-orange-500/20 text-orange-400 border-orange-500/50"
      default:
        return "bg-neutral-500/20 text-neutral-400 border-neutral-500/50"
    }
  }

  const generateNewInsight = async () => {
    setIsGenerating(true)

    // Simulate 15-second generation process
    for (let i = 0; i < generationStages.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1250)) // ~15 seconds total
    }

    // Generate new insight
    const newInsight = {
      id: `AI-${String(insights.length + 1).padStart(3, "0")}`,
      title: "LAYER 2 SCALING OPPORTUNITY",
      confidence: 93,
      type: "opportunity",
      timeframe: "5 days",
      prediction: "Polygon (MATIC) expected +22% surge",
      reasoning:
        "Ethereum gas fees reaching critical levels, driving massive migration to Layer 2 solutions. Polygon showing strongest fundamentals with upcoming zkEVM launch and institutional partnerships.",
      arweaveHash: `gen${Date.now()}...${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString().replace("T", " ").substr(0, 16) + " UTC",
      impact: "high",
      accuracy: 94.7,
      detailedAnalysis: {
        technicalIndicators: [
          "RSI showing oversold conditions at 28",
          "MACD bullish crossover confirmed",
          "Volume spike +340% in last 24h",
          "Support level holding at $0.85",
        ],
        fundamentalFactors: [
          "zkEVM mainnet launch scheduled",
          "Disney partnership announcement",
          "Ethereum gas fees at 6-month high",
          "Developer activity increased 45%",
        ],
        riskFactors: ["General market volatility", "Regulatory uncertainty", "Competition from other L2s"],
        priceTargets: {
          conservative: "$1.15",
          moderate: "$1.28",
          aggressive: "$1.45",
        },
      },
    }

    setGeneratedInsight(newInsight)
    setIsGenerating(false)
    setShowGeneratedInsight(true)

    // Add to insights list
    setInsights((prev) => [newInsight, ...prev])
  }

  const downloadInsight = (insight: any) => {
    const reportContent = `
PsyFi AI INSIGHT REPORT
Generated: ${new Date().toISOString()}
Arweave Hash: ${insight.arweaveHash}

═══════════════════════════════════════════════════════════════

INSIGHT OVERVIEW
═══════════════════════════════════════════════════════════════
ID: ${insight.id}
Title: ${insight.title}
Type: ${insight.type.toUpperCase()}
Confidence: ${insight.confidence}%
Timeframe: ${insight.timeframe}
Impact Level: ${insight.impact.toUpperCase()}

PREDICTION
═══════════════════════════════════════════════════════════════
${insight.prediction}

AI REASONING
═══════════════════════════════════════════════════════════════
${insight.reasoning}

${
  insight.detailedAnalysis
    ? `
DETAILED ANALYSIS
═══════════════════════════════════════════════════════════════

TECHNICAL INDICATORS:
${insight.detailedAnalysis.technicalIndicators.map((item: string) => `• ${item}`).join("\n")}

FUNDAMENTAL FACTORS:
${insight.detailedAnalysis.fundamentalFactors.map((item: string) => `• ${item}`).join("\n")}

RISK FACTORS:
${insight.detailedAnalysis.riskFactors.map((item: string) => `• ${item}`).join("\n")}

PRICE TARGETS:
• Conservative: ${insight.detailedAnalysis.priceTargets.conservative}
• Moderate: ${insight.detailedAnalysis.priceTargets.moderate}
• Aggressive: ${insight.detailedAnalysis.priceTargets.aggressive}
`
    : ""
}

VERIFICATION
═══════════════════════════════════════════════════════════════
This insight has been permanently stored on Arweave blockchain
for transparency and immutability.

Hash: ${insight.arweaveHash}
Timestamp: ${insight.timestamp}
Historical Accuracy: ${insight.accuracy}%

═══════════════════════════════════════════════════════════════
Generated by PsyFi AI-Powered DeFi OS
Built on Arweave for Permanent Transparency
    `.trim()

    const blob = new Blob([reportContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `PsyFi_AI_Insight_${insight.id}_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleChatSubmit = async () => {
    if (!chatMessage.trim()) return

    const userMessage = { type: "user", content: chatMessage, timestamp: new Date() }
    setChatHistory((prev) => [...prev, userMessage])
    setChatMessage("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        type: "ai",
        content:
          "Based on current market conditions and your portfolio, I recommend maintaining your current DeFi positions while monitoring the upcoming ETH upgrade. The risk-reward ratio favors a cautious approach.",
        timestamp: new Date(),
        confidence: 87,
      }
      setChatHistory((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }, 2000)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 tracking-wider flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Bot className="w-8 h-8 text-purple-400" />
            </motion.div>
            AI INSIGHTS
          </h1>
          <p className="text-sm text-neutral-400 mt-1">AI-powered market analysis and recommendations</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={generateNewInsight}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white shadow-lg shadow-purple-500/25"
          >
            <Brain className="w-4 h-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate New Insight"}
          </Button>
        </motion.div>
      </motion.div>

      {/* AI Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {aiStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <Card
              className={`bg-gradient-to-r from-${stat.color}-900/20 to-black/50 backdrop-blur-xl border-${stat.color}-500/30 hover:border-${stat.color}-500/50 transition-all duration-300`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs text-${stat.color}-400 tracking-wider font-medium`}>{stat.label}</p>
                    <motion.p
                      key={stat.value}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-2xl font-bold text-white font-mono mt-1"
                    >
                      {stat.value}
                    </motion.p>
                  </div>
                  <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                    <stat.icon className={`w-8 h-8 text-${stat.color}-400`} />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* AI Insights List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h2 className="text-xl font-bold text-white tracking-wider">ACTIVE AI INSIGHTS</h2>
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            whileHover={{ scale: 1.01, y: -2 }}
          >
            <Card
              className="bg-gradient-to-r from-black/50 to-purple-900/10 backdrop-blur-xl border-purple-500/30 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedInsight(insight)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.5 }}
                    >
                      <Bot className="w-6 h-6 text-purple-400" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-lg font-bold text-white tracking-wider">{insight.title}</CardTitle>
                      <p className="text-sm text-neutral-400 font-mono">{insight.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getTypeColor(insight.type)} border`}>{insight.type.toUpperCase()}</Badge>
                    <div className={`text-sm font-bold ${getConfidenceColor(insight.confidence)}`}>
                      {insight.confidence}% CONFIDENCE
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-cyan-400 mb-2">PREDICTION</h4>
                    <p className="text-white">{insight.prediction}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-purple-400 mb-2">AI REASONING</h4>
                    <p className="text-neutral-300 text-sm">{insight.reasoning}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-purple-500/30">
                  <div className="flex items-center gap-4 text-xs text-neutral-400">
                    <div>
                      Timeframe: <span className="text-white">{insight.timeframe}</span>
                    </div>
                    <div>
                      Accuracy: <span className="text-green-400">{insight.accuracy}%</span>
                    </div>
                    <div>
                      Stored: <span className="text-cyan-400 font-mono">{insight.arweaveHash}</span>
                    </div>
                    <div>{insight.timestamp}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        downloadInsight(insight)
                      }}
                      className="border-green-500/50 text-green-400 hover:bg-green-900/20 bg-transparent"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-purple-500/50 text-purple-400 hover:bg-purple-900/20 bg-transparent"
                    >
                      View on Arweave
                    </Button>
                    <Button size="sm" className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white">
                      Apply Insight
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* AI Chat Interface */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="bg-gradient-to-r from-purple-900/20 to-cyan-900/20 backdrop-blur-xl border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-cyan-400 tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4" />
              ASK THE AI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Chat History */}
            {chatHistory.length > 0 && (
              <div className="max-h-60 overflow-y-auto space-y-3 p-4 bg-black/30 rounded-lg border border-purple-500/20">
                {chatHistory.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs p-3 rounded-lg ${
                        message.type === "user" ? "bg-purple-500/20 text-white" : "bg-cyan-500/20 text-white"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.confidence && (
                        <p className="text-xs text-cyan-400 mt-1">Confidence: {message.confidence}%</p>
                      )}
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-cyan-500/20 p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0 }}
                          className="w-2 h-2 bg-cyan-400 rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
                          className="w-2 h-2 bg-cyan-400 rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
                          className="w-2 h-2 bg-cyan-400 rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Chat Input */}
            <div className="flex gap-2">
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleChatSubmit()}
                placeholder="Ask AI about market trends, portfolio optimization, or risk analysis..."
                className="flex-1 bg-black/50 border-purple-500/30 text-white placeholder-neutral-500 focus:border-cyan-500/50"
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleChatSubmit}
                  disabled={!chatMessage.trim() || isTyping}
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
            <div className="text-xs text-neutral-500 text-center">
              <Sparkles className="w-3 h-3 inline mr-1" />
              All AI responses are timestamped and stored on Arweave for transparency
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Generation Loading Modal */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md"
            >
              <Card className="bg-black/90 backdrop-blur-xl border-purple-500/50 shadow-2xl shadow-purple-500/20">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 tracking-wider">
                    GENERATING AI INSIGHT
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-400 rounded-full"
                    />
                  </div>

                  <div className="space-y-3">
                    {generationStages.map((stage, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0.3 }}
                        animate={{
                          opacity: index < Math.floor((Date.now() % 15000) / 1250) ? 1 : 0.3,
                          x: index < Math.floor((Date.now() % 15000) / 1250) ? 0 : -10,
                        }}
                        className={`text-sm flex items-center gap-2 ${
                          index < Math.floor((Date.now() % 15000) / 1250) ? "text-cyan-400" : "text-neutral-500"
                        }`}
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                          className={`w-2 h-2 rounded-full ${
                            index < Math.floor((Date.now() % 15000) / 1250) ? "bg-cyan-400" : "bg-neutral-600"
                          }`}
                        />
                        {stage}
                      </motion.div>
                    ))}
                  </div>

                  <div className="w-full bg-neutral-800 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 15, ease: "linear" }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Insight Modal */}
      <AnimatePresence>
        {showGeneratedInsight && generatedInsight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowGeneratedInsight(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-black/90 backdrop-blur-xl border-purple-500/50 shadow-2xl shadow-purple-500/20">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 tracking-wider">
                      NEW AI INSIGHT GENERATED
                    </CardTitle>
                    <p className="text-sm text-neutral-400 font-mono">{generatedInsight.id}</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setShowGeneratedInsight(false)}
                    className="text-neutral-400 hover:text-white"
                  >
                    ✕
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">{generatedInsight.title}</h3>
                        <div className="flex items-center gap-2 mb-4">
                          <Badge className={getTypeColor(generatedInsight.type)}>
                            {generatedInsight.type.toUpperCase()}
                          </Badge>
                          <div className={`text-lg font-bold ${getConfidenceColor(generatedInsight.confidence)}`}>
                            {generatedInsight.confidence}% CONFIDENCE
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-cyan-400 mb-2">PREDICTION</h4>
                        <p className="text-white text-lg font-medium">{generatedInsight.prediction}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-purple-400 mb-2">AI REASONING</h4>
                        <p className="text-neutral-300">{generatedInsight.reasoning}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-green-400 mb-2">TECHNICAL INDICATORS</h4>
                        <div className="space-y-1">
                          {generatedInsight.detailedAnalysis.technicalIndicators.map(
                            (indicator: string, index: number) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 bg-green-400 rounded-full" />
                                <span className="text-white">{indicator}</span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-cyan-400 mb-2">FUNDAMENTAL FACTORS</h4>
                        <div className="space-y-1">
                          {generatedInsight.detailedAnalysis.fundamentalFactors.map((factor: string, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                              <span className="text-white">{factor}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-orange-400 mb-2">PRICE TARGETS</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center p-2 bg-green-900/20 border border-green-500/30 rounded">
                            <div className="text-xs text-green-400">Conservative</div>
                            <div className="text-white font-mono">
                              {generatedInsight.detailedAnalysis.priceTargets.conservative}
                            </div>
                          </div>
                          <div className="text-center p-2 bg-cyan-900/20 border border-cyan-500/30 rounded">
                            <div className="text-xs text-cyan-400">Moderate</div>
                            <div className="text-white font-mono">
                              {generatedInsight.detailedAnalysis.priceTargets.moderate}
                            </div>
                          </div>
                          <div className="text-center p-2 bg-purple-900/20 border border-purple-500/30 rounded">
                            <div className="text-xs text-purple-400">Aggressive</div>
                            <div className="text-white font-mono">
                              {generatedInsight.detailedAnalysis.priceTargets.aggressive}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-purple-500/30">
                    <Button
                      onClick={() => downloadInsight(generatedInsight)}
                      className="bg-gradient-to-r from-green-500 to-cyan-500 text-white flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Full Report
                    </Button>
                    <Button
                      variant="outline"
                      className="border-purple-500/50 text-purple-400 hover:bg-purple-900/20 bg-transparent"
                    >
                      View on Arweave
                    </Button>
                    <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white">
                      Apply to Portfolio
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Insight Detail Modal */}
      <AnimatePresence>
        {selectedInsight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedInsight(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-black/90 backdrop-blur-xl border-purple-500/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-white tracking-wider">
                      {selectedInsight.title}
                    </CardTitle>
                    <p className="text-sm text-neutral-400 font-mono">{selectedInsight.id}</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedInsight(null)}
                    className="text-neutral-400 hover:text-white"
                  >
                    ✕
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-purple-400 tracking-wider mb-2">INSIGHT TYPE</h3>
                        <Badge className={getTypeColor(selectedInsight.type)}>
                          {selectedInsight.type.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-cyan-400 tracking-wider mb-2">PREDICTION</h3>
                        <p className="text-white">{selectedInsight.prediction}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-green-400 tracking-wider mb-2">HISTORICAL ACCURACY</h3>
                        <p className="text-green-400 font-mono text-lg">{selectedInsight.accuracy}%</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-orange-400 tracking-wider mb-2">AI CONFIDENCE</h3>
                        <div className={`text-2xl font-bold ${getConfidenceColor(selectedInsight.confidence)}`}>
                          {selectedInsight.confidence}%
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-purple-400 tracking-wider mb-2">TIMEFRAME</h3>
                        <p className="text-white">{selectedInsight.timeframe}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-cyan-400 tracking-wider mb-2">IMPACT LEVEL</h3>
                        <Badge
                          className={
                            selectedInsight.impact === "high"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-orange-500/20 text-orange-400"
                          }
                        >
                          {selectedInsight.impact.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-purple-400 tracking-wider mb-2">AI REASONING</h3>
                    <p className="text-neutral-300 leading-relaxed">{selectedInsight.reasoning}</p>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-purple-500/30">
                    <Button
                      onClick={() => downloadInsight(selectedInsight)}
                      className="bg-gradient-to-r from-green-500 to-cyan-500 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Report
                    </Button>
                    <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white flex-1">
                      Apply to Portfolio
                    </Button>
                    <Button
                      variant="outline"
                      className="border-purple-500/50 text-purple-400 hover:bg-purple-900/20 bg-transparent"
                    >
                      View on Arweave
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
