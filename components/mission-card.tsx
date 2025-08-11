import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Mission } from "@/lib/types"
import { Calendar, Users, Zap, Trophy } from "lucide-react"

interface MissionCardProps {
  mission: Mission
}

export function MissionCard({ mission }: MissionCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Hard":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-white">{mission.title}</h3>
              <Badge className={getDifficultyColor(mission.difficulty)}>{mission.difficulty}</Badge>
            </div>
            <p className="text-sm text-slate-400 line-clamp-2">{mission.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mission.progress !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Progress</span>
              <span className="text-white">{mission.progress}%</span>
            </div>
            <Progress value={mission.progress} className="h-2" />
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-white font-medium">{mission.gxpReward} GXP</span>
            </div>
            {mission.yoloReward && (
              <div className="flex items-center space-x-1">
                <Trophy className="w-4 h-4 text-purple-500" />
                <span className="text-purple-400 font-medium">{mission.yoloReward}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>{mission.participants} participants</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>Due {new Date(mission.deadline).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-700">
          {mission.isCompleted ? (
            <Button disabled className="w-full bg-green-600/20 text-green-400 border border-green-600/30">
              ✓ Completed
            </Button>
          ) : (
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              {mission.progress ? "Continue" : "Start Mission"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
