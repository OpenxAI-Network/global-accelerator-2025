export enum LoanHealthStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  CRITICAL = 'critical',
  LIQUIDATION = 'liquidation'
}

export interface PositionHealth {
  id: string;
  name: string;
  chainId: number;
  chainName: string;
  status: LoanHealthStatus;
  ltv: number; // Loan-to-Value ratio
  borrowedAmount: number;
  collateralValue: number;
  healthScore: number; // 0-100 health score
  lastUpdated: Date;
  liquidationThreshold: number;
  rebalanceThreshold: number;
  assetSymbol: string;
  collateralAssetSymbol: string;
}

export interface HealthAlert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  message: string;
  positionId?: string;
  timestamp: Date;
  isRead: boolean;
  actionRequired?: boolean;
}

export interface PortfolioHealth {
  totalPositions: number;
  healthyPositions: number;
  warningPositions: number;
  criticalPositions: number;
  totalBorrowed: number;
  totalCollateral: number;
  averageLTV: number;
  overallHealthScore: number;
  lastUpdate: Date;
}
