export interface PortfolioPosition {
  id: string;
  name: string;
  icon: string;
  chainId: number;
  chainName: string;
  chainIcon: string;
  totalValue: number;
  borrowedValue: number;
  collateralValue: number;
  healthScore: number;
  ltv: number;
  lastUpdated: Date;
  status: 'active' | 'liquidated' | 'closed';
  assets: PortfolioAsset[];
  protocols: string[];
}

export interface PortfolioAsset {
  symbol: string;
  name: string;
  amount: number;
  value: number;
  price: number;
  chainId: number;
  type: 'collateral' | 'borrowed' | 'reward';
}

export interface ChainSummary {
  chainId: number;
  chainName: string;
  totalValue: number;
  totalBorrowed: number;
  totalCollateral: number;
  positionCount: number;
  averageHealth: number;
}

export interface PortfolioMetrics {
  totalValue: number;
  totalBorrowed: number;
  totalCollateral: number;
  netWorth: number;
  averageHealth: number;
  totalPositions: number;
  activePositions: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface PortfolioHistory {
  timestamp: Date;
  totalValue: number;
  totalBorrowed: number;
  totalCollateral: number;
  healthScore: number;
}

export interface PortfolioFilters {
  chains: number[];
  protocols: string[];
  minValue: number;
  maxValue: number;
  minHealth: number;
  maxHealth: number;
  status: string[];
}
