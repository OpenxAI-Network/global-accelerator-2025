import React, { useState, useRef, useEffect } from 'react';
import { useAIAssistant } from '../hooks/useAIAssistant';
import { AIResponse, AIContext } from '../types/ai';

interface ContextualAIAssistanceProps {
  context?: AIContext;
  onAction?: (action: string, data: any) => void;
  placeholder?: string;
  maxHeight?: number;
}

const ContextualAIAssistance: React.FC<ContextualAIAssistanceProps> = ({
  context,
  onAction,
  placeholder = "Ask me anything about your portfolio, DeFi strategies, or get help with Aegis...",
  maxHeight = 400
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [conversation, setConversation] = useState<AIResponse[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, isLoading, error } = useAIAssistant();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Load conversation suggestions based on context
  useEffect(() => {
    if (context) {
      loadContextualSuggestions(context);
    }
  }, [context]);

  const loadContextualSuggestions = (ctx: AIContext) => {
    const contextSuggestions: { [key: string]: string[] } = {
      portfolio: [
        "How can I improve my portfolio health?",
        "What's the best strategy for my current positions?",
        "Should I rebalance my portfolio?",
        "What are the risks in my current setup?"
      ],
      lending: [
        "How do I calculate my LTV ratio?",
        "What happens if my position gets liquidated?",
        "How can I add more collateral?",
        "What are the best lending strategies?"
      ],
      crossChain: [
        "How do cross-chain transactions work?",
        "What are the fees for bridging assets?",
        "How long do cross-chain transfers take?",
        "Which chains are best for my strategy?"
      ],
      security: [
        "How secure is my position?",
        "What are the security risks?",
        "How can I protect my assets?",
        "What should I do if I suspect fraud?"
      ]
    };

    const relevantSuggestions = contextSuggestions[ctx.type] || [];
    setSuggestions(relevantSuggestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message to conversation
    const userResponse: AIResponse = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: userMessage,
      timestamp: new Date(),
      context: context
    };
    
    setConversation(prev => [...prev, userResponse]);
    setIsTyping(true);

    try {
      // Send message to AI
      const aiResponse = await sendMessage(userMessage, context);
      
      // Add AI response to conversation
      const aiResponseObj: AIResponse = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        context: context,
        actions: aiResponse.actions,
        insights: aiResponse.insights
      };
      
      setConversation(prev => [...prev, aiResponseObj]);
    } catch (err) {
      // Add error response
      const errorResponse: AIResponse = {
        id: `error-${Date.now()}`,
        type: 'error',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        context: context
      };
      
      setConversation(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const handleActionClick = (action: string, data: any) => {
    onAction?.(action, data);
  };

  const clearConversation = () => {
    setConversation([]);
  };

  const exportConversation = () => {
    const conversationText = conversation
      .map(msg => `${msg.type === 'user' ? 'You' : 'AI'}: ${msg.content}`)
      .join('\n\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegis-ai-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="contextual-ai-assistance">
      {/* AI Assistant Toggle */}
      <div className="ai-toggle" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="ai-icon">🤖</div>
        <div className="ai-status">
          <span className="ai-title">AI Assistant</span>
          <span className="ai-subtitle">Powered by Gemini</span>
        </div>
        <div className={`toggle-arrow ${isExpanded ? 'expanded' : ''}`}>▼</div>
      </div>

      {/* AI Assistant Panel */}
      {isExpanded && (
        <div className="ai-panel" style={{ maxHeight }}>
          {/* Panel Header */}
          <div className="ai-panel-header">
            <h3>AI Assistant</h3>
            <div className="ai-actions">
              <button onClick={clearConversation} className="btn-clear" title="Clear conversation">
                🗑️
              </button>
              <button onClick={exportConversation} className="btn-export" title="Export conversation">
                📤
              </button>
              <button onClick={() => setIsExpanded(false)} className="btn-close" title="Close">
                ×
              </button>
            </div>
          </div>

          {/* Contextual Suggestions */}
          {suggestions.length > 0 && (
            <div className="ai-suggestions">
              <h4>Suggested Questions</h4>
              <div className="suggestions-grid">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="suggestion-btn"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conversation */}
          <div className="ai-conversation">
            {conversation.length === 0 ? (
              <div className="conversation-empty">
                <div className="empty-icon">💬</div>
                <h4>Start a conversation</h4>
                <p>Ask me anything about DeFi, your portfolio, or get help with Aegis features.</p>
              </div>
            ) : (
              conversation.map((message) => (
                <div key={message.id} className={`message ${message.type}`}>
                  <div className="message-header">
                    <span className="message-type">
                      {message.type === 'user' ? '👤 You' : '🤖 AI'}
                    </span>
                    <span className="message-time">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                  
                  <div className="message-content">
                    {message.content}
                  </div>

                  {/* AI Actions */}
                  {message.type === 'ai' && message.actions && message.actions.length > 0 && (
                    <div className="message-actions">
                      {message.actions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleActionClick(action.type, action.data)}
                          className="action-btn"
                        >
                          {action.icon} {action.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* AI Insights */}
                  {message.type === 'ai' && message.insights && message.insights.length > 0 && (
                    <div className="message-insights">
                      <h5>💡 Insights</h5>
                      <ul>
                        {message.insights.map((insight, index) => (
                          <li key={index}>{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="message ai typing">
                <div className="message-header">
                  <span className="message-type">🤖 AI</span>
                  <span className="message-time">Now</span>
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="ai-input-form">
            <div className="input-wrapper">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder}
                disabled={isLoading}
                className="ai-input"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="ai-send-btn"
              >
                {isLoading ? '🔄' : '📤'}
              </button>
            </div>
            
            {error && (
              <div className="ai-error">
                <span className="error-icon">❌</span>
                <span className="error-message">{error}</span>
              </div>
            )}
          </form>

          {/* Context Info */}
          {context && (
            <div className="ai-context">
              <div className="context-header">
                <span className="context-icon">🎯</span>
                <span className="context-title">Context: {context.type}</span>
              </div>
              <div className="context-details">
                {context.description && <p>{context.description}</p>}
                {context.data && (
                  <div className="context-data">
                    <pre>{JSON.stringify(context.data, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContextualAIAssistance;
