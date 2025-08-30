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

// Mock dashboard data storage (replace with database in production)
const dashboardData = {
  connectedWallets: new Map(),
  portfolioSummaries: new Map(),
  chainPortfolios: new Map(),
  activityFeeds: new Map(),
  walletBalances: new Map(),
  creditScores: new Map()
};

// Initialize mock dashboard data
const initializeMockData = () => {
  // Mock connected wallets
  const mockWallets = [
    {
      id: '1',
      name: 'MetaMask',
      type: 'evm',
      chain: 'Ethereum',
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      status: 'connected',
      balance: 2.45,
      nativeToken: 'ETH',
      isActive: true,
      lastActivity: new Date().toISOString(),
      icon: '🦊'
    },
    {
      id: '2',
      name: 'Phantom',
      type: 'solana',
      chain: 'Solana',
      address: '5D4Xz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRq',
      status: 'connected',
      balance: 15.8,
      nativeToken: 'SOL',
      isActive: false,
      lastActivity: new Date(Date.now() - 3600000).toISOString(),
      icon: '👻'
    },
    {
      id: '3',
      name: 'WalletConnect',
      type: 'walletconnect',
      chain: 'Avalanche',
      address: '0x8ba1f109551bD432803012645Hac136c772c3c7c',
      status: 'connected',
      balance: 125.5,
      nativeToken: 'AVAX',
      isActive: false,
      lastActivity: new Date(Date.now() - 7200000).toISOString(),
      icon: '🔗'
    }
  ];

  mockWallets.forEach(wallet => {
    dashboardData.connectedWallets.set(wallet.id, wallet);
  });

  // Mock portfolio summaries
  const mockPortfolioSummary = {
    totalCollateralUSD: 15420,
    totalLoansUSD: 8200,
    borrowingPowerUSD: 12500,
    utilizationPercent: 65.6,
    creditScore: 82,
    liquidationRiskPercent: 18,
    netWorthUSD: 7220,
    availableCreditUSD: 4300,
    healthStatus: 'healthy'
  };
  dashboardData.portfolioSummaries.set('default', mockPortfolioSummary);

  // Mock chain portfolios
  const mockChainPortfolios = [
    {
      chain: 'Ethereum',
      collateral: {
        'USDC': { amount: 5000, usdValue: 5000, apy: 8.2, change24h: 0.1 },
        'ETH': { amount: 2.5, usdValue: 4500, apy: 6.8, change24h: -2.3 },
        'WBTC': { amount: 0.15, usdValue: 3200, apy: 7.5, change24h: 1.8 }
      },
      loans: {
        'USDC': { amount: 3000, usdValue: 3000, interestRate: 12.5, dueDate: '2025-10-15' },
        'ETH': { amount: 1.2, usdValue: 2200, interestRate: 11.8, dueDate: '2025-09-30' }
      },
      totalCollateralUSD: 12700,
      totalLoansUSD: 5200,
      borrowingPowerUSD: 8500
    },
    {
      chain: 'Solana',
      collateral: {
        'SOL': { amount: 25, usdValue: 1800, apy: 9.1, change24h: 3.2 },
        'USDC': { amount: 800, usdValue: 800, apy: 8.5, change24h: 0.1 }
      },
      loans: {
        'USDC': { amount: 500, usdValue: 500, interestRate: 13.2, dueDate: '2025-10-20' }
      },
      totalCollateralUSD: 2600,
      totalLoansUSD: 500,
      borrowingPowerUSD: 2000
    },
    {
      chain: 'Avalanche',
      collateral: {
        'AVAX': { amount: 50, usdValue: 120, apy: 7.8, change24h: -1.5 }
      },
      loans: {
        'USDC': { amount: 2500, usdValue: 2500, interestRate: 14.1, dueDate: '2025-11-05' }
      },
      totalCollateralUSD: 120,
      totalLoansUSD: 2500,
      borrowingPowerUSD: 2000
    }
  ];
  dashboardData.chainPortfolios.set('default', mockChainPortfolios);

  // Mock activity feeds
  const mockActivityFeed = [
    {
      id: '1',
      type: 'deposit',
      chain: 'Ethereum',
      asset: 'USDC',
      amount: 1000,
      usdValue: 1000,
      status: 'confirmed',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      wallet: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      details: 'Deposited USDC as collateral'
    },
    {
      id: '2',
      type: 'borrow',
      chain: 'Avalanche',
      asset: 'USDC',
      amount: 500,
      usdValue: 500,
      status: 'confirmed',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      wallet: '0x8ba1f109551bD432803012645Hac136c772c3c7c',
      details: 'Borrowed USDC against AVAX collateral'
    },
    {
      id: '3',
      type: 'repay',
      chain: 'Ethereum',
      asset: 'ETH',
      amount: 0.5,
      usdValue: 900,
      status: 'confirmed',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      txHash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
      wallet: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      details: 'Repaid ETH loan'
    },
    {
      id: '4',
      type: 'collateral_adjustment',
      chain: 'Solana',
      asset: 'SOL',
      amount: 5,
      usdValue: 360,
      status: 'confirmed',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      txHash: '0x4567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123',
      wallet: '5D4Xz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRq',
      details: 'Added SOL collateral'
    }
  ];
  dashboardData.activityFeeds.set('default', mockActivityFeed);

  // Mock wallet balances
  dashboardData.walletBalances.set('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', {
    ETH: 2.45,
    USDC: 5000,
    WBTC: 0.15
  });
  dashboardData.walletBalances.set('5D4Xz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRq', {
    SOL: 15.8,
    USDC: 800
  });
  dashboardData.walletBalances.set('0x8ba1f109551bD432803012645Hac136c772c3c7c', {
    AVAX: 125.5
  });

  // Mock credit scores
  dashboardData.creditScores.set('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', {
    score: 82,
    level: 'good',
    factors: ['Diversified collateral', 'Consistent repayment history', 'Low utilization ratio'],
    lastUpdated: new Date().toISOString()
  });
  dashboardData.creditScores.set('5D4Xz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRq', {
    score: 75,
    level: 'fair',
    factors: ['Growing portfolio', 'Recent activity'],
    lastUpdated: new Date().toISOString()
  });
  dashboardData.creditScores.set('0x8ba1f109551bD432803012645Hac136c772c3c7c', {
    score: 68,
    level: 'fair',
    factors: ['New user', 'Limited history'],
    lastUpdated: new Date().toISOString()
  });
};

