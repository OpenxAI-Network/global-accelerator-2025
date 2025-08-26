"use client";

import { useState } from "react";

import { Badge } from "@pocketpenny/ui/components/badge";
import { Button } from "@pocketpenny/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@pocketpenny/ui/components/card";
import { Progress } from "@pocketpenny/ui/components/progress";
import { AlertTriangle, Clock, DollarSign, Target, TrendingDown, TrendingUp } from "lucide-react";

interface RiskReturnQuizProps {
  onInteract: () => void;
}

export const RiskReturnQuiz: React.FC<RiskReturnQuizProps> = ({ onInteract }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      question: "You invest $1,000 and it drops to $800 in the first month. What do you do?",
      options: [
        { text: "Sell immediately to prevent further losses", score: 1 },
        { text: "Wait and see what happens", score: 2 },
        { text: "Invest another $500 while it's on sale", score: 3 },
      ],
    },
    {
      question: "What's your investment timeline?",
      options: [
        { text: "Less than 5 years", score: 1 },
        { text: "5-15 years", score: 2 },
        { text: "More than 15 years", score: 3 },
      ],
    },
    {
      question: "Which scenario sounds more appealing?",
      options: [
        { text: "Guaranteed 3% return every year", score: 1 },
        { text: "Average 7% return, but some years lose 20%", score: 2 },
        { text: "Average 10% return, but very volatile", score: 3 },
      ],
    },
    {
      question: "How much of your income can you afford to lose?",
      options: [
        { text: "None - I need every dollar", score: 1 },
        { text: "About 10-20%", score: 2 },
        { text: "30% or more", score: 3 },
      ],
    },
    {
      question: "How do you feel about market crashes?",
      options: [
        { text: "Terrifying - I'd lose sleep", score: 1 },
        { text: "Concerning but part of investing", score: 2 },
        { text: "Exciting - time to buy more!", score: 3 },
      ],
    },
  ];

  const handleAnswer = (score: number) => {
    onInteract();
    const newAnswers = [...answers, score];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
  };

  const getRiskProfile = (totalScore: number) => {
    if (totalScore <= 7) {
      return {
        level: "Conservative",
        color: "bg-green-100 text-green-800",
        icon: <DollarSign className="h-5 w-5" />,
        description: "You prefer stability and capital preservation over high returns.",
        allocation: { stocks: 20, bonds: 70, cash: 10 },
        expectedReturn: "4-6%",
        maxDrawdown: "5-10%",
        recommendations: [
          "High-grade bonds and bond ETFs",
          "Conservative balanced funds",
          "CDs and savings accounts for emergency fund",
          "Small allocation to broad market ETFs",
        ],
      };
    } else if (totalScore <= 11) {
      return {
        level: "Moderate",
        color: "bg-blue-100 text-blue-800",
        icon: <Target className="h-5 w-5" />,
        description: "You seek balanced growth with moderate risk tolerance.",
        allocation: { stocks: 60, bonds: 35, cash: 5 },
        expectedReturn: "6-8%",
        maxDrawdown: "15-25%",
        recommendations: [
          "Balanced index funds (60/40 stocks/bonds)",
          "Target-date funds for retirement",
          "Mix of domestic and international ETFs",
          "Some individual blue-chip stocks",
        ],
      };
    } else {
      return {
        level: "Aggressive",
        color: "bg-red-100 text-red-800",
        icon: <TrendingUp className="h-5 w-5" />,
        description: "You can handle high volatility for potentially higher returns.",
        allocation: { stocks: 90, bonds: 5, cash: 5 },
        expectedReturn: "8-12%",
        maxDrawdown: "30-50%",
        recommendations: [
          "Growth-focused index funds",
          "Small-cap and emerging market ETFs",
          "Individual growth stocks",
          "Some speculative investments",
        ],
      };
    }
  };

  const totalScore = answers.reduce((sum, score) => sum + score, 0);
  const riskProfile = showResults ? getRiskProfile(totalScore) : null;
  const progress = ((currentQuestion + (showResults ? 1 : 0)) / questions.length) * 100;

  if (showResults && riskProfile) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">📊 Your Risk Profile Results</CardTitle>
            <Progress value={100} className="h-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <Badge className={`${riskProfile.color} mb-4 px-4 py-2 text-lg`}>
                {riskProfile.icon}
                <span className="ml-2">{riskProfile.level} Investor</span>
              </Badge>
              <p className="text-lg text-gray-600">{riskProfile.description}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
                <TrendingUp className="mx-auto mb-2 h-8 w-8 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Expected Return</h4>
                <p className="text-2xl font-bold text-blue-900">{riskProfile.expectedReturn}</p>
                <p className="text-sm text-blue-600">Annual average</p>
              </div>

              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                <TrendingDown className="mx-auto mb-2 h-8 w-8 text-red-600" />
                <h4 className="font-semibold text-red-800">Max Drawdown</h4>
                <p className="text-2xl font-bold text-red-900">{riskProfile.maxDrawdown}</p>
                <p className="text-sm text-red-600">Worst case scenario</p>
              </div>

              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                <Clock className="mx-auto mb-2 h-8 w-8 text-green-600" />
                <h4 className="font-semibold text-green-800">Time Horizon</h4>
                <p className="text-2xl font-bold text-green-900">
                  {riskProfile.level === "Conservative"
                    ? "1-5 yrs"
                    : riskProfile.level === "Moderate"
                      ? "5-15 yrs"
                      : "15+ yrs"}
                </p>
                <p className="text-sm text-green-600">Recommended</p>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-6">
              <h3 className="mb-4 text-xl font-semibold">Recommended Asset Allocation</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Stocks</span>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-32 rounded-full bg-gray-200">
                      <div
                        className="h-3 rounded-full bg-blue-600"
                        style={{ width: `${riskProfile.allocation.stocks}%` }}
                      ></div>
                    </div>
                    <span className="font-semibold">{riskProfile.allocation.stocks}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Bonds</span>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-32 rounded-full bg-gray-200">
                      <div
                        className="h-3 rounded-full bg-green-600"
                        style={{ width: `${riskProfile.allocation.bonds}%` }}
                      ></div>
                    </div>
                    <span className="font-semibold">{riskProfile.allocation.bonds}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cash</span>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-32 rounded-full bg-gray-200">
                      <div
                        className="h-3 rounded-full bg-yellow-600"
                        style={{ width: `${riskProfile.allocation.cash}%` }}
                      ></div>
                    </div>
                    <span className="font-semibold">{riskProfile.allocation.cash}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Target className="h-5 w-5 text-blue-600" />
                Investment Recommendations
              </h3>
              <ul className="space-y-2">
                {riskProfile.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600"></div>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" />
                <div>
                  <h4 className="font-semibold text-orange-800">Important Reminder</h4>
                  <p className="mt-1 text-sm text-orange-700">
                    This is a general assessment. Your actual risk tolerance may change over time based on your
                    financial situation, market experience, and life circumstances. Consider consulting with a financial
                    advisor for personalized advice.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button onClick={resetQuiz} variant="outline">
                Retake Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🎯 Risk Tolerance Assessment</CardTitle>
          <CardDescription>Discover your investment personality and get personalized recommendations</CardDescription>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-500">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-xl font-semibold">{questions[currentQuestion]?.question ?? ""}</h3>

              <div className="space-y-3">
                {questions[currentQuestion]?.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswer(option.score)}
                    variant="outline"
                    className="h-auto w-full justify-start p-4 text-left hover:bg-blue-50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-300">
                        <div className="h-2 w-2 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100"></div>
                      </div>
                      <span>{option.text}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 font-semibold">Understanding Risk vs Return</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  • <strong>Higher risk = Higher potential returns</strong> (and higher potential losses)
                </p>
                <p>
                  • <strong>Lower risk = Lower but more stable returns</strong>
                </p>
                <p>
                  • <strong>Time horizon matters:</strong> Longer timelines can handle more risk
                </p>
                <p>
                  • <strong>Your comfort level is key:</strong> Don't take more risk than you can sleep with
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
