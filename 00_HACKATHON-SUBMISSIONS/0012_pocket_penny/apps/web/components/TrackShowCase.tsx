"use client";

import { useRouter } from "next/navigation";

import {
  BarChart3,
  Bot,
  Brain,
  CheckCircle,
  DollarSign,
  Heart,
  History,
  RotateCcw,
  Scale,
  Users,
  Zap,
} from "lucide-react";

const tracks = [
  {
    id: 1,
    icon: RotateCcw,
    title: "Round-Up Saving Simulator",
    description: "Learn the power of micro-investing by simulating round-up savings from everyday purchases.",
    url: "/round-up-simulator",
    features: [
      "Interactive purchase simulator",
      "Automatic round-up calculations",
      "Long-term growth projections",
      "Habit formation tracking",
    ],
  },
  {
    id: 2,
    icon: Brain,
    title: "Finance Concepts Demystifier",
    description: "Break down complex financial jargon into simple, understandable concepts with visual aids.",
    url: "/finance-concepts",
    features: ["Visual concept explanations", "Interactive glossary", "Real-world examples", "Knowledge assessments"],
  },
  {
    id: 3,
    icon: BarChart3,
    title: "Budget-to-Invest Dashboard",
    description: "Create budgets that automatically allocate funds for investment opportunities.",
    url: "/budget-invest-dashboard",
    features: [
      "Smart budget allocation",
      "Investment goal tracking",
      "Expense categorization",
      "Monthly progress reports",
    ],
  },
  {
    id: 4,
    icon: Bot,
    title: "AI Finance Assistant",
    description: "Get personalized financial advice and answers to your money questions 24/7.",
    url: "/ai-finance-assistant",
    features: ["Natural language processing", "Personalized recommendations", "Market insights", "Goal-based planning"],
  },
  {
    id: 5,
    icon: History,
    title: "Market History Explorer",
    description: "Explore historical market data and learn from past financial events and trends.",
    url: "/market-history-explorer",
    features: [
      "Interactive timeline",
      "Historical analysis tools",
      "Market trend visualization",
      "Educational narratives",
    ],
  },
  {
    id: 6,
    icon: Scale,
    title: "Investment Risk Visualizer",
    description: "Understand and visualize different types of investment risks with interactive models.",
    url: "/investment-risk-visualizer",
    features: ["Risk assessment tools", "Portfolio simulation", "Volatility modeling", "Risk tolerance quiz"],
  },
  {
    id: 7,
    icon: Heart,
    title: "Values-Based Investing Guide",
    description: "Align your investments with your personal values through ESG and impact investing.",
    url: "/values-based-investing",
    features: ["Values assessment", "ESG screening tools", "Impact measurement", "Ethical investment options"],
  },
  {
    id: 8,
    icon: DollarSign,
    title: "Fee Impact Calculator",
    description: "Understand how fees compound over time and learn to minimize their impact on returns.",
    url: "/fee-impact-calculator",
    features: [
      "Fee comparison tools",
      "Long-term impact analysis",
      "Cost-efficient alternatives",
      "Savings projections",
    ],
  },
  {
    id: 9,
    icon: Users,
    title: "Collaborative Investment Simulator",
    description: "Practice investment strategies with friends and learn from group decision-making.",
    url: "/collaborative-investment-simulator",
    features: [
      "Group portfolio management",
      "Peer learning features",
      "Competition modes",
      "Social investing insights",
    ],
  },
  {
    id: 10,
    icon: Zap,
    title: "Financial Health API",
    description: "Integrate comprehensive financial health scoring into your apps and services.",
    url: "/financial-health-api",
    features: ["RESTful API endpoints", "Real-time health scoring", "Developer documentation", "Custom integrations"],
  },
];

export const TracksShowcase = () => {
  const router = useRouter();

  return (
    <section id="tracks" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">10 Comprehensive Learning Tracks</h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600">
            Master every aspect of personal finance with our specialized educational modules.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="group transform rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="mb-4 flex items-center">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 transition-colors duration-300 group-hover:bg-blue-200">
                  <track.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{track.title}</h3>
              </div>

              <p className="mb-4 leading-relaxed text-gray-600">{track.description}</p>

              <ul className="mb-6 space-y-2">
                {track.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="mr-2 h-4 w-4 flex-shrink-0 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className="w-full transform rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-blue-700"
                onClick={() => router.push(track.url)}
              >
                Try Demo
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