initializeMockData();

// API: Get dashboard overview
app.get('/api/dashboard/overview', async (req, res) => {
  try {
    const overview = {
      totalWallets: dashboardData.connectedWallets.size,
      totalChains: 6, // Ethereum, Solana, Avalanche, Base, Polygon, ZetaChain
      totalCollateralUSD: 15420,
      totalLoansUSD: 8200,
      activeLoans: 4,
      recentActivity: dashboardData.activityFeeds.get('default')?.slice(0, 5) || [],
      lastUpdated: new Date().toISOString()
    };
    
    res.json({ success: true, data: overview });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard overview' });
  }
});

// API: Get connected wallets
app.get('/api/dashboard/wallets', async (req, res) => {
  try {
    const wallets = Array.from(dashboardData.connectedWallets.values());
    res.json({ success: true, data: wallets });
  } catch (error) {
    console.error('Error fetching connected wallets:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch connected wallets' });
  }
});

// API: Connect new wallet
app.post('/api/dashboard/wallets/connect', async (req, res) => {
  try {
    const { walletType, address, chain } = req.body;
    
    if (!walletType || !address || !chain) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }

    // Simulate wallet connection
    const newWallet = {
      id: Date.now().toString(),
      name: walletType === 'evm' ? 'MetaMask' : walletType === 'solana' ? 'Phantom' : 'WalletConnect',
      type: walletType,
      chain: chain,
      address: address,
      status: 'connected',
      balance: Math.random() * 100,
      nativeToken: walletType === 'evm' ? 'ETH' : walletType === 'solana' ? 'SOL' : 'AVAX',
      isActive: true,
      lastActivity: new Date().toISOString(),
      icon: walletType === 'evm' ? '🦊' : walletType === 'solana' ? '👻' : '🔗'
    };

    dashboardData.connectedWallets.set(newWallet.id, newWallet);
    
    // Initialize wallet data
    dashboardData.walletBalances.set(address, {});
    dashboardData.creditScores.set(address, {
      score: 70,
      level: 'fair',
      factors: ['New wallet connection'],
      lastUpdated: new Date().toISOString()
    });

    res.json({ success: true, data: newWallet });
  } catch (error) {
    console.error('Error connecting wallet:', error);
    res.status(500).json({ success: false, error: 'Failed to connect wallet' });
  }
});

// API: Disconnect wallet
app.delete('/api/dashboard/wallets/:walletId', async (req, res) => {
  try {
    const { walletId } = req.params;
    const wallet = dashboardData.connectedWallets.get(walletId);
    
    if (!wallet) {
      return res.status(404).json({ success: false, error: 'Wallet not found' });
    }

    // Remove wallet data
    dashboardData.connectedWallets.delete(walletId);
    dashboardData.walletBalances.delete(wallet.address);
    dashboardData.creditScores.delete(wallet.address);

    res.json({ success: true, message: 'Wallet disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
    res.status(500).json({ success: false, error: 'Failed to disconnect wallet' });
  }
});

// API: Get portfolio summary
app.get('/api/dashboard/portfolio/summary', async (req, res) => {
  try {
    const summary = dashboardData.portfolioSummaries.get('default');
    if (!summary) {
      return res.status(404).json({ success: false, error: 'Portfolio summary not found' });
    }
    
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('Error fetching portfolio summary:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch portfolio summary' });
  }
});

// API: Get chain portfolios
app.get('/api/dashboard/portfolio/chains', async (req, res) => {
  try {
    const portfolios = dashboardData.chainPortfolios.get('default') || [];
    res.json({ success: true, data: portfolios });
  } catch (error) {
    console.error('Error fetching chain portfolios:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch chain portfolios' });
  }
});

