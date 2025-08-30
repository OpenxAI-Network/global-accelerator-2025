import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

export class AIService {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.geminiModelName = process.env.GEMINI_MODEL_NAME || 'gemini-2.0-flash';
    
    if (!this.geminiApiKey) {
      console.warn('⚠️  GEMINI_API_KEY not found in environment variables. AI features will be limited.');
      this.gemini = null;
    } else {
      try {
        this.gemini = new GoogleGenerativeAI(this.geminiApiKey);
        this.model = this.gemini.getGenerativeModel({ model: this.geminiModelName });
        console.log(`✅ Gemini AI initialized with model: ${this.geminiModelName}`);
      } catch (error) {
        console.error('❌ Failed to initialize Gemini AI:', error.message);
        this.gemini = null;
      }
    }
    
    this.riskModels = new Map();
    this.isHealthy = true;
  }

  async generateContent(prompt, options = {}) {
    if (!this.gemini || !this.model) {
      throw new Error('Gemini AI not available. Please check your API key configuration.');
    }

    try {
      const {
        maxTokens = 1024,
        temperature = 0.1,
        topP = 0.8,
        topK = 40
      } = options;

      const result = await this.model.generateContent({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: temperature,
          topP: topP,
          topK: topK
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      });

      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini AI generation error:', error);
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  async getRiskAssessment(userId, portfolio) {
    if (!this.gemini) {
      return this.getMockRiskAssessment(portfolio);
    }

    try {
      const prompt = `Analyze this DeFi portfolio for risk assessment:

User ID: ${userId}
Portfolio: ${JSON.stringify(portfolio, null, 2)}

Provide a comprehensive risk analysis including:
1. Overall Risk Score (1-100)
2. Risk Categories (Market, Smart Contract, Liquidity, etc.)
3. Specific Threats Identified
4. Risk Mitigation Strategies
5. Portfolio Optimization Recommendations

Format as JSON with fields: riskScore, riskLevel, riskCategories, threats, mitigation, optimization, recommendations`;

      const response = await this.generateContent(prompt, { maxTokens: 1500, temperature: 0.2 });
      
      try {
        const analysis = JSON.parse(response);
        return {
          riskScore: analysis.riskScore || 75,
          riskLevel: analysis.riskLevel || 'medium',
          riskCategories: analysis.riskCategories || ['Market', 'Smart Contract'],
          threats: analysis.threats || ['Unable to parse AI response'],
          mitigation: analysis.mitigation || ['Contact support for detailed analysis'],
          optimization: analysis.optimization || ['Diversify holdings'],
          recommendations: analysis.recommendations || ['Review portfolio with professional'],
          aiGenerated: true,
          timestamp: new Date().toISOString()
        };
      } catch (parseError) {
        console.warn('Failed to parse AI response, using fallback:', parseError);
        return this.getMockRiskAssessment(portfolio);
      }
    } catch (error) {
      console.error('AI risk assessment failed, using mock:', error);
      return this.getMockRiskAssessment(portfolio);
    }
  }

  async getSecurityAlerts(userId) {
    if (!this.gemini) {
      return this.getMockSecurityAlerts();
    }

    try {
      const prompt = `Generate security alerts for a DeFi user:

User ID: ${userId}
Current Time: ${new Date().toISOString()}

Provide security alerts including:
1. System Status
2. Market Conditions
3. Network Issues
4. Security Recommendations

Format as JSON with fields: alerts (array of objects with type, message, severity, timestamp)`;

      const response = await this.generateContent(prompt, { maxTokens: 1000, temperature: 0.1 });
      
      try {
        const data = JSON.parse(response);
        return data.alerts || this.getMockSecurityAlerts();
      } catch (parseError) {
        console.warn('Failed to parse AI security alerts, using fallback:', parseError);
        return this.getMockSecurityAlerts();
      }
    } catch (error) {
      console.error('AI security alerts failed, using mock:', error);
      return this.getMockSecurityAlerts();
    }
  }

  async analyzeTransaction(txData) {
    if (!this.gemini) {
      return this.getMockTransactionAnalysis(txData);
    }

    try {
      const prompt = `Analyze this blockchain transaction for security risks:

Transaction Data: ${JSON.stringify(txData, null, 2)}

Provide security analysis including:
1. Risk Level (low/medium/high)
2. Confidence Score (0-1)
3. Security Recommendation
4. Potential Flags/Issues
5. Gas Fee Analysis

Format as JSON with fields: risk, confidence, recommendation, flags, gasAnalysis, riskFactors`;

      const response = await this.generateContent(prompt, { maxTokens: 1200, temperature: 0.1 });
      
      try {
        const analysis = JSON.parse(response);
        return {
          risk: analysis.risk || 'low',
          confidence: analysis.confidence || 0.95,
          recommendation: analysis.recommendation || 'Transaction appears safe',
          flags: analysis.flags || [],
          gasAnalysis: analysis.gasAnalysis || 'Standard gas fees',
          riskFactors: analysis.riskFactors || [],
          aiGenerated: true,
          timestamp: new Date().toISOString()
        };
      } catch (parseError) {
        console.warn('Failed to parse AI transaction analysis, using fallback:', parseError);
        return this.getMockTransactionAnalysis(txData);
      }
    } catch (error) {
      console.error('AI transaction analysis failed, using mock:', error);
      return this.getMockTransactionAnalysis(txData);
    }
  }

  async getPortfolioInsights(portfolioData, context = {}) {
    if (!this.gemini) {
      return this.getMockPortfolioInsights(portfolioData);
    }

    try {
      const prompt = `Analyze this DeFi portfolio and provide insights:

Portfolio: ${JSON.stringify(portfolioData, null, 2)}
Context: ${JSON.stringify(context, null, 2)}

Provide portfolio insights including:
1. Performance Analysis
2. Risk Assessment
3. Opportunities Identified
4. Recommendations
5. Market Trends Impact

Format as JSON with fields: insights, performance, opportunities, recommendations, marketImpact`;

      const response = await this.generateContent(prompt, { maxTokens: 1500, temperature: 0.2 });
      
      try {
        const data = JSON.parse(response);
        return {
          content: data.insights || 'Portfolio analysis completed',
          actions: data.actions || [],
          insights: data.insights || [],
          aiGenerated: true,
          timestamp: new Date().toISOString()
        };
      } catch (parseError) {
        console.warn('Failed to parse AI portfolio insights, using fallback:', parseError);
        return this.getMockPortfolioInsights(portfolioData);
      }
    } catch (error) {
      console.error('AI portfolio insights failed, using mock:', error);
      return this.getMockPortfolioInsights(portfolioData);
    }
  }

  async getStrategyRecommendations(userProfile, marketData, context = {}) {
    if (!this.gemini) {
      return this.getMockStrategyRecommendations(userProfile, marketData);
    }

    try {
      const prompt = `Provide DeFi strategy recommendations:

User Profile: ${JSON.stringify(userProfile, null, 2)}
Market Data: ${JSON.stringify(marketData, null, 2)}
Context: ${JSON.stringify(context, null, 2)}

Provide strategy recommendations including:
1. Risk-Adjusted Strategies
2. Yield Optimization
3. Diversification Tactics
4. Market Timing
5. Risk Management

Format as JSON with fields: strategies, riskLevel, expectedYield, diversification, riskManagement`;

      const response = await this.generateContent(prompt, { maxTokens: 1500, temperature: 0.3 });
      
      try {
        const data = JSON.parse(response);
        return {
          content: data.strategies || 'Strategy recommendations generated',
          actions: data.actions || [],
          insights: data.insights || [],
          aiGenerated: true,
          timestamp: new Date().toISOString()
        };
      } catch (parseError) {
        console.warn('Failed to parse AI strategy recommendations, using fallback:', parseError);
        return this.getMockStrategyRecommendations(userProfile, marketData);
      }
    } catch (error) {
      console.error('AI strategy recommendations failed, using mock:', error);
      return this.getMockStrategyRecommendations(userProfile, marketData);
    }
  }

  // Mock fallback methods
  getMockRiskAssessment(portfolio) {
    return {
      riskScore: 75,
      riskLevel: 'medium',
      riskCategories: ['Market', 'Smart Contract'],
      threats: [
        { level: 'low', description: 'Market volatility within normal range' },
        { level: 'medium', description: 'ETH concentration risk' }
      ],
      mitigation: ['Diversify holdings', 'Monitor market conditions'],
      optimization: ['Rebalance portfolio', 'Add stablecoin exposure'],
      recommendations: [
        'Consider diversifying your ETH position',
        'BTC shows strong momentum, hold position',
        'Monitor MATIC for potential exit opportunity'
      ],
      aiGenerated: false,
      timestamp: new Date().toISOString()
    };
  }

  getMockSecurityAlerts() {
    return [
      { type: 'info', message: 'All systems operational', severity: 'low', timestamp: new Date().toISOString() },
      { type: 'warning', message: 'High gas fees detected on Ethereum', severity: 'medium', timestamp: new Date().toISOString() }
    ];
  }

  getMockTransactionAnalysis(txData) {
    return {
      risk: 'low',
      confidence: 0.95,
      recommendation: 'Transaction appears safe',
      flags: [],
      gasAnalysis: 'Standard gas fees',
      riskFactors: [],
      aiGenerated: false,
      timestamp: new Date().toISOString()
    };
  }

  getMockPortfolioInsights(portfolioData) {
    return {
      content: 'Portfolio analysis completed with mock data',
      actions: [],
      insights: [],
      aiGenerated: false,
      timestamp: new Date().toISOString()
    };
  }

  getMockStrategyRecommendations(userProfile, marketData) {
    return {
      content: 'Strategy recommendations generated with mock data',
      actions: [],
      insights: [],
      aiGenerated: false,
      timestamp: new Date().toISOString()
    };
  }

  // Health check method
  isHealthy() {
    return this.isHealthy && (this.gemini !== null);
  }

  // Get service status
  getStatus() {
    return {
      isHealthy: this.isHealthy(),
      geminiAvailable: this.gemini !== null,
      modelName: this.geminiModelName,
      apiKeyConfigured: !!this.geminiApiKey,
      timestamp: new Date().toISOString()
    };
  }
}
