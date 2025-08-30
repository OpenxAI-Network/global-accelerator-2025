// AI Portfolio Optimization Service for AEGIS
// Provides advanced portfolio analysis, risk management, and optimization recommendations

export interface PortfolioAnalysis {
  portfolioId: string;
  timestamp: string;
  totalValue: number;
  totalReturn: number;
  riskMetrics: RiskMetrics;
  allocation: AssetAllocation[];
  optimization: OptimizationRecommendation;
  rebalancing: RebalancingRecommendation;
  riskManagement: RiskManagementStrategy;
  performance: PerformanceMetrics;
}

export interface RiskMetrics {
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  var95: number; // Value at Risk 95%
  cvar95: number; // Conditional Value at Risk 95%
  beta: number;
  correlation: number;
  diversificationScore: number;
}

export interface AssetAllocation {
  asset: string;
  symbol: string;
  allocation: number; // Percentage
  currentValue: number;
  targetAllocation: number;
  deviation: number;
  risk: 'low' | 'medium' | 'high';
  performance: number; // Return percentage
}

export interface OptimizationRecommendation {
  strategy: 'conservative' | 'moderate' | 'aggressive';
  targetAllocation: AssetAllocation[];
  expectedReturn: number;
  expectedRisk: number;
  confidence: number;
  reasoning: string[];
  implementation: string[];
}

export interface RebalancingRecommendation {
  isNeeded: boolean;
  urgency: 'low' | 'medium' | 'high';
  trades: RebalancingTrade[];
  expectedCost: number;
  benefits: string[];
  risks: string[];
}

export interface RebalancingTrade {
  asset: string;
  action: 'buy' | 'sell';
  amount: number;
  percentage: number;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

export interface RiskManagementStrategy {
  stopLossLevels: StopLossLevel[];
  positionSizing: PositionSizing;
  hedging: HedgingStrategy[];
  riskLimits: RiskLimits;
}

export interface StopLossLevel {
  asset: string;
  level: number;
  type: 'trailing' | 'fixed' | 'dynamic';
  description: string;
}

export interface PositionSizing {
  maxPositionSize: number;
  maxPortfolioRisk: number;
  correlationAdjustment: boolean;
  volatilityAdjustment: boolean;
}

export interface HedgingStrategy {
  type: 'options' | 'futures' | 'inverse' | 'correlation';
  asset: string;
  allocation: number;
  cost: number;
  effectiveness: number;
  description: string;
}

export interface RiskLimits {
  maxDrawdown: number;
  maxVolatility: number;
  maxCorrelation: number;
  maxConcentration: number;
}

export interface PerformanceMetrics {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  recoveryTime: number;
}

export interface PortfolioData {
  assets: {
    symbol: string;
    name: string;
    allocation: number;
    currentValue: number;
    purchasePrice: number;
    currentPrice: number;
    quantity: number;
  }[];
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentHorizon: 'short' | 'medium' | 'long';
  liquidityNeeds: 'low' | 'medium' | 'high';
  constraints: string[];
}

export class AIPortfolioOptimizationService {
  private ollamaEndpoint: string;
  private model: string;

  constructor(ollamaEndpoint: string = 'http://localhost:11434', model: string = 'llama2') {
    this.ollamaEndpoint = ollamaEndpoint;
    this.model = model;
  }

  /**
   * Generate comprehensive portfolio analysis
   */
  async analyzePortfolio(portfolioData: PortfolioData): Promise<PortfolioAnalysis> {
    try {
      console.log('🧠 AI: Analyzing portfolio for optimization');
      
      // Calculate risk metrics
      const riskMetrics = this.calculateRiskMetrics(portfolioData);
      
      // Analyze current allocation
      const allocation = this.analyzeAllocation(portfolioData);
      
      // Generate optimization recommendations
      const optimization = await this.generateOptimizationRecommendation(portfolioData, riskMetrics);
      
      // Generate rebalancing recommendations
      const rebalancing = this.generateRebalancingRecommendation(allocation, optimization);
      
      // Generate risk management strategy
      const riskManagement = this.generateRiskManagementStrategy(portfolioData, riskMetrics);
      
      // Calculate performance metrics
      const performance = this.calculatePerformanceMetrics(portfolioData);
      
      return {
        portfolioId: 'portfolio_' + Math.random().toString(36).substring(7),
        timestamp: new Date().toISOString(),
        totalValue: portfolioData.assets.reduce((sum, asset) => sum + asset.currentValue, 0),
        totalReturn: this.calculateTotalReturn(portfolioData),
        riskMetrics,
        allocation,
        optimization,
        rebalancing,
        riskManagement,
        performance
      };
      
    } catch (error) {
      console.error('❌ AI: Failed to analyze portfolio', error);
      throw error;
    }
  }

