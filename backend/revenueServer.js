const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.REVENUE_PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// Revenue Streams Data
const revenueStreams = [
  {
    id: 'loan-origination',
    stream: 'Loan Origination Fees',
    model: '0.75% of all originations',
    impact: '$150K/month @ $20M vol',
    description: 'Fee charged when new cross-chain loans are opened on AEGIS',
    icon: 'trending-up',
    color: 'bg-green-500',
    projectedMonthly: '$150,000',
    projectedYearly: '$1,800,000',
    growthRate: '+15%',
    category: 'core',
    riskLevel: 'low',
    scalability: 'high'
  },
  {
    id: 'liquidation-premium',
    stream: 'Liquidation & Security Fees',
    model: '8% of liquidated collateral',
    impact: '$25K/month (avg 3/day)',
    description: 'Premium collected when unhealthy positions are liquidated',
    icon: 'shield',
    color: 'bg-red-500',
    projectedMonthly: '$25,000',
    projectedYearly: '$300,000',
    growthRate: '+8%',
    category: 'security',
    riskLevel: 'medium',
    scalability: 'medium'
  },
  {
    id: 'yield-margin',
    stream: 'Yield Sharing / Interest Margin',
    model: '0.5–1% of lent assets',
    impact: '$50K+/month @ $10M TVL',
    description: 'Protocol fee on managed, auto-rebalanced, or AI-optimized lending pools',
    icon: 'dollar-sign',
    color: 'bg-blue-500',
    projectedMonthly: '$75,000',
    projectedYearly: '$900,000',
    growthRate: '+25%',
    category: 'core',
    riskLevel: 'low',
    scalability: 'high'
  },
  {
    id: 'api-licensing',
    stream: 'API SaaS & White-Labeling',
    model: '$2–10K/month per client',
    impact: '$20–50K/month, grows w/ integrations',
    description: 'Exchanges, wallets, and DAOs integrate AEGIS AI risk engine',
    icon: 'code',
    color: 'bg-purple-500',
    projectedMonthly: '$35,000',
    projectedYearly: '$420,000',
    growthRate: '+40%',
    category: 'enterprise',
    riskLevel: 'low',
    scalability: 'very-high'
  },
  {
    id: 'premium-security',
    stream: 'Premium Security Automation',
    model: 'Tiered feature pricing',
    impact: '$10–30K/month (institutions)',
    description: 'Advanced features like AI threat monitoring and compliance reporting',
    icon: 'shield',
    color: 'bg-yellow-500',
    projectedMonthly: '$20,000',
    projectedYearly: '$240,000',
    growthRate: '+20%',
    category: 'enterprise',
    riskLevel: 'low',
    scalability: 'high'
  },
  {
    id: 'token-utility',
    stream: 'Token Fees & Governance',
    model: 'AEGIS token utility',
    impact: 'Variable; launched post-hackathon',
    description: 'Token used for protocol fees, governance, and staking rewards',
    icon: 'users',
    color: 'bg-indigo-500',
    projectedMonthly: '$15,000',
    projectedYearly: '$180,000',
    growthRate: '+60%',
    category: 'governance',
    riskLevel: 'medium',
    scalability: 'high'
  },
  {
    id: 'data-syndication',
    stream: 'Data/Analytics as a Service',
    model: 'Sell security/analytics data',
    impact: '$5–20K/month',
    description: 'Real-time risk data and cross-chain security analytics',
    icon: 'database',
    color: 'bg-pink-500',
    projectedMonthly: '$12,500',
    projectedYearly: '$150,000',
    growthRate: '+30%',
    category: 'enterprise',
    riskLevel: 'low',
    scalability: 'very-high'
  }
];

// Market Data
const marketData = {
  totalAddressableMarket: '$70B+',
  defiLendingMarket: '$50B+',
  crossChainServices: '$12B+',
  securityCompliance: '$8B+',
  aegisTargetShare: '0.15-0.35%',
  growthProjection: '+25% annually'
};

