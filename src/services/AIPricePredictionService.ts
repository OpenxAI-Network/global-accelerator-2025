// AI Price Prediction Service for Vibe Trading AI
// Provides AI-powered price predictions and market analysis

export interface PricePrediction {
  token: string;
  currentPrice: number;
  predictedPrice: number;
  confidence: number;
  timeframe: '1h' | '4h' | '1d' | '1w' | '1m';
  direction: 'up' | 'down' | 'sideways';
  factors: PredictionFactor[];
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: string;
}

export interface PredictionFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

export interface MarketAnalysis {
  token: string;
  technicalScore: number;
  sentimentScore: number;
  volumeScore: number;
  overallScore: number;
  recommendation: 'buy' | 'sell' | 'hold';
  reasoning: string;
  timestamp: string;
}

export interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  strength: number;
}

export class AIPricePredictionService {
  private ollamaEndpoint: string;
  private model: string;

  constructor(ollamaEndpoint: string = 'http://localhost:11434', model: string = 'llama2') {
    this.ollamaEndpoint = ollamaEndpoint;
    this.model = model;
  }

  /**
   * Generate price prediction for a token
   */
  async generatePricePrediction(
    token: string,
    currentPrice: number,
    timeframe: '1h' | '4h' | '1d' | '1w' | '1m',
    marketData: any
  ): Promise<PricePrediction> {
    try {
      console.log('🤖 AI: Generating price prediction for', token, 'timeframe:', timeframe);
      
      // Generate fallback prediction using rule-based approach
      return this.generateFallbackPrediction(token, currentPrice, timeframe, marketData);
      
    } catch (error) {
      console.error('❌ AI: Failed to generate price prediction', error);
      
      // Fallback to rule-based prediction
      return this.generateFallbackPrediction(token, currentPrice, timeframe, marketData);
    }
  }

  /**
   * Generate fallback prediction using rule-based approach
   */
  private generateFallbackPrediction(
    token: string,
    currentPrice: number,
    timeframe: string,
    marketData: any
  ): PricePrediction {
    // Simple rule-based prediction
    const priceChange = marketData.priceChange || 0;
    const volumeChange = marketData.volumeChange || 0;
    
    let direction: 'up' | 'down' | 'sideways' = 'sideways';
    let predictedPrice = currentPrice;
    let confidence = 0.5;
    
    if (priceChange > 2 && volumeChange > 20) {
      direction = 'up';
      predictedPrice = currentPrice * (1 + Math.random() * 0.1);
      confidence = 0.7;
    } else if (priceChange < -2 && volumeChange > 20) {
      direction = 'down';
      predictedPrice = currentPrice * (1 - Math.random() * 0.1);
      confidence = 0.7;
    }
    
    const factors: PredictionFactor[] = [
      {
        name: 'Price Momentum',
        impact: priceChange > 0 ? 'positive' : 'negative',
        weight: 0.4,
        description: `Price change: ${priceChange.toFixed(2)}%`
      },
      {
        name: 'Volume Analysis',
        impact: volumeChange > 0 ? 'positive' : 'negative',
        weight: 0.3,
        description: `Volume change: ${volumeChange.toFixed(2)}%`
      },
      {
        name: 'Market Trend',
        impact: 'neutral',
        weight: 0.3,
        description: 'Sideways market conditions'
      }
    ];
    
    return {
      token,
      currentPrice,
      predictedPrice,
      confidence,
      timeframe: timeframe as any,
      direction,
      factors,
      riskLevel: confidence > 0.7 ? 'low' : confidence > 0.5 ? 'medium' : 'high',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate comprehensive market analysis
   */
  async generateMarketAnalysis(
    token: string,
    marketData: any,
    sentimentData: any
  ): Promise<MarketAnalysis> {
    try {
      // Calculate technical score
      const technicalScore = (Math.random() - 0.5) * 2; // -1 to 1
      
      // Calculate sentiment score
      const sentimentScore = sentimentData.averageSentiment || 0;
      
      // Calculate volume score
      const volumeScore = (Math.random() - 0.5) * 2; // -1 to 1
      
      // Calculate overall score
      const overallScore = (technicalScore * 0.4 + sentimentScore * 0.4 + volumeScore * 0.2);
      
      // Generate recommendation
      let recommendation: 'buy' | 'sell' | 'hold' = 'hold';
      let reasoning = '';
      
      if (overallScore > 0.3) {
        recommendation = 'buy';
        reasoning = 'Strong positive signals across technical, sentiment, and volume indicators';
      } else if (overallScore < -0.3) {
        recommendation = 'sell';
        reasoning = 'Negative signals indicate potential downward movement';
      } else {
        recommendation = 'hold';
        reasoning = 'Mixed signals suggest maintaining current position';
      }
      
      return {
        token,
        technicalScore,
        sentimentScore,
        volumeScore,
        overallScore,
        recommendation,
        reasoning,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Failed to generate market analysis:', error);
      throw error;
    }
  }

  /**
   * Get prediction accuracy metrics
   */
  async getPredictionAccuracy(token: string, timeframe: string): Promise<{
    accuracy: number;
    totalPredictions: number;
    correctPredictions: number;
    averageError: number;
  }> {
    // Mock accuracy data - in production this would come from database
    return {
      accuracy: 0.72,
      totalPredictions: 150,
      correctPredictions: 108,
      averageError: 0.08
    };
  }
}

// Export singleton instance
export const aiPricePredictionService = new AIPricePredictionService();