// API: Get activity feed
app.get('/api/dashboard/activity', async (req, res) => {
  try {
    const { limit = 20, wallet } = req.query;
    let activities = dashboardData.activityFeeds.get('default') || [];
    
    if (wallet) {
      activities = activities.filter(activity => activity.wallet === wallet);
    }
    
    if (limit) {
      activities = activities.slice(0, parseInt(limit));
    }
    
    res.json({ success: true, data: activities });
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch activity feed' });
  }
});

// API: Get wallet balance
app.get('/api/dashboard/wallets/:address/balance', async (req, res) => {
  try {
    const { address } = req.params;
    const balance = dashboardData.walletBalances.get(address) || {};
    
    res.json({ success: true, data: balance });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch wallet balance' });
  }
});

// API: Get credit score
app.get('/api/dashboard/wallets/:address/credit-score', async (req, res) => {
  try {
    const { address } = req.params;
    const creditScore = dashboardData.creditScores.get(address);
    
    if (!creditScore) {
      return res.status(404).json({ success: false, error: 'Credit score not found' });
    }
    
    res.json({ success: true, data: creditScore });
  } catch (error) {
    console.error('Error fetching credit score:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch credit score' });
  }
});

// API: Update portfolio data (simulate real-time updates)
app.post('/api/dashboard/portfolio/update', async (req, res) => {
  try {
    const { chain, asset, type, amount, usdValue } = req.body;
    
    // Simulate portfolio update
    const summary = dashboardData.portfolioSummaries.get('default');
    if (summary) {
      if (type === 'deposit') {
        summary.totalCollateralUSD += usdValue;
        summary.netWorthUSD += usdValue;
      } else if (type === 'withdraw') {
        summary.totalCollateralUSD -= usdValue;
        summary.netWorthUSD -= usdValue;
      } else if (type === 'borrow') {
        summary.totalLoansUSD += usdValue;
        summary.utilizationPercent = (summary.totalLoansUSD / summary.totalCollateralUSD) * 100;
      } else if (type === 'repay') {
        summary.totalLoansUSD -= usdValue;
        summary.utilizationPercent = (summary.totalLoansUSD / summary.totalCollateralUSD) * 100;
      }
      
      summary.lastUpdated = new Date().toISOString();
    }
    
    res.json({ success: true, message: 'Portfolio updated successfully' });
  } catch (error) {
    console.error('Error updating portfolio:', error);
    res.status(500).json({ success: false, error: 'Failed to update portfolio' });
  }
});

// API: Refresh wallet data
app.post('/api/dashboard/wallets/:address/refresh', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Simulate refreshing wallet data from blockchain
    const wallet = Array.from(dashboardData.connectedWallets.values())
      .find(w => w.address === address);
    
    if (!wallet) {
      return res.status(404).json({ success: false, error: 'Wallet not found' });
    }
    
    // Update balance (simulate real-time fetch)
    wallet.balance = Math.random() * 100;
    wallet.lastActivity = new Date().toISOString();
    
    res.json({ success: true, data: wallet });
  } catch (error) {
    console.error('Error refreshing wallet data:', error);
    res.status(500).json({ success: false, error: 'Failed to refresh wallet data' });
  }
});

// API: Get cross-chain statistics
app.get('/api/dashboard/statistics', async (req, res) => {
  try {
    const stats = {
      totalUsers: 12500,
      totalVolume24h: 2500000,
      activeLoans: 4500,
      totalCollateral: 45000000,
      averageAPY: 8.5,
      liquidationRate: 0.02,
      chains: ['Ethereum', 'Solana', 'Avalanche', 'Base', 'Polygon', 'ZetaChain'],
      lastUpdated: new Date().toISOString()
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Dashboard Server',
    timestamp: new Date().toISOString(),
    wallets: dashboardData.connectedWallets.size,
    portfolios: dashboardData.chainPortfolios.size
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Dashboard server error:', error);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

const PORT = process.env.PORT || 4004;
app.listen(PORT, () => {
  console.log(`🚀 Dashboard Server running on port ${PORT}`);
  console.log(`📊 Managing ${dashboardData.connectedWallets.size} connected wallets`);
  console.log(`🔗 ZetaChain RPC: ${ZETACHAIN_RPC_URL}`);
  console.log(`💼 Portfolio aggregation and multi-wallet support enabled`);
});

export default app;