// Revenue Projections
const revenueProjections = {
  year1: { monthly: '$332.5K', annual: '$4.0M', growth: 'Baseline' },
  year2: { monthly: '$706.3K', annual: '$8.5M', growth: '+112%' },
  year3: { monthly: '$1.27M', annual: '$15.2M', growth: '+79%' },
  year5: { monthly: '$2.73M', annual: '$32.8M', growth: '+116%' }
};

// Routes
app.get('/api/revenue/streams', (req, res) => {
  try {
    res.json({
      success: true,
      data: revenueStreams,
      total: revenueStreams.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch revenue streams',
      message: error.message
    });
  }
});

app.get('/api/revenue/summary', (req, res) => {
  try {
    const totalMonthly = revenueStreams.reduce((sum, stream) => {
      const monthly = parseFloat(stream.projectedMonthly.replace(/[$,]/g, ''));
      return sum + monthly;
    }, 0);

    const totalYearly = revenueStreams.reduce((sum, stream) => {
      const yearly = parseFloat(stream.projectedYearly.replace(/[$,]/g, ''));
      return sum + yearly;
    }, 0);

    const summary = {
      totalMonthly: `$${(totalMonthly / 1000).toFixed(1)}K`,
      totalYearly: `$${(totalYearly / 1000000).toFixed(1)}M`,
      revenueStreams: revenueStreams.length,
      averageGrowthRate: '+25%',
      topPerformer: revenueStreams.reduce((max, stream) => 
        parseFloat(stream.growthRate.replace(/[+%]/g, '')) > parseFloat(max.growthRate.replace(/[+%]/g, '')) ? stream : max
      ),
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to calculate revenue summary',
      message: error.message
    });
  }
});

app.get('/api/revenue/market', (req, res) => {
  try {
    res.json({
      success: true,
      data: marketData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market data',
      message: error.message
    });
  }
});

app.get('/api/revenue/projections', (req, res) => {
  try {
    res.json({
      success: true,
      data: revenueProjections,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch revenue projections',
      message: error.message
    });
  }
});

app.get('/api/revenue/stream/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stream = revenueStreams.find(s => s.id === id);
    
    if (!stream) {
      return res.status(404).json({
        success: false,
        error: 'Revenue stream not found'
      });
    }

    res.json({
      success: true,
      data: stream,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch revenue stream',
      message: error.message
    });
  }
});

app.get('/api/revenue/analytics', (req, res) => {
  try {
    const analytics = {
      categoryBreakdown: {
        core: revenueStreams.filter(s => s.category === 'core').length,
        security: revenueStreams.filter(s => s.category === 'security').length,
        enterprise: revenueStreams.filter(s => s.category === 'enterprise').length,
        governance: revenueStreams.filter(s => s.category === 'governance').length
      },
      riskProfile: {
        low: revenueStreams.filter(s => s.riskLevel === 'low').length,
        medium: revenueStreams.filter(s => s.riskLevel === 'medium').length,
        high: revenueStreams.filter(s => s.riskLevel === 'high').length
      },
      scalabilityProfile: {
        medium: revenueStreams.filter(s => s.scalability === 'medium').length,
        high: revenueStreams.filter(s => s.scalability === 'high').length,
        'very-high': revenueStreams.filter(s => s.scalability === 'very-high').length
      },
      totalProjectedRevenue: revenueStreams.reduce((sum, stream) => {
        const monthly = parseFloat(stream.projectedMonthly.replace(/[$,]/g, ''));
        return sum + monthly;
      }, 0),
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate analytics',
      message: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AEGIS Revenue Server',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/revenue/streams',
      '/api/revenue/summary',
      '/api/revenue/market',
      '/api/revenue/projections',
      '/api/revenue/stream/:id',
      '/api/revenue/analytics'
    ]
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Revenue Server Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      '/api/revenue/streams',
      '/api/revenue/summary',
      '/api/revenue/market',
      '/api/revenue/projections',
      '/api/revenue/stream/:id',
      '/api/revenue/analytics',
      '/health'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AEGIS Revenue Server running on port ${PORT}`);
  console.log(`📊 Revenue API available at http://localhost:${PORT}/api/revenue`);
  console.log(`🔍 Health check at http://localhost:${PORT}/health`);
});

module.exports = app;
