"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, Zap } from "lucide-react"
import { useState, useEffect } from "react"

interface MarketStatsBarProps {
  totalMarketCap: string
  totalUsers: number
  activeTraders: number
  totalGXP: number
  priceChangePercent: number
}

export function MarketStatsBar({
  totalMarketCap,
  totalUsers,
  activeTraders,
  totalGXP,
  priceChangePercent,
}: MarketStatsBarProps) {
  const isPositive = priceChangePercent > 0

  return (
    <Card className="bg-gray-900/50 border-gray-800 mb-6 gradient-border">
      <CardContent className="p-2">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-xs text-gray-400">Market Cap</p>
              <p className="text-sm font-semibold text-white font-mono">{totalMarketCap} YOLO</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-xs text-gray-400">Listed Stocks</p>
              <p className="text-sm font-semibold text-white font-mono">{totalUsers.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Activity className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-xs text-gray-400">Active Traders</p>
              <p className="text-sm font-semibold text-white font-mono">{activeTraders.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-xs text-gray-400">Total GXP</p>
              <p className="text-sm font-semibold text-white font-mono">{totalGXP.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isPositive ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
            <div>
              <p className="text-xs text-gray-400">24h Change</p>
              <p className={`text-sm font-semibold font-mono ${isPositive ? "text-green-400" : "text-red-400"}`}>
                {isPositive ? "+" : ""}
                {priceChangePercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
        
        {/* Text Carousel */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <TextCarousel />
        </div>
      </CardContent>
    </Card>
  )
}

// Text Carousel Component
function TextCarousel() {
  const carouselTexts = [
    "Trust Through Transparency - Blockchain-powered credibility system for your every contribution.",
    "Personal Growth Value - Participate, learn, share, and watch your growth translate into real value.",
    "Social Capital Monetization - Turn your influence into assets, interact and earn, let social value become liquid.",
    "Decentralized Innovation Hub - Where creativity meets opportunity in the new economy.",
    "Community-Driven Excellence - Your contributions shape the future of collaborative growth.",
    "Verified Achievement Network - Every milestone matters, every skill counts, every growth is rewarded."
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselTexts.length)
    }, 4000) // Change text every 4 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-6 overflow-hidden">
      <div 
        className="flex transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {carouselTexts.map((text, index) => (
          <div 
            key={index}
            className="w-full flex-shrink-0 flex items-center justify-center px-4"
          >
            <p className="text-xl text-gray-300 text-center leading-relaxed font-medium">
              {text}
            </p>
          </div>
        ))}
      </div>
      
      {/* Dots indicator */}
      <div className="flex justify-center space-x-2 mt-2">
        {carouselTexts.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              index === currentIndex ? 'bg-blue-500' : 'bg-gray-600'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}
