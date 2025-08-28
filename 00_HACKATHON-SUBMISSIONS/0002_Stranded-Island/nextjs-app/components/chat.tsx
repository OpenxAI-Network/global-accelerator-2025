"use client";

import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface StoryState {
  choices: string[];
  currentLocation: string;
  health: number;
  currentMilestone: number;
  milestoneStep: number;
  previousChoices: string[];
  lastAIMessage?: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
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
  const [showSwipeInterface, setShowSwipeInterface] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const storyContainerRef = useRef<HTMLDivElement>(null);

  // Mouse movement detection for swipe
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!hasMoved) {
      setHasMoved(true);
      setMousePosition({ x: e.clientX, y: e.clientY });
    } else {
      const deltaX = e.clientX - mousePosition.x;
      const deltaY = e.clientY - mousePosition.y;
      
      // Check if it's a horizontal movement (more horizontal than vertical)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 100) {
        handleSwipe();
      }
    }
  };

  const handleSwipe = () => {
    setIsFading(true);
    // Start the game after the fade animation completes (1 second)
    setTimeout(() => {
      setShowSwipeInterface(false);
      startGame();
    }, 1000);
  };

  const startGame = async () => {
    setGameStarted(true);
    
    const welcomeMessage: Message = {
      id: '1',
      type: 'ai',
      content: `Welcome to your mysterious island adventure. You're about to embark on a journey where every choice matters and the story unfolds based on your decisions.

Type anything in the textbox below to begin your adventure.`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const resetGame = () => {
    setGameStarted(false);
    setStoryState({
      choices: [],
      currentLocation: "Unknown Shore",
      health: 100,
      currentMilestone: 1,
      milestoneStep: 1,
      previousChoices: []
    });
    setMessages([]);
    setShowSwipeInterface(true);
    setIsFading(false);
    setHasMoved(false);
  };

  // Scroll to show new AI messages above the text box
  const scrollToShowNewContent = () => {
    if (storyContainerRef.current) {
      // Calculate the height of the bottom interface to ensure content appears above it
      const bottomInterfaceHeight = 120; // Approximate height of bottom interface
      const containerHeight = storyContainerRef.current.clientHeight;
      const scrollHeight = storyContainerRef.current.scrollHeight;
      
      // Scroll to show new content above the bottom interface
      const targetScrollTop = scrollHeight - containerHeight + bottomInterfaceHeight;
      storyContainerRef.current.scrollTop = targetScrollTop;
    }
  };

  // Auto-scroll when new messages are added
  useEffect(() => {
    if (messages.length > 0) {
      // Small delay to ensure the message is rendered
      setTimeout(() => {
        scrollToShowNewContent();
      }, 100);
    }
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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

  const updateStoryState = (aiMessage: string, currentMilestone: number, updatedStoryState: StoryState) => {
    if (updatedStoryState) {
      setStoryState(updatedStoryState);
    }
  };

  // Helper function to check if a user message should be highlighted as selected
  const isUserMessageSelected = (msg: Message, index: number) => {
    if (msg.type !== 'user') return false;
    
    // Find the next AI message after this user message
    const nextAIMessageIndex = messages.findIndex((m, i) => i > index && m.type === 'ai');
    
    // If there's no next AI message, this is the latest user choice
    if (nextAIMessageIndex === -1) return true;
    
    // If there is a next AI message, this user choice led to that response
    return true;
  };

  // Swipe interface
  if (showSwipeInterface) {
    return (
      <div className={`swipe-container ${isFading ? 'fade-out' : ''}`}>
        <div className="game-title">Stranded</div>
        <div className="swipe-instruction">SWIPE TO PLAY</div>
        <div 
          className="swipe-area"
          onMouseMove={handleMouseMove}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Chat-style Story Container */}
      <div className="story-container" ref={storyContainerRef}>
        {messages.map((msg, index) => (
          <div key={msg.id} className={`chat-message ${msg.type === 'ai' ? 'ai-message' : 'user-message'} ${isUserMessageSelected(msg, index) ? 'selected' : ''}`}>
            <div className={`message-bubble ${msg.type === 'ai' ? 'ai-bubble' : 'user-bubble'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">The story unfolds...</div>
          </div>
        )}
        
        {error && (
          <div className="error-container">
            <div className="error-message">
              Error: {error}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Interface - Larger and more prominent */}
      <div className="bottom-interface">
        <div className="bottom-interface-content">
          <div className="input-container">
            <input
              id="message-input"
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your choices here..."
              disabled={loading}
              className="text-input"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !message.trim()}
              className="send-button"
            >
              Send
            </button>
          </div>
          
          <button
            onClick={resetGame}
            className="reset-button"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
