import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  AlertCircle,
  Info,
  Mic,
  Volume2,
  Brain
} from 'lucide-react';
import { GeminiCoPilot, CoPilotContext, CoPilotResponse } from '../services/GeminiCoPilot';
import VoiceCommandInput from './VoiceCommandInput';

interface GeminiCoPilotProps {
  apiKey?: string;
}

const GeminiCoPilotComponent: React.FC<GeminiCoPilotProps> = ({ apiKey }) => {
  const [copilot, setCopilot] = useState<GeminiCoPilot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState('');
  const [response, setResponse] = useState<CoPilotResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [conversationHistory, setConversationHistory] = useState<Array<{
    type: 'user' | 'ai';
    content: string;
    timestamp: string;
    taskType?: string;
  }>>([]);
  
  // Context state
  const [context, setContext] = useState<CoPilotContext>({
    projectType: 'defi',
    currentTask: 'Cross-chain DeFi strategy development',
    userExperience: 'intermediate',
    preferredLanguage: 'typescript',
    focusArea: 'smart-contracts'
  });

  // Task-specific state
  const [codeInput, setCodeInput] = useState('');
  const [requirements, setRequirements] = useState('');
  const [problem, setProblem] = useState('');
  const [constraints, setConstraints] = useState<string[]>(['Performance', 'Security', 'Scalability']);

  const copilotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (apiKey) {
      const newCopilot = new GeminiCoPilot(apiKey);
      setCopilot(newCopilot);
    }
  }, [apiKey]);

  const handleTaskExecution = async (taskType: string, customInput?: string) => {
    if (!copilot) {
      setError('Gemini AI Co-Pilot not available. Please check your API key.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      let result: CoPilotResponse;
      let userInput = customInput || '';

      switch (taskType) {
        case 'code-review':
          userInput = customInput || codeInput || '// Sample code for review';
          result = await copilot.reviewCode(
            userInput,
            context.preferredLanguage,
            context.currentTask
          );
          break;

        case 'security-analysis':
          userInput = customInput || codeInput || '// Sample smart contract for security analysis';
          result = await copilot.analyzeSecurity(
            userInput,
            context
          );
          break;

        case 'cross-chain-strategy':
          userInput = customInput || 'Develop cross-chain DeFi strategy';
          result = await copilot.developCrossChainStrategy(
            { experience: context.userExperience, focus: context.focusArea },
            { market: 'bullish', volatility: 'medium' },
            'moderate'
          );
          break;

        case 'problem-solving':
          userInput = customInput || problem || 'How to optimize cross-chain transaction costs?';
          result = await copilot.solveProblem(
            userInput,
            context,
            constraints
          );
          break;

        case 'documentation':
          userInput = customInput || codeInput || '// Sample code for documentation';
          result = await copilot.generateDocumentation(
            userInput,
            `AEGIS ${context.projectType} project`,
            'technical'
          );
          break;

        case 'code-generation':
          userInput = customInput || requirements || 'Create a secure DeFi lending function';
          result = await copilot.generateCode(
            userInput,
            context.preferredLanguage,
            context
          );
          break;

        default:
          throw new Error('Unknown task type');
      }

      setResponse(result);
      setCurrentTask(`Completed: ${taskType.replace('-', ' ')}`);
      
      // Add to conversation history
      setConversationHistory(prev => [
        ...prev,
        {
          type: 'user',
          content: userInput,
          timestamp: new Date().toISOString(),
          taskType
        },
        {
          type: 'ai',
          content: result.solution,
          timestamp: new Date().toISOString(),
          taskType
        }
      ]);
      
      // Scroll to response
      setTimeout(() => {
        copilotRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Task execution failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle voice command submission
  const handleVoiceCommand = async (command: string) => {
    // Analyze the command to determine the task type
    const lowerCommand = command.toLowerCase();
    let taskType = 'problem-solving'; // Default
    
    if (lowerCommand.includes('code') || lowerCommand.includes('review') || lowerCommand.includes('improve')) {
      taskType = 'code-review';
    } else if (lowerCommand.includes('security') || lowerCommand.includes('vulnerability') || lowerCommand.includes('attack')) {
      taskType = 'security-analysis';
    } else if (lowerCommand.includes('strategy') || lowerCommand.includes('cross-chain') || lowerCommand.includes('portfolio')) {
      taskType = 'cross-chain-strategy';
    } else if (lowerCommand.includes('document') || lowerCommand.includes('write') || lowerCommand.includes('explain')) {
      taskType = 'documentation';
    } else if (lowerCommand.includes('generate') || lowerCommand.includes('create') || lowerCommand.includes('build')) {
      taskType = 'code-generation';
    }
    
    // Execute the task with the voice command
    await handleTaskExecution(taskType, command);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!copilot) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            Gemini AI Co-Pilot Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Co-Pilot Not Available</h3>
            <p className="text-gray-600 mb-4">
              Please provide a valid Gemini API key to initialize the AI Co-Pilot.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg text-left">
              <h4 className="font-semibold mb-2">To get started:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Visit <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a></li>
                <li>Create a new API key</li>
                <li>Add it to your environment variables</li>
                <li>Restart the application</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const status = copilot.getStatus();

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bot className="h-12 w-12 text-blue-600" />
            <div>
              <CardTitle className="text-3xl">Gemini AI Co-Pilot</CardTitle>
              <p className="text-gray-600">Your Best Development Teammate</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Badge className={getStatusColor(status.available ? 'healthy' : 'error')}>
              {status.available ? 'Available' : 'Unavailable'}
            </Badge>
            <Badge variant="outline">Model: {status.model}</Badge>
            <Badge variant="outline">Capabilities: {status.capabilities.length}</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Voice Command Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-purple-600" />
            Voice Commands
          </CardTitle>
          <p className="text-sm text-gray-600">
            Use natural language voice commands to interact with your AI Co-Pilot
          </p>
        </CardHeader>
        <CardContent>
          <VoiceCommandInput
            onCommandSubmit={handleVoiceCommand}
            placeholder="Try: 'Analyze this code for security vulnerabilities' or 'Generate a DeFi lending contract'"
            showExamples={true}
            autoSubmit={true}
          />
        </CardContent>
      </Card>

      {/* Main Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Task Selection */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI Co-Pilot Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => handleTaskExecution('code-review')}
                disabled={isLoading}
                className="w-full justify-start"
                variant="outline"
              >
                <Code className="h-4 w-4 mr-2" />
                Code Review & Improvement
              </Button>
              
              <Button
                onClick={() => handleTaskExecution('security-analysis')}
                disabled={isLoading}
                className="w-full justify-start"
                variant="outline"
              >
                <Shield className="h-4 w-4 mr-2" />
                Security Analysis
              </Button>
              
              <Button
                onClick={() => handleTaskExecution('cross-chain-strategy')}
                disabled={isLoading}
                className="w-full justify-start"
                variant="outline"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Cross-Chain Strategy
              </Button>
              
              <Button
                onClick={() => handleTaskExecution('problem-solving')}
                disabled={isLoading}
                className="w-full justify-start"
                variant="outline"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Problem Solving
              </Button>
              
              <Button
                onClick={() => handleTaskExecution('documentation')}
                disabled={isLoading}
                className="w-full justify-start"
                variant="outline"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Documentation Generation
              </Button>
              
              <Button
                onClick={() => handleTaskExecution('code-generation')}
                disabled={isLoading}
                className="w-full justify-start"
                variant="outline"
              >
                <Code className="h-4 w-4 mr-2" />
                Code Generation
              </Button>
            </CardContent>
          </Card>

          {/* Context Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium">Project Type</label>
                <Select
                  value={context.projectType}
                  onValueChange={(value: any) => setContext({ ...context, projectType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="defi">DeFi</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="cross-chain">Cross-Chain</SelectItem>
                    <SelectItem value="ai">AI/ML</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Experience Level</label>
                <Select
                  value={context.userExperience}
                  onValueChange={(value: any) => setContext({ ...context, userExperience: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Preferred Language</label>
                <Select
                  value={context.preferredLanguage}
                  onValueChange={(value: any) => setContext({ ...context, preferredLanguage: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="solidity">Solidity</SelectItem>
                    <SelectItem value="rust">Rust</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Panel - Input & Context */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Task Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Code Input</label>
                <Textarea
                  placeholder="Paste your code here for review, analysis, or documentation..."
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  rows={6}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Requirements/Problem</label>
                <Textarea
                  placeholder="Describe what you need or the problem you're facing..."
                  value={requirements || problem}
                  onChange={(e) => {
                    setRequirements(e.target.value);
                    setProblem(e.target.value);
                  }}
                  rows={4}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Current Task</label>
                <Input
                  placeholder="What are you working on?"
                  value={context.currentTask}
                  onChange={(e) => setContext({ ...context, currentTask: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Capabilities Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Co-Pilot Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {status.capabilities.map((capability, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{capability}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Results */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Co-Pilot Response</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">AI Co-Pilot is thinking...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600">{error}</p>
                </div>
              ) : response ? (
                <div ref={copilotRef} className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Solution</h4>
                    <p className="text-blue-800">{response.solution}</p>
                  </div>
                  
                  {response.code && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Generated Code</h4>
                      <pre className="text-sm overflow-x-auto bg-gray-100 p-3 rounded">
                        <code>{response.code}</code>
                      </pre>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold mb-2">Explanation</h4>
                    <p className="text-gray-700">{response.explanation}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Next Steps</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {response.nextSteps.map((step, index) => (
                        <li key={index} className="text-gray-700">{step}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Confidence</h4>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${response.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {Math.round(response.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Difficulty</h4>
                      <Badge className={getDifficultyColor(response.difficulty)}>
                        {response.difficulty}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Estimated Time</h4>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{response.estimatedTime}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Related Concepts</h4>
                    <div className="flex flex-wrap gap-2">
                      {response.relatedConcepts.map((concept, index) => (
                        <Badge key={index} variant="secondary">
                          {concept}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Bot className="h-12 w-12 mx-auto mb-4" />
                  <p>Select a task or use voice commands to get started with your AI Co-Pilot</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Conversation History */}
      {conversationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conversation History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {conversationHistory.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-blue-50 border-l-4 border-blue-500' 
                      : 'bg-green-50 border-l-4 border-green-500'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      message.type === 'user' ? 'bg-blue-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {message.type === 'user' ? 'You' : 'AI Co-Pilot'}
                        </span>
                        {message.taskType && (
                          <Badge variant="outline" className="text-xs">
                            {message.taskType.replace('-', ' ')}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Capabilities Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Why Gemini AI Co-Pilot?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: copilot.getCapabilitiesSummary().replace(/\n/g, '<br>') }} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeminiCoPilotComponent;
