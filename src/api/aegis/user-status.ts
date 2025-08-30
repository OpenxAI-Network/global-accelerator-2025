import { NextApiRequest, NextApiResponse } from 'next';
import { getUserSecurityStatus } from '../../../utils/aegis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow both GET and POST requests
  if (!['GET', 'POST'].includes(req.method || '')) {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    let userId: string;

    if (req.method === 'GET') {
      // For GET requests, try to get userId from query params
      userId = req.query.userId as string;
    } else {
      // For POST requests, get userId from body
      userId = req.body.userId;
    }

    // If no userId provided, generate a mock one for demonstration
    if (!userId) {
      userId = 'demo_user_' + Math.random().toString(36).substring(7);
    }

    console.log('🔒 AEGIS API: Getting user security status for', userId);

    // Get user security status from AEGIS
    const securityStatus = await getUserSecurityStatus(userId);

    if (!securityStatus) {
      return res.status(404).json({
        error: 'User security status not found',
        userId,
        timestamp: new Date().toISOString()
      });
    }

    // Add additional mock data for demonstration
    const enrichedStatus = {
      ...securityStatus,
      // Add threat history
      threatHistory: Array.from({ length: securityStatus.threatCount }, (_, i) => ({
        id: `threat_${i}`,
        type: ['suspicious_pattern', 'amount_limit', 'token_blacklist', 'cross_chain'][Math.floor(Math.random() * 4)],
        severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        description: `Security threat detected: ${['suspicious trading pattern', 'amount limit exceeded', 'blacklisted token', 'cross-chain anomaly'][Math.floor(Math.random() * 4)]}`,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        resolved: Math.random() > 0.5
      })),
      // Add security settings
      securitySettings: {
        twoFactorEnabled: Math.random() > 0.3,
        emailNotifications: true,
        smsNotifications: Math.random() > 0.5,
        tradingLimits: {
          maxSingleTrade: 50000,
          maxDailyVolume: 100000,
          maxWeeklyVolume: 500000
        },
        restrictions: {
          newTokens: Math.random() > 0.5,
          crossChain: Math.random() > 0.3,
          largeAmounts: Math.random() > 0.2
        }
      },
      // Add recent activity
      recentActivity: Array.from({ length: 10 }, (_, i) => ({
        id: `activity_${i}`,
        type: ['trade', 'withdrawal', 'deposit', 'security_check'][Math.floor(Math.random() * 4)],
        status: ['completed', 'pending', 'failed', 'blocked'][Math.floor(Math.random() * 4)],
        amount: Math.random() * 10000,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
      })),
      // Add compliance status
      compliance: {
        kycStatus: ['unverified', 'pending', 'verified', 'rejected'][Math.floor(Math.random() * 4)],
        amlStatus: ['clear', 'pending', 'flagged'][Math.floor(Math.random() * 3)],
        lastReview: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        nextReview: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    };

    console.log('🔒 AEGIS API: User security status retrieved', {
      userId,
      riskScore: enrichedStatus.riskScore,
      threatCount: enrichedStatus.threatCount,
      securityLevel: enrichedStatus.securityLevel
    });

    // Return enriched security status
    return res.status(200).json({
      success: true,
      data: enrichedStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('🔒 AEGIS API: Error getting user security status', error);
    
    return res.status(500).json({
      error: 'Internal server error while retrieving user security status',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
