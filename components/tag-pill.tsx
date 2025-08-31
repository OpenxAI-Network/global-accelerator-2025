"use client"

import { Button } from "@/components/ui/button"
import { Hash } from "lucide-react"

interface TagPillProps {
  tag: string
  count?: number
  onClick?: () => void
  variant?: "default" | "active"
}

export function TagPill({ tag, count, onClick, variant = "default" }: TagPillProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={`
        transition-all duration-200 hover:scale-105 bg-transparent
        ${
          variant === "active"
            ? "border-blue-500 bg-blue-500/20 text-blue-300 tech-glow"
            : "border-gray-600 text-gray-300 hover:bg-purple-600 hover:border-purple-500"
        }
      `}
    >
      <Hash className="w-3 h-3 mr-1" />
      {tag}
      {count && <span className="ml-2 text-xs bg-gray-800 px-2 py-0.5 rounded-full font-mono">{count}</span>}
    </Button>
  )
}
