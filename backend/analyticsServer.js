import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json());

// ZetaChain RPC configuration
const ZETACHAIN_RPC_URL = 'https://rpc.zetachain.net';
const provider = new ethers.JsonRpcProvider(ZETACHAIN_RPC_URL);

// Backend wallet for transaction signing (load from environment in production)
const PRIVATE_KEY = process.env.BACKEND_PRIVATE_KEY || '0x1234567890123456789012345678901234567890123456789012345678901234';
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

// Mock analytics data storage (replace with database in production)
const analyticsData = {
  liquidityStats: new Map(),
  riskModelData: new Map(),
  interestRateTrends: new Map(),
  protocolHealth: new Map(),
  userRiskProfiles: new Map()
};

// Initialize mock analytics data
const initializeMockData = () => {
  // Mock liquidity statistics
  const mockLiquidityStats = [
    { chain: 'ethereum', liquidity: 1500, change24h: 2.5, totalUsers: 12500, avgAPY: 8.2, utilization: 78, status: 'healthy' },
    { chain: 'avalanche', liquidity: 850, change24h: -1.2, totalUsers: 6800, avgAPY: 9.1, utilization: 82, status: 'healthy' },
    { chain: 'solana', liquidity: 500, change24h: 5.8, totalUsers: 4200, avgAPY: 7.8, utilization: 65, status: 'warning' },
    { chain: 'base', liquidity: 300, change24h: 12.3, totalUsers: 2800, avgAPY: 10.5, utilization: 45, status: 'healthy' },
    { chain: 'polygon', liquidity: 420, change24h: 3.1, totalUsers: 3500, avgAPY: 8.9, utilization: 71, status: 'healthy' },
    { chain: 'zetachain', liquidity: 400, change24h: 8.7, totalUsers: 1800, avgAPY: 11.2, utilization: 38, status: 'healthy' }
  ];

  mockLiquidityStats.forEach(stat => {
    analyticsData.liquidityStats.set(stat.chain, {
      ...stat,
      lastUpdated: new Date().toISOString(),
      historicalData: generateHistoricalLiquidityData(stat.chain)
    });
  });

  // Mock risk model data
  const mockRiskModelData = [
    { month: 'Jan', avgCreditScore: 78, liquidations: 4, borrowRepayments: 70, defaultRate: 2.1, marketVolatility: 15 },
    { month: 'Feb', avgCreditScore: 80, liquidations: 5, borrowRepayments: 75, defaultRate: 1.9, marketVolatility: 18 },
    { month: 'Mar', avgCreditScore: 82, liquidations: 3, borrowRepayments: 80, defaultRate: 1.7, marketVolatility: 12 },
    { month: 'Apr', avgCreditScore: 81, liquidations: 4, borrowRepayments: 85, defaultRate: 1.8, marketVolatility: 16 },
    { month: 'May', avgCreditScore: 83, liquidations: 2, borrowRepayments: 88, defaultRate: 1.5, marketVolatility: 14 },
    { month: 'Jun', avgCreditScore: 85, liquidations: 1, borrowRepayments: 92, defaultRate: 1.2, marketVolatility: 11 }
  ];

  analyticsData.riskModelData.set('global', {
    data: mockRiskModelData,
    lastUpdated: new Date().toISOString(),
    trends: calculateRiskTrends(mockRiskModelData)
  });

  // Mock interest rate trends
  const mockInterestRateTrends = [
    { month: 'Jan', ethereum: 0.052, avalanche: 0.048, solana: 0.055, polygon: 0.049, base: 0.061, zetachain: 0.058 },
    { month: 'Feb', ethereum: 0.054, avalanche: 0.050, solana: 0.053, polygon: 0.051, base: 0.059, zetachain: 0.056 },
    { month: 'Mar', ethereum: 0.051, avalanche: 0.047, solana: 0.054, polygon: 0.048, base: 0.057, zetachain: 0.054 },
    { month: 'Apr', ethereum: 0.053, avalanche: 0.049, solana: 0.052, polygon: 0.050, base: 0.055, zetachain: 0.052 },
    { month: 'May', ethereum: 0.050, avalanche: 0.046, solana: 0.051, polygon: 0.047, base: 0.053, zetachain: 0.050 },
    { month: 'Jun', ethereum: 0.048, avalanche: 0.044, solana: 0.049, polygon: 0.045, base: 0.051, zetachain: 0.048 }
  ];

  analyticsData.interestRateTrends.set('global', {
    data: mockInterestRateTrends,
    lastUpdated: new Date().toISOString(),
    analysis: calculateInterestRateAnalysis(mockInterestRateTrends)
  });

  // Mock protocol health data
  analyticsData.protocolHealth.set('global', {
    overallScore: 87,
    liquidityHealth: 92,
    creditHealth: 85,
    marketHealth: 78,
    riskLevel: 'low',
    lastUpdated: new Date().toISOString(),
    metrics: {
      totalTVL: 3970,
      activeUsers: 32800,
      totalLoans: 15420,
      avgLoanSize: 257.5,
      defaultRate: 1.6,
      liquidationRate: 0.8
    }
  });

  // Mock user risk profiles
  const mockUserRiskProfiles = [
    {
      userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      creditScore: 82,
      liquidationRisk: 15,
      portfolioDiversification: 78,
      repaymentHistory: 95,
      collateralQuality: 88,
      riskLevel: 'low',
      recommendedActions: [
        'Add collateral to optimize borrowing power',
        'Maintain repayments on time to improve credit score',
        'Monitor volatile collateral assets closely',
        'Consider diversifying across more stable assets'
      ],
      optimizationTips: [
        'Your credit score is above average - leverage this for better rates',
        'Portfolio diversification could be improved by adding more stable assets',
        'Excellent repayment history - maintain this to unlock premium features',
        'Consider increasing collateral on high-volatility positions'
      ],
      lastUpdated: new Date().toISOString()
    }
  ];

  mockUserRiskProfiles.forEach(profile => {
    analyticsData.userRiskProfiles.set(profile.userAddress, profile);
  });
};

