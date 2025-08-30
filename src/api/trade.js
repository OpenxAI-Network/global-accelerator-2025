import { checkTradeSecurity } from '../utils/aegis';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const trade = req.body; // { token, amount, side, user, ... }
      
      console.log('🚀 Trade API: Processing trade request', trade);
      
      // Validate trade data
      if (!trade || !trade.token || !trade.amount || !trade.side) {
        return res.status(400).json({
          error: 'Invalid trade data',
          required: ['token', 'amount', 'side'],
          received: Object.keys(trade || {})
        });
      }

      // Run AEGIS security analysis before trade execution
      console.log('🔒 AEGIS: Running pre-trade security check...');
      const threat = await checkTradeSecurity(trade);
      
      if (threat.block) {
        console.log('🚨 AEGIS: Trade blocked due to security threat', threat);
        return res.status(403).json({ 
          error: 'Trade blocked by AEGIS security system', 
          threat,
          timestamp: new Date().toISOString()
        });
      }

      console.log('✅ AEGIS: Trade passed security checks, proceeding to execution');

      // Continue to Vibe/Base trade logic
      // In production, this would execute the trade on Base chain
      const tradeResult = await executeTradeOnBase(trade);
      
      return res.status(200).json({ 
        success: true, 
        tradeId: tradeResult.id,
        securityScore: threat.securityScore,
        message: 'Trade executed successfully with AEGIS security validation'
      });

    } catch (error) {
      console.error('🚨 Trade API: Error processing trade', error);
      
      return res.status(500).json({
        error: 'Trade execution failed',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Handle other HTTP methods
  res.setHeader('Allow', ['POST']);
  return res.status(405).json({ 
    error: `Method ${req.method} Not Allowed`,
    allowed: ['POST']
  });
}

// Mock function for Base chain trade execution
// In production, this would integrate with Base chain through MiniKit
async function executeTradeOnBase(trade) {
  console.log('🔄 Executing trade on Base chain:', trade);
  
  // Simulate Base chain transaction
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    id: 'trade_' + Math.random().toString(36).substring(7),
    hash: '0x' + Math.random().toString(36).substring(2, 66),
    status: 'confirmed',
    gasUsed: Math.random() * 0.01,
    gasPrice: Math.random() * 50 + 20,
    timestamp: new Date().toISOString()
  };
}
