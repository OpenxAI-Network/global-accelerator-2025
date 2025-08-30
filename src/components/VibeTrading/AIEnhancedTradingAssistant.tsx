'use client';

import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Settings, Zap } from 'lucide-react';

interface SentimentAnalysis {
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  keywords: string[];
  emotion: string;
  tradingSignal: 'bullish' | 'bearish' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  timestamp: string;
  urgency: 'low' | 'medium' | 'high';
  marketContext: string;
  influencerScore: number;
  reach: number;
  engagement: number;
  sourceCredibility: 'low' | 'medium' | 'high';
}

interface SocialPost {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  platform: 'farcaster' | 'twitter' | 'discord';
  engagement: number;
  mentions: string[];
}

interface TradingInsight {
  token: string;
  sentiment: SentimentAnalysis;
  priceImpact: number;
  confidence: number;
  recommendation: string;
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: string;
}

interface AIEnhancedTradingAssistantProps {
  selectedToken: string;
  currentPrice: number;
}

export default function AIEnhancedTradingAssistant({ selectedToken, currentPrice }: AIEnhancedTradingAssistantProps) {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modelStatus, setModelStatus] = useState<{ status: string; models: string[]; currentModel: string } | null>(null);
  const [tradingInsights, setTradingInsights] = useState<TradingInsight[]>([]);
  const [sentimentData, setSentimentData] = useState<SentimentAnalysis[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'insights' | 'sentiment' | 'settings'>('chat');
  const [mounted, setMounted] = useState(false);

  // Fix hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      checkOllamaStatus();
      generateMockSentimentData();
    }
  }, [selectedToken, mounted]);

  const checkOllamaStatus = async () => {
    try {
      // For now, simulate offline status to prevent crashes
      setModelStatus({
        status: 'offline',
        models: ['llama2'],
        currentModel: 'llama2'
      });
    } catch (error) {
      console.error('Failed to check Ollama status:', error);
      setModelStatus({
        status: 'offline',
        models: ['llama2'],
        currentModel: 'llama2'
      });
    }
  };

  const generateMockSentimentData = () => {
    try {
      // Generate mock social posts for demonstration
      const mockPosts: SocialPost[] = [
        {
          id: '1',
          text: `${selectedToken} is looking bullish today! 🚀 The technical indicators are strong and volume is increasing.`,
          author: 'crypto_analyst',
          timestamp: new Date().toISOString(),
          platform: 'farcaster',
          engagement: 156,
          mentions: [selectedToken]
        },
        {
          id: '2',
          text: `Just bought more ${selectedToken} on this dip. Fundamentals haven't changed, this is a great entry point.`,
          author: 'defi_trader',
          timestamp: new Date().toISOString(),
          platform: 'farcaster',
          engagement: 89,
          mentions: [selectedToken]
        },
        {
          id: '3',
          text: `${selectedToken} showing some bearish signals. RSI is overbought and we might see a correction soon.`,
          author: 'technical_trader',
          timestamp: new Date().toISOString(),
          platform: 'farcaster',
          engagement: 234,
          mentions: [selectedToken]
        }
      ];

      // Analyze sentiment and generate insights
      analyzeSentimentAndGenerateInsights(mockPosts);
    } catch (error) {
      console.error('Error generating mock sentiment data:', error);
    }
  };

  const analyzeSentimentAndGenerateInsights = async (posts: SocialPost[]) => {
    try {
      setIsAnalyzing(true);
      
      // Generate mock sentiment analyses
      const analyses: SentimentAnalysis[] = posts.map((post, index) => ({
        text: post.text,
        sentiment: ['positive', 'negative', 'neutral'][index % 3] as 'positive' | 'negative' | 'neutral',
        confidence: 0.7 + Math.random() * 0.3,
        keywords: [selectedToken, 'crypto', 'trading'],
        emotion: ['excited', 'concerned', 'neutral'][index % 3],
        tradingSignal: ['bullish', 'bearish', 'neutral'][index % 3] as 'bullish' | 'bearish' | 'neutral',
        impact: ['high', 'medium', 'low'][index % 3] as 'high' | 'medium' | 'low',
        timestamp: new Date().toISOString(),
        urgency: ['low', 'medium', 'high'][index % 3] as 'low' | 'medium' | 'high',
        marketContext: 'General market sentiment',
        influencerScore: 50 + Math.random() * 50,
        reach: 100 + Math.random() * 900,
        engagement: post.engagement,
        sourceCredibility: ['low', 'medium', 'high'][index % 3] as 'low' | 'medium' | 'high'
      }));
      
      setSentimentData(analyses);
      
      // Generate mock trading insights
      const insights: TradingInsight[] = analyses.map((analysis, index) => ({
        token: selectedToken,
        sentiment: analysis,
        priceImpact: (Math.random() - 0.5) * 10,
        confidence: analysis.confidence,
        recommendation: `Based on ${analysis.sentiment} sentiment, consider ${analysis.tradingSignal} position`,
        riskLevel: ['low', 'medium', 'high'][index % 3] as 'low' | 'medium' | 'high',
        timestamp: new Date().toISOString()
      }));
      
      setTradingInsights(insights);
      
    } catch (error) {
      console.error('Failed to analyze sentiment and generate insights:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    try {
      setIsAnalyzing(true);
      
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResponse = `Based on current ${selectedToken} market data and sentiment analysis, here's my assessment:

• Current Price: $${currentPrice}
• Market Sentiment: ${sentimentData[0]?.sentiment || 'neutral'}
• Trading Signal: ${tradingInsights[0]?.sentiment.tradingSignal || 'neutral'}

The AI analysis suggests ${sentimentData[0]?.sentiment === 'positive' ? 'a bullish outlook' : sentimentData[0]?.sentiment === 'negative' ? 'a bearish outlook' : 'a neutral market position'} for ${selectedToken}.

Remember: This is not financial advice. Always do your own research.`;
      
      setResponse(mockResponse);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      setResponse('Sorry, I encountered an error while analyzing your question. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="bg-white/5 rounded-lg p-6 text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-blue-200">Initializing AI Assistant...</p>
      </div>
    );
  }

  try {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-bold text-white">AI Trading Assistant</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              modelStatus?.status === 'online' ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            <span className="text-xs text-gray-400">
              {modelStatus?.status === 'online' ? 'AI Online' : 'AI Offline'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
          {(['chat', 'insights', 'sentiment', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {activeTab === 'chat' && (
            <div className="space-y-4">
              <form onSubmit={handleQuestionSubmit} className="space-y-3">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={`Ask me anything about ${selectedToken} trading, market sentiment, or technical analysis...`}
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 resize-none"
                  rows={3}
                />
                <button
                  type="submit"
                  disabled={isAnalyzing || !question.trim()}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Analyzing...
                    </div>
                  ) : (
                    'Ask AI Assistant'
                  )}
                </button>
              </form>

              {response && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/20">
                  <h4 className="font-semibold text-white mb-2">AI Response:</h4>
                  <p className="text-gray-200 whitespace-pre-line">{response}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-white">Trading Insights</h4>
              {tradingInsights.map((insight, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{insight.token}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      insight.riskLevel === 'low' ? 'bg-green-500/20 text-green-300' :
                      insight.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {insight.riskLevel} risk
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{insight.recommendation}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>Confidence: {(insight.confidence * 100).toFixed(0)}%</span>
                    <span>Impact: {insight.priceImpact > 0 ? '+' : ''}{insight.priceImpact.toFixed(2)}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'sentiment' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-white">Sentiment Analysis</h4>
              {sentimentData.map((analysis, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${
                      analysis.sentiment === 'positive' ? 'text-green-400' :
                      analysis.sentiment === 'negative' ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {(analysis.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{analysis.text}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>Signal: {analysis.tradingSignal}</span>
                    <span>Impact: {analysis.impact}</span>
                    <span>Urgency: {analysis.urgency}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-white">AI Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">AI Model Status</span>
                  <span className={`text-sm ${
                    modelStatus?.status === 'online' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {modelStatus?.status || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Current Model</span>
                  <span className="text-sm text-gray-400">{modelStatus?.currentModel || 'None'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Available Models</span>
                  <span className="text-sm text-gray-400">{modelStatus?.models?.join(', ') || 'None'}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-white/20">
                <p className="text-xs text-gray-400 text-center">
                  AI features are currently running in demo mode with mock data.
                  Connect to Ollama for real-time AI analysis.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering AIEnhancedTradingAssistant:', error);
    return (
      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6 text-center">
        <p className="text-red-200 mb-4">Error rendering AI Assistant</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
        >
          Reload Page
        </button>
      </div>
    );
  }
}
