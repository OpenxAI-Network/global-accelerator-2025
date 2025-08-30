'use client';

import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, BarChart3, Target, Zap, Activity, Settings } from 'lucide-react';
import { aiPricePredictionService, PricePrediction, MarketAnalysis, TechnicalIndicator } from '../../services/AIPricePredictionService';

interface AIMarketAnalysisDashboardProps {
  selectedToken: string;
  currentPrice: number;
}

export default function AIMarketAnalysisDashboard({ selectedToken, currentPrice }: AIMarketAnalysisDashboardProps) {
  const [predictions, setPredictions] = useState<PricePrediction[]>([]);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '4h' | '1d' | '1w' | '1m'>('1d');
  const [activeTab, setActiveTab] = useState<'predictions' | 'analysis' | 'technical' | 'accuracy'>('predictions');

  useEffect(() => {
    generateMarketData();
  }, [selectedToken, selectedTimeframe]);

  const generateMarketData = async () => {
    try {
      setIsGenerating(true);
      
      // Generate mock market data
      const mockMarketData = {
        currentPrice,
        priceChange: (Math.random() - 0.5) * 10, // -5% to +5%
        volumeChange: (Math.random() - 0.5) * 100, // -50% to +50%
        volume: Math.random() * 1000000,
        averageVolume: 500000,
        rsi: Math.random() * 100,
        macd: (Math.random() - 0.5) * 2,
        macdSignal: (Math.random() - 0.5) * 2,
        sma20: currentPrice * (1 + (Math.random() - 0.5) * 0.1),
        sma50: currentPrice * (1 + (Math.random() - 0.5) * 0.1),
        bbUpper: currentPrice * 1.1,
        bbLower: currentPrice * 0.9,
        bbMiddle: currentPrice,
        socialSentiment: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)],
        newsSentiment: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)]
      };

      // Generate predictions for different timeframes
      const timeframes: Array<'1h' | '4h' | '1d' | '1w' | '1m'> = ['1h', '4h', '1d', '1w', '1m'];
      const newPredictions: PricePrediction[] = [];
      
      for (const timeframe of timeframes) {
        const prediction = await aiPricePredictionService.generatePricePrediction(
          selectedToken,
          currentPrice,
          timeframe,
          mockMarketData
        );
        newPredictions.push(prediction);
      }
      
      setPredictions(newPredictions);
      
      // Generate market analysis
      const analysis = await aiPricePredictionService.generateMarketAnalysis(
        selectedToken,
        mockMarketData,
        { averageSentiment: (Math.random() - 0.5) * 2 }
      );
      
      setMarketAnalysis(analysis);
      
    } catch (error) {
      console.error('Failed to generate market data:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 0.5) return 'text-green-400';
    if (score > 0) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'buy': return 'text-green-400';
      case 'sell': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Market Analysis</h3>
            <div className="text-sm text-blue-200">Powered by Advanced AI & Technical Analysis</div>
          </div>
        </div>
        
        <button
          onClick={generateMarketData}
          disabled={isGenerating}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Refresh Analysis
            </>
          )}
        </button>
      </div>

      {/* Timeframe Selector */}
      <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
        {[
          { id: '1h', label: '1 Hour' },
          { id: '4h', label: '4 Hours' },
          { id: '1d', label: '1 Day' },
          { id: '1w', label: '1 Week' },
          { id: '1m', label: '1 Month' }
        ].map((timeframe) => (
          <button
            key={timeframe.id}
            onClick={() => setSelectedTimeframe(timeframe.id as any)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTimeframe === timeframe.id
                ? 'bg-purple-500 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {timeframe.label}
          </button>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
        {[
          { id: 'predictions', label: 'Price Predictions', icon: <Target className="w-4 h-4" /> },
          { id: 'analysis', label: 'Market Analysis', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'technical', label: 'Technical Indicators', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'accuracy', label: 'AI Accuracy', icon: <Brain className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-500 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'predictions' && (
          <div className="space-y-4">
            <h4 className="text-white font-medium">AI Price Predictions</h4>
            
            {predictions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No predictions available. Generate market analysis to see AI predictions.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {predictions.map((prediction, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/20">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-white font-medium">{prediction.timeframe}</div>
                        <div className="text-gray-400 text-sm">
                          {new Date(prediction.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getDirectionIcon(prediction.direction)}
                        <span className={`text-sm font-medium ${getDirectionColor(prediction.direction)}`}>
                          {prediction.direction.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Current Price</span>
                        <span className="text-white">${prediction.currentPrice.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Predicted Price</span>
                        <span className="text-white font-medium">${prediction.predictedPrice.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Confidence</span>
                        <span className="text-white">{Math.round(prediction.confidence * 100)}%</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Risk Level</span>
                        <span className={`font-medium ${getRiskColor(prediction.riskLevel)}`}>
                          {prediction.riskLevel.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    {prediction.factors.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/20">
                        <div className="text-sm text-gray-400 mb-2">Key Factors:</div>
                        <div className="space-y-1">
                          {prediction.factors.slice(0, 2).map((factor, idx) => (
                            <div key={idx} className="text-xs text-gray-300">
                              • {factor.name}: {factor.description}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-4">
            <h4 className="text-white font-medium">Comprehensive Market Analysis</h4>
            
            {!marketAnalysis ? (
              <div className="text-center py-8 text-gray-400">
                No market analysis available. Generate analysis to see detailed insights.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Overall Recommendation */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-white font-medium">AI Recommendation</div>
                    <span className={`text-lg font-bold ${getRecommendationColor(marketAnalysis.recommendation)}`}>
                      {marketAnalysis.recommendation.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-gray-300 text-sm">{marketAnalysis.reasoning}</div>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/20">
                    <div className="text-sm text-gray-400 mb-2">Technical Score</div>
                    <div className={`text-2xl font-bold ${getScoreColor(marketAnalysis.technicalScore)}`}>
                      {(marketAnalysis.technicalScore * 100).toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-400">-100 to +100</div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4 border border-white/20">
                    <div className="text-sm text-gray-400 mb-2">Sentiment Score</div>
                    <div className={`text-2xl font-bold ${getScoreColor(marketAnalysis.sentimentScore)}`}>
                      {(marketAnalysis.sentimentScore * 100).toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-400">-100 to +100</div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4 border border-white/20">
                    <div className="text-sm text-gray-400 mb-2">Volume Score</div>
                    <div className={`text-2xl font-bold ${getScoreColor(marketAnalysis.volumeScore)}`}>
                      {(marketAnalysis.volumeScore * 100).toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-400">-100 to +100</div>
                  </div>
                </div>

                {/* Overall Score */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/20">
                  <div className="text-sm text-gray-400 mb-2">Overall Market Score</div>
                  <div className={`text-3xl font-bold ${getScoreColor(marketAnalysis.overallScore)}`}>
                    {(marketAnalysis.overallScore * 100).toFixed(0)}
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 mt-2">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        marketAnalysis.overallScore > 0.3 ? 'bg-green-500' :
                        marketAnalysis.overallScore > -0.3 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.abs(marketAnalysis.overallScore) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'technical' && (
          <div className="space-y-4">
            <h4 className="text-white font-medium">Technical Indicators Analysis</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* RSI */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/20">
                <div className="text-sm text-gray-400 mb-2">RSI (Relative Strength Index)</div>
                <div className="text-2xl font-bold text-white">65.4</div>
                <div className="text-sm text-yellow-400">Neutral</div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '65.4%' }}></div>
                </div>
                <div className="text-xs text-gray-400 mt-1">30 (Oversold) - 70 (Overbought)</div>
              </div>

              {/* MACD */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/20">
                <div className="text-sm text-gray-400 mb-2">MACD</div>
                <div className="text-2xl font-bold text-green-400">+0.15</div>
                <div className="text-sm text-green-400">Bullish</div>
                <div className="text-xs text-gray-400 mt-1">Signal: +0.08</div>
              </div>

              {/* Moving Averages */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/20">
                <div className="text-sm text-gray-400 mb-2">Moving Averages</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">SMA 20:</span>
                    <span className="text-white">$2,450</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">SMA 50:</span>
                    <span className="text-white">$2,380</span>
                  </div>
                </div>
                <div className="text-sm text-green-400 mt-2">Golden Cross</div>
              </div>

              {/* Bollinger Bands */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/20">
                <div className="text-sm text-gray-400 mb-2">Bollinger Bands</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Upper:</span>
                    <span className="text-white">$2,650</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Middle:</span>
                    <span className="text-white">$2,450</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lower:</span>
                    <span className="text-white">$2,250</span>
                  </div>
                </div>
                <div className="text-sm text-yellow-400 mt-2">Price near middle</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'accuracy' && (
          <div className="space-y-4">
            <h4 className="text-white font-medium">AI Prediction Accuracy</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/20">
                <div className="text-sm text-gray-400 mb-2">Overall Accuracy</div>
                <div className="text-3xl font-bold text-green-400">72%</div>
                <div className="text-sm text-gray-400">Based on 150 predictions</div>
                <div className="w-full bg-gray-700 rounded-full h-3 mt-2">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/20">
                <div className="text-sm text-gray-400 mb-2">Correct Predictions</div>
                <div className="text-3xl font-bold text-white">108</div>
                <div className="text-sm text-gray-400">Out of 150 total</div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/20">
                <div className="text-sm text-gray-400 mb-2">Average Error</div>
                <div className="text-3xl font-bold text-yellow-400">8%</div>
                <div className="text-sm text-gray-400">Price deviation</div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/20">
                <div className="text-sm text-gray-400 mb-2">Model Confidence</div>
                <div className="text-3xl font-bold text-blue-400">85%</div>
                <div className="text-sm text-gray-400">AI confidence level</div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/20">
              <div className="text-sm text-gray-400 mb-2">Accuracy by Timeframe</div>
              <div className="space-y-2">
                {[
                  { timeframe: '1 Hour', accuracy: 68 },
                  { timeframe: '4 Hours', accuracy: 71 },
                  { timeframe: '1 Day', accuracy: 75 },
                  { timeframe: '1 Week', accuracy: 78 },
                  { timeframe: '1 Month', accuracy: 72 }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-white text-sm">{item.timeframe}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${item.accuracy}%` }}></div>
                      </div>
                      <span className="text-gray-400 text-sm w-12 text-right">{item.accuracy}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
