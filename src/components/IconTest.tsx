import React from 'react';
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

const IconTest: React.FC = () => {
  return (
    <div className="p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-8">Icon Test - All Icons Should Be Visible</h1>
      
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="flex flex-col items-center p-4 border rounded">
          <Brain className="h-8 w-8 text-purple-600 mb-2" />
          <span className="text-sm">Brain</span>
        </div>
        <div className="flex flex-col items-center p-4 border rounded">
          <Send className="h-8 w-8 text-blue-600 mb-2" />
          <span className="text-sm">Send</span>
        </div>
        <div className="flex flex-col items-center p-4 border rounded">
          <Mic className="h-8 w-8 text-green-600 mb-2" />
          <span className="text-sm">Mic</span>
        </div>
        <div className="flex flex-col items-center p-4 border rounded">
          <Loader2 className="h-8 w-8 text-orange-600 mb-2 animate-spin" />
          <span className="text-sm">Loader</span>
        </div>
        <div className="flex flex-col items-center p-4 border rounded">
          <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
          <span className="text-sm">Check</span>
        </div>
        <div className="flex flex-col items-center p-4 border rounded">
          <AlertCircle className="h-8 w-8 text-red-600 mb-2" />
          <span className="text-sm">Alert</span>
        </div>
        <div className="flex flex-col items-center p-4 border rounded">
          <Lightbulb className="h-8 w-8 text-yellow-600 mb-2" />
          <span className="text-sm">Lightbulb</span>
        </div>
        <div className="flex flex-col items-center p-4 border rounded">
          <TrendingUp className="h-8 w-8 text-indigo-600 mb-2" />
          <span className="text-sm">Trending</span>
        </div>
        <div className="flex flex-col items-center p-4 border rounded">
          <Shield className="h-8 w-8 text-gray-600 mb-2" />
          <span className="text-sm">Shield</span>
        </div>
        <div className="flex flex-col items-center p-4 border rounded">
          <Code className="h-8 w-8 text-purple-600 mb-2" />
          <span className="text-sm">Code</span>
        </div>
        <div className="flex flex-col items-center p-4 border rounded">
          <Zap className="h-8 w-8 text-yellow-600 mb-2" />
          <span className="text-sm">Zap</span>
        </div>
        <div className="flex flex-col items-center p-4 border rounded">
          <Clock className="h-8 w-8 text-blue-600 mb-2" />
          <span className="text-sm">Clock</span>
        </div>
        <div className="flex flex-col items-center p-4 border rounded">
          <MessageSquare className="h-8 w-8 text-green-600 mb-2" />
          <span className="text-sm">Message</span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-gray-600 mb-4">
          If you can see all the icons above, then lucide-react is working correctly.
        </p>
        <p className="text-gray-600">
          If icons are missing, there might be a CSS or import issue.
        </p>
      </div>
    </div>
  );
};

export default IconTest;
