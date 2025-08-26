"use client";

import { useState } from "react";

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@pocketpenny/ui/components";
import { toast } from "sonner";

import { CompoundInterestCalculator } from "../_calculators/compound-interest-calculator";
import { DiversificationSimulator } from "../_calculators/diversification-simulator";
import { DollarCostAveragingDemo } from "../_calculators/dollar-cost-averaging-demo";
import { EmergencyFundCalculator } from "../_calculators/emergency-fund-calculator";
import { ETFvsStocksComparison } from "../_calculators/etf-vs-stocks-comparison";
import { InflationImpactDemo } from "../_calculators/inflation-impact-demo";
import { MarketVolatilityDemo } from "../_calculators/market-volatility-demo";
import { RiskReturnQuiz } from "../_calculators/risk-return-quiz";
import { ConversationalChat } from "./conversational-chat";
import { useFinanceData, useUserProgress } from "./providers";

interface ConceptDialogProps {
  concept: {
    id: string;
    title: string;
    description: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    xpReward: number;
    completed: boolean;
  };
  isOpen: boolean;
  onClose: () => void;
}

export const ConceptDialog: React.FC<ConceptDialogProps> = ({ concept, isOpen, onClose }) => {
  const { state: userProgress, dispatch: dispatchUserProgress } = useUserProgress();
  const { dispatch: dispatchFinanceData } = useFinanceData();
  const [hasInteracted, setHasInteracted] = useState(false);
  const isCompleted = userProgress.completedConcepts.includes(concept.id);

  const handleComplete = () => {
    if (!isCompleted && hasInteracted) {
      dispatchUserProgress({ type: "COMPLETE_CONCEPT", payload: concept.id });
      dispatchUserProgress({ type: "ADD_XP", payload: concept.xpReward });
      dispatchFinanceData({ type: "MARK_CONCEPT_COMPLETED", payload: concept.id });

      // Add badges based on milestones
      const newCompletedCount = userProgress.completedConcepts.length + 1;
      if (newCompletedCount === 1) {
        dispatchUserProgress({ type: "UNLOCK_BADGE", payload: "First Steps" });
      } else if (newCompletedCount === 3) {
        dispatchUserProgress({ type: "UNLOCK_BADGE", payload: "Getting Started" });
      } else if (newCompletedCount === 5) {
        dispatchUserProgress({ type: "UNLOCK_BADGE", payload: "Knowledge Builder" });
      } else if (newCompletedCount === 8) {
        dispatchUserProgress({ type: "UNLOCK_BADGE", payload: "Finance Master" });
      }

      toast.success(`Concept completed! +${concept.xpReward} XP`, {
        description: `You've mastered ${concept.title}`,
      });
    }
  };

  const renderCalculator = () => {
    switch (concept.id) {
      case "compound-interest":
        return <CompoundInterestCalculator onInteract={() => setHasInteracted(true)} />;
      case "dollar-cost-averaging":
        return <DollarCostAveragingDemo onInteract={() => setHasInteracted(true)} />;
      case "etf-vs-stocks":
        return <ETFvsStocksComparison onInteract={() => setHasInteracted(true)} />;
      case "risk-return":
        return <RiskReturnQuiz onInteract={() => setHasInteracted(true)} />;
      case "diversification":
        return <DiversificationSimulator onInteract={() => setHasInteracted(true)} />;
      case "market-volatility":
        return <MarketVolatilityDemo onInteract={() => setHasInteracted(true)} />;
      case "emergency-fund":
        return <EmergencyFundCalculator onInteract={() => setHasInteracted(true)} />;
      case "inflation-impact":
        return <InflationImpactDemo onInteract={() => setHasInteracted(true)} />;
      default:
        return <div className="p-8 text-center text-gray-500">Calculator coming soon!</div>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{concept.title}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="learn" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="learn">Interactive Learning</TabsTrigger>
            <TabsTrigger value="chat">Ask Questions</TabsTrigger>
          </TabsList>

          <TabsContent value="learn" className="mt-6">
            {renderCalculator()}

            {hasInteracted && !isCompleted && (
              <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-green-800">Ready to complete this concept?</h3>
                    <p className="text-green-600">
                      You've interacted with the content. Mark it as completed to earn XP!
                    </p>
                  </div>
                  <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                    Complete (+{concept.xpReward} XP)
                  </Button>
                </div>
              </div>
            )}

            {isCompleted && (
              <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
                    <span className="text-sm text-white">✓</span>
                  </div>
                  <span className="font-semibold text-blue-800">Concept Completed!</span>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <ConversationalChat conceptId={concept.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
