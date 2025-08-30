// AI Sentiment Analysis Service for Vibe Trading AI
// Integrates with Ollama AI for real-time sentiment analysis

export interface SentimentAnalysis {
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  keywords: string[];
  emotion: string;
  tradingSignal: 'bullish' | 'bearish' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  timestamp: string;
  // Enhanced fields
  urgency: 'low' | 'medium' | 'high';
  marketContext: string;
  influencerScore: number;
  reach: number;
  engagement: number;
  sourceCredibility: 'low' | 'medium' | 'high';
}

export interface SocialPost {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  platform: 'farcaster' | 'twitter' | 'discord';
  engagement: number;
  mentions: string[];
}

export interface TradingInsight {
  token: string;
  sentiment: SentimentAnalysis;
  priceImpact: number;
  confidence: number;
  recommendation: string;
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: string;
}

export class AISentimentService {
  private ollamaEndpoint: string;
  private model: string;

  constructor(ollamaEndpoint: string = 'http://localhost:11434', model: string = 'llama2') {
    this.ollamaEndpoint = ollamaEndpoint;
    this.model = model;
  }

  /**
   * Analyze sentiment of social media posts using Ollama AI
   */
  async analyzeSentiment(posts: SocialPost[]): Promise<SentimentAnalysis[]> {
    try {
      console.log('🤖 AI: Analyzing sentiment for', posts.length, 'posts');
      
      const analyses: SentimentAnalysis[] = [];
      
      for (const post of posts) {
        const analysis = await this.analyzeSinglePost(post);
        analyses.push(analysis);
        
        // Add delay to avoid overwhelming Ollama
        await this.delay(100);
      }
      
      console.log('✅ AI: Sentiment analysis completed for', analyses.length, 'posts');
      return analyses;
      
    } catch (error) {
      console.error('❌ AI: Sentiment analysis failed', error);
      throw new Error('Failed to analyze sentiment: ' + error.message);
    }
  }

