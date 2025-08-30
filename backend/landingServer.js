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

// Mock platform data storage (replace with database in production)
const platformData = {
  statistics: {
    totalValueLocked: 45000000,
    activeUsers: 12500,
    supportedChains: 6,
    averageAPY: 8.5,
    totalLoans: 4500,
    totalCollateral: 52000000,
    liquidationRate: 0.02,
    lastUpdated: new Date().toISOString()
  },
  features: [
    {
      id: 'cross-chain',
      title: 'Cross-Chain Collateral',
      description: 'Use assets from Bitcoin, Solana, Avalanche, and more as collateral seamlessly across chains.',
      status: 'active',
      chains: ['ethereum', 'solana', 'avalanche', 'base', 'polygon', 'zetachain']
    },
    {
      id: 'ai-credit',
      title: 'AI Credit Scoring',
      description: 'Real-time AI-powered credit scores that reflect your on-chain behavior and risk profile.',
      status: 'active',
      accuracy: 94.2
    },
    {
      id: 'dynamic-rates',
      title: 'Dynamic Interest Rates',
      description: 'Optimized, risk-adjusted interest rates balancing borrower incentives and protocol safety.',
      status: 'active',
      range: '4.5% - 18.2%'
    },
    {
      id: 'nft-lending',
      title: 'NFT & GameFi Lending',
      description: 'Lock NFTs on one chain and borrow assets on another — perfect for GameFi players and collectors.',
      status: 'beta',
      supportedTypes: ['ERC-721', 'ERC-1155', 'SPL NFTs']
    }
  ],
  chains: [
    {
      name: 'Ethereum',
      icon: '🔷',
      status: 'active',
      tvl: 25000000,
      users: 8500,
      contracts: ['0xEthereumLendingContract', '0xEthereumCollateralContract'],
      supportedAssets: ['ETH', 'USDC', 'WBTC', 'DAI']
    },
    {
      name: 'Solana',
      icon: '🟣',
      status: 'active',
      tvl: 8000000,
      users: 2800,
      contracts: ['0xSolanaLendingContract', '0xSolanaCollateralContract'],
      supportedAssets: ['SOL', 'USDC', 'RAY', 'SRM']
    },
    {
      name: 'Avalanche',
      icon: '🔴',
      status: 'active',
      tvl: 6000000,
      users: 1800,
      contracts: ['0xAvalancheLendingContract', '0xAvalancheCollateralContract'],
      supportedAssets: ['AVAX', 'USDC', 'WETH', 'WBTC']
    },
    {
      name: 'Base',
      icon: '🔵',
      status: 'active',
      tvl: 3000000,
      users: 1200,
      contracts: ['0xBaseLendingContract', '0xBaseCollateralContract'],
      supportedAssets: ['ETH', 'USDC', 'WETH', 'DAI']
    },
    {
      name: 'Polygon',
      icon: '🟣',
      status: 'active',
      tvl: 2000000,
      users: 800,
      contracts: ['0xPolygonLendingContract', '0xPolygonCollateralContract'],
      supportedAssets: ['MATIC', 'USDC', 'WETH', 'WBTC']
    },
    {
      name: 'ZetaChain',
      icon: '⚡',
      status: 'active',
      tvl: 1000000,
      users: 400,
      contracts: ['0xZetaChainLendingContract', '0xZetaChainCollateralContract'],
      supportedAssets: ['ZETA', 'USDC', 'WETH', 'WBTC']
    }
  ],
  testimonials: [
    {
      id: '1',
      user: '0xDeFiWhale...',
      chain: 'Ethereum',
      message: 'Aegis has revolutionized my cross-chain lending strategy. The AI credit scoring is incredibly accurate!',
      rating: 5,
      date: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '2',
      user: '0xSolanaTrader...',
      chain: 'Solana',
      message: 'Finally, a platform that lets me use my SOL as collateral to borrow on other chains seamlessly.',
      rating: 5,
      date: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: '3',
      user: '0xGameFiPlayer...',
      chain: 'Avalanche',
      message: 'NFT lending across chains is a game-changer for my GameFi portfolio. Highly recommended!',
      rating: 5,
      date: new Date(Date.now() - 259200000).toISOString()
    }
  ],
  roadmap: [
    {
      phase: 'Phase 1',
      title: 'Core Lending Infrastructure',
      status: 'completed',
      features: ['Multi-chain support', 'Basic AI credit scoring', 'Collateral management'],
      completionDate: '2024-Q4'
    },
    {
      phase: 'Phase 2',
      title: 'Advanced AI & Risk Management',
      status: 'completed',
      features: ['Predictive liquidation', 'Dynamic interest rates', 'Portfolio optimization'],
      completionDate: '2025-Q1'
    },
    {
      phase: 'Phase 3',
      title: 'NFT & GameFi Integration',
      status: 'in-progress',
      features: ['Cross-chain NFT lending', 'GameFi asset support', 'Metaverse integration'],
      completionDate: '2025-Q2'
    },
    {
      phase: 'Phase 4',
      title: 'Institutional Features',
      status: 'planned',
      features: ['Whitelabel solutions', 'Advanced analytics', 'Compliance tools'],
      completionDate: '2025-Q4'
    }
  ]
};

