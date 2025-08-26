export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  roundUp: number;
}

export interface GrowthProjection {
  year: number;
  conservative: number;
  moderate: number;
  aggressive: number;
  principal: number;
}

export interface UserProfile {
  name: string;
  monthlyGoal: number;
  riskTolerance: "conservative" | "moderate" | "aggressive";
  timeHorizon: number;
}

export interface AppState {
  transactions: Transaction[];
  userProfile: UserProfile | null;
  totalRoundUp: number;
  monthlyAverage: number;
  projections: GrowthProjection[];
  isLoading: boolean;
  error: string | null;
}