  /**
   * Analyze a single social media post
   */
  private async analyzeSinglePost(post: SocialPost): Promise<SentimentAnalysis> {
    try {
      const prompt = this.buildSentimentPrompt(post.text);
      
      const response = await fetch(`${this.ollamaEndpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.3,
            top_p: 0.9,
            max_tokens: 200
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      const analysis = this.parseSentimentResponse(data.response, post);
      
      return analysis;
      
    } catch (error) {
      console.error('❌ AI: Failed to analyze post', post.id, error);
      
      // Fallback to rule-based analysis
      return this.fallbackSentimentAnalysis(post);
    }
  }

  /**
   * Build enhanced prompt for sentiment analysis
   */
  private buildSentimentPrompt(text: string): string {
    return `Analyze this cryptocurrency-related social media post with advanced sentiment analysis and provide a comprehensive structured response.

Post: "${text}"

Analyze and respond in this exact JSON format:
{
  "sentiment": "positive|negative|neutral",
  "confidence": 0.85,
  "keywords": ["keyword1", "keyword2"],
  "emotion": "excited|worried|neutral|optimistic|pessimistic|fearful|greedy|confident|uncertain",
  "tradingSignal": "bullish|bearish|neutral",
  "impact": "high|medium|low",
  "urgency": "low|medium|high",
  "marketContext": "brief market context description",
  "influencerScore": 0.75,
  "reach": 1000,
  "engagement": 150,
  "sourceCredibility": "low|medium|high"
}

Advanced Analysis Focus:
- Overall sentiment with emotional nuance
- Confidence level (0.0-1.0) based on language clarity
- Cryptocurrency-specific keywords and market terms
- Trading signal strength and direction
- Market impact assessment with urgency
- Context awareness and market relevance
- Influence metrics and reach estimation
- Source credibility assessment

Consider:
- Market timing and urgency indicators
- Technical analysis mentions
- News sentiment correlation
- Community reaction patterns
- Price action implications

Respond only with valid JSON:`;
  }

  /**
   * Parse Ollama response into structured sentiment data
   */
  private parseSentimentResponse(response: string, post: SocialPost): SentimentAnalysis {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        text: post.text,
        sentiment: parsed.sentiment || 'neutral',
        confidence: parsed.confidence || 0.5,
        keywords: parsed.keywords || [],
        emotion: parsed.emotion || 'neutral',
        tradingSignal: parsed.tradingSignal || 'neutral',
        impact: parsed.impact || 'medium',
        timestamp: new Date().toISOString(),
        // Enhanced fields
        urgency: parsed.urgency || 'medium',
        marketContext: parsed.marketContext || 'General market discussion',
        influencerScore: parsed.influencerScore || 0.5,
        reach: parsed.reach || post.engagement,
        engagement: parsed.engagement || post.engagement,
        sourceCredibility: parsed.sourceCredibility || 'medium'
      };
      
    } catch (error) {
      console.error('❌ AI: Failed to parse sentiment response', error);
      return this.fallbackSentimentAnalysis(post);
    }
  }

  /**
   * Enhanced fallback sentiment analysis using rule-based approach
   */
  private fallbackSentimentAnalysis(post: SocialPost): SentimentAnalysis {
    const text = post.text.toLowerCase();
    
    // Enhanced keyword-based sentiment analysis
    const positiveKeywords = ['moon', 'bull', 'pump', 'rocket', '🚀', '💎', 'hodl', 'buy', 'long', 'mooning', 'bullish', 'accumulate'];
    const negativeKeywords = ['dump', 'bear', 'crash', 'sell', 'short', '📉', '💸', 'rug', 'scam', 'bearish', 'dumping'];
    const urgencyKeywords = ['urgent', 'now', 'immediate', 'quick', 'fast', 'asap', 'breaking', 'alert'];
    const technicalKeywords = ['rsi', 'macd', 'support', 'resistance', 'trend', 'breakout', 'consolidation'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    let urgencyCount = 0;
    let technicalCount = 0;
    
    positiveKeywords.forEach(keyword => {
      if (text.includes(keyword)) positiveCount++;
    });
    
    negativeKeywords.forEach(keyword => {
      if (text.includes(keyword)) negativeCount++;
    });
    
    urgencyKeywords.forEach(keyword => {
      if (text.includes(keyword)) urgencyCount++;
    });
    
    technicalKeywords.forEach(keyword => {
      if (text.includes(keyword)) technicalCount++;
    });
    
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    let tradingSignal: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    let urgency: 'low' | 'medium' | 'high' = 'medium';
    let emotion = 'neutral';
    
    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      tradingSignal = 'bullish';
      emotion = positiveCount > 2 ? 'excited' : 'optimistic';
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      tradingSignal = 'bearish';
      emotion = negativeCount > 2 ? 'fearful' : 'worried';
    }
    
    if (urgencyCount > 0) {
      urgency = urgencyCount > 2 ? 'high' : urgencyCount > 1 ? 'medium' : 'low';
    }
    
    const confidence = Math.min(0.8, 0.5 + Math.abs(positiveCount - negativeCount) * 0.1);
    const impact = technicalCount > 0 ? 'high' : confidence > 0.7 ? 'high' : confidence > 0.5 ? 'medium' : 'low';
    
    return {
      text: post.text,
      sentiment,
      confidence,
      keywords: this.extractKeywords(text),
      emotion,
      tradingSignal,
      impact,
      timestamp: new Date().toISOString(),
      // Enhanced fallback fields
      urgency,
      marketContext: technicalCount > 0 ? 'Technical analysis discussion' : 'General market discussion',
      influencerScore: Math.min(0.8, 0.5 + (post.engagement / 1000)),
      reach: post.engagement * 10,
      engagement: post.engagement,
      sourceCredibility: post.engagement > 100 ? 'high' : post.engagement > 50 ? 'medium' : 'low'
    };
  }

  /**
   * Extract relevant keywords from text
   */
  private extractKeywords(text: string): string[] {
    const cryptoKeywords = [
      'eth', 'ethereum', 'btc', 'bitcoin', 'defi', 'nft', 'dao', 'yield', 'liquidity',
      'swap', 'stake', 'governance', 'protocol', 'bridge', 'layer2', 'rollup'
    ];
    
    const textLower = text.toLowerCase();
    return cryptoKeywords.filter(keyword => textLower.includes(keyword));
  }

  /**
   * Generate trading insights from sentiment analysis
   */
  async generateTradingInsights(
    token: string, 
    sentimentAnalyses: SentimentAnalysis[], 
    currentPrice: number
  ): Promise<TradingInsight[]> {
    try {
      console.log('🤖 AI: Generating trading insights for', token);
      
      const insights: TradingInsight[] = [];
      
      for (const analysis of sentimentAnalyses) {
        const insight = await this.analyzeTradingImpact(token, analysis, currentPrice);
        insights.push(insight);
      }
      
      // Sort by confidence and impact
      insights.sort((a, b) => (b.confidence * b.priceImpact) - (a.confidence * a.priceImpact));
      
      console.log('✅ AI: Generated', insights.length, 'trading insights');
      return insights;
      
    } catch (error) {
      console.error('❌ AI: Failed to generate trading insights', error);
      throw new Error('Failed to generate trading insights: ' + error.message);
    }
  }

  /**
   * Analyze trading impact of sentiment
   */
  private async analyzeTradingImpact(
    token: string, 
    analysis: SentimentAnalysis, 
    currentPrice: number
  ): Promise<TradingInsight> {
    // Calculate potential price impact based on sentiment strength
    let priceImpact = 0;
    let recommendation = '';
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    
    if (analysis.sentiment === 'positive' && analysis.tradingSignal === 'bullish') {
      priceImpact = analysis.confidence * 0.05; // Up to 5% positive impact
      recommendation = `Consider buying ${token} based on positive social sentiment`;
      riskLevel = analysis.confidence > 0.8 ? 'low' : 'medium';
    } else if (analysis.sentiment === 'negative' && analysis.tradingSignal === 'bearish') {
      priceImpact = -analysis.confidence * 0.05; // Up to 5% negative impact
      recommendation = `Consider selling ${token} based on negative social sentiment`;
      riskLevel = analysis.confidence > 0.8 ? 'low' : 'medium';
    } else {
      priceImpact = 0;
      recommendation = `Monitor ${token} - sentiment is neutral`;
      riskLevel = 'low';
    }
    
    // Adjust for impact level
    if (analysis.impact === 'high') {
      priceImpact *= 1.5;
    } else if (analysis.impact === 'low') {
      priceImpact *= 0.5;
    }
    
    return {
      token,
      sentiment: analysis,
      priceImpact,
      confidence: analysis.confidence,
      recommendation,
      riskLevel,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get AI model status and available models
   */
  async getModelStatus(): Promise<{ status: string; models: string[]; currentModel: string }> {
    try {
      const response = await fetch(`${this.ollamaEndpoint}/api/tags`);
      
      if (!response.ok) {
        return {
          status: 'offline',
          models: [],
          currentModel: this.model
        };
      }
      
      const data = await response.json();
      const models = data.models?.map((m: any) => m.name) || [];
      
      return {
        status: 'online',
        models,
        currentModel: this.model
      };
      
    } catch (error) {
      return {
        status: 'error',
        models: [],
        currentModel: this.model
      };
    }
  }

  /**
   * Change AI model
   */
  async changeModel(newModel: string): Promise<boolean> {
    try {
      // Check if model exists
      const status = await this.getModelStatus();
      if (!status.models.includes(newModel)) {
        throw new Error(`Model ${newModel} not available`);
      }
      
      this.model = newModel;
      console.log('🤖 AI: Changed model to', newModel);
      return true;
      
    } catch (error) {
      console.error('❌ AI: Failed to change model', error);
      return false;
    }
  }

  /**
   * Advanced sentiment aggregation and trend analysis
   */
  async analyzeSentimentTrends(
    posts: SocialPost[],
    timeWindow: '1h' | '4h' | '1d' | '1w' = '1d'
  ): Promise<{
    overallTrend: 'bullish' | 'bearish' | 'sideways';
    sentimentScore: number;
    confidence: number;
    keyInfluencers: string[];
    trendingTopics: string[];
    marketMood: string;
    volatility: number;
  }> {
    try {
      const analyses = await this.analyzeSentiment(posts);
      
      // Calculate trend metrics
      const sentimentScores = analyses.map(a => 
        a.sentiment === 'positive' ? 1 : a.sentiment === 'negative' ? -1 : 0
      );
      
      const averageSentiment = sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length;
      const sentimentVolatility = this.calculateVolatility(sentimentScores);
      
      // Identify key influencers
      const influencers = analyses
        .filter(a => a.influencerScore > 0.7)
        .sort((a, b) => b.influencerScore - a.influencerScore)
        .slice(0, 5)
        .map(a => a.text.substring(0, 50) + '...');
      
      // Extract trending topics
      const allKeywords = analyses.flatMap(a => a.keywords);
      const keywordFrequency = this.getKeywordFrequency(allKeywords);
      const trendingTopics = Object.entries(keywordFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([keyword]) => keyword);
      
      // Determine overall trend
      let overallTrend: 'bullish' | 'bearish' | 'sideways' = 'sideways';
      if (averageSentiment > 0.3) overallTrend = 'bullish';
      else if (averageSentiment < -0.3) overallTrend = 'bearish';
      
      // Determine market mood
      const marketMood = this.determineMarketMood(analyses, averageSentiment);
      
      return {
        overallTrend,
        sentimentScore: averageSentiment,
        confidence: this.calculateTrendConfidence(analyses),
        keyInfluencers: influencers,
        trendingTopics,
        marketMood,
        volatility: sentimentVolatility
      };
      
    } catch (error) {
      console.error('Failed to analyze sentiment trends:', error);
      throw error;
    }
  }

  /**
   * Calculate volatility of sentiment scores
   */
  private calculateVolatility(scores: number[]): number {
    if (scores.length < 2) return 0;
    
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Calculate trend confidence based on analysis quality
   */
  private calculateTrendConfidence(analyses: SentimentAnalysis[]): number {
    const avgConfidence = analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length;
    const consistency = 1 - this.calculateVolatility(analyses.map(a => a.confidence));
    
    return (avgConfidence + consistency) / 2;
  }

  /**
   * Determine market mood based on sentiment analysis
   */
  private determineMarketMood(analyses: SentimentAnalysis[], avgSentiment: number): string {
    const emotions = analyses.map(a => a.emotion);
    const emotionCounts = this.getKeywordFrequency(emotions);
    
    const dominantEmotion = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';
    
    if (avgSentiment > 0.5) return `Optimistic (${dominantEmotion})`;
    if (avgSentiment < -0.5) return `Pessimistic (${dominantEmotion})`;
    if (Math.abs(avgSentiment) < 0.2) return `Neutral (${dominantEmotion})`;
    
    return `Mixed (${dominantEmotion})`;
  }

  /**
   * Get frequency of keywords or emotions
   */
  private getKeywordFrequency(items: string[]): Record<string, number> {
    return items.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const aiSentimentService = new AISentimentService();
