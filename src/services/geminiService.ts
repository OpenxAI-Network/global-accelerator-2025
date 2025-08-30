import axios from 'axios';

// Gemini AI Service Configuration
const GEMINI_API_BASE = 'http://localhost:4006/api/gemini';

// API Response Types
export interface GeminiGenerateResponse {
  success: boolean;
  generatedText: string;
  model: string;
  usage: any;
  timestamp: string;
}

export interface CreditAnalysis {
  creditScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  riskFactors: string[];
  recommendations: string[];
  maxLoanAmount: number;
  rawResponse?: string;
}

export interface CreditScoreResponse {
  success: boolean;
  creditAnalysis: CreditAnalysis;
  timestamp: string;
}

export interface RiskAnalysis {
  riskScore: number;
  riskCategories: string[];
  threats: string[];
  mitigation: string[];
  optimization: string[];
  rawResponse?: string;
}

export interface RiskAssessmentResponse {
  success: boolean;
  riskAnalysis: RiskAnalysis;
  timestamp: string;
}

export interface BatchRequest {
  prompt: string;
  model?: string;
}

export interface BatchResponse {
  success: boolean;
  results: Array<{
    success?: boolean;
    generatedText?: string;
    error?: string;
    details?: string;
    request: BatchRequest;
  }>;
  timestamp: string;
}

/**
 * Gemini AI Service for frontend integration
 * Provides secure access to AI-powered features through backend proxy
 */
export class GeminiService {
  private baseUrl: string;

  constructor(baseUrl: string = GEMINI_API_BASE) {
    this.baseUrl = baseUrl;
  }

  /**
   * Check if the Gemini service is healthy
   */
  async healthCheck(): Promise<{ status: string; service: string; models: string[] }> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`);
      return response.data;
    } catch (error) {
      console.error('Gemini health check failed:', error);
      throw new Error('Gemini service unavailable');
    }
  }

  /**
   * Generate content using Gemini AI
   */
  async generateContent(
    prompt: string,
    model: string = 'gemini-2.0-flash',
    maxTokens: number = 1024,
    temperature: number = 0.7
  ): Promise<GeminiGenerateResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/generate`, {
        prompt,
        model,
        maxTokens,
        temperature
      });
      return response.data;
    } catch (error: any) {
      console.error('Content generation failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to generate content');
    }
  }

  /**
   * Get AI-powered credit score for lending
   */
  async getCreditScore(
    userAddress: string,
    transactionHistory: any[] = [],
    collateralValue: number = 0,
    loanAmount: number = 0,
    chain: string = 'Multiple'
  ): Promise<CreditScoreResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/credit-score`, {
        userAddress,
        transactionHistory,
        collateralValue,
        loanAmount,
        chain
      });
      return response.data;
    } catch (error: any) {
      console.error('Credit scoring failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to generate credit score');
    }
  }

  /**
   * Get AI-powered risk assessment for portfolio
   */
  async getRiskAssessment(
    portfolio: any,
    marketConditions: any = {},
    userPreferences: { riskTolerance?: string } = {}
  ): Promise<RiskAssessmentResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/risk-assessment`, {
        portfolio,
        marketConditions,
        userPreferences
      });
      return response.data;
    } catch (error: any) {
      console.error('Risk assessment failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to generate risk assessment');
    }
  }

  /**
   * Process multiple AI requests in batch
   */
  async batchProcess(requests: BatchRequest[]): Promise<BatchResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/batch`, { requests });
      return response.data;
    } catch (error: any) {
      console.error('Batch processing failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to process batch requests');
    }
  }

  /**
   * Quick text generation for simple prompts
   */
  async quickGenerate(prompt: string): Promise<string> {
    try {
      const response = await this.generateContent(prompt, 'gemini-2.0-flash', 500, 0.5);
      return response.generatedText;
    } catch (error) {
      console.error('Quick generation failed:', error);
      return 'Unable to generate response at this time.';
    }
  }

  /**
   * Generate lending recommendations
   */
  async getLendingRecommendations(
    userProfile: any,
    marketData: any
  ): Promise<string> {
    const prompt = `Based on this user profile and market data, provide lending recommendations:

User Profile: ${JSON.stringify(userProfile, null, 2)}
Market Data: ${JSON.stringify(marketData, null, 2)}

Provide 3-5 specific, actionable recommendations for:
1. Optimal collateral allocation
2. Risk management strategies
3. Interest rate optimization
4. Cross-chain opportunities

Keep recommendations concise and practical.`;

    try {
      return await this.quickGenerate(prompt);
    } catch (error) {
      return 'Unable to generate lending recommendations at this time.';
    }
  }

  /**
   * Analyze transaction for risk
   */
  async analyzeTransactionRisk(transaction: any): Promise<string> {
    const prompt = `Analyze this blockchain transaction for potential risks:

Transaction: ${JSON.stringify(transaction, null, 2)}

Identify:
1. Risk level (Low/Medium/High)
2. Specific risks
3. Recommendations
4. Whether to proceed

Provide a concise analysis.`;

    try {
      return await this.quickGenerate(prompt);
    } catch (error) {
      return 'Unable to analyze transaction risk at this time.';
    }
  }

  /**
   * Generate portfolio insights
   */
  async getPortfolioInsights(portfolio: any): Promise<string> {
    const prompt = `Analyze this DeFi portfolio and provide insights:

Portfolio: ${JSON.stringify(portfolio, null, 2)}

Provide:
1. Key strengths
2. Areas of concern
3. Diversification analysis
4. Optimization suggestions
5. Risk assessment summary

Keep insights actionable and clear.`;

    try {
      return await this.quickGenerate(prompt);
    } catch (error) {
      return 'Unable to generate portfolio insights at this time.';
    }
  }
}

// Create default instance
export const geminiService = new GeminiService();

// Export individual functions for convenience
export const {
  healthCheck,
  generateContent,
  getCreditScore,
  getRiskAssessment,
  batchProcess,
  quickGenerate,
  getLendingRecommendations,
  analyzeTransactionRisk,
  getPortfolioInsights
} = geminiService;
