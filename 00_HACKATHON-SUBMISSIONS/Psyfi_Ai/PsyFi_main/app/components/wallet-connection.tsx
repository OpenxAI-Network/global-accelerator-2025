"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, CheckCircle } from "lucide-react"

interface WalletConnectionProps {
  onConnect: (address: string) => void
  onDisconnect: () => void
  isConnected: boolean
  address: string
}

export default function WalletConnection({ onConnect, onDisconnect, isConnected, address }: WalletConnectionProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [copied, setCopied] = useState(false)

  const wallets = [
    { name: "MetaMask", icon: "🦊", available: true, description: "Connect using browser extension" },
    { name: "WalletConnect", icon: "🔗", available: true, description: "Scan with mobile wallet" },
    { name: "Coinbase Wallet", icon: "🔵", available: true, description: "Connect to Coinbase Wallet" },
    { name: "ArConnect", icon: "🌐", available: true, description: "Connect to Arweave wallet" },
  ]

  const handleWalletSelect = async (walletName: string) => {
    setConnecting(true)
    // Simulate wallet connection
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const mockAddress = "0x742d35Cc6634C0532925a3b8D4C9db96590fcaAb"
    onConnect(mockAddress)
    setShowWalletModal(false)
    setConnecting(false)
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isConnected) {
    return (
      <>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => setShowWalletModal(true)}
            className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-purple-500/25"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>
        </motion.div>

        {/* Wallet Selection Modal */}
        <AnimatePresence>
          {showWalletModal && (
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
                <Card className="bg-black/90 backdrop-blur-xl border-purple-500/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                        Connect Wallet
                      </h3>
                      <Button
                        variant="ghost"
                        onClick={() => setShowWalletModal(false)}
                        className="text-neutral-400 hover:text-white"
                      >
                        ✕
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {wallets.map((wallet, index) => (
                        <motion.button
                          key={wallet.name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => handleWalletSelect(wallet.name)}
                          disabled={!wallet.available || connecting}
                          className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-purple-900/20 to-cyan-900/20 border border-purple-500/30 rounded-lg hover:border-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="text-3xl">{wallet.icon}</span>
                          <div className="flex-1 text-left">
                            <div className="text-white font-medium group-hover:text-purple-400 transition-colors">
                              {wallet.name}
                            </div>
                            <div className="text-xs text-neutral-400">{wallet.description}</div>
                          </div>
                          {connecting && (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                              className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"
                            />
                          )}
                        </motion.button>
                      ))}
                    </div>
                    <div className="mt-6 text-xs text-neutral-500 text-center">
                      By connecting a wallet, you agree to PsyFi's{" "}
                      <span className="text-purple-400 hover:text-purple-300 cursor-pointer">Terms of Service</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  }

  return (
    <div className="relative">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={() => setShowDropdown(!showDropdown)}
          className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/50 text-white hover:bg-purple-900/40 backdrop-blur-sm"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="w-2 h-2 bg-green-400 rounded-full mr-2"
          />
          {formatAddress(address)}
          <motion.div animate={{ rotate: showDropdown ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown className="w-4 h-4 ml-2" />
          </motion.div>
        </Button>
      </motion.div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-64 bg-black/90 backdrop-blur-xl border border-purple-500/50 rounded-lg shadow-xl z-50"
          >
            <div className="p-4 border-b border-purple-500/30">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400 font-medium">Connected</span>
              </div>
              <div className="text-sm text-white font-mono break-all">{address}</div>
            </div>
            <div className="p-2">
              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                onClick={copyAddress}
                className="w-full flex items-center gap-3 p-3 text-sm text-neutral-400 hover:text-white hover:bg-purple-900/20 rounded-lg transition-all"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Address"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                className="w-full flex items-center gap-3 p-3 text-sm text-neutral-400 hover:text-white hover:bg-purple-900/20 rounded-lg transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                View on Explorer
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                onClick={onDisconnect}
                className="w-full flex items-center gap-3 p-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
