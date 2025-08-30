import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { 
  Brain, 
  Send, 
  Mic, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Lightbulb,
  TrendingUp,
  Shield,
  Code,
  Zap,
  Clock,
  MessageSquare
} from 'lucide-react';
import { AIAssistant as AIAssistantService, AICommand, AIResponse, AIContext } from '../services/AIAssistant';
import VoiceCommandInput from './VoiceCommandInput';

interface AIAssistantProps {
  apiKey?: string;
  className?: string;
  showVoiceCommands?: boolean;
  initialContext?: Partial<AIContext>;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ 
  apiKey, 
  className,
  showVoiceCommands = true,
  initialContext = {}
}) => {
  const [aiAssistant, setAiAssistant] = useState<AIAssistantService | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<AIResponse | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    command: AICommand;
    response: AIResponse;
  }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [showVoiceInterface, setShowVoiceInterface] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);

  // Initialize AI Assistant
  useEffect(() => {
    const assistant = new AIAssistantService(apiKey);
    setAiAssistant(assistant);
    
    // Set initial context
    if (initialContext) {
      assistant.setContext(initialContext);
    }
  }, [apiKey, initialContext]);

  // Set default context if none provided
  useEffect(() => {
    if (aiAssistant && Object.keys(initialContext).length === 0) {
      aiAssistant.setContext({
        userProfile: {
          experience: 'intermediate',
          focus: 'defi',
          chains: ['Ethereum', 'Polygon', 'Arbitrum', 'Optimism', 'Avalanche']
        },
        currentPortfolio: {
          assets: [
            { symbol: 'ETH', amount: 2.5, chain: 'Ethereum' },
            { symbol: 'BTC', amount: 0.1, chain: 'Bitcoin' },
            { symbol: 'USDC', amount: 5000, chain: 'Polygon' }
          ],
          totalValue: 8500,
          riskLevel: 'medium'
        },
        projectContext: {
          type: 'defi',
          stage: 'development',
          technologies: ['Solidity', 'React', 'TypeScript', 'Hardhat']
        }
      });
    }
  }, [aiAssistant, initialContext]);

  // Handle text input submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !aiAssistant || isProcessing) return;

    await processCommand(inputValue.trim());
  };

  // Handle voice command submission
  const handleVoiceCommand = async (command: string) => {
    if (!aiAssistant || isProcessing) return;
    await processCommand(command);
  };

  // Process command with AI
  const processCommand = async (commandText: string) => {
    setIsProcessing(true);
    setError(null);
    setCurrentResponse(null);

    try {
      const command: AICommand = {
        text: commandText,
        timestamp: new Date().toISOString(),
        context: 'user-query'
      };

      const response = await aiAssistant!.processCommand(command);

      // Add to conversation history
      setConversationHistory(prev => [...prev, { command, response }]);
      setCurrentResponse(response);

      // Clear input
      setInputValue('');

      // Scroll to response
      setTimeout(() => {
        responseRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process command');
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle voice interface
  const toggleVoiceInterface = () => {
    setShowVoiceInterface(!showVoiceInterface);
  };

  // Get task type icon
  const getTaskTypeIcon = (taskType: string) => {
    switch (taskType) {
      case 'lending': return <TrendingUp className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'development': return <Code className="h-4 w-4" />;
      case 'portfolio': return <Lightbulb className="h-4 w-4" />;
      case 'market': return <TrendingUp className="h-4 w-4" />;
      case 'cross-chain': return <Zap className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  // Get task type color
  const getTaskTypeColor = (taskType: string) => {
    switch (taskType) {
      case 'lending': return 'bg-blue-100 text-blue-800';
      case 'security': return 'bg-green-100 text-green-800';
      case 'development': return 'bg-purple-100 text-purple-800';
      case 'portfolio': return 'bg-yellow-100 text-yellow-800';
      case 'market': return 'bg-indigo-100 text-indigo-800';
      case 'cross-chain': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Get confidence label
  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  if (!aiAssistant) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Initializing AI Assistant...</p>
        </CardContent>
      </Card>
    );
  }

  const status = aiAssistant.getStatus();

  return (
    <div className={className}>
      {/* Header */}
      <Card className="mb-6">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-8 w-8 text-purple-600" />
            <div>
              <CardTitle className="text-2xl">AI Assistant - Natural Language Commands</CardTitle>
              <p className="text-gray-600">Powered by {status.mode}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <Badge className={status.available ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
              {status.available ? 'AI Available' : 'Demo Mode - AI Always Available'}
            </Badge>
            <Badge variant="outline">Capabilities: {status.capabilities.length}</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Input Section */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Try: 'Show me loan options for my BTC' or 'Borrow 1000 USDC at 70% LTV'"
                disabled={isProcessing}
                className="pr-20 text-lg"
              />
              
              <Button
                type="submit"
                disabled={!inputValue.trim() || isProcessing}
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Ask AI
              </Button>
            </div>

            {/* Voice Command Button */}
            {showVoiceCommands && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={toggleVoiceInterface}
                  className="flex items-center gap-2"
                >
                  <Mic className="h-4 w-4" />
                  Voice Command
                </Button>
              </div>
            )}
          </form>

          {/* Voice Command Interface */}
          {showVoiceCommands && showVoiceInterface && (
            <div className="mt-4">
              <VoiceCommandInput
                onCommandSubmit={handleVoiceCommand}
                placeholder="Speak your command naturally..."
                showExamples={false}
                autoSubmit={true}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Example Commands */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Example AI Commands:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>"Show loan options for my BTC"</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>"What's my risk across all chains?"</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>"Borrow 1000 USDC at 70% LTV"</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>"Optimize my portfolio for yield"</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>"Generate a secure lending contract"</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>"Analyze my portfolio security"</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Response */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Response:
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isProcessing ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">AI is processing your request...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : currentResponse ? (
            <div ref={responseRef} className="space-y-4">
              {/* Response Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={getTaskTypeColor(currentResponse.taskType)}>
                    {getTaskTypeIcon(currentResponse.taskType)}
                    {currentResponse.taskType.replace('-', ' ')}
                  </Badge>
                  <Badge className={getConfidenceColor(currentResponse.confidence)}>
                    {getConfidenceLabel(currentResponse.confidence)} Confidence
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  {new Date(currentResponse.timestamp).toLocaleTimeString()}
                </div>
              </div>

              {/* Main Response */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-900 leading-relaxed">{currentResponse.response}</p>
              </div>

              {/* Suggestions */}
              {currentResponse.suggestions.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                    Suggested Next Steps:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {currentResponse.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-gray-700">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Data */}
              {currentResponse.data && Object.keys(currentResponse.data).length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Additional Information:</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <pre className="whitespace-pre-wrap text-gray-700">
                      {JSON.stringify(currentResponse.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4" />
              <p>Ask me anything about DeFi, security, development, or portfolio management!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversation History */}
      {conversationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conversation History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {conversationHistory.map((item, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="space-y-2">
                    {/* User Command */}
                    <div className="bg-blue-50 p-2 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-blue-800">You:</span>
                        <Badge className={getTaskTypeColor(item.response.taskType)}>
                          {getTaskTypeIcon(item.response.taskType)}
                          {item.response.taskType.replace('-', ' ')}
                        </Badge>
                      </div>
                      <p className="text-blue-900 text-sm">"{item.command.text}"</p>
                    </div>
                    
                    {/* AI Response */}
                    <div className="bg-green-50 p-2 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <Brain className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">AI:</span>
                        <Badge className={getConfidenceColor(item.response.confidence)}>
                          {Math.round(item.response.confidence * 100)}% Confidence
                        </Badge>
                      </div>
                      <p className="text-green-900 text-sm">{item.response.response}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIAssistant;
