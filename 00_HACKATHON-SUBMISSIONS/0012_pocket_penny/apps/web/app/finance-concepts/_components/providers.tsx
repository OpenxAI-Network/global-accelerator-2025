"use client";

import React, { ReactNode, createContext, useContext, useReducer } from "react";

// Types
interface FinanceConcept {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  estimatedTime: number;
  prerequisites: string[];
  tags: string[];
  xpReward: number;
  completed: boolean;
}

interface FinanceDataState {
  concepts: FinanceConcept[];
  categories: string[];
  totalConcepts: number;
}

interface UserProgressState {
  completedConcepts: string[];
  currentLevel: number;
  totalXP: number;
  totalPoints: number;
  badges: string[];
  streak: number;
  lastActivityDate: string;
}

interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: string;
}

interface UIState {
  chatHistory: ChatMessage[];
  isChatOpen: boolean;
  currentConceptId: string | null;
}

// Initial states
const initialFinanceData: FinanceDataState = {
  concepts: [
    {
      id: "compound-interest",
      title: "Compound Interest",
      description: "Learn how your money grows exponentially over time through the power of compounding.",
      difficulty: "beginner",
      category: "Basics",
      estimatedTime: 15,
      prerequisites: [],
      tags: ["savings", "growth", "time-value"],
      xpReward: 100,
      completed: false,
    },
    {
      id: "diversification",
      title: "Portfolio Diversification",
      description: "Understand why spreading your investments across different assets reduces risk.",
      difficulty: "intermediate",
      category: "Risk Management",
      estimatedTime: 20,
      prerequisites: ["compound-interest"],
      tags: ["risk", "portfolio", "balance"],
      xpReward: 150,
      completed: false,
    },
    {
      id: "dollar-cost-averaging",
      title: "Dollar-Cost Averaging",
      description: "Discover how investing fixed amounts regularly can smooth out market volatility.",
      difficulty: "beginner",
      category: "Strategy",
      estimatedTime: 12,
      prerequisites: [],
      tags: ["strategy", "volatility", "consistency"],
      xpReward: 100,
      completed: false,
    },
    {
      id: "emergency-fund",
      title: "Emergency Fund Planning",
      description: "Build a financial safety net to protect against unexpected expenses.",
      difficulty: "beginner",
      category: "Planning",
      estimatedTime: 10,
      prerequisites: [],
      tags: ["safety", "planning", "security"],
      xpReward: 100,
      completed: false,
    },
    {
      id: "etf-vs-stocks",
      title: "ETFs vs Individual Stocks",
      description: "Compare the pros and cons of investing in ETFs versus picking individual stocks.",
      difficulty: "intermediate",
      category: "Investment Types",
      estimatedTime: 18,
      prerequisites: ["diversification"],
      tags: ["comparison", "etfs", "stocks"],
      xpReward: 150,
      completed: false,
    },
    {
      id: "inflation-impact",
      title: "Inflation Impact",
      description: "Learn how inflation erodes purchasing power and how to protect your investments.",
      difficulty: "intermediate",
      category: "Economics",
      estimatedTime: 15,
      prerequisites: ["compound-interest"],
      tags: ["inflation", "purchasing-power", "protection"],
      xpReward: 150,
      completed: false,
    },
    {
      id: "market-volatility",
      title: "Understanding Market Volatility",
      description: "Grasp why markets fluctuate and how to navigate turbulent times.",
      difficulty: "advanced",
      category: "Market Analysis",
      estimatedTime: 25,
      prerequisites: ["dollar-cost-averaging", "diversification"],
      tags: ["volatility", "markets", "psychology"],
      xpReward: 200,
      completed: false,
    },
    {
      id: "risk-return",
      title: "Risk vs Return Trade-off",
      description: "Master the fundamental relationship between risk and potential returns.",
      difficulty: "advanced",
      category: "Risk Management",
      estimatedTime: 20,
      prerequisites: ["diversification", "market-volatility"],
      tags: ["risk", "return", "trade-off"],
      xpReward: 200,
      completed: false,
    },
  ],
  categories: ["Basics", "Risk Management", "Strategy", "Planning", "Investment Types", "Economics", "Market Analysis"],
  totalConcepts: 8,
};

const initialUserProgress: UserProgressState = {
  completedConcepts: [],
  currentLevel: 1,
  totalXP: 0,
  totalPoints: 0,
  badges: [],
  streak: 0,
  lastActivityDate: new Date().toISOString(),
};

const initialUIState: UIState = {
  chatHistory: [],
  isChatOpen: false,
  currentConceptId: null,
};

// Action types
type FinanceDataAction =
  | { type: "SET_CONCEPTS"; payload: FinanceConcept[] }
  | { type: "ADD_CONCEPT"; payload: FinanceConcept }
  | { type: "UPDATE_CONCEPT"; payload: { id: string; updates: Partial<FinanceConcept> } }
  | { type: "MARK_CONCEPT_COMPLETED"; payload: string };

