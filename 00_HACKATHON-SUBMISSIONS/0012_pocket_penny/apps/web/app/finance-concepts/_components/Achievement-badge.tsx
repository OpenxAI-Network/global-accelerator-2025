"use client";

import { Award, BookOpen, Star, Target, Trophy, Zap } from "lucide-react";

interface AchievementBadgeProps {
  badge: string;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({ badge }) => {
  const getBadgeInfo = (badgeName: string) => {
    switch (badgeName) {
      case "First Steps":
        return { icon: Star, color: "from-yellow-400 to-yellow-600", description: "Completed your first concept" };
      case "Getting Started":
        return { icon: Target, color: "from-blue-400 to-blue-600", description: "Completed 3 concepts" };
      case "Knowledge Builder":
        return { icon: BookOpen, color: "from-green-400 to-green-600", description: "Completed 5 concepts" };
      case "Finance Master":
        return { icon: Trophy, color: "from-purple-400 to-purple-600", description: "Completed all concepts" };
      case "Quick Learner":
        return {
          icon: Zap,
          color: "from-orange-400 to-orange-600",
          description: "Completed concept in under 5 minutes",
        };
      default:
        return { icon: Award, color: "from-gray-400 to-gray-600", description: "Achievement unlocked" };
    }
  };

  const { icon: Icon, color, description } = getBadgeInfo(badge);

  return (
    <div className="flex min-w-[120px] flex-col items-center rounded-lg border border-gray-200 bg-white p-4 shadow-md">
      <div
        className={`h-16 w-16 bg-gradient-to-br ${color} mb-3 flex items-center justify-center rounded-full shadow-lg`}
      >
        <Icon className="h-8 w-8 text-white" />
      </div>
      <h3 className="mb-1 text-center text-sm font-semibold text-gray-900">{badge}</h3>
      <p className="text-center text-xs text-gray-500">{description}</p>
    </div>
  );
};
