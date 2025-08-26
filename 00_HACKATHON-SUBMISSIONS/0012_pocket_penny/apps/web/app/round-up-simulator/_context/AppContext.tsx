import { ReactNode, createContext, useContext, useReducer } from "react";

import { AppState, GrowthProjection, Transaction, UserProfile } from "../_types";
import { calculateCompoundGrowth } from "../_utils/calculations";

type AppAction =
  | { type: "SET_TRANSACTIONS"; payload: Transaction[] }
  | { type: "SET_USER_PROFILE"; payload: UserProfile }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CALCULATE_PROJECTIONS" }
  | { type: "RESET" };

interface AppContextType extends AppState {
  setTransactions: (transactions: Transaction[]) => void;
  setUserProfile: (profile: UserProfile) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  calculateProjections: () => void;
  reset: () => void;
}

const initialState: AppState = {
  transactions: [],
  userProfile: null,
  totalRoundUp: 0,
  monthlyAverage: 0,
  projections: [],
  isLoading: false,
  error: null,
};

function getMonthsDifference(transactions: Transaction[]): number {
  if (transactions.length === 0) return 1;

  const dates = transactions.map((t) => new Date(t.date)).sort((a, b) => a.getTime() - b.getTime());
  const earliest = dates[0];
  const latest = dates[dates.length - 1];

  if (!earliest || !latest) return 1;

  const monthsDiff =
    (latest.getFullYear() - earliest.getFullYear()) * 12 + (latest.getMonth() - earliest.getMonth()) + 1;

  return Math.max(1, monthsDiff);
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_TRANSACTIONS": {
      const transactions = action.payload;
      const totalRoundUp = transactions.reduce((sum, t) => sum + t.roundUp, 0);
      const monthlyAverage = totalRoundUp / Math.max(1, getMonthsDifference(transactions));

      return {
        ...state,
        transactions,
        totalRoundUp,
        monthlyAverage,
        error: null,
      };
    }
    case "SET_USER_PROFILE":
      return {
        ...state,
        userProfile: action.payload,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case "CALCULATE_PROJECTIONS": {
      const { monthlyAverage } = state;
      if (!monthlyAverage) return state;

      const monthlyContribution = monthlyAverage;
      const projections: GrowthProjection[] = [];

      for (let year = 1; year <= 20; year++) {
        projections.push({
          year,
          conservative: calculateCompoundGrowth(monthlyContribution, 0.03, year),
          moderate: calculateCompoundGrowth(monthlyContribution, 0.07, year),
          aggressive: calculateCompoundGrowth(monthlyContribution, 0.1, year),
          principal: monthlyContribution * 12 * year,
        });
      }

      return {
        ...state,
        projections,
      };
    }
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const setTransactions = (transactions: Transaction[]) => {
    dispatch({ type: "SET_TRANSACTIONS", payload: transactions });
    dispatch({ type: "CALCULATE_PROJECTIONS" });
  };

  const setUserProfile = (userProfile: UserProfile) => {
    dispatch({ type: "SET_USER_PROFILE", payload: userProfile });
    dispatch({ type: "CALCULATE_PROJECTIONS" });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error });
  };

  const calculateProjections = () => {
    dispatch({ type: "CALCULATE_PROJECTIONS" });
  };

  const reset = () => {
    dispatch({ type: "RESET" });
  };

  const contextValue: AppContextType = {
    ...state,
    setTransactions,
    setUserProfile,
    setLoading,
    setError,
    calculateProjections,
    reset,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
