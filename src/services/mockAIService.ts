// Mock AI Service for Hackathon Demo
// This service provides reliable, realistic AI responses without external API calls

export interface MockCreditScoreResponse {
  success: boolean;
  creditScore: number;
  riskLevel: string;
  riskFactors: string[];
  recommendations: string[];
  maxLoanAmount: number;
}

export interface MockRiskAssessmentResponse {
  success: boolean;
  riskAnalysis: {
    riskScore: number;
    threats: string[];
    mitigation: string[];
    probability: number;
  };
}

export interface MockMarketInsightsResponse {
  success: boolean;
  insights: {
    trend: string;
    opportunities: string[];
    risks: string[];
    recommendations: string[];
  };
}

export interface MockPortfolioRecommendationsResponse {
  success: boolean;
  recommendations: {
    rebalancing: string[];
    riskManagement: string[];
    opportunities: string[];
    timeline: string;
  };
}

class MockAIService {
  private generateRandomScore(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  async generateContent(prompt: string): Promise<string> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    if (prompt.toLowerCase().includes('loan') || prompt.toLowerCase().includes('borrow')) {
      return "Based on your portfolio analysis, I recommend a conservative borrowing approach. Your current LTV ratio is optimal at 65%, and I suggest maintaining this level to maximize borrowing power while minimizing liquidation risk. Consider diversifying your collateral across multiple chains for better risk distribution.";
    }
    
    if (prompt.toLowerCase().includes('risk') || prompt.toLowerCase().includes('portfolio')) {
      return "Your portfolio shows healthy diversification across 5 chains with a risk-adjusted return profile. The AI risk engine recommends maintaining current positions while gradually increasing exposure to emerging DeFi protocols on Base and Avalanche chains.";
    }
    
    return "I've analyzed your request using advanced AI algorithms. Based on current market conditions and your portfolio composition, I recommend focusing on cross-chain opportunities that align with your risk tolerance. The market is showing positive momentum for lending protocols.";
  }

  async getCreditScore(
    walletAddress: string,
    transactionHistory: any[],
    totalValue: number,
    totalDebt: number,
    chainDiversity: string
  ): Promise<MockCreditScoreResponse> {
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
    
    // Generate realistic credit score based on inputs
    let baseScore = 650;
    
    if (totalValue > 10000) baseScore += 50;
    if (totalValue > 50000) baseScore += 50;
    if (totalValue > 100000) baseScore += 50;
    
    if (totalDebt < totalValue * 0.3) baseScore += 30;
    if (totalDebt < totalValue * 0.1) baseScore += 20;
    
    if (chainDiversity.includes('Multiple') || chainDiversity.includes('5')) baseScore += 25;
    
    const creditScore = Math.min(850, Math.max(300, baseScore + this.generateRandomScore(-20, 20)));
    
    let riskLevel = 'Low';
    if (creditScore < 600) riskLevel = 'High';
    else if (creditScore < 700) riskLevel = 'Medium';
    
    const riskFactors = [
      'Portfolio concentration in single assets',
      'High volatility in collateral values',
      'Limited cross-chain diversification'
    ];
    
    const recommendations = [
      'Diversify collateral across multiple chains',
      'Maintain conservative LTV ratios',
      'Regular portfolio rebalancing',
      'Monitor market conditions closely'
    ];
    
    const maxLoanAmount = Math.floor(totalValue * (creditScore / 850) * 0.8);
    
    return {
      success: true,
      creditScore,
      riskLevel,
      riskFactors,
      recommendations,
      maxLoanAmount
    };
  }

