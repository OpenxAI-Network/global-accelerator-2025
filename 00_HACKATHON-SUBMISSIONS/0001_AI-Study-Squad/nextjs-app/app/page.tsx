'use client'

import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion, AnimatePresence } from 'framer-motion'

interface Agent {
  name: string
  icon: string
  color: string
  description: string
}

interface AgentMessage {
  agent: string
  content: string
  timestamp: Date
  metadata?: any
}

interface LearningSession {
  id: string
  topic: string
  level: 'beginner' | 'intermediate' | 'advanced'
  startTime: Date
  messages: AgentMessage[]
}

const agents: Agent[] = [
  {
    name: 'Knowledge Assessor',
    icon: '🎯',
    color: 'from-blue-500 to-cyan-500',
    description: 'Evaluates your current knowledge level'
  },
  {
    name: 'Content Creator',
    icon: '📚',
    color: 'from-purple-500 to-pink-500',
    description: 'Creates personalized learning materials'
  },
  {
    name: 'Quiz Master',
    icon: '🎲',
    color: 'from-green-500 to-emerald-500',
    description: 'Generates quizzes and evaluates answers'
  },
  {
    name: 'Progress Tracker',
    icon: '📊',
    color: 'from-orange-500 to-red-500',
    description: 'Tracks and analyzes your progress'
  },
  {
    name: 'Study Buddy',
    icon: '🤖',
    color: 'from-indigo-500 to-purple-500',
    description: 'Your friendly learning companion'
  }
]

