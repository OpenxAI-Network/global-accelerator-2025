"use client";

import { Button } from "@pocketpenny/ui/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@pocketpenny/ui/components/dialog";
import { Award, BookOpen, Target, TrendingUp } from "lucide-react";

interface WelcomeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeDialog: React.FC<WelcomeDialogProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="mb-4 text-center text-3xl">Welcome to Finance Concepts Demystified! 🚀</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-center text-lg text-gray-600">
            Master investing basics through interactive lessons, calculators, and gamified learning. No jargon, just
            practical knowledge that builds your financial confidence.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-start space-x-3 rounded-lg bg-blue-50 p-4">
              <BookOpen className="mt-1 h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">Interactive Learning</h3>
                <p className="text-sm text-blue-700">Calculators, simulators, and real-world examples</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg bg-green-50 p-4">
              <TrendingUp className="mt-1 h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">Track Progress</h3>
                <p className="text-sm text-green-700">Earn XP, unlock badges, and level up</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg bg-orange-50 p-4">
              <Target className="mt-1 h-6 w-6 text-orange-600" />
              <div>
                <h3 className="font-semibold text-orange-900">Practical Focus</h3>
                <p className="text-sm text-orange-700">Real scenarios and actionable insights</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg bg-purple-50 p-4">
              <Award className="mt-1 h-6 w-6 text-purple-600" />
              <div>
                <h3 className="font-semibold text-purple-900">Achievement System</h3>
                <p className="text-sm text-purple-700">Celebrate your learning milestones</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 font-semibold text-gray-900">Your Learning Journey</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
                Complete concepts
              </span>
              <span className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-blue-500"></div>
                Earn experience points
              </span>
              <span className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-yellow-500"></div>
                Unlock achievements
              </span>
            </div>
          </div>

          <div className="text-center">
            <Button onClick={onClose} size="lg" className="px-8">
              Start Your Finance Journey
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