  /**
   * Calculate comprehensive risk metrics
   */
  private calculateRiskMetrics(portfolioData: PortfolioData): RiskMetrics {
    const assets = portfolioData.assets;
    const totalValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
    
    // Calculate volatility
    const returns = assets.map(asset => {
      const return_ = (asset.currentPrice - asset.purchasePrice) / asset.purchasePrice;
      return return_ * (asset.allocation / 100);
    });
    
    const volatility = this.calculateVolatility(returns);
    
    // Calculate Sharpe ratio (assuming risk-free rate of 2%)
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const sharpeRatio = (avgReturn - 0.02) / volatility;
    
    // Calculate maximum drawdown
    const maxDrawdown = this.calculateMaxDrawdown(returns);
    
    // Calculate Value at Risk (95% confidence)
    const var95 = this.calculateVaR(returns, 0.95);
    const cvar95 = this.calculateCVaR(returns, 0.95);
    
    // Calculate beta (market correlation)
    const beta = this.calculateBeta(returns);
    
    // Calculate correlation
    const correlation = this.calculatePortfolioCorrelation(assets);
    
    // Calculate diversification score
    const diversificationScore = this.calculateDiversificationScore(assets);
    
    return {
      volatility,
      sharpeRatio: isFinite(sharpeRatio) ? sharpeRatio : 0,
      maxDrawdown,
      var95,
      cvar95,
      beta,
      correlation,
      diversificationScore
    };
  }

