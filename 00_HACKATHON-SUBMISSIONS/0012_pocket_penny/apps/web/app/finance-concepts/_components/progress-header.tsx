"use client";

import { Progress } from "@pocketpenny/ui/components/progress";
import { Star, Target, Trophy } from "lucide-react";

import { useUserProgress } from "./providers";

export const ProgressHeader = () => {
  const { state: userProgress } = useUserProgress();

  const progressToNextLevel = ((userProgress.totalXP % 500) / 500) * 100;
  const xpToNextLevel = 500 - (userProgress.totalXP % 500);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <span className="font-semibold text-gray-900">Level {userProgress.currentLevel}</span>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <Star className="h-5 w-5 text-blue-500" />
              <span className="text-gray-600">{userProgress.totalXP} XP</span>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <Target className="h-5 w-5 text-green-500" />
              <span className="text-gray-600">{userProgress.completedConcepts.length} concepts mastered</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <div className="text-sm text-gray-500">{xpToNextLevel} XP to next level</div>
              <div className="w-32">
                <Progress value={progressToNextLevel} className="h-2" />
              </div>
            </div>

            <div className="flex gap-1">
              {userProgress.badges.slice(0, 3).map((badge, index) => (
                <div
                  key={badge}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-sm font-bold text-white"
                  title={badge}
                >
                  {index + 1}
                </div>
              ))}
              {userProgress.badges.length > 3 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">
                  +{userProgress.badges.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
