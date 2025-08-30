// AI Market Intelligence Service for AEGIS
// Provides advanced market analysis, pattern recognition, and predictive insights

export interface MarketIntelligence {
  token: string;
  timestamp: string;
  marketPhase: 'accumulation' | 'markup' | 'distribution' | 'markdown' | 'consolidation';
  trendStrength: 'weak' | 'moderate' | 'strong' | 'very_strong';
  supportLevels: number[];
  resistanceLevels: number[];
  keyLevels: KeyLevel[];
  patternAnalysis: PatternAnalysis[];
  riskAssessment: RiskAssessment;
  opportunityScore: number;
  volatilityProfile: VolatilityProfile;
  marketSentiment: MarketSentiment;
  institutionalActivity: InstitutionalActivity;
  correlationAnalysis: CorrelationAnalysis[];
}

export interface KeyLevel {
  price: number;
  type: 'support' | 'resistance' | 'breakout' | 'breakdown';
  strength: number;
  volume: number;
  significance: 'low' | 'medium' | 'high';
  description: string;
}

export interface PatternAnalysis {
  pattern: string;
  confidence: number;
  completion: number;
  target: number;
  stopLoss: number;
  timeframe: string;
  description: string;
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'extreme';
  riskFactors: RiskFactor[];
  riskScore: number;
  mitigation: string[];
}

export interface RiskFactor {
  factor: string;
  impact: 'low' | 'medium' | 'high';
  probability: number;
  description: string;
}

export interface VolatilityProfile {
  currentVolatility: number;
  historicalVolatility: number;
  volatilityRegime: 'low' | 'normal' | 'high' | 'extreme';
  volatilityTrend: 'decreasing' | 'stable' | 'increasing';
  expectedRange: [number, number];
}

export interface MarketSentiment {
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  sentimentScore: number;
  fearGreedIndex: number;
  socialSentiment: number;
  newsSentiment: number;
  technicalSentiment: number;
}

export interface InstitutionalActivity {
  netFlow: number;
  largeTransactions: number;
  whaleMovements: number;
  institutionalInterest: 'low' | 'medium' | 'high';
  description: string;
}

export interface CorrelationAnalysis {
  asset: string;
  correlation: number;
  significance: 'low' | 'medium' | 'high';
  description: string;
}

export interface MarketData {
  price: number;
  volume: number;
  marketCap: number;
  priceChange: number;
  volumeChange: number;
  high24h: number;
  low24h: number;
  rsi: number;
  macd: number;
  macdSignal: number;
  sma20: number;
  sma50: number;
  sma200: number;
  bbUpper: number;
  bbLower: number;
  bbMiddle: number;
  atr: number;
  obv: number;
}

export class AIMarketIntelligenceService {
  private ollamaEndpoint: string;
  private model: string;

  constructor(ollamaEndpoint: string = 'http://localhost:11434', model: string = 'llama2') {
    this.ollamaEndpoint = ollamaEndpoint;
    this.model = model;
  }

  /**
   * Generate comprehensive market intelligence
   */
  async generateMarketIntelligence(
    token: string,
    marketData: MarketData,
    sentimentData: any,
    historicalData: any[]
  ): Promise<MarketIntelligence> {
    try {
      console.log('🧠 AI: Generating market intelligence for', token);
      
      // Analyze market phase and trends
      const marketPhase = this.analyzeMarketPhase(marketData, historicalData);
      const trendStrength = this.calculateTrendStrength(marketData, historicalData);
      
      // Identify key levels
      const supportLevels = this.identifySupportLevels(marketData, historicalData);
      const resistanceLevels = this.identifyResistanceLevels(marketData, historicalData);
      const keyLevels = this.analyzeKeyLevels(marketData, historicalData);
      
      // Pattern recognition
      const patternAnalysis = await this.analyzePatterns(token, marketData, historicalData);
      
      // Risk assessment
      const riskAssessment = this.assessRisk(marketData, sentimentData, historicalData);
      
      // Volatility analysis
      const volatilityProfile = this.analyzeVolatility(marketData, historicalData);
      
      // Market sentiment
      const marketSentiment = this.analyzeMarketSentiment(marketData, sentimentData);
      
      // Institutional activity
      const institutionalActivity = this.analyzeInstitutionalActivity(marketData, historicalData);
      
      // Correlation analysis
      const correlationAnalysis = this.analyzeCorrelations(token, marketData, historicalData);
      
      // Calculate opportunity score
      const opportunityScore = this.calculateOpportunityScore(
        marketData, sentimentData, patternAnalysis, riskAssessment
      );
      
      return {
        token,
        timestamp: new Date().toISOString(),
        marketPhase,
        trendStrength,
        supportLevels,
        resistanceLevels,
        keyLevels,
        patternAnalysis,
        riskAssessment,
        opportunityScore,
        volatilityProfile,
        marketSentiment,
        institutionalActivity,
        correlationAnalysis
      };
      
    } catch (error) {
      console.error('❌ AI: Failed to generate market intelligence', error);
      throw error;
    }
  }

