"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Zap, TrendingUp, Shield, Bot, Database, Coins, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import DashboardPage from "./dashboard/page"
import AIInsightsPage from "./ai-insights/page"
import FraudDetectionPage from "./fraud-detection/page"
import DeFiPoolsPage from "./defi-pools/page"
import MarketAnalyzerPage from "./market-analyzer/page"
import MemoryVaultPage from "./memory-vault/page"
import MarketplacePage from "./marketplace/page"
import WalletConnection from "./components/wallet-connection"

export default function PsyFiApp() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate app loading
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleWalletConnect = (address: string) => {
    setWalletConnected(true)
    setWalletAddress(address)
  }

  const handleWalletDisconnect = () => {
    setWalletConnected(false)
    setWalletAddress("")
  }

  const navigationItems = [
    {
      id: "dashboard",
      icon: TrendingUp,
      label: "DASHBOARD",
      color: "text-cyan-400",
      gradient: "from-cyan-500/20 to-blue-500/20",
    },
    {
      id: "ai-insights",
      icon: Bot,
      label: "AI INSIGHTS",
      color: "text-purple-400",
      gradient: "from-purple-500/20 to-pink-500/20",
    },
    {
      id: "fraud-detection",
      icon: Shield,
      label: "FRAI-M",
      color: "text-red-400",
      gradient: "from-red-500/20 to-orange-500/20",
    },
    {
      id: "defi-pools",
      icon: Coins,
      label: "DeFi POOLS",
      color: "text-green-400",
      gradient: "from-green-500/20 to-emerald-500/20",
    },
    {
      id: "market-analyzer",
      icon: Activity,
      label: "MARKET ANALYZER",
      color: "text-blue-400",
      gradient: "from-blue-500/20 to-indigo-500/20",
    },
    {
      id: "memory-vault",
      icon: Database,
      label: "MEMORY VAULT",
      color: "text-orange-400",
      gradient: "from-orange-500/20 to-yellow-500/20",
    },
    {
      id: "marketplace",
      icon: Zap,
      label: "MARKETPLACE",
      color: "text-pink-400",
      gradient: "from-pink-500/20 to-rose-500/20",
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500 border-t-cyan-400 rounded-full mx-auto mb-4"
          />
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400"
          >
            PsyFi
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-neutral-400 mt-2"
          >
            Initializing AI-Powered DeFi OS...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/10 via-black to-cyan-900/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.1),transparent_50%)]" />
      </div>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`${sidebarCollapsed ? "w-16" : "w-72"} bg-black/80 backdrop-blur-xl border-r border-purple-500/30 transition-all duration-300 fixed md:relative z-50 h-full`}
        style={{
          background: "linear-gradient(180deg, rgba(139,92,246,0.1) 0%, rgba(0,0,0,0.9) 100%)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="p-4">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className={`${sidebarCollapsed ? "hidden" : "block"}`}>
              <motion.h1
                whileHover={{ scale: 1.05 }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-bold text-2xl tracking-wider flex items-center gap-2"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Zap className="w-8 h-8 text-purple-400" />
                </motion.div>
                PsyFi
              </motion.h1>
              <p className="text-purple-400/70 text-xs mt-1">AI-Powered DeFi OS v2.1</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-purple-400 hover:text-cyan-400 hover:bg-purple-500/20"
            >
              <motion.div animate={{ rotate: sidebarCollapsed ? 0 : 180 }} transition={{ duration: 0.3 }}>
                <ChevronRight className="w-5 h-5" />
              </motion.div>
            </Button>
          </motion.div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navigationItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 group ${
                  activeSection === item.id
                    ? `bg-gradient-to-r ${item.gradient} border border-purple-500/50 text-white shadow-lg shadow-purple-500/20`
                    : "text-neutral-400 hover:text-white hover:bg-purple-900/20"
                }`}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  animate={activeSection === item.id ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <item.icon
                    className={`w-5 h-5 ${activeSection === item.id ? item.color : ""} group-hover:${item.color}`}
                  />
                </motion.div>
                {!sidebarCollapsed && <span className="text-sm font-medium tracking-wider">{item.label}</span>}
                {activeSection === item.id && !sidebarCollapsed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-2 h-2 bg-cyan-400 rounded-full"
                  />
                )}
              </motion.button>
            ))}
          </nav>

          {/* System Status */}
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-8 p-4 bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border border-purple-500/30 rounded-lg backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  className="w-2 h-2 bg-cyan-400 rounded-full"
                />
                <span className="text-xs text-cyan-400 font-medium">AI SYSTEM ONLINE</span>
              </div>
              <div className="text-xs text-neutral-400 space-y-1">
                <div className="flex justify-between">
                  <span>UPTIME:</span>
                  <span className="text-green-400">99.7%</span>
                </div>
                <div className="flex justify-between">
                  <span>AI MODELS:</span>
                  <span className="text-purple-400">12 ACTIVE</span>
                </div>
                <div className="flex justify-between">
                  <span>FRAUD ALERTS:</span>
                  <span className="text-red-400">3 TODAY</span>
                </div>
                <div className="flex justify-between">
                  <span>TVL:</span>
                  <span className="text-cyan-400">$2.4M</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Toolbar */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="h-16 bg-black/80 backdrop-blur-xl border-b border-purple-500/30 flex items-center justify-between px-6 relative z-10"
        >
          <div className="flex items-center gap-4">
            <div className="text-sm text-neutral-400">
              PSYFI /{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                {activeSection.toUpperCase().replace("-", " ")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="text-xs text-green-400 flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              ARWEAVE SYNC: ACTIVE
            </motion.div>
            <WalletConnection
              onConnect={handleWalletConnect}
              onDisconnect={handleWalletDisconnect}
              isConnected={walletConnected}
              address={walletAddress}
            />
          </div>
        </motion.div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {activeSection === "dashboard" && <DashboardPage walletConnected={walletConnected} />}
              {activeSection === "ai-insights" && <AIInsightsPage />}
              {activeSection === "fraud-detection" && <FraudDetectionPage />}
              {activeSection === "defi-pools" && <DeFiPoolsPage />}
              {activeSection === "market-analyzer" && <MarketAnalyzerPage />}
              {activeSection === "memory-vault" && <MemoryVaultPage />}
              {activeSection === "marketplace" && <MarketplacePage />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
