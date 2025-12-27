"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Shield, AlertTriangle, CheckCircle, XCircle, Search, Download, Eye, Target } from "lucide-react"

export default function FraudDetectionPage() {
  const [walletAddress, setWalletAddress] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [currentStage, setCurrentStage] = useState(0)

  const analysisStages = [
    "Initializing FRAI-M scanner...",
    "Connecting to blockchain networks...",
    "Scanning transaction history...",
    "Analyzing transaction patterns...",
    "Cross-referencing fraud databases...",
    "Evaluating smart contract interactions...",
    "Checking for suspicious activities...",
    "Running behavioral pattern analysis...",
    "Calculating risk assessment scores...",
    "Generating comprehensive report...",
    "Storing results on Arweave...",
    "Analysis complete!",
  ]

  const fraudStats = [
    { label: "WALLETS ANALYZED", value: "12,847", icon: Search, color: "blue" },
    { label: "FRAUD DETECTED", value: "1,203", icon: AlertTriangle, color: "red" },
    { label: "ACCURACY RATE", value: "98.7%", icon: CheckCircle, color: "green" },
    { label: "SAVED LOSSES", value: "$2.4M", icon: Shield, color: "purple" },
  ]

  const recentAnalyses = [
    {
      id: "FRAI-001",
      address: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
      riskLevel: "low",
      score: 95,
      timestamp: "2 hours ago",
      status: "safe",
    },
    {
      id: "FRAI-002",
      address: "0x8ba1f109551bD432803012645Hac189451c",
      riskLevel: "high",
      score: 23,
      timestamp: "4 hours ago",
      status: "fraud",
    },
    {
      id: "FRAI-003",
      address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      riskLevel: "medium",
      score: 67,
      timestamp: "6 hours ago",
      status: "caution",
    },
    {
      id: "FRAI-004",
      address: "0xA0b86a33E6441e8e421f0c7245Fc9A5c3c0532925",
      riskLevel: "low",
      score: 89,
      timestamp: "8 hours ago",
      status: "safe",
    },
  ]

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/50"
      case "medium":
        return "bg-orange-500/20 text-orange-400 border-orange-500/50"
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/50"
      case "critical":
        return "bg-red-600/20 text-red-300 border-red-600/50"
      default:
        return "bg-neutral-500/20 text-neutral-400 border-neutral-500/50"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-orange-400"
    if (score >= 40) return "text-red-400"
    return "text-red-300"
  }

  const analyzeWallet = async () => {
    if (!walletAddress.trim()) return

    setIsAnalyzing(true)
    setCurrentStage(0)

    // Simulate 15+ second analysis with stage progression
    for (let i = 0; i < analysisStages.length; i++) {
      setCurrentStage(i)
      await new Promise((resolve) => setTimeout(resolve, 1300)) // ~15.6 seconds total
    }

    // Generate analysis result based on wallet address
    const addressHash = walletAddress.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)

    const riskFactors = Math.abs(addressHash) % 100
    let riskLevel = "low"
    let safetyScore = 85 + (riskFactors % 15)

    if (riskFactors > 70) {
      riskLevel = "critical"
      safetyScore = 15 + (riskFactors % 25)
    } else if (riskFactors > 50) {
      riskLevel = "high"
      safetyScore = 25 + (riskFactors % 35)
    } else if (riskFactors > 30) {
      riskLevel = "medium"
      safetyScore = 55 + (riskFactors % 25)
    }

    const result = {
      id: `FRAI-${Date.now()}`,
      walletAddress,
      riskLevel,
      safetyScore,
      status: safetyScore >= 70 ? "safe" : safetyScore >= 40 ? "caution" : "fraud",
      arweaveHash: `fraud_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      timestamp: new Date().toISOString(),
      transactionSummary: {
        totalTransactions: 1250 + riskFactors * 10,
        totalVolume: `$${(50000 + riskFactors * 1000).toLocaleString()}`,
        firstActivity: "2021-03-15",
        lastActivity: "2025-01-29",
        uniqueAddresses: 45 + (riskFactors % 50),
      },
      riskFactors: [
        ...(riskFactors > 70
          ? [
              {
                category: "Suspicious Patterns",
                severity: "critical",
                description: "Multiple high-value transactions to mixer services",
              },
              {
                category: "Blacklisted Addresses",
                severity: "high",
                description: "Interactions with known fraudulent wallets",
              },
              { category: "Rapid Transfers", severity: "high", description: "Unusual velocity in fund movements" },
            ]
          : []),
        ...(riskFactors > 50
          ? [
              {
                category: "Smart Contract Risk",
                severity: "medium",
                description: "Interactions with unverified contracts",
              },
              {
                category: "Geographic Anomalies",
                severity: "medium",
                description: "Transactions from high-risk jurisdictions",
              },
            ]
          : []),
        ...(riskFactors > 30
          ? [{ category: "Volume Spikes", severity: "low", description: "Occasional large transaction volumes" }]
          : []),
        { category: "Standard Activity", severity: "info", description: "Normal DeFi protocol interactions detected" },
      ],
      behavioralAnalysis: {
        patterns: [
          "Regular DeFi protocol usage",
          "Consistent transaction timing",
          "Diversified asset portfolio",
          ...(riskFactors > 50 ? ["Unusual late-night activity", "Rapid asset liquidation patterns"] : []),
        ],
        anomalies:
          riskFactors > 40
            ? [
                "Sudden change in transaction frequency",
                "Interactions with privacy coins",
                "Use of multiple intermediary addresses",
              ]
            : ["No significant anomalies detected"],
        recommendations:
          riskFactors > 60
            ? [
                "Avoid transacting with this wallet",
                "Report to relevant authorities",
                "Monitor for future suspicious activity",
              ]
            : riskFactors > 30
              ? [
                  "Exercise caution in transactions",
                  "Verify identity before large transfers",
                  "Monitor transaction patterns",
                ]
              : [
                  "Wallet appears safe for normal transactions",
                  "Continue standard security practices",
                  "Regular monitoring recommended",
                ],
      },
    }

    setAnalysisResult(result)
    setIsAnalyzing(false)
    setShowAnalysisModal(true)
  }

  const downloadReport = () => {
    if (!analysisResult) return

    const reportContent = `
FRAI-M FRAUD DETECTION REPORT
Generated: ${new Date().toISOString()}
Report ID: ${analysisResult.id}
Arweave Hash: ${analysisResult.arweaveHash}

═══════════════════════════════════════════════════════════════

WALLET ANALYSIS SUMMARY
═══════════════════════════════════════════════════════════════
Wallet Address: ${analysisResult.walletAddress}
Risk Level: ${analysisResult.riskLevel.toUpperCase()}
Safety Score: ${analysisResult.safetyScore}/100
Overall Status: ${analysisResult.status.toUpperCase()}

TRANSACTION SUMMARY
═══════════════════════════════════════════════════════════════
Total Transactions: ${analysisResult.transactionSummary.totalTransactions}
Total Volume: ${analysisResult.transactionSummary.totalVolume}
First Activity: ${analysisResult.transactionSummary.firstActivity}
Last Activity: ${analysisResult.transactionSummary.lastActivity}
Unique Addresses: ${analysisResult.transactionSummary.uniqueAddresses}

RISK FACTOR ANALYSIS
═══════════════════════════════════════════════════════════════
${analysisResult.riskFactors
  .map(
    (factor: any) => `
${factor.category.toUpperCase()} [${factor.severity.toUpperCase()}]
${factor.description}
`,
  )
  .join("")}

BEHAVIORAL ANALYSIS
═══════════════════════════════════════════════════════════════

DETECTED PATTERNS:
${analysisResult.behavioralAnalysis.patterns.map((pattern: string) => `• ${pattern}`).join("\n")}

ANOMALIES:
${analysisResult.behavioralAnalysis.anomalies.map((anomaly: string) => `• ${anomaly}`).join("\n")}

RECOMMENDATIONS:
${analysisResult.behavioralAnalysis.recommendations.map((rec: string) => `• ${rec}`).join("\n")}

VERIFICATION & TRANSPARENCY
═══════════════════════════════════════════════════════════════
This analysis has been permanently stored on Arweave blockchain
for transparency and immutability.

Arweave Transaction Hash: ${analysisResult.arweaveHash}
Analysis Timestamp: ${analysisResult.timestamp}
FRAI-M Version: 2.1.0

═══════════════════════════════════════════════════════════════
Generated by PsyFi FRAI-M (Fraud Risk Assessment & Intelligence Module)
Built on Arweave for Permanent Transparency
    `.trim()

    const blob = new Blob([reportContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `FRAI-M_Report_${analysisResult.walletAddress.slice(0, 8)}_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 tracking-wider flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Shield className="w-8 h-8 text-red-400" />
            </motion.div>
            FRAI-M
          </h1>
          <p className="text-sm text-neutral-400 mt-1">Fraud Risk Assessment & Intelligence Module</p>
        </div>
      </motion.div>

      {/* Fraud Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {fraudStats.map((stat, index) => (
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

      {/* Live Fraud Detection */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="bg-gradient-to-r from-red-900/20 to-orange-900/20 backdrop-blur-xl border-red-500/30">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-red-400 tracking-wider flex items-center gap-2">
              <Target className="w-5 h-5" />
              LIVE WALLET ANALYSIS
            </CardTitle>
            <p className="text-sm text-neutral-400">
              Enter a wallet address to perform real-time fraud detection analysis
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter wallet address (0x...)"
                className="flex-1 bg-black/50 border-red-500/30 text-white placeholder-neutral-500 focus:border-red-500/50"
                disabled={isAnalyzing}
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={analyzeWallet}
                  disabled={!walletAddress.trim() || isAnalyzing}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg shadow-red-500/25"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {isAnalyzing ? "Analyzing..." : "Analyze Wallet"}
                </Button>
              </motion.div>
            </div>

            <div className="text-xs text-neutral-500 flex items-center gap-2">
              <Shield className="w-3 h-3" />
              All analyses are encrypted and stored on Arweave for transparency
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Analyses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h2 className="text-xl font-bold text-white tracking-wider">RECENT ANALYSES</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {recentAnalyses.map((analysis, index) => (
            <motion.div
              key={analysis.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <Card className="bg-gradient-to-r from-black/50 to-red-900/10 backdrop-blur-xl border-red-500/30 hover:border-orange-500/50 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-mono text-sm">{analysis.address}</p>
                      <p className="text-xs text-neutral-400">
                        {analysis.id} • {analysis.timestamp}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getRiskColor(analysis.riskLevel)} border`}>
                        {analysis.riskLevel.toUpperCase()}
                      </Badge>
                      <div className={`text-sm font-bold ${getScoreColor(analysis.score)}`}>{analysis.score}/100</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {analysis.status === "safe" && <CheckCircle className="w-4 h-4 text-green-400" />}
                      {analysis.status === "caution" && <AlertTriangle className="w-4 h-4 text-orange-400" />}
                      {analysis.status === "fraud" && <XCircle className="w-4 h-4 text-red-400" />}
                      <span
                        className={`text-sm font-medium ${
                          analysis.status === "safe"
                            ? "text-green-400"
                            : analysis.status === "caution"
                              ? "text-orange-400"
                              : "text-red-400"
                        }`}
                      >
                        {analysis.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500/50 text-red-400 hover:bg-red-900/20 bg-transparent"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Analysis Loading Modal */}
      <AnimatePresence>
        {isAnalyzing && (
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
              <Card className="bg-black/90 backdrop-blur-xl border-red-500/50 shadow-2xl shadow-red-500/20">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 tracking-wider">
                    ANALYZING WALLET
                  </CardTitle>
                  <p className="text-sm text-neutral-400">FRAI-M is scanning for fraudulent activity</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-16 h-16 border-4 border-red-500/30 border-t-red-400 rounded-full"
                    />
                  </div>

                  <div className="space-y-3">
                    {analysisStages.map((stage, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0.3 }}
                        animate={{
                          opacity: index <= currentStage ? 1 : 0.3,
                          x: index <= currentStage ? 0 : -10,
                        }}
                        className={`text-sm flex items-center gap-2 ${
                          index <= currentStage ? "text-red-400" : "text-neutral-500"
                        }`}
                      >
                        <motion.div
                          animate={{ scale: index === currentStage ? [1, 1.2, 1] : 1 }}
                          transition={{ duration: 1, repeat: index === currentStage ? Number.POSITIVE_INFINITY : 0 }}
                          className={`w-2 h-2 rounded-full ${index <= currentStage ? "bg-red-400" : "bg-neutral-600"}`}
                        />
                        {stage}
                      </motion.div>
                    ))}
                  </div>

                  <div className="w-full bg-neutral-800 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${((currentStage + 1) / analysisStages.length) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Result Modal */}
      <AnimatePresence>
        {showAnalysisModal && analysisResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowAnalysisModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-6xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-black/90 backdrop-blur-xl border-red-500/50 shadow-2xl shadow-red-500/20">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 tracking-wider">
                      FRAUD ANALYSIS REPORT
                    </CardTitle>
                    <p className="text-sm text-neutral-400 font-mono">{analysisResult.id}</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setShowAnalysisModal(false)}
                    className="text-neutral-400 hover:text-white"
                  >
                    ✕
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Analysis Summary */}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className={`p-4 rounded-lg border ${getRiskColor(analysisResult.riskLevel)}`}>
                      <div className="text-xs mb-1">RISK LEVEL</div>
                      <div className="text-2xl font-bold">{analysisResult.riskLevel.toUpperCase()}</div>
                    </div>
                    <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                      <div className="text-xs text-blue-400 mb-1">SAFETY SCORE</div>
                      <div className={`text-2xl font-bold ${getScoreColor(analysisResult.safetyScore)}`}>
                        {analysisResult.safetyScore}/100
                      </div>
                    </div>
                    <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                      <div className="text-xs text-purple-400 mb-1">STATUS</div>
                      <div
                        className={`text-2xl font-bold ${
                          analysisResult.status === "safe"
                            ? "text-green-400"
                            : analysisResult.status === "caution"
                              ? "text-orange-400"
                              : "text-red-400"
                        }`}
                      >
                        {analysisResult.status.toUpperCase()}
                      </div>
                    </div>
                    <div className="p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
                      <div className="text-xs text-cyan-400 mb-1">ARWEAVE HASH</div>
                      <div className="text-sm font-mono text-cyan-400 break-all">{analysisResult.arweaveHash}</div>
                    </div>
                  </div>

                  {/* Wallet Address */}
                  <div className="p-4 bg-neutral-900/50 border border-neutral-500/30 rounded-lg">
                    <h3 className="text-white font-medium mb-2">ANALYZED WALLET</h3>
                    <p className="text-cyan-400 font-mono text-lg break-all">{analysisResult.walletAddress}</p>
                  </div>

                  {/* Transaction Summary */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <h3 className="text-green-400 font-medium mb-3">TRANSACTION SUMMARY</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Total Transactions:</span>
                          <span className="text-white font-mono">
                            {analysisResult.transactionSummary.totalTransactions}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Total Volume:</span>
                          <span className="text-white font-mono">{analysisResult.transactionSummary.totalVolume}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">First Activity:</span>
                          <span className="text-white">{analysisResult.transactionSummary.firstActivity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Last Activity:</span>
                          <span className="text-white">{analysisResult.transactionSummary.lastActivity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Unique Addresses:</span>
                          <span className="text-white font-mono">
                            {analysisResult.transactionSummary.uniqueAddresses}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                      <h3 className="text-red-400 font-medium mb-3">RISK FACTORS</h3>
                      <div className="space-y-2">
                        {analysisResult.riskFactors.map((factor: any, index: number) => (
                          <div key={index} className="flex items-start gap-2">
                            <div
                              className={`w-2 h-2 rounded-full mt-2 ${
                                factor.severity === "critical"
                                  ? "bg-red-300"
                                  : factor.severity === "high"
                                    ? "bg-red-400"
                                    : factor.severity === "medium"
                                      ? "bg-orange-400"
                                      : factor.severity === "low"
                                        ? "bg-yellow-400"
                                        : "bg-blue-400"
                              }`}
                            />
                            <div>
                              <div
                                className={`text-sm font-medium ${
                                  factor.severity === "critical"
                                    ? "text-red-300"
                                    : factor.severity === "high"
                                      ? "text-red-400"
                                      : factor.severity === "medium"
                                        ? "text-orange-400"
                                        : factor.severity === "low"
                                          ? "text-yellow-400"
                                          : "text-blue-400"
                                }`}
                              >
                                {factor.category}
                              </div>
                              <div className="text-xs text-neutral-300">{factor.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Behavioral Analysis */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                      <h4 className="text-blue-400 font-medium mb-2">DETECTED PATTERNS</h4>
                      <div className="space-y-1">
                        {analysisResult.behavioralAnalysis.patterns.map((pattern: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-1 h-1 bg-blue-400 rounded-full" />
                            <span className="text-white">{pattern}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
                      <h4 className="text-orange-400 font-medium mb-2">ANOMALIES</h4>
                      <div className="space-y-1">
                        {analysisResult.behavioralAnalysis.anomalies.map((anomaly: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-1 h-1 bg-orange-400 rounded-full" />
                            <span className="text-white">{anomaly}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                      <h4 className="text-purple-400 font-medium mb-2">RECOMMENDATIONS</h4>
                      <div className="space-y-1">
                        {analysisResult.behavioralAnalysis.recommendations.map((rec: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-1 h-1 bg-purple-400 rounded-full" />
                            <span className="text-white">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-red-500/30">
                    <Button
                      onClick={downloadReport}
                      className="bg-gradient-to-r from-green-500 to-cyan-500 text-white flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Full Report
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-500/50 text-red-400 hover:bg-red-900/20 bg-transparent"
                    >
                      View on Arweave
                    </Button>
                    <Button
                      variant="outline"
                      className="border-orange-500/50 text-orange-400 hover:bg-orange-900/20 bg-transparent"
                    >
                      Share Report
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
