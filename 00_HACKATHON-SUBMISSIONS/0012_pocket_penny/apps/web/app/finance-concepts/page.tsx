"use client";

import { useEffect, useState } from "react";

import { Badge } from "@pocketpenny/ui/components/badge";

import { AchievementBadge } from "./_components/Achievement-badge";
import { ConceptCard } from "./_components/concept-card";
import { ProgressHeader } from "./_components/progress-header";
import { useFinanceData, useUserProgress } from "./_components/providers";
import { WelcomeDialog } from "./_components/welcome-dialog";

export default function Home() {
  const { state: financeData } = useFinanceData();
  const { state: userProgress } = useUserProgress();
  const [showWelcome, setShowWelcome] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");

  useEffect(() => {
    if (!localStorage.getItem("hasVisited")) {
      setShowWelcome(true);
    }
  }, []);

  const handleWelcomeComplete = () => {
    localStorage.setItem("hasVisited", "true");
    setShowWelcome(false);
  };

  const filteredConcepts = financeData.concepts.filter(
    (concept) => filterDifficulty === "all" || concept.difficulty === filterDifficulty
  );

  const completionRate = Math.round((userProgress.completedConcepts.length / financeData.concepts.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <ProgressHeader />

      <main className="container mx-auto max-w-6xl px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-6xl">
            Finance Concepts
            <span className="text-blue-600"> Demystified</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
            Master investing basics through interactive lessons, calculators, and real-world examples. No jargon, just
            practical knowledge.
          </p>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span>{userProgress.completedConcepts.length} completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              <span>Level {userProgress.currentLevel}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-orange-500"></div>
              <span>{completionRate}% progress</span>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          <Badge
            variant={filterDifficulty === "all" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilterDifficulty("all")}
          >
            All Concepts
          </Badge>
          <Badge
            variant={filterDifficulty === "beginner" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilterDifficulty("beginner")}
          >
            Beginner
          </Badge>
          <Badge
            variant={filterDifficulty === "intermediate" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilterDifficulty("intermediate")}
          >
            Intermediate
          </Badge>
          <Badge
            variant={filterDifficulty === "advanced" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilterDifficulty("advanced")}
          >
            Advanced
          </Badge>
        </div>

        {/* Concepts Grid */}
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredConcepts.map((concept) => (
            <ConceptCard
              key={concept.id}
              concept={concept}
              isCompleted={userProgress.completedConcepts.includes(concept.id)}
            />
          ))}
        </div>

        {/* Achievement Section */}
        {userProgress.badges.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
            <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">Your Achievements</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {userProgress.badges.map((badge) => (
                <AchievementBadge key={badge} badge={badge} />
              ))}
            </div>
          </div>
        )}
      </main>

      <WelcomeDialog isOpen={showWelcome} onClose={handleWelcomeComplete} />
    </div>
  );
}
