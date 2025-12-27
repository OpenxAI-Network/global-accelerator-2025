"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { TrendingUp, BarChart3, Target, Zap, Activity, AlertTriangle, Bot, DollarSign, Settings } from "lucide-react"
import InteractiveChart from "../components/interactive-chart"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

export default function MarketAnalyzerPage() {
  const [selectedAsset, setSelectedAsset] = useState("ETH/USD")
  const [chartData, setChartData] = useState<any[]>([])
  const [heatmapData, setHeatmapData] = useState<any[]>([])
  const [showAutonomousTrading, setShowAutonomousTrading] = useState(false)
  const [isSettingUpBot, setIsSettingUpBot] = useState(false)
  const [tradingBot, setTradingBot] = useState<any>(null)
  const [showBotDashboard, setShowBotDashboard] = useState(false)

  // Trading Bot Configuration
  const [botConfig, setBotConfig] = useState({
    strategy: "dca",
    riskLevel: "medium",
    investmentAmount: 1000,
    frequency: "daily",
    assets: [] as string[],
    stopLoss: 10,
    takeProfit: 20,
    maxDrawdown: 15,
    rebalanceThreshold: 5,
  })

  const predictions = [
    {
      asset: "ETH/USD",
      current: 2845.67,
      predicted: 3200.0,
      change: 12.5,
      timeframe: "7 days",
      confidence: 89,
      arweaveHash: "pred_abc123...def456",
      volume: "2.4B",
      sentiment: "bullish",
    },
    {
      asset: "BTC/USD",
      current: 43250.0,
      predicted: 41800.0,
      change: -3.4,
      timeframe: "3 days",
      confidence: 76,
      arweaveHash: "pred_xyz789...uvw012",
      volume: "8.9B",
      sentiment: "bearish",
    },
    {
      asset: "AAVE/USD",
      current: 89.45,
      predicted: 105.2,
      change: 17.6,
      timeframe: "14 days",
      confidence: 82,
      arweaveHash: "pred_mno345...pqr678",
      volume: "145M",
      sentiment: "bullish",
    },
    {
      asset: "UNI/USD",
      current: 12.34,
      predicted: 15.8,
      change: 28.0,
      timeframe: "10 days",
      confidence: 85,
      arweaveHash: "pred_def789...ghi012",
      volume: "234M",
      sentiment: "very_bullish",
    },
  ]

  const marketData = [
    { symbol: "ETH", price: 2845.67, change: 5.2, volume: "2.4B", marketCap: "342B", sentiment: 0.8 },
    { symbol: "BTC", price: 43250.0, change: -1.8, volume: "8.9B", marketCap: "850B", sentiment: 0.3 },
    { symbol: "USDC", price: 1.0, change: 0.1, volume: "1.2B", marketCap: "32B", sentiment: 0.5 },
    { symbol: "AAVE", price: 89.45, change: 8.7, volume: "145M", marketCap: "1.3B", sentiment: 0.9 },
    { symbol: "UNI", price: 12.34, change: -2.3, volume: "234M", marketCap: "7.4B", sentiment: 0.6 },
    { symbol: "COMP", price: 67.89, change: 4.1, volume: "89M", marketCap: "1.1B", sentiment: 0.7 },
    { symbol: "LINK", price: 15.67, change: 12.4, volume: "456M", marketCap: "8.9B", sentiment: 0.85 },
    { symbol: "MKR", price: 1234.56, change: -5.2, volume: "67M", marketCap: "1.2B", sentiment: 0.4 },
  ]

  const analyzerStats = [
    { label: "PREDICTIONS TODAY", value: "23", icon: Target, color: "blue" },
    { label: "ACCURACY RATE", value: "87.3%", icon: Zap, color: "purple" },
    { label: "PROFITABLE CALLS", value: "76%", icon: TrendingUp, color: "green" },
  ]

  const botSetupStages = [
    "Initializing trading engine...",
    "Connecting to exchanges...",
    "Analyzing market conditions...",
    "Calibrating risk parameters...",
    "Setting up portfolio tracking...",
    "Configuring alert systems...",
    "Testing trading strategies...",
    "Validating security protocols...",
    "Deploying autonomous agent...",
    "Bot ready for trading!",
  ]

  useEffect(() => {
    // Generate chart data for selected asset
    const generateChartData = () => {
      const data = []
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)

      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        const basePrice = selectedAsset === "ETH/USD" ? 2500 : selectedAsset === "BTC/USD" ? 40000 : 80
        data.push({
          date,
          value: basePrice + Math.random() * 1000 + i * 10,
          volume: Math.random() * 1000000,
        })
      }
      return data
    }

    setChartData(generateChartData())

    // Generate heatmap data
    const generateHeatmapData = () => {
      return marketData.map((asset) => ({
        ...asset,
        performance: Math.random() * 20 - 10,
        volatility: Math.random() * 100,
      }))
    }

    setHeatmapData(generateHeatmapData())
  }, [selectedAsset])

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-400" : "text-red-400"
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return "text-green-400"
    if (confidence >= 75) return "text-cyan-400"
    return "text-orange-400"
  }

  const getSentimentColor = (sentiment: string | number) => {
    if (typeof sentiment === "number") {
      if (sentiment >= 0.8) return "bg-green-500/20 text-green-400"
      if (sentiment >= 0.6) return "bg-cyan-500/20 text-cyan-400"
      if (sentiment >= 0.4) return "bg-orange-500/20 text-orange-400"
      return "bg-red-500/20 text-red-400"
    }

    switch (sentiment) {
      case "very_bullish":
        return "bg-green-500/20 text-green-400"
      case "bullish":
        return "bg-cyan-500/20 text-cyan-400"
      case "bearish":
        return "bg-orange-500/20 text-orange-400"
      default:
        return "bg-neutral-500/20 text-neutral-400"
    }
  }

  const getSentimentText = (sentiment: number) => {
    if (sentiment >= 0.8) return "VERY BULLISH"
    if (sentiment >= 0.6) return "BULLISH"
    if (sentiment >= 0.4) return "NEUTRAL"
    return "BEARISH"
  }

  const setupTradingBot = async () => {
    setIsSettingUpBot(true)

    // Simulate 15-second setup process
    for (let i = 0; i < botSetupStages.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1500)) // 15 seconds total
    }

    // Create trading bot instance
    const bot = {
      id: `BOT-${Date.now()}`,
      name: `${botConfig.strategy.toUpperCase()} Trading Bot`,
      status: "active",
      strategy: botConfig.strategy,
      riskLevel: botConfig.riskLevel,
      totalInvested: botConfig.investmentAmount,
      currentValue: botConfig.investmentAmount,
      totalReturn: 0,
      totalTrades: 0,
      winRate: 0,
      assets: botConfig.assets,
      performance: Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        value: botConfig.investmentAmount * (1 + (Math.random() * 0.1 - 0.05)),
        trades: Math.floor(Math.random() * 5),
      })),
      recentTrades: [
        { asset: "ETH", type: "BUY", amount: 0.5, price: 2845.67, time: "2 min ago", profit: 0 },
        { asset: "BTC", type: "SELL", amount: 0.02, price: 43250.0, time: "15 min ago", profit: 125.5 },
        { asset: "AAVE", type: "BUY", amount: 10, price: 89.45, time: "1 hour ago", profit: 0 },
      ],
    }

    setTradingBot(bot)
    setIsSettingUpBot(false)
    setShowBotDashboard(true)
    setShowAutonomousTrading(false)
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
          <h1 className="text-3xl font-bold text-white tracking-wider flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </motion.div>
            MARKET ANALYZER
          </h1>
          <p className="text-sm text-neutral-400 mt-1">AI-powered market predictions and autonomous trading</p>
        </div>
        <div className="flex gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg shadow-blue-500/25">
              <Target className="w-4 h-4 mr-2" />
              Generate Prediction
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => setShowAutonomousTrading(true)}
              variant="outline"
              className="border-blue-500/50 text-blue-400 hover:bg-blue-900/20 bg-transparent"
            >
              <Bot className="w-4 h-4 mr-2" />
              Autonomous Trading
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Market Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {analyzerStats.map((stat, index) => (
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

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Price Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-8"
        >
          <Card className="bg-gradient-to-b from-black/50 to-blue-900/10 backdrop-blur-xl border-blue-500/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-400 tracking-wider">
                  PRICE ANALYSIS - {selectedAsset}
                </CardTitle>
                <div className="flex gap-2">
                  {["ETH/USD", "BTC/USD", "AAVE/USD"].map((asset) => (
                    <Button
                      key={asset}
                      size="sm"
                      variant={selectedAsset === asset ? "default" : "outline"}
                      onClick={() => setSelectedAsset(asset)}
                      className={
                        selectedAsset === asset
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                          : "border-blue-500/50 text-blue-400 hover:bg-blue-900/20 bg-transparent"
                      }
                    >
                      {asset}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {chartData.length > 0 && (
                  <InteractiveChart
                    data={chartData}
                    width={600}
                    height={300}
                    color="#3b82f6"
                    title={`${selectedAsset} Price Movement (30 Days)`}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Market Heatmap */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-4"
        >
          <Card className="bg-gradient-to-b from-purple-900/20 to-black/50 backdrop-blur-xl border-purple-500/30 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-400 tracking-wider">MARKET HEATMAP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {heatmapData.slice(0, 8).map((asset, index) => (
                  <motion.div
                    key={asset.symbol}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      asset.change >= 0
                        ? "bg-green-500/10 border-green-500/30 hover:border-green-500/50"
                        : "bg-red-500/10 border-red-500/30 hover:border-red-500/50"
                    }`}
                  >
                    <div className="text-white font-bold text-sm">{asset.symbol}</div>
                    <div className="text-xs text-neutral-400 font-mono">${asset.price.toLocaleString()}</div>
                    <div className={`text-xs font-medium ${getChangeColor(asset.change)}`}>
                      {asset.change > 0 ? "+" : ""}
                      {asset.change}%
                    </div>
                    <div className="mt-1">
                      <Badge className={getSentimentColor(asset.sentiment)}>{getSentimentText(asset.sentiment)}</Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Predictions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <h2 className="text-xl font-bold text-white tracking-wider">AI MARKET PREDICTIONS</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {predictions.map((pred, index) => (
            <motion.div
              key={pred.asset}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className="bg-gradient-to-r from-black/50 to-blue-900/10 backdrop-blur-xl border-blue-500/30 hover:border-purple-500/50 transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-white tracking-wider">{pred.asset}</CardTitle>
                      <p className="text-sm text-neutral-400">Current: ${pred.current.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold font-mono ${getChangeColor(pred.change)}`}>
                        {pred.change > 0 ? "+" : ""}
                        {pred.change}%
                      </div>
                      <div className="text-xs text-neutral-400">{pred.timeframe}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-blue-400 mb-2">PREDICTED PRICE</h4>
                      <p className="text-white font-mono text-lg">${pred.predicted.toLocaleString()}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-purple-400 mb-2">AI CONFIDENCE</h4>
                      <p className={`font-mono text-lg ${getConfidenceColor(pred.confidence)}`}>{pred.confidence}%</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-cyan-400 mb-2">SENTIMENT</h4>
                      <Badge className={getSentimentColor(pred.sentiment)}>
                        {pred.sentiment.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-3 bg-blue-900/10 border border-blue-500/20 rounded-lg">
                    <div>
                      <div className="text-xs text-blue-400 mb-1">24H VOLUME</div>
                      <div className="text-white font-mono">{pred.volume}</div>
                    </div>
                    <div>
                      <div className="text-xs text-purple-400 mb-1">ARWEAVE HASH</div>
                      <div className="text-cyan-400 font-mono text-xs">{pred.arweaveHash}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-500/50 text-blue-400 hover:bg-blue-900/20 bg-transparent"
                      >
                        View Analysis
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        Set Alert
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Market Sentiment Analysis */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <Card className="bg-gradient-to-r from-green-900/20 to-red-900/20 backdrop-blur-xl border-green-500/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-green-400 tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4" />
              MARKET SENTIMENT ANALYSIS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-green-400 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  BULLISH SIGNALS
                </h4>
                <div className="space-y-3">
                  {[
                    "Institutional buying pressure increasing (+15%)",
                    "DeFi TVL reaching new highs ($180B)",
                    "Positive regulatory developments in EU",
                    "Major protocol upgrades scheduled",
                    "Whale accumulation patterns detected",
                  ].map((signal, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-center gap-2"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.3 }}
                        className="w-2 h-2 bg-green-400 rounded-full"
                      />
                      <span className="text-white text-sm">{signal}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-red-400 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  BEARISH SIGNALS
                </h4>
                <div className="space-y-3">
                  {[
                    "High leverage ratios detected (3.2x avg)",
                    "Whale wallet movements (+$2B outflow)",
                    "Macroeconomic uncertainty rising",
                    "Exchange reserves increasing",
                    "Fear & Greed Index: 35 (Fear)",
                  ].map((signal, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-center gap-2"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.3 }}
                        className="w-2 h-2 bg-red-400 rounded-full"
                      />
                      <span className="text-white text-sm">{signal}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Overall Sentiment Meter */}
            <div className="mt-6 pt-6 border-t border-purple-500/30">
              <h4 className="text-sm font-medium text-purple-400 mb-4 text-center">OVERALL MARKET SENTIMENT</h4>
              <div className="relative">
                <div className="w-full h-4 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"></div>
                <motion.div
                  initial={{ x: 0 }}
                  animate={{ x: "60%" }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="absolute top-0 w-4 h-4 bg-white rounded-full shadow-lg"
                />
                <div className="flex justify-between text-xs text-neutral-400 mt-2">
                  <span>EXTREME FEAR</span>
                  <span>NEUTRAL</span>
                  <span>EXTREME GREED</span>
                </div>
                <div className="text-center mt-2">
                  <span className="text-cyan-400 font-bold">CAUTIOUSLY OPTIMISTIC</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Autonomous Trading Setup Modal */}
      <AnimatePresence>
        {showAutonomousTrading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowAutonomousTrading(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-black/90 backdrop-blur-xl border-blue-500/50 shadow-2xl shadow-blue-500/20">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-wider">
                      AUTONOMOUS TRADING SETUP
                    </CardTitle>
                    <p className="text-sm text-neutral-400">Configure your AI trading bot</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setShowAutonomousTrading(false)}
                    className="text-neutral-400 hover:text-white"
                  >
                    ✕
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div>
                        <Label className="text-blue-400 font-medium mb-2 block">Trading Strategy</Label>
                        <Select
                          value={botConfig.strategy}
                          onValueChange={(value) => setBotConfig({ ...botConfig, strategy: value })}
                        >
                          <SelectTrigger className="bg-black/50 border-blue-500/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-blue-500/30">
                            <SelectItem value="dca">Dollar Cost Averaging (DCA)</SelectItem>
                            <SelectItem value="momentum">Momentum Trading</SelectItem>
                            <SelectItem value="arbitrage">Arbitrage</SelectItem>
                            <SelectItem value="grid">Grid Trading</SelectItem>
                            <SelectItem value="scalping">Scalping</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-purple-400 font-medium mb-2 block">Risk Level</Label>
                        <Select
                          value={botConfig.riskLevel}
                          onValueChange={(value) => setBotConfig({ ...botConfig, riskLevel: value })}
                        >
                          <SelectTrigger className="bg-black/50 border-purple-500/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-purple-500/30">
                            <SelectItem value="low">Conservative (Low Risk)</SelectItem>
                            <SelectItem value="medium">Balanced (Medium Risk)</SelectItem>
                            <SelectItem value="high">Aggressive (High Risk)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-cyan-400 font-medium mb-2 block">Investment Amount ($)</Label>
                        <Input
                          type="number"
                          value={botConfig.investmentAmount}
                          onChange={(e) =>
                            setBotConfig({ ...botConfig, investmentAmount: Number.parseInt(e.target.value) || 0 })
                          }
                          className="bg-black/50 border-cyan-500/30 text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-green-400 font-medium mb-2 block">Trading Frequency</Label>
                        <Select
                          value={botConfig.frequency}
                          onValueChange={(value) => setBotConfig({ ...botConfig, frequency: value })}
                        >
                          <SelectTrigger className="bg-black/50 border-green-500/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-green-500/30">
                            <SelectItem value="hourly">Every Hour</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="signal">On AI Signal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-orange-400 font-medium mb-2 block">
                          Stop Loss (%): {botConfig.stopLoss}%
                        </Label>
                        <Slider
                          value={[botConfig.stopLoss]}
                          onValueChange={(value) => setBotConfig({ ...botConfig, stopLoss: value[0] })}
                          max={25}
                          min={5}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label className="text-green-400 font-medium mb-2 block">
                          Take Profit (%): {botConfig.takeProfit}%
                        </Label>
                        <Slider
                          value={[botConfig.takeProfit]}
                          onValueChange={(value) => setBotConfig({ ...botConfig, takeProfit: value[0] })}
                          max={50}
                          min={10}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <Label className="text-blue-400 font-medium mb-2 block">Trading Assets</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {["ETH", "BTC", "USDC", "AAVE", "UNI", "COMP", "LINK", "MKR"].map((asset) => (
                            <Button
                              key={asset}
                              size="sm"
                              variant={botConfig.assets.includes(asset) ? "default" : "outline"}
                              onClick={() => {
                                const newAssets = botConfig.assets.includes(asset)
                                  ? botConfig.assets.filter((a) => a !== asset)
                                  : [...botConfig.assets, asset]
                                setBotConfig({ ...botConfig, assets: newAssets })
                              }}
                              className={
                                botConfig.assets.includes(asset)
                                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                                  : "border-blue-500/50 text-blue-400 hover:bg-blue-900/20 bg-transparent"
                              }
                            >
                              {asset}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-purple-400 font-medium mb-2 block">
                          Max Drawdown (%): {botConfig.maxDrawdown}%
                        </Label>
                        <Slider
                          value={[botConfig.maxDrawdown]}
                          onValueChange={(value) => setBotConfig({ ...botConfig, maxDrawdown: value[0] })}
                          max={30}
                          min={5}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label className="text-cyan-400 font-medium mb-2 block">
                          Rebalance Threshold (%): {botConfig.rebalanceThreshold}%
                        </Label>
                        <Slider
                          value={[botConfig.rebalanceThreshold]}
                          onValueChange={(value) => setBotConfig({ ...botConfig, rebalanceThreshold: value[0] })}
                          max={20}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                        <h4 className="text-blue-400 font-medium mb-2">Bot Configuration Preview</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Strategy:</span>
                            <span className="text-white capitalize">{botConfig.strategy.replace("_", " ")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Risk Level:</span>
                            <span className="text-white capitalize">{botConfig.riskLevel}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Investment:</span>
                            <span className="text-white">${botConfig.investmentAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Assets:</span>
                            <span className="text-blue-400">{botConfig.assets.length} selected</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Stop Loss:</span>
                            <span className="text-red-400">{botConfig.stopLoss}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Take Profit:</span>
                            <span className="text-green-400">{botConfig.takeProfit}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
                        <h4 className="text-orange-400 font-medium mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Risk Disclaimer
                        </h4>
                        <p className="text-xs text-neutral-300">
                          Autonomous trading involves significant risk. Past performance does not guarantee future
                          results. Only invest what you can afford to lose. All trades are executed on your behalf and
                          recorded on Arweave.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-blue-500/30">
                    <Button
                      onClick={setupTradingBot}
                      disabled={isSettingUpBot || botConfig.assets.length === 0}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white flex-1"
                    >
                      <Bot className="w-4 h-4 mr-2" />
                      {isSettingUpBot ? "Setting Up Bot..." : "Deploy Trading Bot"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAutonomousTrading(false)}
                      className="border-neutral-500/50 text-neutral-400 hover:bg-neutral-900/20 bg-transparent"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bot Setup Loading Modal */}
      <AnimatePresence>
        {isSettingUpBot && (
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
              <Card className="bg-black/90 backdrop-blur-xl border-blue-500/50 shadow-2xl shadow-blue-500/20">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-wider">
                    DEPLOYING TRADING BOT
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-400 rounded-full"
                    />
                  </div>

                  <div className="space-y-3">
                    {botSetupStages.map((stage, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0.3 }}
                        animate={{
                          opacity: index < Math.floor((Date.now() % 15000) / 1500) ? 1 : 0.3,
                          x: index < Math.floor((Date.now() % 15000) / 1500) ? 0 : -10,
                        }}
                        className={`text-sm flex items-center gap-2 ${
                          index < Math.floor((Date.now() % 15000) / 1500) ? "text-blue-400" : "text-neutral-500"
                        }`}
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                          className={`w-2 h-2 rounded-full ${
                            index < Math.floor((Date.now() % 15000) / 1500) ? "bg-blue-400" : "bg-neutral-600"
                          }`}
                        />
                        {stage}
                      </motion.div>
                    ))}
                  </div>

                  <div className="w-full bg-neutral-800 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
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

      {/* Trading Bot Dashboard Modal */}
      <AnimatePresence>
        {showBotDashboard && tradingBot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowBotDashboard(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-6xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-black/90 backdrop-blur-xl border-blue-500/50 shadow-2xl shadow-blue-500/20">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-wider">
                      {tradingBot.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                        {tradingBot.status.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-neutral-400 font-mono">{tradingBot.id}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="border-orange-500/50 text-orange-400 hover:bg-orange-900/20 bg-transparent"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setShowBotDashboard(false)}
                      className="text-neutral-400 hover:text-white"
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <div className="text-xs text-green-400 mb-1">TOTAL INVESTED</div>
                      <div className="text-2xl font-bold text-white font-mono">
                        ${tradingBot.totalInvested.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
                      <div className="text-xs text-cyan-400 mb-1">CURRENT VALUE</div>
                      <div className="text-2xl font-bold text-white font-mono">
                        ${tradingBot.currentValue.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                      <div className="text-xs text-purple-400 mb-1">TOTAL RETURN</div>
                      <div
                        className={`text-2xl font-bold font-mono ${tradingBot.totalReturn >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {tradingBot.totalReturn >= 0 ? "+" : ""}${tradingBot.totalReturn.toFixed(2)}
                      </div>
                    </div>
                    <div className="p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
                      <div className="text-xs text-orange-400 mb-1">WIN RATE</div>
                      <div className="text-2xl font-bold text-white font-mono">{tradingBot.winRate}%</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Performance Chart */}
                    <div className="p-4 bg-black/30 border border-blue-500/30 rounded-lg">
                      <h3 className="text-blue-400 font-medium mb-3 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Performance (30 Days)
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={tradingBot.performance}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                            <YAxis stroke="#9ca3af" fontSize={12} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#000",
                                border: "1px solid #3b82f6",
                                borderRadius: "8px",
                              }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#colorPerformance)" />
                            <defs>
                              <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Recent Trades */}
                    <div className="p-4 bg-black/30 border border-purple-500/30 rounded-lg">
                      <h3 className="text-purple-400 font-medium mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Recent Trades
                      </h3>
                      <div className="space-y-3">
                        {tradingBot.recentTrades.map((trade: any, index: number) => (
                          <div key={index} className="p-3 bg-black/30 border border-neutral-500/30 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={
                                    trade.type === "BUY"
                                      ? "bg-green-500/20 text-green-400"
                                      : "bg-red-500/20 text-red-400"
                                  }
                                >
                                  {trade.type}
                                </Badge>
                                <span className="text-white font-medium">{trade.asset}</span>
                              </div>
                              <span className="text-neutral-400 text-xs">{trade.time}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-neutral-400">
                                {trade.amount} @ ${trade.price.toLocaleString()}
                              </span>
                              <span
                                className={`font-mono ${trade.profit > 0 ? "text-green-400" : trade.profit < 0 ? "text-red-400" : "text-neutral-400"}`}
                              >
                                {trade.profit > 0 ? "+" : ""}${trade.profit.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <h4 className="text-green-400 font-medium mb-2">Strategy Details</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Type:</span>
                          <span className="text-white capitalize">{tradingBot.strategy.replace("_", " ")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Risk Level:</span>
                          <span className="text-white capitalize">{tradingBot.riskLevel}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Assets:</span>
                          <span className="text-white">{tradingBot.assets.join(", ")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
                      <h4 className="text-cyan-400 font-medium mb-2">Trading Stats</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Total Trades:</span>
                          <span className="text-white">{tradingBot.totalTrades}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Win Rate:</span>
                          <span className="text-green-400">{tradingBot.winRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Avg Trade:</span>
                          <span className="text-white">$125.50</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                      <h4 className="text-purple-400 font-medium mb-2">Bot Status</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Status:</span>
                          <Badge className="bg-green-500/20 text-green-400">ACTIVE</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Uptime:</span>
                          <span className="text-white">24h 15m</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Next Trade:</span>
                          <span className="text-cyan-400">~2h 30m</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-blue-500/30">
                    <Button className="bg-gradient-to-r from-green-500 to-cyan-500 text-white">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Add Funds
                    </Button>
                    <Button
                      variant="outline"
                      className="border-orange-500/50 text-orange-400 hover:bg-orange-900/20 bg-transparent"
                    >
                      Pause Bot
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-500/50 text-red-400 hover:bg-red-900/20 bg-transparent"
                    >
                      Stop Bot
                    </Button>
                    <Button
                      variant="outline"
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-900/20 bg-transparent flex-1"
                    >
                      View Full Report
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
