import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  Brain, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useVoiceCommand } from '../hooks/useVoiceCommand';
import WaveformVisualizer from './WaveformVisualizer';

interface VoiceCommandInputProps {
  onCommandSubmit: (command: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showExamples?: boolean;
  autoSubmit?: boolean;
}

const VoiceCommandInput: React.FC<VoiceCommandInputProps> = ({
  onCommandSubmit,
  placeholder = "Try: 'Show me loan options for my BTC' or 'Borrow 1000 USDC at 70% LTV'",
  className,
  disabled = false,
  showExamples = true,
  autoSubmit = true
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const {
    isListening,
    transcript,
    confidence,
    error,
    currentWaveform,
    audioLevel,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    clearTranscript
  } = useVoiceCommand();

  // Auto-submit when transcript is finalized
  useEffect(() => {
    if (transcript && !isListening && autoSubmit && confidence > 0.7) {
      handleSubmit(transcript);
    }
  }, [transcript, isListening, confidence, autoSubmit]);

  // Clear input when transcript changes
  useEffect(() => {
    if (transcript) {
      setInputValue(transcript);
    }
  }, [transcript]);

  const handleSubmit = async (command: string) => {
    if (!command.trim() || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      await onCommandSubmit(command.trim());
      setInputValue('');
      clearTranscript();
    } catch (error) {
      console.error('Command submission failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(inputValue);
  };

  const handleVoiceCommand = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'bg-green-100 text-green-800';
    if (conf >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 0.8) return 'High';
    if (conf >= 0.6) return 'Medium';
    return 'Low';
  };

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-center text-gray-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <p>Speech recognition not supported in this browser</p>
            <p className="text-sm">Please use Chrome, Edge, or Safari for voice commands</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Main Input Area */}
      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Voice Command Button */}
            <div className="flex flex-col items-center gap-2">
              <Button
                type="button"
                onClick={handleVoiceCommand}
                disabled={disabled || isProcessing}
                variant={isListening ? "destructive" : "outline"}
                size="lg"
                className={`w-16 h-16 rounded-full transition-all duration-300 ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'hover:bg-blue-50'
                }`}
              >
                {isListening ? (
                  <MicOff className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>
              
              {/* Status Indicator */}
              <div className="text-center">
                {isListening && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Volume2 className="h-3 w-3 mr-1" />
                    Listening
                  </Badge>
                )}
                {error && (
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Error
                  </Badge>
                )}
              </div>
            </div>

            {/* Input Field */}
            <div className="flex-1">
              <form onSubmit={handleInputSubmit} className="space-y-3">
                <div className="relative">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled || isProcessing}
                    className="pr-20 text-lg"
                  />
                  
                  {/* Submit Button */}
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
                  </Button>
                </div>

                {/* Voice Input Status */}
                {isListening && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Brain className="h-4 w-4 text-purple-500" />
                    <span>Listening for voice command...</span>
                    {confidence > 0 && (
                      <Badge className={getConfidenceColor(confidence)}>
                        {getConfidenceLabel(confidence)} Confidence
                      </Badge>
                    )}
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Transcript Preview */}
                {transcript && !isListening && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-800">
                        Voice Command Detected:
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge className={getConfidenceColor(confidence)}>
                          {Math.round(confidence * 100)}% Confidence
                        </Badge>
                        <Button
                          type="button"
                          onClick={clearTranscript}
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-blue-600 hover:text-blue-800"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                    <p className="text-blue-900">{transcript}</p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Waveform Visualization */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="text-center mb-3">
            <h3 className="text-sm font-medium text-gray-700 mb-1">
              Voice Input Visualization
            </h3>
            <p className="text-xs text-gray-500">
              Real-time audio waveform and level monitoring
            </p>
          </div>
          
          <WaveformVisualizer
            waveformData={currentWaveform}
            audioLevel={audioLevel}
            isListening={isListening}
            height={80}
            width={400}
            barCount={40}
            barWidth={8}
            barGap={2}
            animate={true}
          />
        </CardContent>
      </Card>

      {/* Example Commands */}
      {showExamples && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              Example AI Commands:
            </h3>
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VoiceCommandInput;
