import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Brain, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Shield,
  Code,
  TrendingUp,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import VoiceCommandInput from '../components/VoiceCommandInput';

const VoiceCommandDemo: React.FC = () => {
  const [commandHistory, setCommandHistory] = useState<Array<{
    command: string;
    timestamp: string;
    response?: string;
    taskType?: string;
  }>>([]);

  const handleVoiceCommand = async (command: string) => {
    // Simulate AI response based on command type
    const lowerCommand = command.toLowerCase();
    let response = '';
    let taskType = 'general';

    if (lowerCommand.includes('loan') || lowerCommand.includes('borrow')) {
      taskType = 'lending';
      response = `Based on your voice command "${command}", I can help you with lending options. Here are the current rates: BTC at 65% LTV, ETH at 70% LTV, and stablecoins at 85% LTV. Would you like me to calculate specific borrowing amounts?`;
    } else if (lowerCommand.includes('security') || lowerCommand.includes('risk')) {
      taskType = 'security';
      response = `Security analysis for "${command}": I've identified potential risks in your portfolio. Your cross-chain exposure shows moderate risk (6/10). I recommend implementing additional security measures and diversifying across chains.`;
    } else if (lowerCommand.includes('code') || lowerCommand.includes('contract')) {
      taskType = 'development';
      response = `Code generation for "${command}": I'll create a secure smart contract with proper validation, access controls, and error handling. The contract will include comprehensive testing and documentation.`;
    } else if (lowerCommand.includes('strategy') || lowerCommand.includes('portfolio')) {
      taskType = 'strategy';
      response = `Portfolio strategy for "${command}": Based on current market conditions, I recommend a 40% ETH, 30% BTC, 20% stablecoins, and 10% altcoins allocation. This provides optimal risk-adjusted returns.`;
    } else {
      response = `I understand you said "${command}". This appears to be a general inquiry. I can help you with DeFi strategies, smart contract development, security analysis, or portfolio optimization. What would you like to focus on?`;
    }

    // Add to command history
    setCommandHistory(prev => [
      ...prev,
      {
        command,
        timestamp: new Date().toISOString(),
        response,
        taskType
      }
    ]);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const getTaskTypeIcon = (taskType: string) => {
    switch (taskType) {
      case 'lending': return <TrendingUp className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'development': return <Code className="h-4 w-4" />;
      case 'strategy': return <Lightbulb className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getTaskTypeColor = (taskType: string) => {
    switch (taskType) {
      case 'lending': return 'bg-blue-100 text-blue-800';
      case 'security': return 'bg-green-100 text-green-800';
      case 'development': return 'bg-purple-100 text-purple-800';
      case 'strategy': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Mic className="h-16 w-16 text-purple-600" />
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Voice Commands
              </h1>
              <p className="text-xl text-gray-600 mt-2">Natural Language AI Interaction</p>
            </p>
          </div>
          
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
            Experience the future of AI interaction with natural language voice commands. 
            Speak naturally to your Gemini AI Co-Pilot and watch it understand and respond to your requests.
          </p>

          <div className="flex items-center justify-center gap-4 mb-8">
            <Badge className="bg-green-100 text-green-800 px-4 py-2 text-lg">
              <CheckCircle className="h-5 w-5 mr-2" />
              Speech-to-Text
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-lg">
              <Volume2 className="h-5 w-5 mr-2" />
              Real-time Waveform
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 px-4 py-2 text-lg">
              <Brain className="h-5 w-5 mr-2" />
              AI Understanding
            </Badge>
          </div>
        </div>

        {/* Voice Command Interface */}
        <div className="max-w-4xl mx-auto mb-12">
          <VoiceCommandInput
            onCommandSubmit={handleVoiceCommand}
            placeholder="Try: 'Show me loan options for my BTC' or 'Analyze my portfolio security'"
            showExamples={true}
            autoSubmit={true}
          />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Mic className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Natural Language</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Speak naturally in plain English. No need to learn specific commands or syntax. 
                Just describe what you want, and the AI understands.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Volume2 className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Real-time Visualization</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                See your voice input visualized in real-time with animated waveforms. 
                Monitor audio levels and get visual feedback during recording.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Brain className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">AI Intelligence</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Advanced AI understands context and intent. Automatically determines the best 
                task type and provides intelligent responses to your voice commands.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Zap className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle className="text-lg">Instant Processing</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Voice commands are processed instantly with high accuracy. 
                Get responses in real-time as you speak naturally.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-lg">Secure & Private</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                All voice processing happens locally in your browser. 
                No voice data is stored or transmitted to external servers.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Code className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle className="text-lg">Multi-Purpose</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Use voice commands for code generation, security analysis, 
                portfolio management, documentation, and more.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Command History */}
        {commandHistory.length > 0 && (
          <Card className="max-w-4xl mx-auto mb-12">
            <CardHeader>
              <CardTitle className="text-lg">Voice Command History</CardTitle>
              <p className="text-sm text-gray-600">
                Your conversation history with the AI Co-Pilot
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {commandHistory.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <Mic className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900">Voice Command:</span>
                          {item.taskType && (
                            <Badge className={getTaskTypeColor(item.taskType)}>
                              {getTaskTypeIcon(item.taskType)}
                              {item.taskType}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3 italic">"{item.command}"</p>
                        
                        {item.response && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Brain className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">AI Response:</span>
                            </div>
                            <p className="text-blue-900 text-sm">{item.response}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Use Cases */}
        <Card className="max-w-4xl mx-auto mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Perfect Voice Commands for AEGIS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-purple-600">🎤 DeFi & Lending</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>"Show me loan options for my BTC collateral"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>"What's the best LTV ratio for ETH?"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>"Calculate borrowing costs for 1000 USDC"</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-600">🛡️ Security & Analysis</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>"Analyze my portfolio for security risks"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>"Check for vulnerabilities in my smart contracts"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>"What are the latest DeFi attack vectors?"</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-green-600">💻 Development</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>"Generate a secure lending smart contract"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>"Review my Solidity code for best practices"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>"Create unit tests for my DeFi protocol"</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-yellow-600">📊 Strategy & Portfolio</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>"Optimize my portfolio for maximum yield"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>"Develop a cross-chain arbitrage strategy"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>"What's my risk exposure across all chains?"</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Ready to Speak with Your AI?</CardTitle>
            <p className="text-purple-100 text-lg">
              Experience the power of natural language voice commands with Gemini AI Co-Pilot
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-purple-200 mb-4">
              Just click the microphone button and start speaking naturally. 
              Your AI teammate will understand and respond to your requests instantly.
            </p>
            <div className="flex items-center justify-center gap-2 text-purple-200">
              <Mic className="h-5 w-5" />
              <span>Click the microphone above to get started!</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoiceCommandDemo;
