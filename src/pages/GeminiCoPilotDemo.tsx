import React, { useState } from 'react';
import GeminiCoPilotComponent from '../components/GeminiCoPilot';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Code, 
  Shield, 
  Zap, 
  BookOpen, 
  Lightbulb, 
  Clock, 
  TrendingUp,
  CheckCircle,
  Rocket,
  Target,
  Users,
  Globe,
  Lock,
  Cpu
} from 'lucide-react';

const GeminiCoPilotDemo: React.FC = () => {
  const [showCoPilot, setShowCoPilot] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      setShowCoPilot(true);
    }
  };

  if (showCoPilot) {
    return <GeminiCoPilotComponent apiKey={apiKey} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Bot className="h-16 w-16 text-blue-600" />
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Gemini AI Co-Pilot
              </h1>
              <p className="text-xl text-gray-600 mt-2">Your Best Development Teammate</p>
            </p>
          </div>
          
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
            Experience how Google Gemini AI can be leveraged as your co-pilot and best teammate 
            to accelerate AEGIS project development and enhance various tasks through advanced AI capabilities.
          </p>

          <div className="flex items-center justify-center gap-4 mb-8">
            <Badge className="bg-green-100 text-green-800 px-4 py-2 text-lg">
              <CheckCircle className="h-5 w-5 mr-2" />
              Multimodal AI Processing
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-lg">
              <Cpu className="h-5 w-5 mr-2" />
              Advanced Reasoning
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 px-4 py-2 text-lg">
              <Rocket className="h-5 w-5 mr-2" />
              Project Acceleration
            </Badge>
          </div>
        </div>

        {/* API Key Setup */}
        <Card className="max-w-md mx-auto mb-16">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-6 w-6" />
              Get Started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleApiKeySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                <Rocket className="h-5 w-5 mr-2" />
                Launch Co-Pilot
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <a 
                href="https://makersuite.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                Get your API key from Google AI Studio →
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Code className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Code Generation & Review</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Generate production-ready code, review existing code, and get AI-powered suggestions 
                for improvements, security, and performance optimization.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Security Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                AI-powered security analysis for smart contracts, identifying vulnerabilities, 
                attack vectors, and providing comprehensive security recommendations.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Globe className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Cross-Chain Strategy</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Develop comprehensive cross-chain DeFi strategies with AI analysis of market conditions, 
                risk management, and optimization opportunities.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Lightbulb className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle className="text-lg">Problem Solving</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                AI co-pilot that acts as a senior developer teammate, analyzing complex problems 
                and providing multiple solution approaches with implementation guidance.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-lg">Documentation Generation</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Automatically generate comprehensive technical documentation, API references, 
                and deployment guides to accelerate project completion.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle className="text-lg">Performance Optimization</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                AI-powered analysis for code performance, gas optimization, and scalability 
                improvements specific to blockchain and DeFi applications.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Helps Section */}
        <Card className="mb-16">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">How Gemini AI Co-Pilot Accelerates Your AEGIS Project</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-600">🚀 Development Acceleration</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Generate production-ready code in minutes, not hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>AI-powered code review catches issues before deployment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Automated documentation saves days of manual work</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Instant problem-solving guidance for complex challenges</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-purple-600">🛡️ Security Enhancement</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>AI vulnerability detection across smart contracts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Real-time security analysis and recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>DeFi-specific attack vector identification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Security best practices enforcement</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Use Cases Section */}
        <Card className="mb-16">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Perfect For AEGIS Project Development</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4">
                <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Code className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-2">Smart Contracts</h4>
                <p className="text-sm text-gray-600">Generate, review, and secure Solidity contracts</p>
              </div>

              <div className="text-center p-4">
                <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Globe className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-semibold mb-2">Cross-Chain Logic</h4>
                <p className="text-sm text-gray-600">Develop ZetaChain integration strategies</p>
              </div>

              <div className="text-center p-4">
                <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="font-semibold mb-2">Security Protocols</h4>
                <p className="text-sm text-gray-600">AI-powered threat detection systems</p>
              </div>

              <div className="text-center p-4">
                <div className="p-3 bg-yellow-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Users className="h-8 w-8 text-yellow-600" />
                </div>
                <h4 className="font-semibold mb-2">User Interfaces</h4>
                <p className="text-sm text-gray-600">React components and UX optimization</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-3xl">Ready to Accelerate Your Development?</CardTitle>
            <p className="text-blue-100 text-lg">
              Experience the power of Google Gemini AI as your co-pilot and best teammate
            </p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => document.getElementById('api-key-form')?.scrollIntoView({ behavior: 'smooth' })}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Rocket className="h-5 w-5 mr-2" />
              Launch Gemini Co-Pilot Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GeminiCoPilotDemo;
