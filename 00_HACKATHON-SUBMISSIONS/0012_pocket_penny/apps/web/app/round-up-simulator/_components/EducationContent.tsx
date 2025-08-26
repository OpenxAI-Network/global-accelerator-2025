"use client";

import React, { useState } from "react";

import { BookOpen, ChevronRight, DollarSign, PiggyBank, Target, TrendingUp } from "lucide-react";

interface EducationCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: string;
  tips: string[];
}

export function EducationalContent() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const educationCards: EducationCard[] = [
    {
      id: "round-up",
      title: "Round-Up Investing",
      description: "Turn spare change into investment wealth",
      icon: <PiggyBank className="h-6 w-6" />,
      content:
        "Round-up investing automatically invests your spare change from everyday purchases. When you buy something for $4.35, the app rounds up to $5.00 and invests the extra $0.65. This painless micro-investing strategy helps you build wealth without noticing the impact on your budget.",
      tips: [
        "Start small - even $0.50 per transaction adds up over time",
        "Automate the process to remove the temptation to spend spare change",
        "Think of it as a 'set it and forget it' savings strategy",
      ],
    },
    {
      id: "compound-interest",
      title: "Compound Interest",
      description: "The eighth wonder of the world",
      icon: <TrendingUp className="h-6 w-6" />,
      content:
        "Compound interest means earning returns on both your original investment and previously earned returns. With round-up investing, your small contributions grow exponentially over time as your earnings generate their own earnings.",
      tips: [
        "Time is your biggest advantage - start investing early",
        "Reinvest all earnings to maximize compound growth",
        "Small amounts invested consistently beat large lump sums invested sporadically",
      ],
    },
    {
      id: "dollar-cost-averaging",
      title: "Dollar-Cost Averaging",
      description: "Reduce risk through consistent investing",
      icon: <DollarSign className="h-6 w-6" />,
      content:
        "Round-up investing naturally implements dollar-cost averaging by making small, frequent investments regardless of market conditions. This strategy reduces the impact of market volatility and helps you avoid trying to time the market.",
      tips: [
        "Don't worry about market timing - consistency wins",
        "Market dips become buying opportunities with regular investing",
        "Focus on time in the market, not timing the market",
      ],
    },
    {
      id: "goal-setting",
      title: "Setting Financial Goals",
      description: "Turn dreams into achievable targets",
      icon: <Target className="h-6 w-6" />,
      content:
        "Clear financial goals give your round-up investments purpose and direction. Whether saving for an emergency fund, vacation, or retirement, having specific targets helps you stay motivated and track progress.",
      tips: [
        "Set SMART goals: Specific, Measurable, Achievable, Relevant, Time-bound",
        "Break large goals into smaller milestones to maintain motivation",
        "Celebrate progress to reinforce positive financial habits",
      ],
    },
  ];

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      <div className="mb-6 flex items-center">
        <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
          <BookOpen className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Financial Education</h3>
          <p className="text-gray-600">Learn the concepts behind smart investing</p>
        </div>
      </div>

      <div className="space-y-4">
        {educationCards.map((card) => (
          <div key={card.id} className="overflow-hidden rounded-lg border border-gray-200">
            <button
              onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)}
              className="w-full p-4 text-left transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    {card.icon}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{card.title}</div>
                    <div className="text-sm text-gray-600">{card.description}</div>
                  </div>
                </div>
                <ChevronRight
                  className={`h-5 w-5 text-gray-400 transition-transform ${
                    expandedCard === card.id ? "rotate-90" : ""
                  }`}
                />
              </div>
            </button>

            {expandedCard === card.id && (
              <div className="border-t border-gray-100 bg-gray-50 px-4 pb-4">
                <div className="pt-4">
                  <p className="mb-4 leading-relaxed text-gray-700">{card.content}</p>
                  <div>
                    <h4 className="mb-2 font-medium text-gray-900">Key Tips:</h4>
                    <ul className="space-y-1">
                      {card.tips.map((tip, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-600">
                          <span className="mr-2 mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
