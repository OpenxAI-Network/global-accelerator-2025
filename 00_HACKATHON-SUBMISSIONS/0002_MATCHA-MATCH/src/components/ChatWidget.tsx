import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  recommendations?: any[]; // Added for widget display
  sentiment?: string; // Added for sentiment display
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(true); // Changed to true - chat opens by default
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message when component mounts
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: "Hi! 👋 Welcome to Matcha-Match, your tea guide. I can help you find the perfect matcha café based on your mood, preferences, and location. What are you looking for today?",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }

    // Listen for custom event to open chat
    const handleOpenChat = () => {
      setIsOpen(true);
    };

    window.addEventListener('openChatWidget', handleOpenChat);
    return () => {
      window.removeEventListener('openChatWidget', handleOpenChat);
    };
  }, []);

  const handleSendMessage = async () => {
    if (inputText.trim() && !isLoading) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputText,
        isUser: true,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputText("");
      setIsLoading(true);

      try {
        // Generate a session ID for this chat session
        const sessionId = `chat_${Date.now()}`;
        
        // Call your Django backend Ollama integration
        const response = await fetch('/api/ai/chat/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage.text,
            session_id: sessionId,
            // Add default coordinates for Sydney
            lat: -33.8715,
            lng: 151.2006
          }),
        });

        console.log('API Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('API Response data:', data);
          
          // Build a comprehensive response including café recommendations
          let aiResponseText = data.message || "I'm here to help you discover the perfect matcha experience!";
          
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: aiResponseText,
            isUser: false,
            timestamp: new Date(),
            recommendations: data.recommendations || [], // Store recommendations for widget display
            sentiment: data.sentiment || 'neutral' // Store sentiment for display
          };
          setMessages(prev => [...prev, aiResponse]);
        } else {
          const errorText = await response.text();
          console.error('API Error response:', errorText);
          
          // Fallback response if API fails
          const fallbackResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: `I'm having trouble connecting to my AI brain right now. Please try again in a moment. (Error: ${response.status})`,
            isUser: false,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, fallbackResponse]);
        }
      } catch (error) {
        console.error('Error calling AI API:', error);
        // Fallback response on error
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm experiencing a connection issue. Please check if the backend is running and try again.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorResponse]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button - Fixed at bottom-right corner */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 w-16 h-16 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 z-[9999] flex items-center justify-center group border-4 border-white"
        aria-label="Toggle chat"
        style={{ position: 'fixed' }}
      >
        {isOpen ? (
          <X className="w-7 h-7" />
        ) : (
          <MessageCircle className="w-7 h-7" />
        )}
        <div className="absolute inset-0 bg-green-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
      </button>

      {/* Chat Box */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 w-[600px] h-[700px] bg-white rounded-lg shadow-2xl border border-green-200 z-[9998] flex flex-col">
          {/* Chat Header */}
          <div className="bg-green-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">Matcha Guide</span>
              
              {/* Show current mood if available */}
              {messages.length > 1 && messages[messages.length - 1]?.sentiment && messages[messages.length - 1]?.sentiment !== 'neutral' && (
                <div className="ml-3 px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                  🧠 {messages[messages.length - 1].sentiment?.charAt(0).toUpperCase() + messages[messages.length - 1].sentiment?.slice(1)}
                </div>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-lg ${
                    message.isUser
                      ? "bg-green-600 text-white rounded-br-md"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                  }`}
                >
                  {message.isUser ? (
                    <p className="text-sm">{message.text}</p>
                  ) : (
                    <div className="text-sm">
                      {/* Show the main message text */}
                      <p className="text-gray-800 mb-3">{message.text}</p>
                      
                      {/* Show sentiment analysis if available */}
                      {message.sentiment && message.sentiment !== 'neutral' && (
                        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-lg">🧠</span>
                            <span className="font-semibold text-blue-800">Mood Analysis</span>
                          </div>
                          <p className="text-sm text-blue-700">
                            I detected you're feeling <span className="font-bold capitalize">{message.sentiment}</span>! 
                            I've tailored these recommendations to match your current mood and energy level.
                          </p>
                        </div>
                      )}
                      
                      {/* Show recommendations as clickable widgets if available */}
                      {message.recommendations && message.recommendations.length > 0 && (
                        <div className="space-y-3 mt-4">
                          <h3 className="font-bold text-green-700 text-base mb-3">🍵 Here are some great matcha cafés for you:</h3>
                          
                          {message.recommendations.map((cafe: any, index: number) => (
                            <div 
                              key={cafe.id || index}
                              className="bg-white border border-green-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:border-green-300"
                              onClick={() => {
                                // Handle café selection - you can add navigation or other actions here
                                console.log('Selected café:', cafe);
                                // Example: open in Google Maps
                                if (cafe.place_id) {
                                  window.open(`https://www.google.com/maps/place/?q=place_id:${cafe.place_id}`, '_blank');
                                }
                              }}
                            >
                              {/* Café Image */}
                              {cafe.photos && cafe.photos.length > 0 && (
                                <div className="mb-3">
                                  <img 
                                    src={cafe.photos[0]} 
                                    alt={`${cafe.name} interior`}
                                    className="w-full h-32 object-cover rounded-lg shadow-sm"
                                    onError={(e) => {
                                      // Fallback if image fails to load
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                              
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-bold text-gray-800 text-base">{cafe.name}</h4>
                                <div className="flex items-center space-x-1">
                                  <span className="text-yellow-500">⭐</span>
                                  <span className="text-sm font-medium">{cafe.rating}</span>
                                </div>
                              </div>
                              
                              <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <span>📍</span>
                                  <span>{cafe.address}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span>💰</span>
                                  <span>{cafe.price_level || 'Price not available'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span>🚶‍♂️</span>
                                  <span>{cafe.distance} km away</span>
                                </div>
                              </div>
                              
                              {cafe.ai_insight && (
                                <div className="mt-3 space-y-2">
                                  {/* Unique reason to visit this specific café */}
                                  {cafe.ai_insight.reason && (
                                    <div className="p-2 bg-blue-50 rounded border border-blue-100">
                                      <p className="text-xs text-blue-700 font-medium mb-1">💡 Why This Café:</p>
                                      <p className="text-xs text-blue-800">{cafe.ai_insight.reason}</p>
                                    </div>
                                  )}
                                  
                                  {/* What this café is best for */}
                                  {cafe.ai_insight.best_for && (
                                    <div className="p-2 bg-purple-50 rounded border border-purple-100">
                                      <p className="text-xs text-purple-700 font-medium mb-1">🎯 Best For:</p>
                                      <p className="text-xs text-purple-800">{cafe.ai_insight.best_for}</p>
                                    </div>
                                  )}
                                  
                                  {/* Key features that make it special */}
                                  {cafe.ai_insight.key_features && (
                                    <div className="p-2 bg-green-50 rounded border border-green-100">
                                      <p className="text-xs text-green-700 font-medium mb-1">✨ Key Features:</p>
                                      <p className="text-xs text-green-800">{cafe.ai_insight.key_features}</p>
                                    </div>
                                  )}
                                  
                                  {/* Why it's ranked where it is */}
                                  {cafe.ai_insight.why_better_than_others && (
                                    <div className="p-2 bg-orange-50 rounded border border-orange-100">
                                      <p className="text-xs text-orange-700 font-medium mb-1">🏆 Ranking Reason:</p>
                                      <p className="text-xs text-orange-800">{cafe.ai_insight.why_better_than_others}</p>
                                    </div>
                                  )}
                                  
                                  {/* Budget explanation */}
                                  {cafe.ai_insight.budget_explanation && (
                                    <div className="p-2 bg-yellow-50 rounded border border-yellow-100">
                                      <p className="text-xs text-yellow-700 font-medium mb-1">💰 Value:</p>
                                      <p className="text-xs text-yellow-800">{cafe.ai_insight.budget_explanation}</p>
                                    </div>
                                  )}
                                  
                                  {/* Distance benefit */}
                                  {cafe.ai_insight.distance_benefit && (
                                    <div className="p-2 bg-indigo-50 rounded border border-indigo-100">
                                      <p className="text-xs text-indigo-700 font-medium mb-1">📍 Location:</p>
                                      <p className="text-xs text-indigo-800">{cafe.ai_insight.distance_benefit}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              <div className="mt-2 text-xs text-green-600 font-medium">
                                Click to open in Google Maps →
                              </div>
                            </div>
                          ))}
                          
                          <p className="text-sm text-gray-600 mt-3 italic">
                            These places are perfect for your current mood and preferences!
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  <p className={`text-xs mt-2 ${
                    message.isUser ? "text-green-100" : "text-gray-500"
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 border border-gray-200 rounded-lg rounded-bl-md px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about matcha places, mood, preferences..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            {/* Quick Suggestions */}
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "I want a peaceful place to study",
                "Looking for a fun spot with friends",
                "Need something affordable",
                "Show me trendy cafés"
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setInputText(suggestion)}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}