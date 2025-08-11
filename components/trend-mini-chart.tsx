"use client"

import { TrendingUp, TrendingDown } from "lucide-react"

interface TrendMiniChartProps {
  data: number[]
  isPositive: boolean
  className?: string
}

export function TrendMiniChart({ data, isPositive, className = "" }: TrendMiniChartProps) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 60
      const y = 20 - ((value - min) / range) * 20
      return `${x},${y}`
    })
    .join(" ")

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <svg width="60" height="20" className="overflow-visible">
        <polyline fill="none" stroke={isPositive ? "#10b981" : "#ef4444"} strokeWidth="2" points={points} />
      </svg>
      {isPositive ? (
        <TrendingUp className="w-3 h-3 text-green-500" />
      ) : (
        <TrendingDown className="w-3 h-3 text-red-500" />
      )}
    </div>
  )
}
