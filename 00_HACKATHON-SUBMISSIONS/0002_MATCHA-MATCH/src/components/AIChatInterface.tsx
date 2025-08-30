import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Heart, Coffee, MapPin, Star } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sentiment?: string;
  recommendations?: any[];
}

interface ChatResponse {
  message: string;
  recommendations: any[];
  sentiment: string;
  session_id: string;
}

const AIChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [currentSentiment, setCurrentSentiment] = useState<string>('neutral');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate a unique session ID for this chat
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied or error:', error);
          // Default to Sydney if location access denied
          setUserLocation({ lat: -33.8688, lng: 151.2093 });
        }
      );
    } else {
      // Fallback to Sydney if geolocation not supported
      setUserLocation({ lat: -33.8688, lng: 151.2093 });
    }
    
    // Add welcome message
    setMessages([{
      role: 'assistant',
      content: "Hi! I'm your AI matcha guide! 🍵 Tell me what kind of café experience you're looking for. For example: 'I want a peaceful place to study' or 'Looking for a fun spot to meet friends!'",
      timestamp: new Date().toISOString(),
    }]);
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getSentimentEmoji = (sentiment: string) => {
    const emojiMap: { [key: string]: string } = {
      'happy': '😊',
      'excited': '🤩',
      'calm': '😌',
      'stressed': '😰',
      'sad': '😢',
      'angry': '😠',
      'neutral': '😐',
      'social': '👥',
      'focused': '🎯'
    };
    return emojiMap[sentiment] || '😐';
  };

  const getSentimentColor = (sentiment: string) => {
    const colorMap: { [key: string]: string } = {
      'happy': 'text-green-600',
      'excited': 'text-yellow-600',
      'calm': 'text-blue-600',
      'stressed': 'text-orange-600',
      'sad': 'text-gray-600',
      'angry': 'text-red-600',
      'neutral': 'text-gray-500',
      'social': 'text-purple-600',
      'focused': 'text-indigo-600'
    };
    return colorMap[sentiment] || 'text-gray-500';
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          session_id: sessionId,
          lat: userLocation?.lat,
          lng: userLocation?.lng,
        }),
      });

      if (response.ok) {
        const data: ChatResponse = await response.json();
        
        // Create AI message with recommendations
        const aiMessage: Message = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date().toISOString(),
          recommendations: data.recommendations || [], // Add recommendations
        };

        setMessages(prev => [...prev, aiMessage]);
        setCurrentSentiment(data.sentiment);
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment!",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const openInGoogleMaps = (cafe: any) => {
    try {
      // Try to use coordinates if available
      if (cafe.lat && cafe.lng) {
        const url = `https://www.google.com/maps?q=${cafe.lat},${cafe.lng}`;
        window.open(url, '_blank');
      }
      // Fallback to search by name and address
      else if (cafe.name && cafe.address) {
        const searchQuery = encodeURIComponent(`${cafe.name} ${cafe.address}`);
        const url = `https://www.google.com/maps/search/${searchQuery}`;
        window.open(url, '_blank');
      }
      // Last resort: just search by name
      else if (cafe.name) {
        const searchQuery = encodeURIComponent(cafe.name);
        const url = `https://www.google.com/maps/search/${searchQuery}`;
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error opening Google Maps:', error);
      // Fallback: open Google Maps homepage
      window.open('https://www.google.com/maps', '_blank');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-full">
            <Coffee className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">MatchaMatch AI</h3>
            <p className="text-sm text-gray-600">Your personal matcha guide</p>
          </div>
        </div>
        
        {/* Sentiment Indicator */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Mood:</span>
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full bg-gray-100 ${getSentimentColor(currentSentiment)}`}>
            <span className="text-lg">{getSentimentEmoji(currentSentiment)}</span>
            <span className="text-sm font-medium capitalize">{currentSentiment}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.role === 'user' && message.sentiment && (
                  <span className="text-sm opacity-75">
                    {getSentimentEmoji(message.sentiment)}
                  </span>
                )}
                <p className="text-sm">{message.content}</p>
              </div>
              
              {/* Show recommendations if available */}
              {message.role === 'assistant' && message.recommendations && message.recommendations.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h4 className="font-semibold text-green-700 text-sm">🍵 AI-Enhanced Recommendations:</h4>
                  {message.recommendations.map((cafe: any, index: number) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg border border-green-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => openInGoogleMaps(cafe)}
                    >
                      {/* Photo Section */}
                      {cafe.photos && cafe.photos.length > 0 ? (
                        <div className="relative h-32 overflow-hidden">
                          <img
                            src={cafe.photos && cafe.photos.length > 0 ? cafe.photos[0] : `http://localhost:8001/api/ai/placeholder/400/200/`}
                            alt={cafe.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const cafeName = cafe.name || 'Café';
                              const fallbackColors = ['4ade80', '22c55e', '16a34a', '15803d', '166534'];
                              const randomColor = fallbackColors[Math.floor(Math.random() * fallbackColors.length)];
                              (e.currentTarget as HTMLImageElement).src =
                                `http://localhost:8001/api/ai/placeholder/400/200/`;
                            }}
                          />
                          {/* AI Rank Badge */}
                          {cafe.ai_insight && (
                            <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                              #{cafe.ai_insight.rank} AI Pick
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative h-32 bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
                          <div className="text-center">
                            <Coffee className="w-8 h-8 text-green-600 mx-auto mb-1" />
                            <p className="text-xs text-green-700 font-medium">{cafe.name}</p>
                          </div>
                          {/* AI Rank Badge */}
                          {cafe.ai_insight && (
                            <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                              #{cafe.ai_insight.rank} AI Pick
                            </div>
                          )}
                        </div>
                      )}

                      {/* Content Section */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-bold text-gray-800 text-lg">{cafe.name}</h5>
                          <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-full">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-semibold text-yellow-700">{cafe.rating}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 text-green-600" />
                          <span className="text-sm">{cafe.address}</span>
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {cafe.distance} km away
                          </span>
                          <span className="text-sm font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                            {cafe.price_level}
                          </span>
                        </div>

                        {/* AI Insights */}
                        {cafe.ai_insight && (
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-3">
                            <div className="flex items-center space-x-2 mb-4">
                              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                              <span className="text-sm font-semibold text-purple-700">🤖 AI Expert Analysis</span>
                            </div>
                            
                            <div className="space-y-4">
                              {/* Main Reason */}
                              <div>
                                <p className="text-sm font-medium text-purple-700 mb-2">✨ Why This Café is Perfect for You:</p>
                                <p className="text-sm text-gray-700 leading-relaxed bg-white/60 p-3 rounded-lg">
                                  {cafe.ai_insight.reason}
                                </p>
                              </div>
                              
                              {/* Key Features */}
                              <div>
                                <p className="text-sm font-medium text-purple-700 mb-2">🌟 Key Features That Match Your Needs:</p>
                                <p className="text-sm text-gray-700 bg-white/60 p-3 rounded-lg">
                                  {cafe.ai_insight.key_features}
                                </p>
                              </div>
                              
                              {/* Why Better Than Others */}
                              <div>
                                <p className="text-sm font-medium text-purple-700 mb-2">🏆 Why This Ranks Higher Than Alternatives:</p>
                                <p className="text-sm text-gray-700 bg-white/60 p-3 rounded-lg">
                                  {cafe.ai_insight.why_better_than_others}
                                </p>
                              </div>
                              
                              {/* Detailed Analysis Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Mood Match */}
                                <div className="bg-white/70 rounded-lg p-3 border border-purple-100">
                                  <p className="text-xs font-medium text-purple-600 mb-1">😌 Mood Match:</p>
                                  <p className="text-xs text-gray-700 leading-relaxed">
                                    {cafe.ai_insight.mood_match}
                                  </p>
                                </div>
                                
                                {/* Best For */}
                                <div className="bg-white/70 rounded-lg p-3 border border-purple-100">
                                  <p className="text-xs font-medium text-purple-600 mb-1">🎯 Best For:</p>
                                  <p className="text-xs text-gray-700 leading-relaxed">
                                    {cafe.ai_insight.best_for}
                                  </p>
                                </div>
                                
                                {/* Budget Explanation */}
                                <div className="bg-white/70 rounded-lg p-3 border border-purple-100">
                                  <p className="text-xs font-medium text-purple-600 mb-1">💰 Budget Fit:</p>
                                  <p className="text-xs text-gray-700 leading-relaxed">
                                    {cafe.ai_insight.budget_explanation}
                                  </p>
                                </div>
                                
                                {/* Distance Benefit */}
                                <div className="bg-white/70 rounded-lg p-3 border border-purple-100">
                                  <p className="text-xs font-medium text-purple-600 mb-1">📍 Location Advantage:</p>
                                  <p className="text-xs text-gray-700 leading-relaxed">
                                    {cafe.ai_insight.distance_benefit}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="text-center">
                          <span className="text-xs text-green-600 font-medium bg-green-50 px-3 py-2 rounded-full">
                            Click to open in Google Maps →
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className={`text-xs mt-1 ${
                message.role === 'user' ? 'text-green-100' : 'text-gray-500'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tell me what kind of matcha experience you're looking for..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              onClick={() => setInputMessage(suggestion)}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIChatInterface;
