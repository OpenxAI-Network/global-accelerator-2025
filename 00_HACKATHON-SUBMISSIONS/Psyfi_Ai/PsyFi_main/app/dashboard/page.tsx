"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, DollarSign, Shield, Bot, Zap, AlertTriangle, Activity, Target } from "lucide-react"
import InteractiveChart from "../components/interactive-chart"
import ThreeDVisualization from "../components/three-d-visualization"

interface DashboardPageProps {
  walletConnected: boolean
}

export default function DashboardPage({ walletConnected }: DashboardPageProps) {
  const [portfolioData, setPortfolioData] = useState<any[]>([])
  const [aiSentiment, setAiSentiment] = useState(0)

  useEffect(() => {
    // Generate mock portfolio data
    const generateData = () => {
      const data = []
      const startDate = new Date(2024, 0, 1)
      const startValue = 20000

      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        const value = startValue + (Math.random() - 0.3) * 5000 + i * 150
        const volume = Math.random() * 1000000
        data.push({ date, value, volume })
      }
      return data
    }

    setPortfolioData(generateData())

    // Animate AI sentiment meter
    const interval = setInterval(() => {
      setAiSentiment((prev) => {
        const target = 94.2
        return prev + (target - prev) * 0.1
      })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  if (!walletConnected) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <Card className="bg-gradient-to-r from-purple-900/20 to-cyan-900/20 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="p-8">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Zap className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">
                Welcome to PsyFi
              </h3>
              <p className="text-neutral-400 mb-6">Connect your wallet to access AI-powered DeFi insights and tools</p>
              <div className="text-xs text-neutral-500">Supported: MetaMask, WalletConnect, ArConnect</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  const portfolioStats = [
    {
      title: "TOTAL PORTFOLIO",
      value: "$24,567.89",
      change: "+12.5%",
      icon: DollarSign,
      color: "purple",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "AI CONFIDENCE",
      value: `${aiSentiment.toFixed(1)}%`,
      change: "HIGH",
      icon: Bot,
      color: "cyan",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      title: "YIELD EARNED",
      value: "$1,234.56",
      change: "+8.3% APY",
      icon: TrendingUp,
      color: "green",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "RISK SCORE",
      value: "LOW",
      change: "2.1/10",
      icon: Shield,
      color: "red",
      gradient: "from-red-500 to-orange-500",
    },
  ]

  const aiInsights = [
    {
      type: "RECOMMENDATION",
      title: "Consider increasing USDC allocation to 35% for stability",
      confidence: 87,
      color: "purple",
    },
    {
      type: "OPPORTUNITY",
      title: "High yield opportunity in AAVE lending pool",
      confidence: 92,
      color: "cyan",
    },
    {
      type: "WARNING",
      title: "Potential market volatility detected in next 48h",
      confidence: 78,
      color: "orange",
    },
  ]

  const fraudAlerts = [
    {
      type: "SUSPICIOUS ACTIVITY",
      description: "Wallet 0x742...caAb flagged",
      severity: "high",
      time: "2 min ago",
    },
    {
      type: "MEDIUM RISK",
      description: "Unusual transaction pattern",
      severity: "medium",
      time: "15 min ago",
    },
  ]

  const recentActivity = [
    { action: "Staked 1000 USDC", pool: "Compound", time: "2 min ago", status: "success" },
    { action: "AI Prediction Stored", data: "ETH/USD +5.2%", time: "15 min ago", status: "info" },
    { action: "Yield Harvested", amount: "$45.67", time: "1 hour ago", status: "success" },
    { action: "Risk Assessment", result: "Portfolio Risk: LOW", time: "2 hours ago", status: "info" },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Portfolio Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {portfolioStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <Card
              className={`bg-gradient-to-r from-${stat.color}-900/20 to-black border-${stat.color}-500/30 backdrop-blur-sm hover:border-${stat.color}-500/50 transition-all duration-300`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs text-${stat.color}-400 tracking-wider font-medium`}>{stat.title}</p>
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                      className="text-2xl font-bold text-white font-mono"
                    >
                      {stat.value}
                    </motion.p>
                    <div className="flex items-center gap-1 text-xs mt-1">
                      <TrendingUp className={`w-3 h-3 text-${stat.color}-400`} />
                      <span className={`text-${stat.color}-400`}>{stat.change}</span>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <stat.icon className={`w-8 h-8 text-${stat.color}-400`} />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-4"
        >
          <Card className="bg-gradient-to-b from-purple-900/20 to-black border-purple-500/30 backdrop-blur-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-400 tracking-wider flex items-center gap-2">
                <Bot className="w-4 h-4" />
                AI ROBO-ADVISOR
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiInsights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className={`p-3 bg-${insight.color}-900/20 border border-${insight.color}-500/30 rounded-lg hover:border-${insight.color}-500/50 transition-all cursor-pointer`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.5 }}
                      className={`w-2 h-2 bg-${insight.color}-400 rounded-full mt-2`}
                    />
                    <div className="flex-1">
                      <div className={`text-xs text-${insight.color}-400 font-mono mb-1`}>{insight.type}</div>
                      <div className="text-sm text-white leading-relaxed">{insight.title}</div>
                      <div className="text-xs text-neutral-400 mt-1">Confidence: {insight.confidence}%</div>
                    </div>
                  </div>
                </motion.div>
              ))}

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white">
                  View All Insights
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Portfolio Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-5"
        >
          <Card className="bg-gradient-to-b from-black to-purple-900/10 border-purple-500/30 backdrop-blur-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-cyan-400 tracking-wider">PORTFOLIO PERFORMANCE</CardTitle>
            </CardHeader>
            <CardContent>
              <InteractiveChart
                data={portfolioData}
                width={400}
                height={200}
                color="#8b5cf6"
                title="30-Day Performance"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Fraud Alerts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-3"
        >
          <Card className="bg-gradient-to-b from-red-900/20 to-black border-red-500/30 backdrop-blur-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-400 tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4" />
                FRAI-M ALERTS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {fraudAlerts.map((alert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className={`flex items-center gap-3 p-3 bg-${alert.severity === "high" ? "red" : "orange"}-900/20 border border-${alert.severity === "high" ? "red" : "orange"}-500/30 rounded-lg hover:border-${alert.severity === "high" ? "red" : "orange"}-500/50 transition-all cursor-pointer`}
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <AlertTriangle className={`w-4 h-4 text-${alert.severity === "high" ? "red" : "orange"}-400`} />
                  </motion.div>
                  <div className="flex-1">
                    <div className={`text-xs text-${alert.severity === "high" ? "red" : "orange"}-400 font-medium`}>
                      {alert.type}
                    </div>
                    <div className="text-xs text-white">{alert.description}</div>
                    <div className="text-xs text-neutral-500 mt-1">{alert.time}</div>
                  </div>
                </motion.div>
              ))}

              <div className="text-center text-xs text-neutral-500 mt-4">All alerts stored on Arweave</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 3D Visualization Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card className="bg-gradient-to-r from-black to-purple-900/10 border-purple-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-purple-400 tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4" />
              AI NETWORK VISUALIZATION
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ThreeDVisualization width={350} height={250} type="sphere" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-black to-cyan-900/10 border-cyan-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-cyan-400 tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4" />
              PORTFOLIO ALLOCATION
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ThreeDVisualization width={350} height={250} type="network" data={[1, 2, 3, 4, 5, 6, 7, 8]} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
        <Card className="bg-gradient-to-r from-black to-purple-900/10 border-purple-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-cyan-400 tracking-wider">RECENT ACTIVITY</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-purple-900/10 border border-purple-500/20 rounded-lg hover:border-purple-500/40 transition-all cursor-pointer"
                  whileHover={{ scale: 1.01, x: 5 }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.3 }}
                      className={`w-2 h-2 rounded-full ${
                        activity.status === "success" ? "bg-green-400" : "bg-cyan-400"
                      }`}
                    />
                    <div>
                      <div className="text-sm text-white">{activity.action}</div>
                      <div className="text-xs text-neutral-400">
                        {activity.pool || activity.data || activity.amount || activity.result}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-neutral-500 font-mono">{activity.time}</div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
