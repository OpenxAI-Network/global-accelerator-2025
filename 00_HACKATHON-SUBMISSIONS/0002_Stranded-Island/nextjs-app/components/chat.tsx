"use client";

import { useState, useEffect } from "react";

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

  // Initialize the game with welcome message and start button
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      type: 'ai',
      content: `🏝️ **STRANDED ISLAND ADVENTURE** 🏝️

Welcome to your mysterious island adventure! You're about to embark on a journey where every choice matters and the story unfolds based on your decisions.

Ready to begin your adventure?`,
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
      setMessage("");
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
      content: `🏝️ **STRANDED ISLAND ADVENTURE** 🏝️

Welcome to your mysterious island adventure! You're about to embark on a journey where every choice matters and the story unfolds based on your decisions.

Ready to begin your adventure?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const getMilestoneProgress = () => {
    const totalMilestones = 5;
    const completed = storyState.currentMilestone - 1; // Use current milestone as progress
    return Math.round((completed / totalMilestones) * 100);
  };

  return (
    <div className="min-h-screen island-bg p-4">
      <div className="story-container">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-storm-gray mb-2 text-shadow">
            🏝️ Stranded Island Adventure 🏝️
          </h1>
          <p className="text-ocean-blue font-medium">
            A choose-your-own-adventure story powered by AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Story Area */}
          <div className="lg:col-span-3">
            <div className="bg-white/95 rounded-lg p-6 shadow-lg min-h-[500px]">
              <div className="space-y-4 mb-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-lg ${
                      msg.type === 'user'
                        ? 'bg-ocean-blue text-white ml-8'
                        : 'bg-jungle-green text-white mr-8'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <div className="text-xs opacity-75 mt-2">
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>

              {loading && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-jungle-green"></div>
                  <p className="text-storm-gray mt-2">The story unfolds...</p>
                </div>
              )}

              {error && (
                <div className="bg-coral-pink text-white p-3 rounded-lg mb-4">
                  Error: {error}
                </div>
              )}

              {/* Input Area */}
              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your choice or message..."
                  disabled={loading}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jungle-green focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !message.trim()}
                  className="px-6 py-3 bg-jungle-green text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar - Stats & Progress */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {/* Game Stats */}
              <div className="bg-white/95 rounded-lg p-4 shadow-lg">
                <h3 className="text-lg font-bold text-storm-gray mb-3">📊 Game Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Health:</span>
                    <span className={`font-bold ${storyState.health > 50 ? 'text-jungle-green' : 'text-coral-pink'}`}>
                      {storyState.health}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-medium text-ocean-blue">{storyState.currentLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Milestone:</span>
                    <span className="font-medium text-sunset-orange">
                      {storyState.currentMilestone}/5
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Step:</span>
                    <span className="font-medium text-purple-600">
                      {storyState.milestoneStep}/2
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-white/95 rounded-lg p-4 shadow-lg">
                <h3 className="text-lg font-bold text-storm-gray mb-3">🎯 Story Progress</h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div 
                    className="bg-gradient-to-r from-jungle-green to-ocean-blue h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${getMilestoneProgress()}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Milestone {storyState.currentMilestone} of 5
                </p>
                <p className="text-xs text-gray-500 text-center">
                  Step {storyState.milestoneStep} of 2
                </p>
              </div>

              {/* Recent Choices */}
              <div className="bg-white/95 rounded-lg p-4 shadow-lg">
                <h3 className="text-lg font-bold text-storm-gray mb-3">🎯 Recent Choices</h3>
                {storyState.choices.length === 0 ? (
                  <p className="text-gray-500 text-sm">No choices made yet</p>
                ) : (
                  <div className="space-y-2">
                    {storyState.choices.slice(-3).map((choice, index) => (
                      <div key={index} className="text-sm text-gray-700 bg-gray-100 p-2 rounded">
                        {choice}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Start Game Button */}
              {!gameStarted && (
                <button
                  onClick={startGame}
                  className="w-full p-3 bg-jungle-green text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  🚀 Start Game
                </button>
              )}

              {/* Reset Game Button */}
              {gameStarted && (
                <button
                  onClick={resetGame}
                  className="w-full p-3 bg-storm-gray text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  🔄 Reset Game
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
