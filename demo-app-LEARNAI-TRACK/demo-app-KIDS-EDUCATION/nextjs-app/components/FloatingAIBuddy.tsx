'use client';

import { useState } from 'react';

interface GameProgress {
  gameType: string;
  category: string;
  score: number;
  totalQuestions: number;
  currentQuestion: number;
}

interface FloatingAIBuddyProps {
  gameType: string;
  gameProgress: GameProgress;
}

export default function FloatingAIBuddy({ gameType, gameProgress }: FloatingAIBuddyProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [speechBubble, setSpeechBubble] = useState<string>('');
  const [isThinking, setIsThinking] = useState(false);

  const handleBuddyClick = async () => {
    if (isThinking) return;
    
    setIsThinking(true);
    
    // Create contextual prompt based on game state
    let contextualPrompt = '';
    
    if (gameProgress.score === 0 && gameProgress.currentQuestion === 0) {
      contextualPrompt = `You are a friendly AI study buddy helping a 5-year-old with a ${gameProgress.gameType} game about ${gameProgress.category}. The child is just starting. Give them a warm, encouraging message to begin their learning adventure. Keep it short, fun, and motivating.`;
    } else if (gameProgress.score > 0) {
      contextualPrompt = `You are a friendly AI study buddy helping a 5-year-old with a ${gameProgress.gameType} game about ${gameProgress.category}. The child has a score of ${gameProgress.score} and is on question ${gameProgress.currentQuestion + 1}. Give them a positive, encouraging message. Keep it short, fun, and motivating.`;
    } else {
      contextualPrompt = `You are a friendly AI study buddy helping a 5-year-old with a ${gameProgress.gameType} game about ${gameProgress.category}. The child might be struggling. Give them a helpful, encouraging message to keep them motivated. Keep it short, fun, and supportive.`;
    }

    try {
      const response = await fetch('/api/ollama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: contextualPrompt })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.response) {
          setSpeechBubble(data.response);
          // Auto-hide speech bubble after 5 seconds
          setTimeout(() => setSpeechBubble(''), 5000);
        }
      }
    } catch (error) {
      console.error('Error getting AI buddy response:', error);
      setSpeechBubble('Need help? I\'m here to cheer you on! 🌟');
      setTimeout(() => setSpeechBubble(''), 5000);
    } finally {
      setIsThinking(false);
    }
  };

  const getBuddyEmoji = () => {
    if (isThinking) return '🤔';
    if (gameProgress.score > 0) return '😊';
    return '🤖';
  };

  const getBuddyMessage = () => {
    if (speechBubble) return speechBubble;
    if (gameProgress.score === 0) return 'Need help?';
    if (gameProgress.score > 0) return 'Great job!';
    return 'Oops, need help?';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 right-6 z-50">
      {/* Speech Bubble */}
      {speechBubble && (
        <div className="absolute bottom-16 right-0 bg-white text-gray-800 p-3 rounded-2xl shadow-lg max-w-xs mb-2 animate-bounce">
          <p className="text-sm font-medium">{getBuddyMessage()}</p>
          <div className="absolute bottom-0 right-4 transform translate-y-full">
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white"></div>
          </div>
        </div>
      )}

      {/* AI Buddy Avatar */}
      <button
        onClick={handleBuddyClick}
        disabled={isThinking}
        className={`
          w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 
          text-white text-2xl flex items-center justify-center shadow-lg 
          hover:from-purple-600 hover:to-blue-600 transition-all duration-300 
          transform hover:scale-110 active:scale-95 cursor-pointer
          ${isThinking ? 'animate-pulse' : ''}
        `}
        title="Click for AI help!"
      >
        {getBuddyEmoji()}
      </button>

      {/* Help Text */}
      <div className="text-center mt-2">
        <p className="text-white text-xs font-medium">AI Buddy</p>
      </div>
    </div>
  );
}
