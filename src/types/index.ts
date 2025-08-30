// Portfolio types
export interface Position {
  asset: string;
  amount: number;
  value: number;
  pnl: number;
  chain: string;
}

export interface Portfolio {
  totalValue: number;
  totalPnl: number;
  positions: Position[];
  chains: string[];
}

// AI types
export interface AIInsight {
  riskScore: number;
  recommendations: string[];
  threats: {
    level: 'low' | 'medium' | 'high';
    description: string;
  }[];
}

export interface SecurityAlert {
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
  severity?: 'low' | 'medium' | 'high';
}

// Notification types
export interface Notification {
  id: number;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  read: boolean;
  timestamp: string;
}

// Avalon types
export interface Loan {
  loanId: string;
  borrowerId: string;
  principal: number;
  interestRate: number;
  durationDays: number;
  collateralNFT: string;
  status: 'active' | 'repaid' | 'liquidated';
  startDate: string;
  dueDate: string;
  liquidationFlag: boolean;
}

export interface CollateralPosition {
  nftId: string;
  name: string;
  ownerId: string;
  image: string;
  valuedUSD: number;
  locked: boolean;
}

export interface LendingPool {
  id: string;
  name: string;
  asset: string;
  totalLiquidity: number;
  utilizationRate: number;
  interestRate: number;
  chain: string;
}

export interface AvalonStats {
  totalLoans: number;
  totalValueLocked: number;
  activeUsers: number;
  averageInterestRate: number;
}

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: number;
}

export interface PortfolioUpdate extends WebSocketMessage {
  type: 'portfolio_update';
  data: {
    totalValue: number;
    totalPnl: number;
    timestamp: number;
  };
}

export interface NotificationUpdate extends WebSocketMessage {
  type: 'notification';
  data: Notification;
}

// API Response types
export interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Backend API response types (matching actual backend response)
export interface BackendPortfolioResponse {
  success: boolean;
  data: Portfolio;
}

export interface BackendPositionsResponse {
  success: boolean;
  data: Position[];
}

export interface BackendAIInsightsResponse {
  success: boolean;
  data: AIInsight;
}

export interface BackendAlertsResponse {
  success: boolean;
  data: SecurityAlert[];
}