  /**
   * Analyze current asset allocation
   */
  private analyzeAllocation(portfolioData: PortfolioData): AssetAllocation[] {
    return portfolioData.assets.map(asset => {
      const currentValue = asset.currentValue;
      const totalValue = portfolioData.assets.reduce((sum, a) => sum + a.currentValue, 0);
      const currentAllocation = (currentValue / totalValue) * 100;
      const deviation = currentAllocation - asset.allocation;
      const performance = ((asset.currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100;
      
      // Determine risk level based on asset type and volatility
      const risk = this.determineAssetRisk(asset.symbol, performance);
      
      return {
        asset: asset.name,
        symbol: asset.symbol,
        allocation: currentAllocation,
        currentValue,
        targetAllocation: asset.allocation,
        deviation,
        risk,
        performance
      };
    });
  }

  /**
   * Generate AI-powered optimization recommendations
   */
  private async generateOptimizationRecommendation(
    portfolioData: PortfolioData,
    riskMetrics: RiskMetrics
  ): Promise<OptimizationRecommendation> {
    try {
      const prompt = this.buildOptimizationPrompt(portfolioData, riskMetrics);
      
      const response = await fetch(`${this.ollamaEndpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          options: { temperature: 0.3, max_tokens: 800 }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseOptimizationResponse(data.response, portfolioData);
      
    } catch (error) {
      console.error('Failed to generate optimization recommendation:', error);
      return this.generateFallbackOptimization(portfolioData, riskMetrics);
    }
  }

  /**
   * Build optimization prompt
   */
  private buildOptimizationPrompt(portfolioData: PortfolioData, riskMetrics: RiskMetrics): string {
    const assets = portfolioData.assets.map(a => `${a.symbol}: ${a.allocation}%`).join(', ');
    
    return `Analyze this portfolio and provide optimization recommendations.

Portfolio Data:
- Assets: ${assets}
- Risk Tolerance: ${portfolioData.riskTolerance}
- Investment Horizon: ${portfolioData.investmentHorizon}
- Liquidity Needs: ${portfolioData.liquidityNeeds}

Current Risk Metrics:
- Volatility: ${(riskMetrics.volatility * 100).toFixed(2)}%
- Sharpe Ratio: ${riskMetrics.sharpeRatio.toFixed(2)}
- Max Drawdown: ${(riskMetrics.maxDrawdown * 100).toFixed(2)}%
- Diversification Score: ${(riskMetrics.diversificationScore * 100).toFixed(2)}%

Provide optimization recommendations in this JSON format:
{
  "strategy": "conservative|moderate|aggressive",
  "targetAllocation": [
    {
      "symbol": "BTC",
      "targetAllocation": 25.0,
      "reasoning": "Core position for long-term growth"
    }
  ],
  "expectedReturn": 0.12,
  "expectedRisk": 0.18,
  "confidence": 0.85,
  "reasoning": ["Reason 1", "Reason 2"],
  "implementation": ["Step 1", "Step 2"]
}

Consider:
- Risk tolerance alignment
- Diversification improvement
- Expected return optimization
- Risk-adjusted performance
- Market conditions
- Liquidity requirements

Respond only with valid JSON:`;
  }

  /**
   * Parse optimization response
   */
  private parseOptimizationResponse(response: string, portfolioData: PortfolioData): OptimizationRecommendation {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Map target allocation to full asset allocation objects
      const targetAllocation = parsed.targetAllocation.map((target: any) => {
        const asset = portfolioData.assets.find(a => a.symbol === target.symbol);
        return {
          asset: asset?.name || target.symbol,
          symbol: target.symbol,
          allocation: target.targetAllocation,
          currentValue: asset?.currentValue || 0,
          targetAllocation: target.targetAllocation,
          deviation: 0,
          risk: 'medium' as const,
          performance: 0
        };
      });
      
      return {
        strategy: parsed.strategy || 'moderate',
        targetAllocation,
        expectedReturn: parsed.expectedReturn || 0.1,
        expectedRisk: parsed.expectedRisk || 0.15,
        confidence: parsed.confidence || 0.7,
        reasoning: parsed.reasoning || ['AI-generated optimization'],
        implementation: parsed.implementation || ['Implement gradually over time']
      };
      
    } catch (error) {
      console.error('Failed to parse optimization response:', error);
      return this.generateFallbackOptimization(portfolioData, {} as RiskMetrics);
    }
  }

  /**
   * Generate fallback optimization
   */
  private generateFallbackOptimization(
    portfolioData: PortfolioData,
    riskMetrics: RiskMetrics
  ): OptimizationRecommendation {
    const strategy = portfolioData.riskTolerance;
    const targetAllocation = portfolioData.assets.map(asset => ({
      asset: asset.name,
      symbol: asset.symbol,
      allocation: asset.allocation,
      currentValue: asset.currentValue,
      targetAllocation: asset.allocation,
      deviation: 0,
      risk: this.determineAssetRisk(asset.symbol, 0) as 'low' | 'medium' | 'high',
      performance: 0
    }));
    
    return {
      strategy,
      targetAllocation,
      expectedReturn: strategy === 'conservative' ? 0.06 : strategy === 'moderate' ? 0.10 : 0.15,
      expectedRisk: strategy === 'conservative' ? 0.08 : strategy === 'moderate' ? 0.15 : 0.25,
      confidence: 0.6,
      reasoning: ['Maintain current allocation based on risk tolerance'],
      implementation: ['Monitor and rebalance quarterly']
    };
  }

  /**
   * Generate rebalancing recommendations
   */
  private generateRebalancingRecommendation(
    allocation: AssetAllocation[],
    optimization: OptimizationRecommendation
  ): RebalancingRecommendation {
    const trades: RebalancingTrade[] = [];
    let totalDeviation = 0;
    
    allocation.forEach(asset => {
      const deviation = Math.abs(asset.deviation);
      totalDeviation += deviation;
      
      if (deviation > 5) { // 5% threshold
        const targetAsset = optimization.targetAllocation.find(t => t.symbol === asset.symbol);
        if (targetAsset) {
          const action = asset.allocation > targetAsset.targetAllocation ? 'sell' : 'buy';
          const amount = Math.abs(asset.allocation - targetAsset.targetAllocation);
          
          trades.push({
            asset: asset.symbol,
            action,
            amount,
            percentage: amount,
            priority: deviation > 10 ? 'high' : deviation > 7 ? 'medium' : 'low',
            reason: `Rebalance to target allocation of ${targetAsset.targetAllocation.toFixed(1)}%`
          });
        }
      }
    });
    
    const isNeeded = totalDeviation > 10;
    const urgency: RebalancingRecommendation['urgency'] = 
      totalDeviation > 20 ? 'high' : totalDeviation > 15 ? 'medium' : 'low';
    
    const expectedCost = trades.reduce((sum, trade) => sum + (trade.amount * 0.001), 0); // 0.1% trading cost
    
    return {
      isNeeded,
      urgency,
      trades: trades.sort((a, b) => b.priority === 'high' ? 1 : -1),
      expectedCost,
      benefits: [
        'Maintain target risk profile',
        'Improve diversification',
        'Optimize expected returns',
        'Reduce concentration risk'
      ],
      risks: [
        'Trading costs',
        'Tax implications',
        'Market timing risk',
        'Execution slippage'
      ]
    };
  }

  /**
   * Generate risk management strategy
   */
  private generateRiskManagementStrategy(
    portfolioData: PortfolioData,
    riskMetrics: RiskMetrics
  ): RiskManagementStrategy {
    const stopLossLevels: StopLossLevel[] = portfolioData.assets.map(asset => {
      const currentPrice = asset.currentPrice;
      const stopLoss = asset.risk === 'high' ? 0.15 : asset.risk === 'medium' ? 0.10 : 0.05;
      
      return {
        asset: asset.symbol,
        level: currentPrice * (1 - stopLoss),
        type: 'trailing' as const,
        description: `${(stopLoss * 100).toFixed(0)}% trailing stop loss for ${asset.symbol}`
      };
    });
    
    const positionSizing: PositionSizing = {
      maxPositionSize: portfolioData.riskTolerance === 'conservative' ? 0.15 : 
                      portfolioData.riskTolerance === 'moderate' ? 0.25 : 0.35,
      maxPortfolioRisk: portfolioData.riskTolerance === 'conservative' ? 0.10 : 
                       portfolioData.riskTolerance === 'moderate' ? 0.15 : 0.25,
      correlationAdjustment: true,
      volatilityAdjustment: true
    };
    
    const hedging: HedgingStrategy[] = [];
    if (riskMetrics.correlation > 0.7) {
      hedging.push({
        type: 'correlation',
        asset: 'USDT',
        allocation: 0.1,
        cost: 0.001,
        effectiveness: 0.8,
        description: 'Add stablecoin to reduce correlation risk'
      });
    }
    
    const riskLimits: RiskLimits = {
      maxDrawdown: portfolioData.riskTolerance === 'conservative' ? 0.10 : 
                  portfolioData.riskTolerance === 'moderate' ? 0.20 : 0.30,
      maxVolatility: portfolioData.riskTolerance === 'conservative' ? 0.15 : 
                    portfolioData.riskTolerance === 'moderate' ? 0.25 : 0.35,
      maxCorrelation: 0.8,
      maxConcentration: portfolioData.riskTolerance === 'conservative' ? 0.20 : 
                       portfolioData.riskTolerance === 'moderate' ? 0.30 : 0.40
    };
    
    return {
      stopLossLevels,
      positionSizing,
      hedging,
      riskLimits
    };
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(portfolioData: PortfolioData): PerformanceMetrics {
    const assets = portfolioData.assets;
    const totalValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
    const totalCost = assets.reduce((sum, asset) => sum + (asset.purchasePrice * asset.quantity), 0);
    
    const totalReturn = (totalValue - totalCost) / totalCost;
    const annualizedReturn = totalReturn; // Simplified - in production would use time-based calculation
    
    const returns = assets.map(asset => {
      return (asset.currentPrice - asset.purchasePrice) / asset.purchasePrice;
    });
    
    const volatility = this.calculateVolatility(returns);
    const sharpeRatio = (totalReturn - 0.02) / volatility; // Assuming 2% risk-free rate
    
    // Simplified metrics - in production would calculate from historical data
    const sortinoRatio = sharpeRatio; // Simplified
    const calmarRatio = totalReturn / 0.1; // Assuming 10% max drawdown
    const winRate = returns.filter(r => r > 0).length / returns.length;
    const profitFactor = 1.5; // Simplified
    const maxDrawdown = 0.1; // Simplified
    const recoveryTime = 30; // Days, simplified
    
    return {
      totalReturn,
      annualizedReturn,
      volatility,
      sharpeRatio: isFinite(sharpeRatio) ? sharpeRatio : 0,
      sortinoRatio: isFinite(sortinoRatio) ? sortinoRatio : 0,
      calmarRatio: isFinite(calmarRatio) ? calmarRatio : 0,
      winRate,
      profitFactor,
      maxDrawdown,
      recoveryTime
    };
  }

  /**
   * Calculate total return
   */
  private calculateTotalReturn(portfolioData: PortfolioData): number {
    const totalValue = portfolioData.assets.reduce((sum, asset) => sum + asset.currentValue, 0);
    const totalCost = portfolioData.assets.reduce((sum, asset) => sum + (asset.purchasePrice * asset.quantity), 0);
    
    return (totalValue - totalCost) / totalCost;
  }

  /**
   * Determine asset risk level
   */
  private determineAssetRisk(symbol: string, performance: number): 'low' | 'medium' | 'high' {
    // Simplified risk classification
    const stableAssets = ['USDT', 'USDC', 'DAI', 'BUSD'];
    const highRiskAssets = ['BTC', 'ETH', 'SOL', 'ADA'];
    
    if (stableAssets.includes(symbol)) return 'low';
    if (highRiskAssets.includes(symbol)) return 'high';
    return 'medium';
  }

  /**
   * Calculate volatility
   */
  private calculateVolatility(returns: number[]): number {
    if (returns.length < 2) return 0;
    
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Calculate maximum drawdown
   */
  private calculateMaxDrawdown(returns: number[]): number {
    let maxDrawdown = 0;
    let peak = returns[0];
    
    returns.forEach(return_ => {
      if (return_ > peak) {
        peak = return_;
      }
      const drawdown = (peak - return_) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });
    
    return maxDrawdown;
  }

  /**
   * Calculate Value at Risk
   */
  private calculateVaR(returns: number[], confidence: number): number {
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * sortedReturns.length);
    return sortedReturns[index] || 0;
  }

  /**
   * Calculate Conditional Value at Risk
   */
  private calculateCVaR(returns: number[], confidence: number): number {
    const var_ = this.calculateVaR(returns, confidence);
    const tailReturns = returns.filter(r => r <= var_);
    
    if (tailReturns.length === 0) return var_;
    
    return tailReturns.reduce((sum, ret) => sum + ret, 0) / tailReturns.length;
  }

  /**
   * Calculate beta
   */
  private calculateBeta(returns: number[]): number {
    // Simplified beta calculation - in production would use market data
    return 1.0;
  }

  /**
   * Calculate portfolio correlation
   */
  private calculatePortfolioCorrelation(assets: any[]): number {
    // Simplified correlation calculation
    return 0.6;
  }

  /**
   * Calculate diversification score
   */
  private calculateDiversificationScore(assets: any[]): number {
    const allocations = assets.map(a => a.allocation / 100);
    const concentration = allocations.reduce((sum, alloc) => sum + Math.pow(alloc, 2), 0);
    
    // Herfindahl-Hirschman Index based diversification
    return Math.max(0, 1 - concentration);
  }
}

// Export singleton instance
export const aiPortfolioOptimizationService = new AIPortfolioOptimizationService();
