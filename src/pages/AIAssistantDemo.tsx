import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  CheckCircle, 
  Zap, 
  Shield, 
  Code, 
  TrendingUp,
  Lightbulb,
  MessageSquare,
  Settings,
  BarChart3
} from 'lucide-react';
import AIAssistant from '../components/AIAssistant';
import { AIContext } from '../services/AIAssistant';

const AIAssistantDemo: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [showAssistant, setShowAssistant] = useState(false);
  const [contextMode, setContextMode] = useState<'basic' | 'advanced' | 'custom'>('basic');

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      setShowAssistant(true);
    }
  };

  const getContextForMode = (mode: string): Partial<AIContext> => {
    switch (mode) {
      case 'basic':
        return {
          userProfile: {
            experience: 'intermediate',
            focus: 'defi',
            chains: ['Ethereum', 'Polygon', 'Arbitrum']
          }
        };
      
      case 'advanced':
        return {
          userProfile: {
            experience: 'expert',
            focus: 'development',
            chains: ['Ethereum', 'Polygon', 'Arbitrum', 'Optimism', 'Avalanche', 'ZetaChain']
          },
          currentPortfolio: {
            assets: [
              { symbol: 'ETH', amount: 5.0, chain: 'Ethereum' },
              { symbol: 'BTC', amount: 0.25, chain: 'Bitcoin' },
              { symbol: 'USDC', amount: 15000, chain: 'Polygon' },
              { symbol: 'SOL', amount: 50, chain: 'Solana' }
            ],
            totalValue: 25000,
            riskLevel: 'high'
          },
          projectContext: {
            type: 'defi',
            stage: 'deployed',
            technologies: ['Solidity', 'React', 'TypeScript', 'Hardhat', 'Foundry', 'OpenZeppelin']
          }
        };
      
      case 'custom':
        return {
          userProfile: {
            experience: 'beginner',
            focus: 'security',
            chains: ['Ethereum', 'Polygon']
          },
          currentPortfolio: {
            assets: [
              { symbol: 'ETH', amount: 1.0, chain: 'Ethereum' },
              { symbol: 'USDC', amount: 2000, chain: 'Polygon' }
            ],
            totalValue: 5000,
            riskLevel: 'low'
          },
          projectContext: {
            type: 'nft',
            stage: 'planning',
            technologies: ['Solidity', 'React', 'IPFS']
          }
        };
      
      default:
        return {};
    }
  };

  if (showAssistant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="h-12 w-12 text-purple-600" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  AI Assistant Demo
                </h1>
                <p className="text-xl text-gray-600 mt-2">Experience Real AI-Powered Natural Language Processing</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4 mb-6">
              <Badge className="bg-green-100 text-green-800 px-4 py-2 text-lg">
                <CheckCircle className="h-5 w-5 mr-2" />
                Fully Functional
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-lg">
                <Brain className="h-5 w-5 mr-2" />
                Real AI Processing
              </Badge>
              <Badge className="bg-purple-100 text-purple-800 px-4 py-2 text-lg">
                <MessageSquare className="h-5 w-5 mr-2" />
                Natural Language
              </Badge>
            </div>

            <Button
              onClick={() => setShowAssistant(false)}
              variant="outline"
              className="mb-4"
            >
              ← Back to Setup
            </Button>
          </div>

          {/* AI Assistant Component */}
          <div className="max-w-6xl mx-auto">
            <AIAssistant
              apiKey={apiKey}
              showVoiceCommands={true}
              initialContext={getContextForMode(contextMode)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Brain className="h-16 w-16 text-purple-600" />
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Assistant
              </h1>
              <p className="text-xl text-gray-600 mt-2">Natural Language Commands with Real AI Processing</p>
            </p>
          </div>
          
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
            Experience a fully functional AI assistant that understands natural language commands, 
            provides intelligent responses, and helps you with DeFi, security, development, and portfolio management.
          </p>

          <div className="flex items-center justify-center gap-4 mb-8">
            <Badge className="bg-green-100 text-green-800 px-4 py-2 text-lg">
              <CheckCircle className="h-5 w-5 mr-2" />
              Real AI Processing
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-lg">
              <Brain className="h-5 w-5 mr-2" />
              Natural Language
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 px-4 py-2 text-lg">
              <Zap className="h-5 w-5 mr-2" />
              Instant Responses
            </Badge>
          </div>
        </div>

        {/* Setup Section */}
        <Card className="max-w-2xl mx-auto mb-16">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Get Started with AI Assistant</CardTitle>
            <p className="text-gray-600">
              Configure your AI assistant and start asking questions in natural language
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleApiKeySubmit} className="space-y-6">
              {/* API Key Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gemini API Key (Optional)
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key for enhanced AI"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Leave empty to use demo mode with built-in AI capabilities
                </p>
              </div>

              {/* Context Mode Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Context Mode
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    type="button"
                    variant={contextMode === 'basic' ? 'default' : 'outline'}
                    onClick={() => setContextMode('basic')}
                    className="flex flex-col items-center gap-2 p-4 h-auto"
                  >
                    <Shield className="h-5 w-5" />
                    <span>Basic</span>
                    <span className="text-xs text-gray-500">Simple DeFi user</span>
                  </Button>
                  
                  <Button
                    type="button"
                    variant={contextMode === 'advanced' ? 'default' : 'outline'}
                    onClick={() => setContextMode('advanced')}
                    className="flex flex-col items-center gap-2 p-4 h-auto"
                  >
                    <Code className="h-5 w-5" />
                    <span>Advanced</span>
                    <span className="text-xs text-gray-500">Expert developer</span>
                  </Button>
                  
                  <Button
                    type="button"
                    variant={contextMode === 'custom' ? 'default' : 'outline'}
                    onClick={() => setContextMode('custom')}
                    className="flex flex-col items-center gap-2 p-4 h-auto"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Custom</span>
                    <span className="text-xs text-gray-500">NFT project focus</span>
                  </Button>
                </div>
              </div>

              {/* Launch Button */}
              <Button type="submit" size="lg" className="w-full">
                <Brain className="h-5 w-5 mr-2" />
                Launch AI Assistant
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <a 
                href="https://makersuite.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline text-sm"
              >
                Get your Gemini API key from Google AI Studio →
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Real AI Processing</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Powered by Google Gemini AI or advanced demo AI with natural language processing, 
                intent recognition, and contextual understanding.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Natural Language</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Ask questions in plain English. No need to learn specific commands or syntax. 
                The AI understands context and provides intelligent responses.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">DeFi Expertise</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Specialized knowledge in DeFi, lending, security, portfolio management, 
                cross-chain operations, and smart contract development.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Lightbulb className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle className="text-lg">Smart Suggestions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get actionable next steps and recommendations based on your queries. 
                The AI provides context-aware suggestions for optimal results.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle className="text-lg">Context Awareness</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                AI remembers your profile, portfolio, and project context to provide 
                personalized and relevant responses to your specific situation.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Zap className="h-6 w-6 text-pink-600" />
                </div>
                <CardTitle className="text-lg">Instant Responses</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get immediate AI-powered responses with confidence scoring, 
                task classification, and structured data for actionable insights.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Use Cases */}
        <Card className="max-w-4xl mx-auto mb-16">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Perfect for AEGIS Project Development</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-purple-600">🎤 DeFi & Lending</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>"What are the best LTV ratios for my assets?"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>"Compare lending pool APYs across chains"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>"Calculate optimal borrowing amounts"</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-600">🛡️ Security & Analysis</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>"Analyze my portfolio security risks"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>"Check for smart contract vulnerabilities"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>"Review my security best practices"</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-green-600">💻 Development</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>"Generate a secure lending contract"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>"Review my Solidity code"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>"Optimize gas usage in my contracts"</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-yellow-600">📊 Portfolio & Strategy</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>"Optimize my portfolio for maximum yield"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>"Develop cross-chain arbitrage strategy"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>"Analyze my risk across all chains"</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Ready to Experience Real AI?</CardTitle>
            <p className="text-purple-100 text-lg">
              Launch your AI assistant and start asking questions in natural language
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-purple-200 mb-4">
              The AI assistant is fully functional with real natural language processing, 
              context awareness, and intelligent responses. No more mock data - experience 
              the power of AI-powered DeFi assistance!
            </p>
            <div className="flex items-center justify-center gap-2 text-purple-200">
              <Brain className="h-5 w-5" />
              <span>Configure your settings above and launch the AI assistant!</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIAssistantDemo;
