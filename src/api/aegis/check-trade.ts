import { NextApiRequest, NextApiResponse } from 'next';
import { checkTradeSecurity } from '../../../utils/aegis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const trade = req.body;

    // Validate trade data
    if (!trade || !trade.token || !trade.amount || !trade.side) {
      return res.status(400).json({
        error: 'Invalid trade data',
        required: ['token', 'amount', 'side'],
        received: Object.keys(trade || {})
      });
    }

    // Validate trade side
    if (!['buy', 'sell'].includes(trade.side)) {
      return res.status(400).json({
        error: 'Invalid trade side',
        allowed: ['buy', 'sell'],
        received: trade.side
      });
    }

    // Validate amount
    if (typeof trade.amount !== 'number' || trade.amount <= 0) {
      return res.status(400).json({
        error: 'Invalid trade amount',
        required: 'positive number',
        received: trade.amount
      });
    }

    // Add mock user data for demonstration
    // In production, this would come from your authentication system
    const enrichedTrade = {
      ...trade,
      user: {
        id: 'user_' + Math.random().toString(36).substring(7),
        riskProfile: {
          maxTradeAmount: 50000, // $50k max
          dailyLimit: 100000,    // $100k daily
          currentDailyVolume: Math.random() * 50000, // Random daily volume
          riskScore: Math.floor(Math.random() * 100),
          accountAge: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000, // Random account age
          verificationLevel: ['unverified', 'basic', 'full'][Math.floor(Math.random() * 3)]
        },
        recentTrades: Array.from({ length: Math.floor(Math.random() * 15) }, (_, i) => ({
          id: `trade_${i}`,
          timestamp: new Date(Date.now() - Math.random() * 10 * 60 * 1000), // Random time in last 10 min
          amount: Math.random() * 1000,
          token: trade.token
        })),
        crossChainActivity: [
          {
            chain: 'ethereum',
            suspiciousTransactions: Math.floor(Math.random() * 10)
          },
          {
            chain: 'base',
            suspiciousTransactions: Math.floor(Math.random() * 10)
          }
        ]
      },
      tokenAge: Math.random() * 7 * 24 * 60 * 60 * 1000, // Random token age up to 7 days
      timestamp: new Date().toISOString()
    };

    console.log('🔒 AEGIS API: Processing trade security check', enrichedTrade);

    // Perform AEGIS security check
    const securityResult = await checkTradeSecurity(enrichedTrade);

    // Log security event
    console.log('🔒 AEGIS API: Security check completed', {
      tradeId: enrichedTrade.user.id,
      token: enrichedTrade.token,
      amount: enrichedTrade.amount,
      side: enrichedTrade.side,
      securityResult
    });

    // Return security assessment
    return res.status(200).json(securityResult);

  } catch (error) {
    console.error('🔒 AEGIS API: Error processing trade security check', error);
    
    return res.status(500).json({
      error: 'Internal server error during security check',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