// Helper functions to generate mock data
function generateHistoricalLiquidityData(chain) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month, index) => ({
    month,
    liquidity: Math.floor(Math.random() * 500) + 200,
    users: Math.floor(Math.random() * 2000) + 1000,
    apy: (Math.random() * 5 + 5).toFixed(1)
  }));
}

function calculateRiskTrends(data) {
  const latest = data[data.length - 1];
  const previous = data[data.length - 2];
  
  return {
    creditScoreTrend: latest.avgCreditScore > previous.avgCreditScore ? 'improving' : 'declining',
    liquidationTrend: latest.liquidations < previous.liquidations ? 'decreasing' : 'increasing',
    defaultRateTrend: latest.defaultRate < previous.defaultRate ? 'improving' : 'worsening',
    volatilityTrend: latest.marketVolatility < previous.marketVolatility ? 'stabilizing' : 'increasing'
  };
}

function calculateInterestRateAnalysis(data) {
  const chains = ['ethereum', 'avalanche', 'solana', 'polygon', 'base', 'zetachain'];
  const analysis = {};
  
  chains.forEach(chain => {
    const rates = data.map(item => item[chain]);
    const avg = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    const trend = rates[rates.length - 1] > rates[0] ? 'increasing' : 'decreasing';
    
    analysis[chain] = {
      average: avg,
      trend,
      volatility: Math.sqrt(rates.reduce((sum, rate) => sum + Math.pow(rate - avg, 2), 0) / rates.length)
    };
  });
  
  return analysis;
}

// Initialize mock data
initializeMockData();

// API Endpoints

// Get cross-chain liquidity statistics
app.get('/api/analytics/liquidity', async (req, res) => {
  try {
    const { chain, timeRange } = req.query;
    let stats;
    
    if (chain && chain !== 'all') {
      stats = [analyticsData.liquidityStats.get(chain.toLowerCase())].filter(Boolean);
    } else {
      stats = Array.from(analyticsData.liquidityStats.values());
    }
    
    res.json({
      success: true,
      data: stats,
      totalLiquidity: stats.reduce((sum, stat) => sum + stat.liquidity, 0),
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching liquidity stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch liquidity statistics'
    });
  }
});

// Get AI risk modeling data
app.get('/api/analytics/risk-model', async (req, res) => {
  try {
    const { timeRange, chain } = req.query;
    const riskData = analyticsData.riskModelData.get('global');
    
    if (!riskData) {
      return res.status(404).json({
        success: false,
        message: 'Risk model data not found'
      });
    }
    
    res.json({
      success: true,
      data: riskData.data,
      trends: riskData.trends,
      lastUpdated: riskData.lastUpdated
    });
  } catch (error) {
    console.error('Error fetching risk model data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch risk model data'
    });
  }
});

// Get interest rate trends
app.get('/api/analytics/interest-rates', async (req, res) => {
  try {
    const { timeRange, chain } = req.query;
    const rateData = analyticsData.interestRateTrends.get('global');
    
    if (!rateData) {
      return res.status(404).json({
        success: false,
        message: 'Interest rate data not found'
      });
    }
    
    let filteredData = rateData.data;
    
    // Filter by specific chain if requested
    if (chain && chain !== 'all') {
      filteredData = rateData.data.map(item => ({
        month: item.month,
        [chain.toLowerCase()]: item[chain.toLowerCase()]
      }));
    }
    
    res.json({
      success: true,
      data: filteredData,
      analysis: rateData.analysis,
      lastUpdated: rateData.lastUpdated
    });
  } catch (error) {
    console.error('Error fetching interest rate trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interest rate trends'
    });
  }
});

// Get protocol health indicators
app.get('/api/analytics/protocol-health', async (req, res) => {
  try {
    const healthData = analyticsData.protocolHealth.get('global');
    
    if (!healthData) {
      return res.status(404).json({
        success: false,
        message: 'Protocol health data not found'
      });
    }
    
    res.json({
      success: true,
      data: healthData,
      lastUpdated: healthData.lastUpdated
    });
  } catch (error) {
    console.error('Error fetching protocol health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch protocol health data'
    });
  }
});