  /**
   * Analyze market phase using Wyckoff methodology
   */
  private analyzeMarketPhase(marketData: MarketData, historicalData: any[]): MarketIntelligence['marketPhase'] {
    const { price, volume, sma20, sma50, sma200 } = marketData;
    
    // Calculate trend indicators
    const shortTermTrend = price > sma20;
    const mediumTermTrend = price > sma50;
    const longTermTrend = price > sma200;
    
    // Volume analysis
    const avgVolume = historicalData.reduce((sum, data) => sum + data.volume, 0) / historicalData.length;
    const volumeTrend = volume > avgVolume * 1.2;
    
    // Price action analysis
    const priceRange = Math.max(...historicalData.map(d => d.price)) - Math.min(...historicalData.map(d => d.price));
    const currentPosition = (price - Math.min(...historicalData.map(d => d.price))) / priceRange;
    
    if (longTermTrend && mediumTermTrend && shortTermTrend && volumeTrend) {
      return 'markup';
    } else if (longTermTrend && mediumTermTrend && !shortTermTrend && volumeTrend) {
      return 'distribution';
    } else if (!longTermTrend && !mediumTermTrend && !shortTermTrend && volumeTrend) {
      return 'markdown';
    } else if (Math.abs(currentPosition - 0.5) < 0.1) {
      return 'consolidation';
    } else {
      return 'accumulation';
    }
  }

  /**
   * Calculate trend strength using multiple indicators
   */
  private calculateTrendStrength(marketData: MarketData, historicalData: any[]): MarketIntelligence['trendStrength'] {
    const { rsi, macd, sma20, sma50, price } = marketData;
    
    let strength = 0;
    
    // RSI analysis
    if (rsi > 70) strength += 2;
    else if (rsi < 30) strength += 2;
    else if (rsi > 60) strength += 1;
    else if (rsi < 40) strength += 1;
    
    // MACD analysis
    if (macd > 0) strength += 1;
    if (macd > marketData.macdSignal) strength += 1;
    
    // Moving average analysis
    if (price > sma20) strength += 1;
    if (price > sma50) strength += 1;
    if (sma20 > sma50) strength += 1;
    
    // Price momentum
    const recentPrices = historicalData.slice(-5).map(d => d.price);
    const priceMomentum = (recentPrices[recentPrices.length - 1] - recentPrices[0]) / recentPrices[0];
    if (Math.abs(priceMomentum) > 0.05) strength += 1;
    
    if (strength >= 7) return 'very_strong';
    if (strength >= 5) return 'strong';
    if (strength >= 3) return 'moderate';
    return 'weak';
  }

  /**
   * Identify support levels using technical analysis
   */
  private identifySupportLevels(marketData: MarketData, historicalData: any[]): number[] {
    const levels: number[] = [];
    const { price, bbLower, sma50, sma200 } = marketData;
    
    // Add technical levels
    levels.push(bbLower);
    levels.push(sma50);
    levels.push(sma200);
    
    // Find recent lows
    const recentLows = historicalData
      .slice(-20)
      .map(d => d.low)
      .filter(low => low < price && low > price * 0.8);
    
    // Cluster nearby levels
    const clusteredLevels = this.clusterPriceLevels([...levels, ...recentLows]);
    
    return clusteredLevels.sort((a, b) => b - a);
  }

