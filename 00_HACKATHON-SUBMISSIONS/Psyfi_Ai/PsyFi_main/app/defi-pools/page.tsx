"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  Coins,
  TrendingUp,
  Shield,
  Zap,
  DollarSign,
  AlertTriangle,
  Target,
  Activity,
  BarChart3,
  PieChartIcon,
} from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie,
} from "recharts"

export default function DeFiPoolsPage() {
  const [selectedPool, setSelectedPool] = useState<any>(null)
  const [stakeAmount, setStakeAmount] = useState("")
  const [showStakeModal, setShowStakeModal] = useState(false)
  const [showStrategyBuilder, setShowStrategyBuilder] = useState(false)
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false)
  const [generatedStrategy, setGeneratedStrategy] = useState<any>(null)
  const [showGeneratedStrategy, setShowGeneratedStrategy] = useState(false)

  // Strategy Builder Form State
  const [strategyForm, setStrategyForm] = useState({
    riskTolerance: "medium",
    investmentAmount: 10000,
    timeHorizon: "6months",
    preferredAssets: [] as string[],
    yieldTarget: 15,
    diversification: "balanced",
  })

  const pools = [
    {
      id: "pool-001",
      protocol: "Compound",
      asset: "USDC",
      apy: 8.45,
      tvl: "2.4M",
      risk: "low",
      aiScore: 94,
      userBalance: "1,250.00",
      earned: "45.67",
      description: "Stable lending pool with consistent returns",
      features: ["Auto-compound", "Insurance", "Governance"],
      minDeposit: 100,
      lockPeriod: "None",
      fees: "0.1%",
    },
    {
      id: "pool-002",
      protocol: "Aave",
      asset: "ETH",
      apy: 12.3,
      tvl: "890K",
      risk: "medium",
      aiScore: 87,
      userBalance: "2.5",
      earned: "0.234",
      description: "Variable rate lending with ETH collateral",
      features: ["Flash loans", "Rate switching", "Collateral"],
      minDeposit: 0.1,
      lockPeriod: "None",
      fees: "0.25%",
    },
    {
      id: "pool-003",
      protocol: "Uniswap V3",
      asset: "USDC/ETH",
      apy: 24.7,
      tvl: "1.8M",
      risk: "high",
      aiScore: 76,
      userBalance: "5,000.00",
      earned: "234.56",
      description: "Concentrated liquidity with impermanent loss risk",
      features: ["LP tokens", "Fee tiers", "Range orders"],
      minDeposit: 500,
      lockPeriod: "None",
      fees: "0.3%",
    },
    {
      id: "pool-004",
      protocol: "Curve",
      asset: "3Pool",
      apy: 6.8,
      tvl: "3.2M",
      risk: "low",
      aiScore: 91,
      userBalance: "750.00",
      earned: "12.34",
      description: "Stablecoin pool optimized for low slippage",
      features: ["Low slippage", "CRV rewards", "Gauge voting"],
      minDeposit: 50,
      lockPeriod: "None",
      fees: "0.04%",
    },
    {
      id: "pool-005",
      protocol: "Yearn",
      asset: "WBTC Vault",
      apy: 15.6,
      tvl: "567K",
      risk: "medium",
      aiScore: 83,
      userBalance: "0.125",
      earned: "0.0045",
      description: "Automated yield farming strategies",
      features: ["Auto-harvest", "Strategy rotation", "Gas optimization"],
      minDeposit: 0.01,
      lockPeriod: "None",
      fees: "2% performance",
    },
    {
      id: "pool-006",
      protocol: "Convex",
      asset: "CRV/ETH",
      apy: 28.9,
      tvl: "234K",
      risk: "high",
      aiScore: 72,
      userBalance: "1,500.00",
      earned: "89.23",
      description: "Boosted Curve rewards with CVX incentives",
      features: ["Boosted rewards", "Vote locking", "CVX tokens"],
      minDeposit: 200,
      lockPeriod: "2 weeks",
      fees: "0.5%",
    },
  ]

  const poolStats = [
    { label: "TOTAL STAKED", value: "$9,250", icon: DollarSign, color: "green" },
    { label: "TOTAL EARNED", value: "$292.61", icon: TrendingUp, color: "cyan" },
    { label: "AVG APY", value: "13.1%", icon: Zap, color: "purple" },
    { label: "AI RISK SCORE", value: "LOW", icon: Shield, color: "orange" },
  ]

  const recommendations = [
    {
      title: "HIGH YIELD OPPORTUNITY",
      protocol: "Balancer WETH/USDC",
      apy: "18.7%",
      risk: "Medium",
      color: "green",
    },
    {
      title: "STABLE YIELD",
      protocol: "Yearn USDT Vault",
      apy: "7.2%",
      risk: "Low",
      color: "cyan",
    },
    {
      title: "TRENDING",
      protocol: "Convex CRV/ETH",
      apy: "15.3%",
      risk: "High",
      color: "purple",
    },
  ]

  const strategyGenerationStages = [
    "Analyzing risk profile...",
    "Scanning available pools...",
    "Calculating optimal allocations...",
    "Evaluating yield opportunities...",
    "Assessing correlation risks...",
    "Optimizing for gas efficiency...",
    "Running Monte Carlo simulations...",
    "Generating performance projections...",
    "Creating rebalancing schedule...",
    "Finalizing strategy parameters...",
  ]

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/50"
      case "medium":
        return "bg-orange-500/20 text-orange-400 border-orange-500/50"
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/50"
      default:
        return "bg-neutral-500/20 text-neutral-400 border-neutral-500/50"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400"
    if (score >= 80) return "text-cyan-400"
    if (score >= 70) return "text-orange-400"
    return "text-red-400"
  }

  const handleStake = (pool: any) => {
    setSelectedPool(pool)
    setShowStakeModal(true)
  }

  const executeStake = () => {
    // Simulate staking transaction
    console.log(`Staking ${stakeAmount} in ${selectedPool?.protocol}`)
    setShowStakeModal(false)
    setStakeAmount("")
    setSelectedPool(null)
  }

  const generateStrategy = async () => {
    setIsGeneratingStrategy(true)

    // Simulate 15-second generation process
    for (let i = 0; i < strategyGenerationStages.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1500)) // 15 seconds total
    }

    // Generate strategy based on form inputs
    const strategy = {
      id: `STRAT-${Date.now()}`,
      name: `${strategyForm.riskTolerance.toUpperCase()} YIELD STRATEGY`,
      expectedApy: strategyForm.yieldTarget + (Math.random() * 5 - 2.5), // ±2.5% variance
      riskScore: strategyForm.riskTolerance === "low" ? 25 : strategyForm.riskTolerance === "medium" ? 55 : 85,
      allocations: [
        { protocol: "Compound USDC", percentage: 35, apy: 8.5, risk: "low" },
        { protocol: "Aave ETH", percentage: 25, apy: 12.3, risk: "medium" },
        { protocol: "Curve 3Pool", percentage: 20, apy: 6.8, risk: "low" },
        { protocol: "Yearn WBTC", percentage: 20, apy: 15.6, risk: "medium" },
      ],
      projectedReturns: {
        monthly: ((strategyForm.investmentAmount * (strategyForm.yieldTarget / 100)) / 12).toFixed(2),
        yearly: (strategyForm.investmentAmount * (strategyForm.yieldTarget / 100)).toFixed(2),
        threeYear: (strategyForm.investmentAmount * Math.pow(1 + strategyForm.yieldTarget / 100, 3)).toFixed(2),
      },
      rebalanceFrequency: "Monthly",
      gasOptimization: "Batched transactions",
      riskMitigation: ["Diversified protocols", "Stablecoin allocation", "Regular rebalancing"],
      performanceData: Array.from({ length: 12 }, (_, i) => ({
        month: `Month ${i + 1}`,
        value: strategyForm.investmentAmount * (1 + (strategyForm.yieldTarget / 100 / 12) * (i + 1)),
        apy: strategyForm.yieldTarget + (Math.random() * 4 - 2),
      })),
    }

    setGeneratedStrategy(strategy)
    setIsGeneratingStrategy(false)
    setShowGeneratedStrategy(true)
    setShowStrategyBuilder(false)
  }

  const COLORS = ["#10b981", "#06b6d4", "#8b5cf6", "#f59e0b"]

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
              transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Coins className="w-8 h-8 text-green-400" />
            </motion.div>
            DeFi POOLS
          </h1>
          <p className="text-sm text-neutral-400 mt-1">AI-scored yield farming and lending opportunities</p>
        </div>
        <div className="flex gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white shadow-lg shadow-green-500/25">
              <Zap className="w-4 h-4 mr-2" />
              Auto-Compound
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => setShowStrategyBuilder(true)}
              variant="outline"
              className="border-green-500/50 text-green-400 hover:bg-green-900/20 bg-transparent"
            >
              <Target className="w-4 h-4 mr-2" />
              Strategy Builder
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Pool Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {poolStats.map((stat, index) => (
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

      {/* Pool List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {pools.map((pool, index) => (
          <motion.div
            key={pool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <Card className="bg-gradient-to-r from-black/50 to-green-900/10 backdrop-blur-xl border-green-500/30 hover:border-cyan-500/50 transition-all duration-300 h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-white tracking-wider">{pool.protocol}</CardTitle>
                    <p className="text-sm text-neutral-400">{pool.asset}</p>
                    <p className="text-xs text-neutral-500 mt-1">{pool.description}</p>
                  </div>
                  <div className="text-right">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.5 }}
                      className="text-2xl font-bold text-green-400 font-mono"
                    >
                      {pool.apy}%
                    </motion.div>
                    <div className="text-xs text-neutral-400">APY</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getRiskColor(pool.risk)} border`}>{pool.risk.toUpperCase()} RISK</Badge>
                    <div className={`text-sm font-bold ${getScoreColor(pool.aiScore)}`}>AI: {pool.aiScore}/100</div>
                  </div>
                  <div className="text-sm text-neutral-400">
                    TVL: <span className="text-white font-mono">${pool.tvl}</span>
                  </div>
                </div>

                {/* Pool Features */}
                <div className="flex flex-wrap gap-1">
                  {pool.features.map((feature) => (
                    <Badge key={feature} className="bg-purple-500/20 text-purple-400 text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>

                {/* Pool Details */}
                <div className="grid grid-cols-2 gap-4 p-3 bg-green-900/10 border border-green-500/20 rounded-lg">
                  <div>
                    <div className="text-xs text-green-400 mb-1">YOUR BALANCE</div>
                    <div className="text-white font-mono text-sm">
                      {pool.userBalance} {pool.asset.split("/")[0]}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-cyan-400 mb-1">EARNED</div>
                    <div className="text-white font-mono text-sm">
                      {pool.earned} {pool.asset.split("/")[0]}
                    </div>
                  </div>
                </div>

                {/* Pool Info */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-neutral-400">Min Deposit</div>
                    <div className="text-white font-mono">{pool.minDeposit}</div>
                  </div>
                  <div>
                    <div className="text-neutral-400">Lock Period</div>
                    <div className="text-white">{pool.lockPeriod}</div>
                  </div>
                  <div>
                    <div className="text-neutral-400">Fees</div>
                    <div className="text-white">{pool.fees}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                    <Button
                      onClick={() => handleStake(pool)}
                      className="w-full bg-gradient-to-r from-green-500 to-cyan-500 text-white"
                    >
                      Stake More
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      className="border-green-500/50 text-green-400 hover:bg-green-900/20 bg-transparent"
                    >
                      Harvest
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      className="border-red-500/50 text-red-400 hover:bg-red-900/20 bg-transparent"
                    >
                      Unstake
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Pool Recommendations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="bg-gradient-to-r from-purple-900/20 to-cyan-900/20 backdrop-blur-xl border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-purple-400 tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4" />
              AI POOL RECOMMENDATIONS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className={`p-4 bg-${rec.color}-900/20 border border-${rec.color}-500/30 rounded-lg cursor-pointer hover:border-${rec.color}-500/50 transition-all`}
                >
                  <h4 className={`text-sm font-medium text-${rec.color}-400 mb-2`}>{rec.title}</h4>
                  <p className="text-white text-sm font-medium">{rec.protocol}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <div className="text-xs text-neutral-400">APY</div>
                      <div className={`text-${rec.color}-400 font-bold`}>{rec.apy}</div>
                    </div>
                    <div>
                      <div className="text-xs text-neutral-400">Risk</div>
                      <div className="text-white text-sm">{rec.risk}</div>
                    </div>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      className={`mt-3 w-full bg-${rec.color}-500 hover:bg-${rec.color}-600 text-white`}
                    >
                      Explore
                    </Button>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Strategy Builder Modal */}
      <AnimatePresence>
        {showStrategyBuilder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowStrategyBuilder(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-black/90 backdrop-blur-xl border-green-500/50 shadow-2xl shadow-green-500/20">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400 tracking-wider">
                      STRATEGY BUILDER
                    </CardTitle>
                    <p className="text-sm text-neutral-400">Create your personalized DeFi yield strategy</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setShowStrategyBuilder(false)}
                    className="text-neutral-400 hover:text-white"
                  >
                    ✕
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div>
                        <Label className="text-green-400 font-medium mb-2 block">Risk Tolerance</Label>
                        <Select
                          value={strategyForm.riskTolerance}
                          onValueChange={(value) => setStrategyForm({ ...strategyForm, riskTolerance: value })}
                        >
                          <SelectTrigger className="bg-black/50 border-green-500/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-green-500/30">
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
                          value={strategyForm.investmentAmount}
                          onChange={(e) =>
                            setStrategyForm({ ...strategyForm, investmentAmount: Number.parseInt(e.target.value) || 0 })
                          }
                          className="bg-black/50 border-cyan-500/30 text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-purple-400 font-medium mb-2 block">Time Horizon</Label>
                        <Select
                          value={strategyForm.timeHorizon}
                          onValueChange={(value) => setStrategyForm({ ...strategyForm, timeHorizon: value })}
                        >
                          <SelectTrigger className="bg-black/50 border-purple-500/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-purple-500/30">
                            <SelectItem value="1month">1 Month</SelectItem>
                            <SelectItem value="3months">3 Months</SelectItem>
                            <SelectItem value="6months">6 Months</SelectItem>
                            <SelectItem value="1year">1 Year</SelectItem>
                            <SelectItem value="2years">2+ Years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-orange-400 font-medium mb-2 block">
                          Target APY (%): {strategyForm.yieldTarget}%
                        </Label>
                        <Slider
                          value={[strategyForm.yieldTarget]}
                          onValueChange={(value) => setStrategyForm({ ...strategyForm, yieldTarget: value[0] })}
                          max={50}
                          min={5}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-neutral-400 mt-1">
                          <span>5% (Safe)</span>
                          <span>50% (High Risk)</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <Label className="text-green-400 font-medium mb-2 block">Diversification Strategy</Label>
                        <Select
                          value={strategyForm.diversification}
                          onValueChange={(value) => setStrategyForm({ ...strategyForm, diversification: value })}
                        >
                          <SelectTrigger className="bg-black/50 border-green-500/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-green-500/30">
                            <SelectItem value="concentrated">Concentrated (2-3 pools)</SelectItem>
                            <SelectItem value="balanced">Balanced (4-6 pools)</SelectItem>
                            <SelectItem value="diversified">Highly Diversified (7+ pools)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-cyan-400 font-medium mb-2 block">Preferred Assets</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {["ETH", "BTC", "USDC", "USDT", "AAVE", "UNI", "COMP", "CRV"].map((asset) => (
                            <Button
                              key={asset}
                              size="sm"
                              variant={strategyForm.preferredAssets.includes(asset) ? "default" : "outline"}
                              onClick={() => {
                                const newAssets = strategyForm.preferredAssets.includes(asset)
                                  ? strategyForm.preferredAssets.filter((a) => a !== asset)
                                  : [...strategyForm.preferredAssets, asset]
                                setStrategyForm({ ...strategyForm, preferredAssets: newAssets })
                              }}
                              className={
                                strategyForm.preferredAssets.includes(asset)
                                  ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                                  : "border-cyan-500/50 text-cyan-400 hover:bg-cyan-900/20 bg-transparent"
                              }
                            >
                              {asset}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                        <h4 className="text-green-400 font-medium mb-2">Strategy Preview</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Risk Level:</span>
                            <span className="text-white capitalize">{strategyForm.riskTolerance}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Investment:</span>
                            <span className="text-white">${strategyForm.investmentAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Target APY:</span>
                            <span className="text-green-400">{strategyForm.yieldTarget}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Est. Monthly:</span>
                            <span className="text-cyan-400">
                              ${((strategyForm.investmentAmount * strategyForm.yieldTarget) / 100 / 12).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-green-500/30">
                    <Button
                      onClick={generateStrategy}
                      disabled={isGeneratingStrategy}
                      className="bg-gradient-to-r from-green-500 to-cyan-500 text-white flex-1"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      {isGeneratingStrategy ? "Generating..." : "Generate Strategy"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowStrategyBuilder(false)}
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

      {/* Strategy Generation Loading Modal */}
      <AnimatePresence>
        {isGeneratingStrategy && (
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
              <Card className="bg-black/90 backdrop-blur-xl border-green-500/50 shadow-2xl shadow-green-500/20">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400 tracking-wider">
                    GENERATING STRATEGY
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-16 h-16 border-4 border-green-500/30 border-t-green-400 rounded-full"
                    />
                  </div>

                  <div className="space-y-3">
                    {strategyGenerationStages.map((stage, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0.3 }}
                        animate={{
                          opacity: index < Math.floor((Date.now() % 15000) / 1500) ? 1 : 0.3,
                          x: index < Math.floor((Date.now() % 15000) / 1500) ? 0 : -10,
                        }}
                        className={`text-sm flex items-center gap-2 ${
                          index < Math.floor((Date.now() % 15000) / 1500) ? "text-green-400" : "text-neutral-500"
                        }`}
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                          className={`w-2 h-2 rounded-full ${
                            index < Math.floor((Date.now() % 15000) / 1500) ? "bg-green-400" : "bg-neutral-600"
                          }`}
                        />
                        {stage}
                      </motion.div>
                    ))}
                  </div>

                  <div className="w-full bg-neutral-800 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-green-500 to-cyan-500 h-2 rounded-full"
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

      {/* Generated Strategy Modal */}
      <AnimatePresence>
        {showGeneratedStrategy && generatedStrategy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowGeneratedStrategy(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-6xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-black/90 backdrop-blur-xl border-green-500/50 shadow-2xl shadow-green-500/20">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400 tracking-wider">
                      {generatedStrategy.name}
                    </CardTitle>
                    <p className="text-sm text-neutral-400 font-mono">{generatedStrategy.id}</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setShowGeneratedStrategy(false)}
                    className="text-neutral-400 hover:text-white"
                  >
                    ✕
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Strategy Overview */}
                    <div className="space-y-4">
                      <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                        <h3 className="text-green-400 font-medium mb-3">Strategy Overview</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Expected APY:</span>
                            <span className="text-green-400 font-bold">
                              {generatedStrategy.expectedApy.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Risk Score:</span>
                            <span
                              className={`font-bold ${generatedStrategy.riskScore < 40 ? "text-green-400" : generatedStrategy.riskScore < 70 ? "text-orange-400" : "text-red-400"}`}
                            >
                              {generatedStrategy.riskScore}/100
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Rebalance:</span>
                            <span className="text-white">{generatedStrategy.rebalanceFrequency}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
                        <h3 className="text-cyan-400 font-medium mb-3">Projected Returns</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Monthly:</span>
                            <span className="text-cyan-400 font-mono">
                              ${generatedStrategy.projectedReturns.monthly}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Yearly:</span>
                            <span className="text-cyan-400 font-mono">
                              ${generatedStrategy.projectedReturns.yearly}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">3-Year:</span>
                            <span className="text-cyan-400 font-mono">
                              ${generatedStrategy.projectedReturns.threeYear}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                        <h3 className="text-purple-400 font-medium mb-3">Risk Mitigation</h3>
                        <div className="space-y-1">
                          {generatedStrategy.riskMitigation.map((item: string, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-purple-400 rounded-full" />
                              <span className="text-white">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Allocation Chart */}
                    <div className="space-y-4">
                      <div className="p-4 bg-black/30 border border-green-500/30 rounded-lg">
                        <h3 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                          <PieChartIcon className="w-4 h-4" />
                          Portfolio Allocation
                        </h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={generatedStrategy.allocations}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="percentage"
                                label
                              >
                                {generatedStrategy.allocations.map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value: any, name: any, props: any) => [`${value}%`, props.payload.protocol]}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {generatedStrategy.allocations.map((allocation: any, index: number) => (
                          <div key={index} className="p-3 bg-black/30 border border-neutral-500/30 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-medium">{allocation.protocol}</span>
                              <span className="text-green-400 font-bold">{allocation.percentage}%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-neutral-400">APY: {allocation.apy}%</span>
                              <Badge className={getRiskColor(allocation.risk)}>{allocation.risk.toUpperCase()}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Performance Chart */}
                    <div className="space-y-4">
                      <div className="p-4 bg-black/30 border border-cyan-500/30 rounded-lg">
                        <h3 className="text-cyan-400 font-medium mb-3 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          Projected Performance
                        </h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={generatedStrategy.performanceData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                              <YAxis stroke="#9ca3af" fontSize={12} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#000",
                                  border: "1px solid #10b981",
                                  borderRadius: "8px",
                                }}
                              />
                              <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#colorValue)" />
                              <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
                        <h3 className="text-orange-400 font-medium mb-3">Strategy Features</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-orange-400" />
                            <span className="text-white">{generatedStrategy.gasOptimization}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-400" />
                            <span className="text-white">Insurance coverage available</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-cyan-400" />
                            <span className="text-white">Auto-rebalancing enabled</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-green-500/30">
                    <Button className="bg-gradient-to-r from-green-500 to-cyan-500 text-white flex-1">
                      Deploy Strategy
                    </Button>
                    <Button
                      variant="outline"
                      className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-900/20 bg-transparent"
                    >
                      Save Strategy
                    </Button>
                    <Button
                      variant="outline"
                      className="border-purple-500/50 text-purple-400 hover:bg-purple-900/20 bg-transparent"
                    >
                      Backtest
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Staking Modal */}
      <AnimatePresence>
        {showStakeModal && selectedPool && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md"
            >
              <Card className="bg-black/90 backdrop-blur-xl border-green-500/50 shadow-2xl shadow-green-500/20">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-white tracking-wider">
                      Stake in {selectedPool.protocol}
                    </CardTitle>
                    <p className="text-sm text-neutral-400">{selectedPool.asset} Pool</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setShowStakeModal(false)}
                    className="text-neutral-400 hover:text-white"
                  >
                    ✕
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <div>
                      <div className="text-xs text-green-400 mb-1">Current APY</div>
                      <div className="text-white font-bold text-lg">{selectedPool.apy}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-cyan-400 mb-1">AI Score</div>
                      <div className={`font-bold text-lg ${getScoreColor(selectedPool.aiScore)}`}>
                        {selectedPool.aiScore}/100
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Amount to Stake</label>
                    <Input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder={`Min: ${selectedPool.minDeposit} ${selectedPool.asset.split("/")[0]}`}
                      className="bg-black/50 border-green-500/30 text-white placeholder-neutral-500 focus:border-green-500/50"
                    />
                    <div className="flex justify-between text-xs text-neutral-400 mt-2">
                      <span>
                        Available: {selectedPool.userBalance} {selectedPool.asset.split("/")[0]}
                      </span>
                      <span>Min: {selectedPool.minDeposit}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Estimated Daily Earnings:</span>
                      <span className="text-green-400 font-mono">
                        {stakeAmount
                          ? ((Number.parseFloat(stakeAmount) * selectedPool.apy) / 365 / 100).toFixed(4)
                          : "0.0000"}{" "}
                        {selectedPool.asset.split("/")[0]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Network Fee:</span>
                      <span className="text-white font-mono">~$2.50</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Protocol Fee:</span>
                      <span className="text-white font-mono">{selectedPool.fees}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                      <Button
                        onClick={executeStake}
                        disabled={!stakeAmount || Number.parseFloat(stakeAmount) < selectedPool.minDeposit}
                        className="w-full bg-gradient-to-r from-green-500 to-cyan-500 text-white"
                      >
                        Confirm Stake
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        onClick={() => setShowStakeModal(false)}
                        className="border-neutral-500/50 text-neutral-400 hover:bg-neutral-900/20 bg-transparent"
                      >
                        Cancel
                      </Button>
                    </motion.div>
                  </div>

                  <div className="text-xs text-neutral-500 text-center p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                    <AlertTriangle className="w-4 h-4 inline mr-2" />
                    All transactions are recorded on Arweave for transparency
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