  async generateRiskAssessment(
    portfolio: any,
    marketConditions: any,
    userPreferences: any
  ): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 800));
    
    const riskScore = this.generateRandomScore(15, 85);
    let riskLevel = 'Low';
    if (riskScore > 60) riskLevel = 'High';
    else if (riskScore > 35) riskLevel = 'Medium';
    
    const analysis = {
      riskScore,
      riskLevel,
      threats: [
        'Market volatility affecting collateral values',
        'Cross-chain bridge security concerns',
        'Smart contract vulnerabilities',
        'Liquidity concentration risks'
      ],
      mitigation: [
        'Implement dynamic LTV adjustments',
        'Diversify across multiple chains',
        'Regular security audits',
        'Liquidity pool diversification'
      ],
      probability: riskScore / 100
    };
    
    return JSON.stringify(analysis);
  }

  async generateMarketInsights(portfolio: any): Promise<MockMarketInsightsResponse> {
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 600));
    
    const trends = [
      'Positive momentum in cross-chain lending',
      'Growing adoption of AI-powered risk management',
      'Increasing institutional interest in DeFi',
      'Rising demand for Bitcoin-backed loans'
    ];
    
    const opportunities = [
      'Cross-chain arbitrage opportunities',
      'Yield farming on emerging protocols',
      'Liquidity provision incentives',
      'NFT collateral expansion'
    ];
    
    const risks = [
      'Regulatory uncertainty',
      'Market volatility spikes',
      'Smart contract risks',
      'Liquidity fragmentation'
    ];
    
    const recommendations = [
      'Increase exposure to cross-chain protocols',
      'Diversify across multiple asset classes',
      'Implement dynamic risk management',
      'Monitor regulatory developments'
    ];
    
    return {
      success: true,
      insights: {
        trend: this.getRandomElement(trends),
        opportunities: this.getRandomElement([opportunities.slice(0, 2), opportunities.slice(1, 3), opportunities.slice(0, 3)]),
        risks: this.getRandomElement([risks.slice(0, 2), risks.slice(1, 3), risks.slice(0, 3)]),
        recommendations: this.getRandomElement([recommendations.slice(0, 2), recommendations.slice(1, 3), recommendations.slice(0, 3)])
      }
    };
  }

  async generatePortfolioRecommendations(portfolio: any): Promise<MockPortfolioRecommendationsResponse> {
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 700));
    
    const rebalancing = [
      'Reduce Bitcoin concentration to 40%',
      'Increase stablecoin allocation to 25%',
      'Add emerging DeFi tokens (15%)',
      'Maintain cross-chain diversification'
    ];
    
    const riskManagement = [
      'Set dynamic stop-loss orders',
      'Monitor collateral ratios hourly',
      'Implement portfolio insurance',
      'Regular risk assessment updates'
    ];
    
    const opportunities = [
      'Explore new lending protocols on Base',
      'Cross-chain yield optimization',
      'NFT collateral expansion',
      'Institutional DeFi products'
    ];
    
    return {
      success: true,
      recommendations: {
        rebalancing: this.getRandomElement([rebalancing.slice(0, 2), rebalancing.slice(1, 3), rebalancing.slice(0, 3)]),
        riskManagement: this.getRandomElement([riskManagement.slice(0, 2), riskManagement.slice(1, 3), riskManagement.slice(0, 3)]),
        opportunities: this.getRandomElement([opportunities.slice(0, 2), opportunities.slice(1, 3), opportunities.slice(0, 3)]),
        timeline: 'Next 30 days'
      }
    };
  }

  async chatWithAI(message: string, context: any): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
    
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('btc') || lowerMessage.includes('bitcoin')) {
      return "Based on your BTC collateral and current market conditions, I recommend borrowing USDC on Avalanche at 65% LTV. This gives you the best risk-adjusted borrowing power while maintaining safety margins. Bitcoin's recent price stability makes it excellent collateral right now.";
    }
    
    if (lowerMessage.includes('loan') || lowerMessage.includes('borrow')) {
      return "I've analyzed your portfolio and found optimal borrowing opportunities. Your current credit score supports borrowing up to $15,000 across multiple chains. I recommend diversifying your loans between Ethereum (for stability) and Avalanche (for higher yields).";
    }
    
    if (lowerMessage.includes('risk') || lowerMessage.includes('portfolio')) {
      return "Your portfolio risk assessment shows a moderate risk profile with good diversification. The AI engine recommends maintaining your current LTV ratios while adding cross-chain insurance products. Your Bitcoin and Ethereum allocations provide solid foundation.";
    }
    
    if (lowerMessage.includes('optimize') || lowerMessage.includes('yield')) {
      return "To optimize your portfolio for yield, I suggest: 1) Increase lending positions on Avalanche (12% APY), 2) Add liquidity to cross-chain pools, 3) Explore new DeFi protocols on Base chain. This could increase your annual returns by 3-5%.";
    }
    
    return "I'm your AI DeFi assistant! I can help you with portfolio analysis, risk assessment, borrowing strategies, and cross-chain opportunities. What specific aspect would you like me to analyze or optimize?";
  }

  async healthCheck(): Promise<{ status: string; service: string; models: string[] }> {
    return {
      status: 'healthy',
      service: 'Mock AI Service',
      models: ['gemini-2.0-flash', 'gpt-4', 'claude-3']
    };
  }
}

export const mockAIService = new MockAIService();
export default mockAIService;
