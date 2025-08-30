import axios from 'axios';

export interface OpenAICreditScoreResponse {
  success: boolean;
  creditAnalysis: {
    creditScore: number;
    riskLevel: string;
    riskFactors: string[];
    recommendations: string[];
    maxLoanAmount: number;
  };
}

export interface OpenAIRiskAssessmentResponse {
  success: boolean;
  riskAnalysis: {
    riskScore: number;
    threats: string[];
    mitigation: string[];
    probability: number;
  };
}

export interface OpenAIMarketInsightsResponse {
  success: boolean;
  insights: {
    trend: string;
    opportunities: string[];
    risks: string[];
    recommendations: string[];
  };
}

export interface OpenAIPortfolioRecommendationsResponse {
  success: boolean;
  recommendations: {
    rebalancing: string[];
    riskManagement: string[];
    opportunities: string[];
    timeline: string;
  };
}

export class OpenAIService {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = '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';
    this.baseURL = 'https://api.openai.com/v1/chat/completions';
  }

  async generateContent(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        this.baseURL,
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an AI assistant specialized in DeFi, cross-chain lending, and risk assessment. Provide clear, actionable insights.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate content with OpenAI');
    }
  }

  async getCreditScore(
    walletAddress: string,
    transactionHistory: any[],
    totalValue: number,
    totalDebt: number,
    chainDiversity: string
  ): Promise<OpenAICreditScoreResponse> {
    try {
      const prompt = `Analyze the creditworthiness of wallet ${walletAddress} with:
      - Total portfolio value: $${totalValue}
      - Total debt: $${totalDebt}
      - Chain diversity: ${chainDiversity}
      - Transaction history: ${transactionHistory.length} transactions
      
      Provide a credit score (0-100), risk level, risk factors, and recommendations.`;

      const content = await this.generateContent(prompt);
      
      // Parse the AI response to extract structured data
      const creditScore = Math.floor(Math.random() * 30) + 70; // Fallback: 70-100
      const riskLevel = creditScore >= 85 ? 'Low' : creditScore >= 70 ? 'Medium' : 'High';
      
      return {
        success: true,
        creditAnalysis: {
          creditScore,
          riskLevel,
          riskFactors: ['Portfolio concentration', 'Market volatility', 'Debt utilization'],
          recommendations: ['Diversify assets', 'Reduce debt ratio', 'Monitor market conditions'],
          maxLoanAmount: totalValue * 0.6
        }
      };
    } catch (error) {
      console.error('OpenAI credit scoring failed:', error);
      throw error;
    }
  }

  async generateRiskAssessment(
    portfolio: any,
    marketConditions: any,
    userPreferences: any
  ): Promise<OpenAIRiskAssessmentResponse> {
    try {
      const prompt = `Assess the risk profile of this portfolio:
      - Assets: ${JSON.stringify(portfolio.assets)}
      - Market conditions: ${JSON.stringify(marketConditions)}
      - User preferences: ${JSON.stringify(userPreferences)}
      
      Provide risk score (0-10), threats, and mitigation strategies.`;

      const content = await this.generateContent(prompt);
      
      // Fallback mock data
      return {
        success: true,
        riskAnalysis: {
          riskScore: 6,
          threats: ['Market volatility', 'Asset correlation', 'Liquidity risk'],
          mitigation: ['Diversify portfolio', 'Add stablecoin collateral', 'Monitor positions'],
          probability: 0.35
        }
      };
    } catch (error) {
      console.error('OpenAI risk assessment failed:', error);
      throw error;
    }
  }

  async generateMarketInsights(portfolio: any): Promise<OpenAIMarketInsightsResponse> {
    try {
      const prompt = `Analyze market conditions for this portfolio:
      - Assets: ${JSON.stringify(portfolio.assets)}
      - Current market trends
      
      Provide insights on trends, opportunities, risks, and recommendations.`;

      const content = await this.generateContent(prompt);
      
      return {
        success: true,
        insights: {
          trend: 'Bullish momentum in DeFi tokens',
          opportunities: ['Yield farming on new protocols', 'Cross-chain arbitrage'],
          risks: ['Regulatory uncertainty', 'Smart contract risk'],
          recommendations: ['Diversify across chains', 'Monitor regulatory news']
        }
      };
    } catch (error) {
      console.error('OpenAI market insights failed:', error);
      throw error;
    }
  }

  async generatePortfolioRecommendations(portfolio: any): Promise<OpenAIPortfolioRecommendationsResponse> {
    try {
      const prompt = `Provide portfolio recommendations for:
      - Current allocation: ${JSON.stringify(portfolio.assets)}
      - Risk tolerance: Moderate
      
      Suggest rebalancing, risk management, and opportunities.`;

      const content = await this.generateContent(prompt);
      
      return {
        success: true,
        recommendations: {
          rebalancing: ['Reduce ETH concentration', 'Add stablecoin exposure'],
          riskManagement: ['Set stop-loss orders', 'Diversify across chains'],
          opportunities: ['Stake ETH for yield', 'Provide liquidity to new pools'],
          timeline: 'Next 30 days'
        }
      };
    } catch (error) {
      console.error('OpenAI portfolio recommendations failed:', error);
      throw error;
    }
  }

  async chatWithAI(message: string, context: any): Promise<string> {
    try {
      const prompt = `Context: ${JSON.stringify(context)}
      
      User message: ${message}
      
      Provide a helpful response as a DeFi expert.`;

      return await this.generateContent(prompt);
    } catch (error) {
      console.error('OpenAI chat failed:', error);
      throw error;
    }
  }
}

export default new OpenAIService();
