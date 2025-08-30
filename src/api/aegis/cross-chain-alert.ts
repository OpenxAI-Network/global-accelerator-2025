import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow both GET and POST requests
  if (!['GET', 'POST'].includes(req.method || '')) {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    if (req.method === 'GET') {
      // GET: Retrieve cross-chain alerts
      return handleGetAlerts(req, res);
    } else {
      // POST: Create new cross-chain alert
      return handleCreateAlert(req, res);
    }
  } catch (error) {
    console.error('🔒 AEGIS API: Cross-chain alert error', error);
    
    return res.status(500).json({
      error: 'Internal server error in cross-chain alert system',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

async function handleGetAlerts(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId, chain, severity, limit = 10 } = req.query;
    
    console.log('🔒 AEGIS API: Getting cross-chain alerts', { userId, chain, severity, limit });

    // Generate mock cross-chain alerts
    const mockAlerts = generateMockCrossChainAlerts(
      parseInt(limit as string),
      userId as string,
      chain as string,
      severity as string
    );

    return res.status(200).json({
      success: true,
      data: {
        alerts: mockAlerts,
        total: mockAlerts.length,
        filters: { userId, chain, severity, limit }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting cross-chain alerts:', error);
    throw error;
  }
}

async function handleCreateAlert(req: NextApiRequest, res: NextApiResponse) {
  try {
    const alertData = req.body;

    // Validate alert data
    if (!alertData || !alertData.type || !alertData.chain || !alertData.severity) {
      return res.status(400).json({
        error: 'Invalid alert data',
        required: ['type', 'chain', 'severity'],
        received: Object.keys(alertData || {})
      });
    }

    console.log('🔒 AEGIS API: Creating cross-chain alert', alertData);

    // Create mock alert
    const newAlert = {
      id: 'alert_' + Math.random().toString(36).substring(7),
      ...alertData,
      timestamp: new Date().toISOString(),
      status: 'active',
      acknowledged: false,
      resolved: false
    };

    // In production, this would be stored in your AEGIS database
    console.log('🔒 AEGIS API: Cross-chain alert created', newAlert);

    return res.status(201).json({
      success: true,
      data: newAlert,
      message: 'Cross-chain alert created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error creating cross-chain alert:', error);
    throw error;
  }
}

function generateMockCrossChainAlerts(limit: number, userId?: string, chain?: string, severity?: string) {
  const alertTypes = [
    'suspicious_transaction',
    'amount_threshold_exceeded',
    'unusual_pattern',
    'cross_chain_anomaly',
    'token_blacklist_violation',
    'risk_score_increase',
    'geographic_anomaly',
    'time_pattern_anomaly'
  ];

  const chains = ['ethereum', 'base', 'polygon', 'arbitrum', 'optimism', 'avalanche'];
  const severities = ['low', 'medium', 'high', 'critical'];

  const alerts = [];

  for (let i = 0; i < limit; i++) {
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const alertChain = chain || chains[Math.floor(Math.random() * chains.length)];
    const alertSeverity = severity || severities[Math.floor(Math.random() * severities.length)];
    
    // Skip if filters don't match
    if (chain && alertChain !== chain) continue;
    if (severity && alertSeverity !== severity) continue;

    const alert = {
      id: `alert_${i}_${Math.random().toString(36).substring(7)}`,
      type: alertType,
      chain: alertChain,
      severity: alertSeverity,
      title: getAlertTitle(alertType, alertChain),
      description: getAlertDescription(alertType, alertChain),
      userId: userId || `user_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: ['active', 'acknowledged', 'resolved'][Math.floor(Math.random() * 3)],
      acknowledged: Math.random() > 0.5,
      resolved: Math.random() > 0.7,
      metadata: generateAlertMetadata(alertType, alertChain),
      recommendations: generateAlertRecommendations(alertType, alertSeverity)
    };

    alerts.push(alert);
  }

  return alerts;
}

function getAlertTitle(type: string, chain: string) {
  const titles = {
    suspicious_transaction: `Suspicious transaction detected on ${chain}`,
    amount_threshold_exceeded: `Large amount transaction on ${chain}`,
    unusual_pattern: `Unusual trading pattern on ${chain}`,
    cross_chain_anomaly: `Cross-chain activity anomaly detected`,
    token_blacklist_violation: `Blacklisted token interaction on ${chain}`,
    risk_score_increase: `Risk score increase detected`,
    geographic_anomaly: `Geographic location anomaly`,
    time_pattern_anomaly: `Unusual time pattern detected`
  };
  return titles[type as keyof typeof titles] || `Security alert on ${chain}`;
}

function getAlertDescription(type: string, chain: string) {
  const descriptions = {
    suspicious_transaction: `A transaction on ${chain} has been flagged as potentially suspicious due to unusual characteristics.`,
    amount_threshold_exceeded: `A transaction on ${chain} exceeds the configured amount threshold and requires review.`,
    unusual_pattern: `An unusual trading pattern has been detected on ${chain} that may indicate market manipulation.`,
    cross_chain_anomaly: `Unusual cross-chain activity has been detected that may indicate coordinated attacks or money laundering.`,
    token_blacklist_violation: `An attempt to interact with a blacklisted token on ${chain} has been detected.`,
    risk_score_increase: `The user's risk score has increased significantly, indicating potential security concerns.`,
    geographic_anomaly: `A transaction has been detected from an unusual geographic location.`,
    time_pattern_anomaly: `Unusual timing patterns have been detected that may indicate automated attacks.`
  };
  return descriptions[type as keyof typeof descriptions] || `Security alert detected on ${chain}`;
}

function generateAlertMetadata(type: string, chain: string) {
  const baseMetadata = {
    chain: chain,
    blockNumber: Math.floor(Math.random() * 10000000),
    transactionHash: '0x' + Math.random().toString(36).substring(2, 66),
    gasUsed: Math.floor(Math.random() * 500000),
    gasPrice: Math.random() * 100
  };

  switch (type) {
    case 'suspicious_transaction':
      return {
        ...baseMetadata,
        amount: Math.random() * 100000,
        recipient: '0x' + Math.random().toString(36).substring(2, 42),
        sender: '0x' + Math.random().toString(36).substring(2, 42)
      };
    case 'amount_threshold_exceeded':
      return {
        ...baseMetadata,
        threshold: 50000,
        actualAmount: Math.random() * 200000 + 50000
      };
    case 'cross_chain_anomaly':
      return {
        ...baseMetadata,
        sourceChain: chain,
        destinationChain: ['ethereum', 'base', 'polygon'].filter(c => c !== chain)[Math.floor(Math.random() * 2)],
        bridgeUsed: ['hop', 'multichain', 'stargate'][Math.floor(Math.random() * 3)]
      };
    default:
      return baseMetadata;
  }
}

function generateAlertRecommendations(type: string, severity: string) {
  const baseRecommendations = [
    'Review the transaction details carefully',
    'Monitor for similar patterns',
    'Consider implementing additional restrictions'
  ];

  const severityRecommendations = {
    low: ['Monitor the situation', 'No immediate action required'],
    medium: ['Investigate further', 'Consider temporary restrictions'],
    high: ['Immediate investigation required', 'Consider blocking similar transactions'],
    critical: ['Immediate action required', 'Consider freezing accounts', 'Contact security team']
  };

  return [
    ...baseRecommendations,
    ...severityRecommendations[severity as keyof typeof severityRecommendations] || []
  ];
}
