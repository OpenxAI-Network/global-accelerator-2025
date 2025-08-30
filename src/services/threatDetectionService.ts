import { ThreatItem, ThreatPattern, RiskMetrics, ChainInfo } from '../types/threats';

export class ThreatDetectionService {
  private static threatPatterns: ThreatPattern[] = [
    {
      id: 'bridge-exploit',
      name: 'Cross-Chain Bridge Exploit',
      description: 'Suspicious activity indicating potential bridge vulnerability exploitation',
      indicators: ['Unusual withdrawal patterns', 'Large value transfers', 'Suspicious contract calls'],
      riskLevel: 'critical',
      mitigationStrategy: 'Immediate bridge pause and investigation',
      examples: ['Suspicious depositAndCall from blacklisted address', 'Abnormal bridge volume spike']
    },
    {
      id: 'contract-interaction',
      name: 'Suspicious Contract Interaction',
      description: 'Interaction with potentially malicious or unaudited smart contracts',
      indicators: ['New contract deployment', 'Unusual function calls', 'High gas usage'],
      riskLevel: 'high',
      mitigationStrategy: 'Contract analysis and user warning',
      examples: ['Interaction with newly deployed unaudited contract', 'Unusual function call patterns']
    },
    {
      id: 'dust-attack',
      name: 'Dust Attack Pattern',
      description: 'Multiple small transactions to unknown addresses',
      indicators: ['Small value transfers', 'Multiple recipients', 'Unknown addresses'],
      riskLevel: 'medium',
      mitigationStrategy: 'Address analysis and monitoring',
      examples: ['Multiple 0.001 ETH transfers to unknown addresses', 'Dust token distribution']
    },
    {
      id: 'volume-anomaly',
      name: 'Volume Anomaly Detection',
      description: 'Unusual transaction volume patterns',
      indicators: ['Volume spike', 'Time-based patterns', 'Address clustering'],
      riskLevel: 'medium',
      mitigationStrategy: 'Pattern analysis and alerting',
      examples: ['Unusual 3AM transaction spike', 'Abnormal weekend activity']
    },
    {
      id: 'social-engineering',
      name: 'Social Engineering Attempt',
      description: 'Potential phishing or social engineering attacks',
      indicators: ['Suspicious URLs', 'Urgent requests', 'Unusual communication'],
      riskLevel: 'high',
      mitigationStrategy: 'User education and warning',
      examples: ['Fake support requests', 'Urgent fund transfer demands']
    }
  ];