// Get user risk profile
app.get('/api/analytics/user-risk-profile/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;
    const riskProfile = analyticsData.userRiskProfiles.get(userAddress);
    
    if (!riskProfile) {
      return res.status(404).json({
        success: false,
        message: 'User risk profile not found'
      });
    }
    
    res.json({
      success: true,
      data: riskProfile,
      lastUpdated: riskProfile.lastUpdated
    });
  } catch (error) {
    console.error('Error fetching user risk profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user risk profile'
    });
  }
});

// Get aggregated analytics summary
app.get('/api/analytics/summary', async (req, res) => {
  try {
    const { timeRange } = req.query;
    
    const liquidityStats = Array.from(analyticsData.liquidityStats.values());
    const riskData = analyticsData.riskModelData.get('global');
    const healthData = analyticsData.protocolHealth.get('global');
    
    const summary = {
      totalLiquidity: liquidityStats.reduce((sum, stat) => sum + stat.liquidity, 0),
      totalUsers: liquidityStats.reduce((sum, stat) => sum + stat.totalUsers, 0),
      avgCreditScore: riskData ? riskData.data[riskData.data.length - 1].avgCreditScore : 0,
      protocolHealth: healthData ? healthData.overallScore : 0,
      riskLevel: healthData ? healthData.riskLevel : 'unknown',
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics summary'
    });
  }
});

// Update liquidity statistics (for real-time updates)
app.post('/api/analytics/liquidity/update', async (req, res) => {
  try {
    const { chain, data } = req.body;
    
    if (!chain || !data) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }
    
    const existingStats = analyticsData.liquidityStats.get(chain.toLowerCase());
    if (existingStats) {
      analyticsData.liquidityStats.set(chain.toLowerCase(), {
        ...existingStats,
        ...data,
        lastUpdated: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: 'Liquidity statistics updated successfully'
    });
  } catch (error) {
    console.error('Error updating liquidity stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update liquidity statistics'
    });
  }
});

// Trigger AI risk model update
app.post('/api/analytics/risk-model/update', async (req, res) => {
  try {
    const { trigger } = req.body;
    
    // Simulate AI model update
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update risk model data with new month
    const currentRiskData = analyticsData.riskModelData.get('global');
    if (currentRiskData) {
      const newMonth = 'Jul';
      const newData = {
        month: newMonth,
        avgCreditScore: Math.floor(Math.random() * 10) + 80,
        liquidations: Math.floor(Math.random() * 5) + 1,
        borrowRepayments: Math.floor(Math.random() * 20) + 85,
        defaultRate: (Math.random() * 1 + 1).toFixed(1),
        marketVolatility: Math.floor(Math.random() * 10) + 10
      };
      
      currentRiskData.data.push(newData);
      currentRiskData.trends = calculateRiskTrends(currentRiskData.data);
      currentRiskData.lastUpdated = new Date().toISOString();
      
      analyticsData.riskModelData.set('global', currentRiskData);
    }
    
    res.json({
      success: true,
      message: 'AI risk model updated successfully',
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating risk model:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update AI risk model'
    });
  }
});

// Get historical data for specific metrics
app.get('/api/analytics/historical/:metric', async (req, res) => {
  try {
    const { metric } = req.params;
    const { chain, timeRange } = req.query;
    
    let historicalData = [];
    
    switch (metric) {
      case 'liquidity':
        if (chain && chain !== 'all') {
          const chainStats = analyticsData.liquidityStats.get(chain.toLowerCase());
          historicalData = chainStats ? chainStats.historicalData : [];
        } else {
          // Aggregate across all chains
          const allChains = Array.from(analyticsData.liquidityStats.values());
          historicalData = allChains[0]?.historicalData || [];
        }
        break;
        
      case 'credit-scores':
        const riskData = analyticsData.riskModelData.get('global');
        historicalData = riskData ? riskData.data.map(item => ({
          month: item.month,
          creditScore: item.avgCreditScore
        })) : [];
        break;
        
      case 'interest-rates':
        const rateData = analyticsData.interestRateTrends.get('global');
        historicalData = rateData ? rateData.data : [];
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid metric specified'
        });
    }
    
    res.json({
      success: true,
      data: historicalData,
      metric,
      chain: chain || 'all',
      timeRange: timeRange || '6M'
    });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch historical data'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      liquidityAnalytics: analyticsData.liquidityStats.size > 0,
      riskModeling: analyticsData.riskModelData.size > 0,
      interestRates: analyticsData.interestRateTrends.size > 0,
      protocolHealth: analyticsData.protocolHealth.size > 0,
      userProfiles: analyticsData.userRiskProfiles.size > 0
    }
  });
});

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
  console.log(`🚀 Analytics & Insights Server running on port ${PORT}`);
  console.log(`📊 Monitoring ${analyticsData.liquidityStats.size} chains`);
  console.log(`🔗 ZetaChain RPC: ${ZETACHAIN_RPC_URL}`);
  console.log(`🤖 AI risk modeling and analytics enabled`);
});

export default app;