export default function AIStudySquad() {
  const [sessionId, setSessionId] = useState<string>('')
  const [currentSession, setCurrentSession] = useState<LearningSession | null>(null)
  const [topic, setTopic] = useState('')
  const [initialAssessment, setInitialAssessment] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeAgents, setActiveAgents] = useState<Set<string>>(new Set())
  const [userInput, setUserInput] = useState('')
  const [sessionStarted, setSessionStarted] = useState(false)
  const [showAssessment, setShowAssessment] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Generate unique session ID
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [currentSession?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const startLearningSession = async () => {
    if (!topic) return

    setLoading(true)
    setActiveAgents(new Set(['Knowledge Assessor', 'Content Creator', 'Quiz Master']))
    
    try {
      const response = await fetch('/api/learning-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          action: 'start',
          data: {
            topic,
            initialAssessment: showAssessment ? initialAssessment : undefined
          }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        const newSession: LearningSession = {
          id: sessionId,
          topic,
          level: 'beginner',
          startTime: new Date(),
          messages: result.responses.map((r: any) => ({
            agent: r.agent,
            content: r.content,
            timestamp: new Date(),
            metadata: r.metadata
          }))
        }
        
        setCurrentSession(newSession)
        setSessionStarted(true)
      }
    } catch (error) {
      console.error('Error starting session:', error)
    } finally {
      setLoading(false)
      setActiveAgents(new Set())
    }
  }

  const sendMessage = async () => {
    if (!userInput.trim() || !sessionStarted) return

    const userMessage: AgentMessage = {
      agent: 'You',
      content: userInput,
      timestamp: new Date()
    }

    setCurrentSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, userMessage]
    } : null)

    setUserInput('')
    setLoading(true)
    setActiveAgents(new Set(['Study Buddy']))

    try {
      const response = await fetch('/api/learning-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          action: 'query',
          data: {
            query: userInput,
            queryType: 'question'
          }
        })
      })

      const result = await response.json()
      
      if (result.success && result.response) {
        const agentMessage: AgentMessage = {
          agent: result.response.agent,
          content: result.response.content,
          timestamp: new Date(),
          metadata: result.response.metadata
        }
        
        setCurrentSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, agentMessage]
        } : null)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
      setActiveAgents(new Set())
    }
  }

  const resetSession = () => {
    setCurrentSession(null)
    setSessionStarted(false)
    setTopic('')
    setInitialAssessment('')
    setShowAssessment(false)
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  }

  const getAgentInfo = (agentName: string): Agent | undefined => {
    return agents.find(a => a.name === agentName)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🎓</span>
              <div>
                <h1 className="text-2xl font-bold text-white">AI Study Squad</h1>
                <p className="text-white/60 text-sm">Multi-Agent Personalized Learning System</p>
              </div>
            </div>
            {sessionStarted && (
              <button
                onClick={resetSession}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
              >
                End Session
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Agent Status Bar */}
      <div className="bg-black/10 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-6 overflow-x-auto">
            <span className="text-white/60 text-sm font-medium whitespace-nowrap">AI Agents:</span>
            {agents.map(agent => (
              <motion.div
                key={agent.name}
                className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                  activeAgents.has(agent.name)
                    ? 'bg-white/20 ring-2 ring-white/40'
                    : 'bg-white/5'
                }`}
                animate={activeAgents.has(agent.name) ? {
                  scale: [1, 1.05, 1],
                  transition: { repeat: Infinity, duration: 2 }
                } : {}}
              >
                <span className="text-xl">{agent.icon}</span>
                <span className={`text-sm font-medium ${
                  activeAgents.has(agent.name) ? 'text-white' : 'text-white/60'
                }`}>
                  {agent.name}
                </span>
                {activeAgents.has(agent.name) && (
                  <motion.div
                    className="w-2 h-2 bg-green-400 rounded-full"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {!sessionStarted ? (
          /* Start Screen */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">
                Start Your Learning Journey
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-white/80 mb-2 font-medium">
                    What would you like to learn about?
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Machine Learning, Quantum Physics, JavaScript..."
                    className="w-full p-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-3 text-white/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showAssessment}
                      onChange={(e) => setShowAssessment(e.target.checked)}
                      className="w-5 h-5 rounded bg-white/10 border-white/20"
                    />
                    <span>Start with knowledge assessment</span>
                  </label>
                </div>

                <AnimatePresence>
                  {showAssessment && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="block text-white/80 mb-2 font-medium">
                        Tell us what you already know about {topic || 'this topic'}:
                      </label>
                      <textarea
                        value={initialAssessment}
                        onChange={(e) => setInitialAssessment(e.target.value)}
                        placeholder="Share your current understanding..."
                        className="w-full h-32 p-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-white/40 focus:outline-none resize-none"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={startLearningSession}
                  disabled={!topic || loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Initializing AI Agents...
                    </span>
                  ) : (
                    'Start Learning Session'
                  )}
                </button>
              </div>

              {/* Agent Cards */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {agents.map(agent => (
                  <motion.div
                    key={agent.name}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{agent.icon}</span>
                      <div>
                        <h3 className="text-white font-semibold">{agent.name}</h3>
                        <p className="text-white/60 text-sm">{agent.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          /* Learning Session */
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Chat Area */}
              <div className="lg:col-span-2">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl h-[600px] flex flex-col">
                  <div className="p-4 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">Learning: {topic}</h2>
                    <p className="text-white/60 text-sm">Session ID: {sessionId.slice(0, 20)}...</p>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <AnimatePresence>
                      {currentSession?.messages.map((message, index) => {
                        const agentInfo = getAgentInfo(message.agent)
                        const isUser = message.agent === 'You'
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: isUser ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[80%] ${isUser ? 'order-2' : ''}`}>
                              <div className="flex items-start space-x-2">
                                {!isUser && (
                                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${
                                    agentInfo?.color || 'from-gray-500 to-gray-600'
                                  } flex items-center justify-center text-white text-sm`}>
                                    {agentInfo?.icon || '🤖'}
                                  </div>
                                )}
                                <div>
                                  <div className="text-xs text-white/60 mb-1">
                                    {message.agent} • {new Date(message.timestamp).toLocaleTimeString()}
                                  </div>
                                  <div className={`rounded-lg p-4 ${
                                    isUser 
                                      ? 'bg-purple-500/20 border border-purple-500/30' 
                                      : 'bg-white/10 border border-white/20'
                                  }`}>
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      className="text-white prose prose-invert prose-sm max-w-none"
                                    >
                                      {message.content}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-4 border-t border-white/10">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        placeholder="Ask a question or request help..."
                        className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
                        disabled={loading}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={loading || !userInput.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {loading ? (
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          'Send'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Panel */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <h3 className="text-white font-bold mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setUserInput('Can you explain this concept in simpler terms?')}
                      className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 text-white/80 rounded-lg text-sm transition-colors"
                    >
                      🔄 Simplify explanation
                    </button>
                    <button
                      onClick={() => setUserInput('Can you give me an example?')}
                      className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 text-white/80 rounded-lg text-sm transition-colors"
                    >
                      💡 Request example
                    </button>
                    <button
                      onClick={() => setUserInput('Generate a quiz question about this')}
                      className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 text-white/80 rounded-lg text-sm transition-colors"
                    >
                      📝 Get quiz question
                    </button>
                    <button
                      onClick={() => setUserInput('What are the key points to remember?')}
                      className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 text-white/80 rounded-lg text-sm transition-colors"
                    >
                      📌 Key takeaways
                    </button>
                  </div>
                </div>

                {/* Session Stats */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <h3 className="text-white font-bold mb-3">Session Stats</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Messages</span>
                      <span className="text-white">{currentSession?.messages.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Duration</span>
                      <span className="text-white">
                        {currentSession ? 
                          `${Math.floor((Date.now() - currentSession.startTime.getTime()) / 60000)} min` 
                          : '0 min'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Active Agents</span>
                      <span className="text-white">{activeAgents.size}</span>
                    </div>
                  </div>
                </div>

                {/* Agent Activity */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <h3 className="text-white font-bold mb-3">Agent Activity</h3>
                  <div className="space-y-2">
                    {agents.map(agent => {
                      const messageCount = currentSession?.messages.filter(
                        m => m.agent === agent.name
                      ).length || 0
                      
                      return (
                        <div key={agent.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span>{agent.icon}</span>
                            <span className="text-white/80 text-sm">{agent.name}</span>
                          </div>
                          <span className="text-white/60 text-xs">{messageCount} msgs</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}