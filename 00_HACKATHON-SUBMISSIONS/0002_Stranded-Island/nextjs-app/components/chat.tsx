"use client";

import { useState, useEffect, useRef } from "react";

interface StoryState {
  choices: string[];
  currentLocation: string;
  health: number;
  currentMilestone: number;
  milestoneStep: number;
  previousChoices: string[];
  lastAIMessage?: string;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export function Chat() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [storyState, setStoryState] = useState<StoryState>({
    choices: [],
    currentLocation: "Unknown Shore",
    health: 100,
    currentMilestone: 1,
    milestoneStep: 1,
    previousChoices: []
  });

  // Ref for auto-scrolling to new content
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize the game with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      type: 'ai',
      content: `

Welcome to your mysterious island adventure. You're about to embark on a journey where every choice matters and the story unfolds based on your decisions.

Type anything in the textbox below to begin your adventure.`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  const startGame = async () => {
    setGameStarted(true);
    setLoading(true);
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "start",
          storyState: {
            ...storyState,
            currentMilestone: 1,
            milestoneStep: 1,
            previousChoices: []
          }
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Update story state based on AI response
        updateStoryState(data.message, data.currentMilestone, data.updatedStoryState);
      } else {
        setError(data.error || "Failed to start game");
      }
    } catch (err: any) {
      setError(err.message || "Failed to start game");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    // Check if this is a start command - now accepts ANY text input
    if (!gameStarted) {
      // Start the game with any input
      await startGame();
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          storyState: storyState
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Debug milestone advancement
        console.log('🎯 AI Response Data:', {
          currentMilestone: data.currentMilestone,
          nextMilestone: data.nextMilestone,
          milestoneStep: data.milestoneStep
        });
        
        // Update story state based on AI response
        updateStoryState(data.message, data.currentMilestone, data.updatedStoryState);
      } else {
        setError(data.error || "Failed to get response");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send message");
    } finally {
      setLoading(false);
      setMessage(""); // Clear the input box after sending
    }
  };

  const updateStoryState = (aiResponse: string, newMilestone?: number, updatedState?: StoryState) => {
    let newState = { ...storyState };
    
    // If we have an updated state from the API, use it
    if (updatedState) {
      newState = { ...updatedState };
    } else {
      // Update milestone if provided - THIS IS CRITICAL FOR STORY PROGRESSION
      if (newMilestone && newMilestone !== newState.currentMilestone) {
        console.log(`🎯 Milestone advancing from ${newState.currentMilestone} to ${newMilestone}`);
        newState.currentMilestone = newMilestone;
        
        // Add milestone to completed list
        const milestoneNames = [
          "Wake Up",
          "Survival & Search", 
          "Evidence Discovery",
          "Encounter",
          "Ending"
        ];
        
        if (newMilestone <= milestoneNames.length) {
          const milestoneName = milestoneNames[newMilestone - 1];
          // Note: We'll track milestones differently now
        }
      }
    }

    // Update location based on response
    if (aiResponse.toLowerCase().includes('beach')) {
      newState.currentLocation = "Beach";
    } else if (aiResponse.toLowerCase().includes('jungle') || aiResponse.toLowerCase().includes('forest')) {
      newState.currentLocation = "Jungle";
    } else if (aiResponse.toLowerCase().includes('coral') || aiResponse.toLowerCase().includes('reef')) {
      newState.currentLocation = "Coral Reef";
    } else if (aiResponse.toLowerCase().includes('higher ground') || aiResponse.toLowerCase().includes('cliff')) {
      newState.currentLocation = "High Ground";
    }

    // Update health based on choices (simple logic)
    if (aiResponse.toLowerCase().includes('hurt') || aiResponse.toLowerCase().includes('damage') || aiResponse.toLowerCase().includes('injury')) {
      newState.health = Math.max(0, newState.health - 10);
    } else if (aiResponse.toLowerCase().includes('heal') || aiResponse.toLowerCase().includes('rest') || aiResponse.toLowerCase().includes('recover')) {
      newState.health = Math.min(100, newState.health + 15);
    }

    setStoryState(newState);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetGame = () => {
    setMessages([]);
    setStoryState({
      choices: [],
      currentLocation: "Unknown Shore",
      health: 100,
      currentMilestone: 1,
      milestoneStep: 1,
      previousChoices: []
    });
    setError("");
    setGameStarted(false); // Reset game started state
    
    // Re-initialize with welcome message
    const welcomeMessage: Message = {
      id: '1',
      type: 'ai',
      content: `

Welcome to your mysterious island adventure. You're about to embark on a journey where every choice matters and the story unfolds based on your decisions.

Type anything in the textbox below to begin your adventure.`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-sky-300 via-cyan-300 to-teal-300">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 header-glass shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-white text-shadow">
                Stranded Island
              </h1>
              <p className="text-white/90 text-sm font-medium mt-1">
                A choose-your-own-adventure story powered by AI
              </p>
            </div>
            
            {/* Game Controls */}
            <div className="flex items-center gap-3">
              {gameStarted && (
                <button
                  onClick={resetGame}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm shadow-lg backdrop-blur-sm"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Floating Text */}
      <div className="pt-24 pb-32"> {/* Top padding for fixed header, bottom padding for fixed input */}
        <div className="max-w-4xl mx-auto px-6">
          {/* Story Container - Floating Text */}
          <div className="min-h-[600px] max-h-[70vh] overflow-y-auto">
            <div className="space-y-8">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${
                    msg.type === 'user'
                      ? 'text-right'
                      : 'text-left'
                  }`}
                >
                  <div className="text-white leading-relaxed">
                    <div className="whitespace-pre-wrap text-lg font-light">
                      {msg.content}
                    </div>
                    <div className="text-white/70 text-xs mt-3 opacity-70">
                      {msg.type === 'user' ? 'You' : 'AI'} • {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/60"></div>
                    <span className="text-white/80 text-lg font-light">The story unfolds...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-red-200 text-center mx-12">
                  <div className="flex items-center gap-2">
                    <span>Error:</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Invisible div for auto-scrolling */}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Input Area */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/20 backdrop-blur-md border-t border-white/30 shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="message-input" className="block text-sm font-medium text-white/90 mb-2">
                {!gameStarted ? "Type anything to begin your adventure" : "What would you like to do?"}
              </label>
              <input
                id="message-input"
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={!gameStarted ? "Type anything to start..." : "Type your choice or message..."}
                disabled={loading}
                className="w-full p-4 bg-white/20 border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-transparent text-lg text-white placeholder-white/60 transition-all duration-200 backdrop-blur-sm"
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={loading || !message.trim()}
              className="px-8 py-4 bg-white/30 text-white rounded-xl hover:bg-white/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl backdrop-blur-sm"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
          
          {/* Subtle Progress Indicator */}
          {gameStarted && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-white/70">
                <span>Milestone {storyState.currentMilestone} of 5</span>
                <span>•</span>
                <span>Step {storyState.milestoneStep} of 2</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
