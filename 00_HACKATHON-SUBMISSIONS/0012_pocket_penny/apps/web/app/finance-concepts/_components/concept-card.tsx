"use client";

import { useState } from "react";

import { Badge } from "@pocketpenny/ui/components/badge";
import { Button } from "@pocketpenny/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@pocketpenny/ui/components/card";
import { ArrowRight, CheckCircle, Circle, Star } from "lucide-react";

import { ConceptDialog } from "./concept-dialog";

interface ConceptCardProps {
  concept: {
    id: string;
    title: string;
    description: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    xpReward: number;
    completed: boolean;
  };
  isCompleted: boolean;
}

export const ConceptCard: React.FC<ConceptCardProps> = ({ concept, isCompleted }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const difficultyColors = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800",
  };

  return (
    <>
      <Card
        className={`h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
          isCompleted ? "ring-2 ring-green-500" : ""
        }`}
        onClick={() => setIsDialogOpen(true)}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
              <Badge className={difficultyColors[concept.difficulty]}>{concept.difficulty}</Badge>
            </div>
            <div className="flex items-center gap-1 text-orange-500">
              <Star className="h-4 w-4" />
              <span className="text-sm font-medium">{concept.xpReward} XP</span>
            </div>
          </div>

          <CardTitle className="text-xl">{concept.title}</CardTitle>
          <CardDescription className="text-base">{concept.description}</CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          <Button
            className="group w-full"
            variant={isCompleted ? "outline" : "default"}
            onClick={(e) => {
              e.stopPropagation();
              setIsDialogOpen(true);
            }}
          >
            {isCompleted ? "Review Concept" : "Start Learning"}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardContent>
      </Card>

      <ConceptDialog concept={concept} isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </>
  );
};