  static generateRealisticThreat(): ThreatItem {
    const pattern = this.threatPatterns[Math.floor(Math.random() * this.threatPatterns.length)];
    const chains = ['Bitcoin', 'Ethereum', 'Solana', 'Polygon', 'Avalanche', 'Binance Smart Chain'];
    const selectedChain = chains[Math.floor(Math.random() * chains.length)];
    
    // Generate realistic confidence and risk scores
    const confidence = Math.floor(Math.random() * 30) + 70; // 70-100
    const riskScore = Math.floor(Math.random() * 40) + 60; // 60-100
    
    // Generate realistic addresses
    const sourceAddress = this.generateMockAddress();
    const destinationAddress = this.generateMockAddress();
    
    const threat: ThreatItem = {
      id: `THR-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: this.generateThreatTitle(pattern, selectedChain),
      description: this.generateThreatDescription(pattern, selectedChain),
      severity: pattern.riskLevel,
      chain: selectedChain,
      timestamp: new Date().toISOString(),
      status: 'active',
      confidence,
      affectedAssets: this.generateAffectedAssets(selectedChain),
      riskScore,
      mitigationSteps: this.generateMitigationSteps(pattern),
      sourceAddress,
      destinationAddress,
      transactionHash: this.generateMockTxHash(),
      estimatedLoss: this.generateEstimatedLoss(riskScore),
      category: this.mapCategory(pattern.id)
    };

    return threat;
  }

  private static generateThreatTitle(pattern: ThreatPattern, chain: string): string {
    const titles = {
      'bridge-exploit': [
        `Critical Bridge Vulnerability Detected on ${chain}`,
        `Suspicious Bridge Activity on ${chain} Network`,
        `Potential Bridge Exploit Attempt on ${chain}`
      ],
      'contract-interaction': [
        `Suspicious Contract Interaction on ${chain}`,
        `Unaudited Contract Activity on ${chain}`,
        `High-Risk Contract Call on ${chain}`
      ],
      'dust-attack': [
        `Dust Attack Pattern Detected on ${chain}`,
        `Suspicious Micro-Transaction Activity on ${chain}`,
        `Potential Sybil Attack on ${chain}`
      ],
      'volume-anomaly': [
        `Unusual Volume Pattern on ${chain}`,
        `Transaction Volume Anomaly on ${chain}`,
        `Abnormal Activity Spike on ${chain}`
      ],
      'social-engineering': [
        `Social Engineering Attempt Detected`,
        `Potential Phishing Attack`,
        `Suspicious Communication Pattern`
      ]
    };

    const patternTitles = titles[pattern.id as keyof typeof titles] || titles['volume-anomaly'];
    return patternTitles[Math.floor(Math.random() * patternTitles.length)];
  }

  private static generateThreatDescription(pattern: ThreatPattern, chain: string): string {
    const descriptions = {
      'bridge-exploit': [
        `Suspicious depositAndCall detected from blacklisted address ${this.generateMockAddress().substring(0, 8)}... on ${chain} bridge. Multiple large withdrawals detected.`,
        `Unusual bridge activity pattern detected. ${Math.floor(Math.random() * 10) + 5} large withdrawals in ${Math.floor(Math.random() * 60) + 30} minutes.`,
        `Bridge volume spike detected. ${Math.floor(Math.random() * 100) + 50}% increase in withdrawal requests from suspicious addresses.`
      ],
      'contract-interaction': [
        `Interaction with newly deployed contract ${this.generateMockAddress().substring(0, 8)}... on ${chain}. Contract has not been audited.`,
        `Unusual function call pattern detected. High gas usage and complex parameter structures suggest potential exploit attempt.`,
        `Contract interaction with known malicious patterns. Function calls match previously identified exploit signatures.`
      ],
      'dust-attack': [
        `Multiple small transactions (${Math.floor(Math.random() * 10) + 5} total) to unknown addresses detected. Possible dust attack or sybil attempt.`,
        `Dust token distribution pattern detected. ${Math.floor(Math.random() * 100) + 50} micro-transactions to new addresses.`,
        `Suspicious micro-transaction clustering. Addresses receiving dust tokens show coordinated behavior patterns.`
      ],
      'volume-anomaly': [
        `Transaction volume spike detected at ${new Date().toLocaleTimeString()}. ${Math.floor(Math.random() * 200) + 100}% increase from normal levels.`,
        `Unusual time-based pattern detected. High activity during typically low-usage periods.`,
        `Address clustering detected. Multiple transactions from related addresses suggesting coordinated activity.`
      ],
      'social-engineering': [
        `Suspicious support request detected. User reported urgent fund transfer request from fake support account.`,
        `Phishing attempt identified. Fake website mimicking legitimate ${chain} service detected.`,
        `Social media scam pattern detected. Multiple users reporting similar fraudulent investment opportunities.`
      ]
    };

    const patternDescriptions = descriptions[pattern.id as keyof typeof descriptions] || descriptions['volume-anomaly'];
    return patternDescriptions[Math.floor(Math.random() * patternDescriptions.length)];
  }

  private static generateAffectedAssets(chain: string): string[] {
    const assets = {
      'Bitcoin': ['BTC', 'WBTC'],
      'Ethereum': ['ETH', 'USDC', 'USDT', 'DAI'],
      'Solana': ['SOL', 'USDC', 'RAY'],
      'Polygon': ['MATIC', 'USDC', 'USDT'],
      'Avalanche': ['AVAX', 'USDC', 'USDT'],
      'Binance Smart Chain': ['BNB', 'BUSD', 'CAKE']
    };

    const chainAssets = assets[chain as keyof typeof assets] || ['Unknown Asset'];
    const numAffected = Math.floor(Math.random() * 3) + 1;
    return chainAssets.slice(0, numAffected);
  }

  private static generateMitigationSteps(pattern: ThreatPattern): string[] {
    const baseSteps = ['Immediate investigation initiated', 'User notifications sent', 'Pattern analysis running'];
    
    const specificSteps = {
      'bridge-exploit': ['Bridge operations paused', 'Emergency response team activated', 'Cross-chain monitoring enhanced'],
      'contract-interaction': ['Contract analysis in progress', 'User warnings issued', 'Blacklist update pending'],
      'dust-attack': ['Address clustering analysis', 'Pattern recognition enhanced', 'User education campaign'],
      'volume-anomaly': ['Statistical analysis running', 'Baseline recalibration', 'Alert threshold adjustment'],
      'social-engineering': ['Support team notified', 'User education materials updated', 'Social media monitoring enhanced']
    };

    const patternSteps = specificSteps[pattern.id as keyof typeof specificSteps] || [];
    return [...baseSteps, ...patternSteps];
  }

  private static generateMockAddress(): string {
    return '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  private static generateMockTxHash(): string {
    return '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  private static generateEstimatedLoss(riskScore: number): string {
    const baseAmount = riskScore * 1000; // Higher risk = higher potential loss
    const multiplier = Math.random() * 5 + 1;
    const amount = Math.floor(baseAmount * multiplier);
    
    if (amount > 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    } else if (amount > 1000) {
      return `$${(amount / 1000).toFixed(2)}K`;
    } else {
      return `$${amount}`;
    }
  }

  private static mapCategory(patternId: string): ThreatItem['category'] {
    const categoryMap: Record<string, ThreatItem['category']> = {
      'bridge-exploit': 'bridge',
      'contract-interaction': 'contract',
      'dust-attack': 'anomaly',
      'volume-anomaly': 'anomaly',
      'social-engineering': 'social'
    };
    return categoryMap[patternId] || 'anomaly';
  }

  static calculateRiskMetrics(threats: ThreatItem[]): RiskMetrics {
    const totalThreats = threats.length;
    const critical = threats.filter(t => t.severity === 'critical').length;
    const high = threats.filter(t => t.severity === 'high').length;
    const medium = threats.filter(t => t.severity === 'medium').length;
    const low = threats.filter(t => t.severity === 'low').length;

    const totalRiskScore = threats.reduce((sum, t) => sum + t.riskScore, 0);
    const averageRiskScore = totalThreats > 0 ? totalRiskScore / totalThreats : 0;

    const threatsByChain: Record<string, number> = {};
    const threatsByCategory: Record<string, number> = {};

    threats.forEach(threat => {
      threatsByChain[threat.chain] = (threatsByChain[threat.chain] || 0) + 1;
      threatsByCategory[threat.category] = (threatsByCategory[threat.category] || 0) + 1;
    });

    return {
      totalThreats,
      protectedValue: '$2.4M',
      critical,
      high,
      medium,
      low,
      totalRiskScore,
      averageRiskScore: Math.round(averageRiskScore),
      threatsByChain,
      threatsByCategory,
      lastUpdated: new Date().toISOString()
    };
  }
}