  /**
   * Identify resistance levels using technical analysis
   */
  private identifyResistanceLevels(marketData: MarketData, historicalData: any[]): number[] {
    const levels: number[] = [];
    const { price, bbUpper, sma20, sma50 } = marketData;
    
    // Add technical levels
    levels.push(bbUpper);
    levels.push(sma20);
    levels.push(sma50);
    
    // Find recent highs
    const recentHighs = historicalData
      .slice(-20)
      .map(d => d.high)
      .filter(high => high > price && high < price * 1.2);
    
    // Cluster nearby levels
    const clusteredLevels = this.clusterPriceLevels([...levels, ...recentHighs]);
    
    return clusteredLevels.sort((a, b) => a - b);
  }

  /**
   * Analyze key levels with significance
   */
  private analyzeKeyLevels(marketData: MarketData, historicalData: any[]): KeyLevel[] {
    const keyLevels: KeyLevel[] = [];
    const { price, volume, bbUpper, bbLower, sma20, sma50, sma200 } = marketData;
    
    // Bollinger Bands
    keyLevels.push({
      price: bbUpper,
      type: 'resistance',
      strength: this.calculateLevelStrength(bbUpper, historicalData),
      volume: volume,
      significance: 'high',
      description: 'Upper Bollinger Band resistance'
    });
    
    keyLevels.push({
      price: bbLower,
      type: 'support',
      strength: this.calculateLevelStrength(bbLower, historicalData),
      volume: volume,
      significance: 'high',
      description: 'Lower Bollinger Band support'
    });
    
    // Moving averages
    keyLevels.push({
      price: sma20,
      type: price > sma20 ? 'support' : 'resistance',
      strength: this.calculateLevelStrength(sma20, historicalData),
      volume: volume,
      significance: 'medium',
      description: '20-period SMA level'
    });
    
    keyLevels.push({
      price: sma50,
      type: price > sma50 ? 'support' : 'resistance',
      strength: this.calculateLevelStrength(sma50, historicalData),
      volume: volume,
      significance: 'high',
      description: '50-period SMA level'
    });
    
    return keyLevels;
  }

