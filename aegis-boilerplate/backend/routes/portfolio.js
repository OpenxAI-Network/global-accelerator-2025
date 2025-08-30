import express from 'express';

const router = express.Router();

// Get portfolio overview
router.get('/overview', async (req, res) => {
  try {
    // Mock portfolio data
    const portfolio = {
      totalValue: 25000,
      totalPnl: 1250,
      positions: [
        { asset: 'ETH', amount: 5.2, value: 12500, pnl: 800 },
        { asset: 'BTC', amount: 0.8, value: 12500, pnl: 450 }
      ],
      chains: ['Ethereum', 'Polygon', 'BSC']
    };
    
    res.json({ success: true, data: portfolio });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get positions
router.get('/positions', async (req, res) => {
  try {
    const positions = [
      { asset: 'ETH', amount: 5.2, value: 12500, pnl: 800, chain: 'Ethereum' },
      { asset: 'BTC', amount: 0.8, value: 12500, pnl: 450, chain: 'Bitcoin' },
      { asset: 'MATIC', amount: 1000, value: 1000, pnl: -50, chain: 'Polygon' }
    ];
    
    res.json({ success: true, data: positions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