type UserProgressAction =
  | { type: "COMPLETE_CONCEPT"; payload: string }
  | { type: "UNLOCK_BADGE"; payload: string }
  | { type: "UPDATE_STREAK"; payload: number }
  | { type: "ADD_POINTS"; payload: number }
  | { type: "RESET_PROGRESS" }
  | { type: "ADD_XP"; payload: number };

type UIAction =
  | { type: "ADD_CHAT_MESSAGE"; payload: ChatMessage }
  | { type: "CLEAR_CHAT_HISTORY" }
  | { type: "SET_CHAT_OPEN"; payload: boolean }
  | { type: "SET_CURRENT_CONCEPT"; payload: string | null }
  | { type: "RESET_UI_STATE" };

// Reducers
function financeDataReducer(state: FinanceDataState, action: FinanceDataAction): FinanceDataState {
  switch (action.type) {
    case "SET_CONCEPTS":
      return { ...state, concepts: action.payload };
    case "ADD_CONCEPT":
      return { ...state, concepts: [...state.concepts, action.payload] };
    case "UPDATE_CONCEPT":
      return {
        ...state,
        concepts: state.concepts.map((concept) =>
          concept.id === action.payload.id ? { ...concept, ...action.payload.updates } : concept
        ),
      };
    case "MARK_CONCEPT_COMPLETED":
      return {
        ...state,
        concepts: state.concepts.map((concept) =>
          concept.id === action.payload ? { ...concept, completed: true } : concept
        ),
      };
    default:
      return state;
  }
}

function userProgressReducer(state: UserProgressState, action: UserProgressAction): UserProgressState {
  switch (action.type) {
    case "COMPLETE_CONCEPT":
      if (state.completedConcepts.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        completedConcepts: [...state.completedConcepts, action.payload],
        totalPoints: state.totalPoints + 100,
        lastActivityDate: new Date().toISOString(),
      };
    case "UNLOCK_BADGE":
      if (state.badges.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        badges: [...state.badges, action.payload],
        totalPoints: state.totalPoints + 500,
      };
    case "UPDATE_STREAK":
      return {
        ...state,
        streak: action.payload,
        lastActivityDate: new Date().toISOString(),
      };
    case "ADD_POINTS":
      return {
        ...state,
        totalPoints: state.totalPoints + action.payload,
      };
    case "ADD_XP":
      return {
        ...state,
        totalPoints: state.totalPoints + action.payload,
      };
    case "RESET_PROGRESS":
      return initialUserProgress;
    default:
      return state;
  }
}

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "ADD_CHAT_MESSAGE":
      return {
        ...state,
        chatHistory: [
          ...state.chatHistory,
          { ...action.payload, id: Date.now().toString(), timestamp: new Date().toISOString() },
        ],
      };
    case "CLEAR_CHAT_HISTORY":
      return {
        ...state,
        chatHistory: [],
      };
    case "SET_CHAT_OPEN":
      return {
        ...state,
        isChatOpen: action.payload,
      };
    case "SET_CURRENT_CONCEPT":
      return {
        ...state,
        currentConceptId: action.payload,
      };
    case "RESET_UI_STATE":
      return initialUIState;
    default:
      return state;
  }
}

// Contexts
const FinanceDataContext = createContext<{
  state: FinanceDataState;
  dispatch: React.Dispatch<FinanceDataAction>;
}>({
  state: initialFinanceData,
  dispatch: () => null,
});

const UserProgressContext = createContext<{
  state: UserProgressState;
  dispatch: React.Dispatch<UserProgressAction>;
}>({
  state: initialUserProgress,
  dispatch: () => null,
});

const UIStateContext = createContext<{
  state: UIState;
  dispatch: React.Dispatch<UIAction>;
}>({
  state: initialUIState,
  dispatch: () => null,
});

// Provider component
interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [financeDataState, financeDataDispatch] = useReducer(financeDataReducer, initialFinanceData);
  const [userProgressState, userProgressDispatch] = useReducer(userProgressReducer, initialUserProgress);
  const [uiState, uiDispatch] = useReducer(uiReducer, initialUIState);

  return (
    <FinanceDataContext.Provider value={{ state: financeDataState, dispatch: financeDataDispatch }}>
      <UserProgressContext.Provider value={{ state: userProgressState, dispatch: userProgressDispatch }}>
        <UIStateContext.Provider value={{ state: uiState, dispatch: uiDispatch }}>{children}</UIStateContext.Provider>
      </UserProgressContext.Provider>
    </FinanceDataContext.Provider>
  );
}

// Custom hooks
export function useFinanceData() {
  const context = useContext(FinanceDataContext);
  if (!context) {
    throw new Error("useFinanceData must be used within a Providers component");
  }
  return context;
}

export function useUserProgress() {
  const context = useContext(UserProgressContext);
  if (!context) {
    throw new Error("useUserProgress must be used within a Providers component");
  }
  return context;
}

export function useUIState() {
  const context = useContext(UIStateContext);
  if (!context) {
    throw new Error("useUIState must be used within a Providers component");
  }
  return context;
}
