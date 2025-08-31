import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TrendingUp, Users, Zap, ArrowUpRight, ArrowDownRight, ChartColumn } from "lucide-react"
import Link from "next/link"

interface GrowtherCardProps {
  id: string
  avatar: string
  name: string
  tagline: string
  gxp: number
  supporters: number
  tags: string[]
  yoloPrice: string
  growthRate: string
  isRising?: boolean
  isPositive?: boolean
}

export function GrowtherCard({
  id,
  avatar,
  name,
  tagline,
  gxp,
  supporters,
  tags,
  yoloPrice,
  growthRate,
  isRising = true,
  isPositive = true,
}: GrowtherCardProps) {
  return (
    <Card className="text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm bg-gray-900/50 border-gray-800 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105 group relative gradient-border tech-glow" style={{ zIndex: 1 }}>
      <div className="absolute top-4 right-4" style={{ zIndex: 10 }}>
        <div className="bg-black/80 backdrop-blur-sm rounded-lg px-3 py-1 border border-gray-700">
          <div className="text-blue-400 font-bold text-sm font-mono">{yoloPrice}</div>
          <div className={`text-xs flex items-center font-mono ${isPositive ? "text-green-400" : "text-red-400"}`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
            {growthRate}
          </div>
        </div>
      </div>
      <Link href={`/growther/${id}`}>
        <CardHeader className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 pb-4 cursor-pointer relative" style={{ zIndex: 10 }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="relative flex size-8 shrink-0 overflow-hidden rounded-full w-16 h-16 border-2 border-blue-500/50 tech-glow">
                <AvatarImage className="aspect-square size-full" src={avatar || "/placeholder.svg?height=80&width=80"} />
                <AvatarFallback className="relative" style={{ zIndex: 20 }}>{name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">{name}</h3>
                <p className="text-sm text-gray-400 line-clamp-2 mt-4">{tagline}</p>
              </div>
            </div>
            {/* Hot badge hidden as requested */}
            {false && isRising && (
              <Badge className="justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden [a&]:hover:bg-primary/90 bg-green-500/20 text-green-400 border-green-500/30 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Hot
              </Badge>
            )}
          </div>
        </CardHeader>
      </Link>
      <CardContent className="px-6 space-y-4 relative" style={{ zIndex: 10 }}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-white font-semibold font-mono">{gxp.toLocaleString()} GXP</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-gray-300 font-mono">{supporters} supporters</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden [a&]:hover:bg-secondary/90 bg-gray-800 text-gray-300 text-xs border-gray-700">
              #{tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden [a&]:hover:bg-secondary/90 bg-gray-800 text-gray-300 text-xs border-gray-700">
              +{tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-800">
          <div className="flex-1">
            <span className="text-lg font-bold text-blue-400 font-mono">{yoloPrice}</span>
            <div className="flex items-center text-xs text-green-400 font-mono">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              {growthRate}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border shadow-xs hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-8 rounded-md gap-1.5 has-[>svg]:px-2.5 border-gray-700 text-gray-300 bg-transparent px-2 hover:bg-gray-800" style={{ zIndex: 15 }}>
              Quick: 10 YOLO
            </Button>
            <Link href={`/growther/${id}`}>
              <Button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 tech-glow" style={{ zIndex: 15 }}>
                <ChartColumn className="w-3 h-3 mr-1" />
                Invest
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
