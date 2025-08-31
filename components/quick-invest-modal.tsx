"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, X, TrendingUp } from "lucide-react"

interface QuickInvestModalProps {
  isOpen: boolean
  onClose: () => void
  growther: {
    id: string
    name: string
    avatar: string
    price: string
    change: string
    gxp: number
  }
}

export function QuickInvestModal({ isOpen, onClose, growther }: QuickInvestModalProps) {
  const [investAmount, setInvestAmount] = useState(100)
  const [isInvesting, setIsInvesting] = useState(false)

  if (!isOpen) return null

  const handleInvest = async () => {
    setIsInvesting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsInvesting(false)
    onClose()
    // Show success toast
  }

  const currentPrice = Number.parseFloat(growther.price.replace(" YOLO", ""))
  const totalCost = (investAmount * currentPrice).toFixed(1)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-slate-800 border-slate-700 w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-bold text-white">Quick Invest</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Growther Info */}
          <div className="flex items-center space-x-4 p-4 bg-slate-700/30 rounded-lg">
            <Avatar className="w-12 h-12 border-2 border-purple-500">
              <AvatarImage src={growther.avatar || "/placeholder.svg"} />
              <AvatarFallback>{growther.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-white font-semibold">{growther.name}</h3>
              <div className="flex items-center space-x-2">
                <span className="text-purple-400 font-bold">{growther.price}</span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {growther.change}
                </Badge>
              </div>
            </div>
          </div>

          {/* Investment Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Investment Amount</label>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 bg-transparent"
                onClick={() => setInvestAmount(Math.max(10, investAmount - 10))}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <div className="flex-1 text-center">
                <input
                  type="number"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(Number(e.target.value))}
                  className="w-full bg-slate-700 text-white text-center py-3 text-lg font-semibold rounded border border-slate-600 focus:border-purple-500 focus:outline-none"
                />
                <p className="text-xs text-slate-400 mt-1">YOLO tokens</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 bg-transparent"
                onClick={() => setInvestAmount(investAmount + 10)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[50, 100, 250, 500].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 bg-transparent"
                onClick={() => setInvestAmount(amount)}
              >
                {amount}
              </Button>
            ))}
          </div>

          {/* Cost Summary */}
          <div className="bg-slate-700/30 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Amount:</span>
              <span className="text-white">{investAmount} YOLO</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Price per token:</span>
              <span className="text-white">{growther.price}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-slate-600 pt-2">
              <span className="text-slate-400">总成本:</span>
              <span className="text-purple-400 font-bold">{totalCost} YOLO</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 bg-transparent"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              onClick={handleInvest}
              disabled={isInvesting}
            >
              {isInvesting ? "投资中..." : `投资 ${totalCost} YOLO`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