// Initialize mock data
const initializeMockData = () => {
  // Update statistics with realistic growth
  setInterval(() => {
    platformData.statistics.totalValueLocked += Math.floor(Math.random() * 100000);
    platformData.statistics.activeUsers += Math.floor(Math.random() * 10);
    platformData.statistics.lastUpdated = new Date().toISOString();
  }, 300000); // Update every 5 minutes
};

initializeMockData();

// API: Get platform overview
app.get('/api/landing/overview', async (req, res) => {
  try {
    const overview = {
      platform: {
        name: 'Aegis',
        tagline: 'AI-Shielded Liquidity Across Chains',
        description: 'Unlock cross-chain DeFi lending with real-time AI credit scoring, predictive liquidation risk, and dynamic interest rates.',
        poweredBy: ['ZetaChain', 'AI/ML', 'Multi-chain Infrastructure']
      },
      statistics: platformData.statistics,
      features: platformData.features,
      chains: platformData.chains.map(chain => ({
        name: chain.name,
        icon: chain.icon,
        status: chain.status,
        tvl: chain.tvl,
        users: chain.users
      })),
      lastUpdated: new Date().toISOString()
    };
    
    res.json({ success: true, data: overview });
  } catch (error) {
    console.error('Error fetching platform overview:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch platform overview' });
  }
});

// API: Get platform statistics
app.get('/api/landing/statistics', async (req, res) => {
  try {
    res.json({ success: true, data: platformData.statistics });
  } catch (error) {
    console.error('Error fetching platform statistics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch platform statistics' });
  }
});

// API: Get supported chains
app.get('/api/landing/chains', async (req, res) => {
  try {
    res.json({ success: true, data: platformData.chains });
  } catch (error) {
    console.error('Error fetching supported chains:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch supported chains' });
  }
});

// API: Get platform features
app.get('/api/landing/features', async (req, res) => {
  try {
    res.json({ success: true, data: platformData.features });
  } catch (error) {
    console.error('Error fetching platform features:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch platform features' });
  }
});

// API: Get user testimonials
app.get('/api/landing/testimonials', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const testimonials = platformData.testimonials.slice(0, parseInt(limit));
    res.json({ success: true, data: testimonials });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch testimonials' });
  }
});

// API: Get platform roadmap
app.get('/api/landing/roadmap', async (req, res) => {
  try {
    res.json({ success: true, data: platformData.roadmap });
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch roadmap' });
  }
});

// API: Submit user feedback
app.post('/api/landing/feedback', async (req, res) => {
  try {
    const { email, message, category, rating } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    // Simulate feedback submission
    const feedback = {
      id: Date.now().toString(),
      email: email || 'anonymous',
      message,
      category: category || 'general',
      rating: rating || 5,
      timestamp: new Date().toISOString(),
      status: 'submitted'
    };

    // In production, save to database
    console.log('User feedback received:', feedback);

    res.json({ 
      success: true, 
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ success: false, error: 'Failed to submit feedback' });
  }
});

// API: Get chain-specific information
app.get('/api/landing/chains/:chainName', async (req, res) => {
  try {
    const { chainName } = req.params;
    const chain = platformData.chains.find(c => 
      c.name.toLowerCase() === chainName.toLowerCase()
    );
    
    if (!chain) {
      return res.status(404).json({ success: false, error: 'Chain not found' });
    }

    res.json({ success: true, data: chain });
  } catch (error) {
    console.error('Error fetching chain information:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch chain information' });
  }
});

// API: Get feature-specific information
app.get('/api/landing/features/:featureId', async (req, res) => {
  try {
    const { featureId } = req.params;
    const feature = platformData.features.find(f => f.id === featureId);
    
    if (!feature) {
      return res.status(404).json({ success: false, error: 'Feature not found' });
    }

    res.json({ success: true, data: feature });
  } catch (error) {
    console.error('Error fetching feature information:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch feature information' });
  }
});

// API: Get platform health status
app.get('/api/landing/health', async (req, res) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        lending: 'operational',
        ai: 'operational',
        crossChain: 'operational',
        nft: 'operational'
      },
      chains: platformData.chains.map(chain => ({
        name: chain.name,
        status: chain.status,
        lastCheck: new Date().toISOString()
      })),
      uptime: '99.9%',
      version: '1.0.0'
    };

    res.json({ success: true, data: healthStatus });
  } catch (error) {
    console.error('Error fetching health status:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch health status' });
  }
});

// API: Get platform analytics
app.get('/api/landing/analytics', async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    
    // Simulate analytics data based on time range
    const analytics = {
      timeRange,
      userGrowth: {
        '24h': 125,
        '7d': 890,
        '30d': 3200
      },
      volumeGrowth: {
        '24h': 2500000,
        '7d': 18000000,
        '30d': 75000000
      },
      chainDistribution: platformData.chains.map(chain => ({
        name: chain.name,
        percentage: (chain.tvl / platformData.statistics.totalValueLocked) * 100
      })),
      lastUpdated: new Date().toISOString()
    };

    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Landing Server',
    timestamp: new Date().toISOString(),
    features: platformData.features.length,
    chains: platformData.chains.length
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Landing server error:', error);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

const PORT = process.env.PORT || 4005;
app.listen(PORT, () => {
  console.log(`🚀 Landing Server running on port ${PORT}`);
  console.log(`📊 Platform statistics and onboarding enabled`);
  console.log(`🔗 ZetaChain RPC: ${ZETACHAIN_RPC_URL}`);
  console.log(`🌟 Multi-chain ecosystem information available`);
});

export default app;