  /**
   * Analyze chart patterns using AI
   */
  private async analyzePatterns(
    token: string,
    marketData: MarketData,
    historicalData: any[]
  ): Promise<PatternAnalysis[]> {
    try {
      const prompt = this.buildPatternAnalysisPrompt(token, marketData, historicalData);
      
      const response = await fetch(`${this.ollamaEndpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          options: { temperature: 0.2, max_tokens: 500 }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parsePatternAnalysis(data.response);
      
    } catch (error) {
      console.error('Failed to analyze patterns:', error);
      return this.generateFallbackPatterns(marketData, historicalData);
    }
  }

  /**
   * Build prompt for pattern analysis
   */
  private buildPatternAnalysisPrompt(
    token: string,
    marketData: MarketData,
    historicalData: any[]
  ): string {
    const recentPrices = historicalData.slice(-20).map(d => d.price);
    const priceChange = ((recentPrices[recentPrices.length - 1] - recentPrices[0]) / recentPrices[0]) * 100;
    
    return `Analyze the chart patterns for ${token} and identify potential technical patterns.

Current Data:
- Price: $${marketData.price}
- 24h Change: ${priceChange.toFixed(2)}%
- RSI: ${marketData.rsi}
- MACD: ${marketData.macd}
- Volume: ${marketData.volume.toLocaleString()}

Recent Price Action: ${recentPrices.map(p => p.toFixed(2)).join(', ')}

Identify chart patterns and respond in this JSON format:
[
  {
    "pattern": "pattern_name",
    "confidence": 0.85,
    "completion": 0.75,
    "target": 2500.00,
    "stopLoss": 2200.00,
    "timeframe": "4h",
    "description": "Pattern description and implications"
  }
]

Focus on:
- Double tops/bottoms
- Head and shoulders
- Triangles and wedges
- Flags and pennants
- Cup and handle
- Breakout patterns

Consider:
- Pattern completion percentage
- Price targets and stop losses
- Timeframe relevance
- Volume confirmation

Respond only with valid JSON:`;
  }

  /**
   * Parse pattern analysis response
   */
  private parsePatternAnalysis(response: string): PatternAnalysis[] {
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.map((pattern: any) => ({
        pattern: pattern.pattern || 'Unknown',
        confidence: pattern.confidence || 0.5,
        completion: pattern.completion || 0,
        target: pattern.target || 0,
        stopLoss: pattern.stopLoss || 0,
        timeframe: pattern.timeframe || '1d',
        description: pattern.description || 'Pattern identified'
      }));
      
    } catch (error) {
      console.error('Failed to parse pattern analysis:', error);
      return [];
    }
  }

  /**
   * Generate fallback patterns
   */
  private generateFallbackPatterns(marketData: MarketData, historicalData: any[]): PatternAnalysis[] {
    const patterns: PatternAnalysis[] = [];
    const { price, rsi, bbUpper, bbLower } = marketData;
    
    // RSI patterns
    if (rsi < 30) {
      patterns.push({
        pattern: 'Oversold Bounce',
        confidence: 0.7,
        completion: 0.8,
        target: price * 1.1,
        stopLoss: bbLower,
        timeframe: '4h',
        description: 'RSI oversold condition suggests potential bounce'
      });
    }
    
    if (rsi > 70) {
      patterns.push({
        pattern: 'Overbought Reversal',
        confidence: 0.6,
        completion: 0.7,
        target: price * 0.9,
        stopLoss: bbUpper,
        timeframe: '4h',
        description: 'RSI overbought condition suggests potential reversal'
      });
    }
    
    return patterns;
  }

  /**
   * Assess market risk comprehensively
   */
  private assessRisk(marketData: MarketData, sentimentData: any, historicalData: any[]): RiskAssessment {
    const riskFactors: RiskFactor[] = [];
    let riskScore = 0;
    
    // Volatility risk
    const volatility = this.calculateVolatility(historicalData.map(d => d.price));
    if (volatility > 0.1) {
      riskFactors.push({
        factor: 'High Volatility',
        impact: 'high',
        probability: 0.8,
        description: 'Price volatility exceeds normal levels'
      });
      riskScore += 0.3;
    }
    
    // Liquidity risk
    if (marketData.volume < 100000) {
      riskFactors.push({
        factor: 'Low Liquidity',
        impact: 'high',
        probability: 0.9,
        description: 'Low trading volume may cause slippage'
      });
      riskScore += 0.4;
    }
    
    // Technical risk
    if (marketData.rsi > 80 || marketData.rsi < 20) {
      riskFactors.push({
        factor: 'Extreme RSI',
        impact: 'medium',
        probability: 0.7,
        description: 'RSI in extreme territory suggests reversal risk'
      });
      riskScore += 0.2;
    }
    
    // Sentiment risk
    if (sentimentData?.sentiment === 'negative' && sentimentData?.confidence > 0.7) {
      riskFactors.push({
        factor: 'Negative Sentiment',
        impact: 'medium',
        probability: 0.6,
        description: 'Strong negative market sentiment'
      });
      riskScore += 0.2;
    }
    
    // Determine overall risk level
    let overallRisk: RiskAssessment['overallRisk'] = 'low';
    if (riskScore > 0.8) overallRisk = 'extreme';
    else if (riskScore > 0.6) overallRisk = 'high';
    else if (riskScore > 0.3) overallRisk = 'medium';
    
    return {
      overallRisk,
      riskFactors,
      riskScore: Math.min(riskScore, 1),
      mitigation: this.generateRiskMitigation(riskFactors)
    };
  }

  /**
   * Generate risk mitigation strategies
   */
  private generateRiskMitigation(riskFactors: RiskFactor[]): string[] {
    const mitigation: string[] = [];
    
    riskFactors.forEach(factor => {
      switch (factor.factor) {
        case 'High Volatility':
          mitigation.push('Use wider stop losses and position sizing');
          mitigation.push('Consider volatility-based position management');
          break;
        case 'Low Liquidity':
          mitigation.push('Trade smaller position sizes');
          mitigation.push('Use limit orders to avoid slippage');
          break;
        case 'Extreme RSI':
          mitigation.push('Wait for RSI to normalize before entering');
          mitigation.push('Use confirmation signals for entries');
          break;
        case 'Negative Sentiment':
          mitigation.push('Monitor sentiment changes closely');
          mitigation.push('Consider hedging strategies');
          break;
      }
    });
    
    return mitigation;
  }

  /**
   * Analyze volatility profile
   */
  private analyzeVolatility(marketData: MarketData, historicalData: any[]): VolatilityProfile {
    const currentVolatility = this.calculateVolatility(historicalData.slice(-10).map(d => d.price));
    const historicalVolatility = this.calculateVolatility(historicalData.map(d => d.price));
    
    let volatilityRegime: VolatilityProfile['volatilityRegime'] = 'normal';
    if (currentVolatility > historicalVolatility * 1.5) volatilityRegime = 'high';
    else if (currentVolatility > historicalVolatility * 2) volatilityRegime = 'extreme';
    else if (currentVolatility < historicalVolatility * 0.5) volatilityRegime = 'low';
    
    const volatilityTrend = this.calculateVolatilityTrend(historicalData);
    const expectedRange = this.calculateExpectedRange(marketData, currentVolatility);
    
    return {
      currentVolatility,
      historicalVolatility,
      volatilityRegime,
      volatilityTrend,
      expectedRange
    };
  }

  /**
   * Calculate volatility trend
   */
  private calculateVolatilityTrend(historicalData: any[]): VolatilityProfile['volatilityTrend'] {
    if (historicalData.length < 20) return 'stable';
    
    const recentVolatility = this.calculateVolatility(historicalData.slice(-10).map(d => d.price));
    const previousVolatility = this.calculateVolatility(historicalData.slice(-20, -10).map(d => d.price));
    
    const change = (recentVolatility - previousVolatility) / previousVolatility;
    
    if (change > 0.2) return 'increasing';
    if (change < -0.2) return 'decreasing';
    return 'stable';
  }

  /**
   * Calculate expected price range
   */
  private calculateExpectedRange(marketData: MarketData, volatility: number): [number, number] {
    const { price } = marketData;
    const range = price * volatility;
    return [price - range, price + range];
  }

  /**
   * Analyze market sentiment
   */
  private analyzeMarketSentiment(marketData: MarketData, sentimentData: any): MarketSentiment {
    const technicalSentiment = this.calculateTechnicalSentiment(marketData);
    const socialSentiment = sentimentData?.sentiment === 'positive' ? 0.7 : 
                           sentimentData?.sentiment === 'negative' ? -0.7 : 0;
    
    const overallSentiment = this.determineOverallSentiment(technicalSentiment, socialSentiment);
    const sentimentScore = (technicalSentiment + socialSentiment) / 2;
    const fearGreedIndex = this.calculateFearGreedIndex(marketData, sentimentData);
    
    return {
      overallSentiment,
      sentimentScore,
      fearGreedIndex,
      socialSentiment,
      newsSentiment: 0, // Placeholder for news sentiment
      technicalSentiment
    };
  }

  /**
   * Calculate technical sentiment
   */
  private calculateTechnicalSentiment(marketData: MarketData): number {
    let sentiment = 0;
    
    // RSI sentiment
    if (marketData.rsi > 50) sentiment += 0.3;
    else sentiment -= 0.3;
    
    // MACD sentiment
    if (marketData.macd > marketData.macdSignal) sentiment += 0.2;
    else sentiment -= 0.2;
    
    // Moving average sentiment
    if (marketData.price > marketData.sma20) sentiment += 0.2;
    else sentiment -= 0.2;
    
    if (marketData.price > marketData.sma50) sentiment += 0.2;
    else sentiment -= 0.2;
    
    return Math.max(-1, Math.min(1, sentiment));
  }

  /**
   * Determine overall sentiment
   */
  private determineOverallSentiment(technical: number, social: number): MarketSentiment['overallSentiment'] {
    const combined = (technical + social) / 2;
    
    if (combined > 0.3) return 'bullish';
    if (combined < -0.3) return 'bearish';
    return 'neutral';
  }

  /**
   * Calculate fear and greed index
   */
  private calculateFearGreedIndex(marketData: MarketData, sentimentData: any): number {
    let index = 50; // Neutral starting point
    
    // RSI component
    if (marketData.rsi > 70) index += 20; // Greed
    else if (marketData.rsi < 30) index -= 20; // Fear
    
    // Volume component
    if (marketData.volume > 1000000) index += 10; // High activity
    else if (marketData.volume < 100000) index -= 10; // Low activity
    
    // Sentiment component
    if (sentimentData?.sentiment === 'positive') index += 15;
    else if (sentimentData?.sentiment === 'negative') index -= 15;
    
    return Math.max(0, Math.min(100, index));
  }

  /**
   * Analyze institutional activity
   */
  private analyzeInstitutionalActivity(marketData: MarketData, historicalData: any[]): InstitutionalActivity {
    const largeTransactions = this.countLargeTransactions(historicalData);
    const whaleMovements = this.detectWhaleMovements(historicalData);
    const netFlow = this.calculateNetFlow(historicalData);
    
    let institutionalInterest: InstitutionalActivity['institutionalInterest'] = 'low';
    if (largeTransactions > 10 || whaleMovements > 5) institutionalInterest = 'high';
    else if (largeTransactions > 5 || whaleMovements > 2) institutionalInterest = 'medium';
    
    return {
      netFlow,
      largeTransactions,
      whaleMovements,
      institutionalInterest,
      description: this.generateInstitutionalDescription(largeTransactions, whaleMovements, netFlow)
    };
  }

  /**
   * Count large transactions
   */
  private countLargeTransactions(historicalData: any[]): number {
    const avgVolume = historicalData.reduce((sum, d) => sum + d.volume, 0) / historicalData.length;
    return historicalData.filter(d => d.volume > avgVolume * 5).length;
  }

  /**
   * Detect whale movements
   */
  private detectWhaleMovements(historicalData: any[]): number {
    const avgVolume = historicalData.reduce((sum, d) => sum + d.volume, 0) / historicalData.length;
    return historicalData.filter(d => d.volume > avgVolume * 10).length;
  }

  /**
   * Calculate net flow
   */
  private calculateNetFlow(historicalData: any[]): number {
    return historicalData.reduce((sum, d) => sum + (d.priceChange || 0), 0);
  }

  /**
   * Generate institutional description
   */
  private generateInstitutionalDescription(
    largeTransactions: number,
    whaleMovements: number,
    netFlow: number
  ): string {
    if (largeTransactions > 10) {
      return 'High institutional activity detected with multiple large transactions';
    } else if (whaleMovements > 5) {
      return 'Significant whale movements indicating institutional interest';
    } else if (Math.abs(netFlow) > 1000) {
      return 'Net flow suggests institutional positioning';
    }
    return 'Normal institutional activity levels';
  }

  /**
   * Analyze correlations with other assets
   */
  private analyzeCorrelations(token: string, marketData: MarketData, historicalData: any[]): CorrelationAnalysis[] {
    // Mock correlation data - in production this would analyze real correlations
    const correlations: CorrelationAnalysis[] = [
      {
        asset: 'BTC',
        correlation: 0.85,
        significance: 'high',
        description: 'Strong positive correlation with Bitcoin'
      },
      {
        asset: 'ETH',
        correlation: 0.72,
        significance: 'high',
        description: 'High correlation with Ethereum'
      },
      {
        asset: 'SPY',
        correlation: 0.45,
        significance: 'medium',
        description: 'Moderate correlation with S&P 500'
      }
    ];
    
    return correlations;
  }

  /**
   * Calculate opportunity score
   */
  private calculateOpportunityScore(
    marketData: MarketData,
    sentimentData: any,
    patterns: PatternAnalysis[],
    riskAssessment: RiskAssessment
  ): number {
    let score = 0.5; // Base score
    
    // Sentiment boost
    if (sentimentData?.sentiment === 'positive') score += 0.2;
    else if (sentimentData?.sentiment === 'negative') score -= 0.2;
    
    // Pattern boost
    if (patterns.length > 0) {
      const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
      score += avgConfidence * 0.2;
    }
    
    // Risk adjustment
    score -= riskAssessment.riskScore * 0.3;
    
    // Technical boost
    if (marketData.rsi < 30) score += 0.1; // Oversold
    if (marketData.rsi > 70) score -= 0.1; // Overbought
    
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate level strength
   */
  private calculateLevelStrength(level: number, historicalData: any[]): number {
    const touches = historicalData.filter(d => 
      Math.abs(d.price - level) / level < 0.02
    ).length;
    
    return Math.min(1, touches / 10);
  }

  /**
   * Cluster nearby price levels
   */
  private clusterPriceLevels(levels: number[]): number[] {
    const clustered: number[] = [];
    const threshold = 0.02; // 2% threshold for clustering
    
    levels.forEach(level => {
      const nearby = clustered.find(clusteredLevel => 
        Math.abs(clusteredLevel - level) / level < threshold
      );
      
      if (!nearby) {
        clustered.push(level);
      }
    });
    
    return clustered;
  }

  /**
   * Calculate volatility
   */
  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;
    
    const returns = prices.slice(1).map((price, i) => 
      (price - prices[i]) / prices[i]
    );
    
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }
}

// Export singleton instance
export const aiMarketIntelligenceService = new AIMarketIntelligenceService();
