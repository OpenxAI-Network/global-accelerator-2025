'use client'

import { useState } from 'react'

interface Flashcard {
  front: string
  back: string
}

interface QuizQuestion {
  question: string
  options: string[]
  correct: number
  explanation: string
}

export default function LearnAI() {
  const [activeTab, setActiveTab] = useState('flashcards')
  const [loading, setLoading] = useState(false)
  
  // Flashcard states
  const [notes, setNotes] = useState('')
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentCard, setCurrentCard] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [streamingProgress, setStreamingProgress] = useState('')
  const [performanceInfo, setPerformanceInfo] = useState('')
  
  // Quiz states
  const [quizText, setQuizText] = useState('')
  const [quiz, setQuiz] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  
  // Study Buddy states
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [chatHistory, setChatHistory] = useState<{question: string, answer: string}[]>([])

  const generateFlashcards = async () => {
    if (!notes.trim()) return
    
    setLoading(true)
    setFlashcards([]) // Clear existing flashcards
    setStreamingProgress('Starting generation...')
    setPerformanceInfo('')
    
    const startTime = performance.now()
    
    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })
      
      if (!response.ok) {
        throw new Error('Failed to start flashcard generation')
      }
      
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }
      
      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '))
        
        for (const line of lines) {
          try {
            const jsonStr = line.replace('data: ', '')
            const data = JSON.parse(jsonStr)
            
            switch (data.type) {
              case 'progress':
                // Show streaming progress to user
                const charCount = data.fullContent.length
                setStreamingProgress(`Generating... ${charCount} characters received`)
                console.log('Generating...', charCount, 'characters so far')
                break
                
              case 'complete':
                if (data.flashcards) {
                  setFlashcards(data.flashcards)
                  setCurrentCard(0)
                  setFlipped(false)
                  
                  // Show performance info
                  const endTime = performance.now()
                  const duration = Math.round(endTime - startTime)
                  const cacheStatus = data.cached ? '⚡ (cached)' : '🧠 (generated)'
                  setPerformanceInfo(`${cacheStatus} ${duration}ms - ${data.flashcards.length} flashcards`)
                }
                setLoading(false)
                setStreamingProgress('')
                return // Exit the loop
                
              case 'error':
                console.error('Streaming error:', data.error)
                setLoading(false)
                setStreamingProgress('')
                setPerformanceInfo('')
                return // Exit the loop
            }
          } catch (parseError) {
            console.error('Error parsing streaming data:', parseError)
          }
        }
      }
      
    } catch (error) {
      console.error('Error generating flashcards:', error)
      setLoading(false)
      setStreamingProgress('')
      setPerformanceInfo('')
    }
  }

  const generateQuiz = async () => {
    if (!quizText.trim()) return
    
    setLoading(true)
    setStreamingProgress('Starting quiz generation...')
    
    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: quizText })
      })
      
      if (!response.ok) {
        throw new Error('Failed to start quiz generation')
      }
      
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }
      
      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '))
        
        for (const line of lines) {
          try {
            const jsonStr = line.replace('data: ', '')
            const data = JSON.parse(jsonStr)
            
            switch (data.type) {
              case 'progress':
                const charCount = data.fullContent.length
                setStreamingProgress(`Generating quiz... ${charCount} characters received`)
                break
                
              case 'complete':
                if (data.quiz) {
                  setQuiz(data.quiz)
                  setCurrentQuestion(0)
                  setSelectedAnswer(null)
                  setShowResults(false)
                  setScore(0)
                }
                setLoading(false)
                setStreamingProgress('')
                return
                
              case 'error':
                console.error('Quiz streaming error:', data.error)
                setLoading(false)
                setStreamingProgress('')
                return
            }
          } catch (parseError) {
            console.error('Error parsing quiz streaming data:', parseError)
          }
        }
      }
      
    } catch (error) {
      console.error('Error generating quiz:', error)
      setLoading(false)
      setStreamingProgress('')
    }
  }

  const askStudyBuddy = async () => {
    if (!question.trim()) return
    
    setLoading(true)
    setStreamingProgress('Thinking...')
    
    try {
      const response = await fetch('/api/study-buddy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      })
      
      if (!response.ok) {
        throw new Error('Failed to start study buddy response')
      }
      
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }
      
      const decoder = new TextDecoder()
      let currentAnswer = ''
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '))
        
        for (const line of lines) {
          try {
            const jsonStr = line.replace('data: ', '')
            const data = JSON.parse(jsonStr)
            
            switch (data.type) {
              case 'progress':
                currentAnswer = data.fullContent
                setStreamingProgress(`Responding... ${currentAnswer.length} characters`)
                break
                
              case 'complete':
                if (data.answer) {
                  const newChat = { question, answer: data.answer }
                  setChatHistory(prev => [...prev, newChat])
                  setAnswer(data.answer)
                  setQuestion('')
                }
                setLoading(false)
                setStreamingProgress('')
                return
                
              case 'error':
                console.error('Study buddy streaming error:', data.error)
                setLoading(false)
                setStreamingProgress('')
                return
            }
          } catch (parseError) {
            console.error('Error parsing study buddy streaming data:', parseError)
          }
        }
      }
      
    } catch (error) {
      console.error('Error asking study buddy:', error)
      setLoading(false)
      setStreamingProgress('')
    }
  }

  const nextCard = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1)
      setFlipped(false)
    }
  }

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1)
      setFlipped(false)
    }
  }

  const selectAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
    
    if (answerIndex === quiz[currentQuestion].correct) {
      setScore(score + 1)
    }
    
    setTimeout(() => {
      if (currentQuestion < quiz.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
      } else {
        setShowResults(true)
      }
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">📚 LearnAI</h1>
          <p className="text-white/80 text-lg">AI-Powered Educational Tools</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 flex space-x-2">
            {[
              { id: 'flashcards', label: '🃏 Flashcards', desc: 'Make Flashcards' },
              { id: 'quiz', label: '📝 Quiz', desc: 'Create Quiz' },
              { id: 'study-buddy', label: '🤖 Study Buddy', desc: 'Ask Questions' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <div className="text-sm font-medium">{tab.label}</div>
                <div className="text-xs opacity-75">{tab.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {/* Flashcards Tab */}
          {activeTab === 'flashcards' && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">🃏 Flashcard Maker</h2>
              
              {flashcards.length === 0 ? (
                <div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Paste your study notes here and I'll create flashcards for you..."
                    className="w-full h-40 p-4 rounded-lg border-0 bg-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-white/30"
                  />
                  <button
                    onClick={generateFlashcards}
                    disabled={loading || !notes.trim()}
                    className="mt-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Generating...' : 'Generate Flashcards'}
                  </button>
                  
                  {streamingProgress && (
                    <div className="mt-2 text-white/80 text-sm animate-pulse">
                      ⚡ {streamingProgress}
                    </div>
                  )}
                  
                  {performanceInfo && (
                    <div className="mt-2 text-green-200 text-sm font-medium">
                      {performanceInfo}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="mb-4 text-white">
                    Card {currentCard + 1} of {flashcards.length}
                  </div>
                  
                  <div 
                    className={`flashcard ${flipped ? 'flipped' : ''} mb-6 cursor-pointer`}
                    onClick={() => setFlipped(!flipped)}
                  >
                    <div className="flashcard-inner">
                      <div className="flashcard-front">
                        <p className="text-lg font-medium">{flashcards[currentCard]?.front}</p>
                      </div>
                      <div className="flashcard-back">
                        <p className="text-lg">{flashcards[currentCard]?.back}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={prevCard}
                      disabled={currentCard === 0}
                      className="px-4 py-2 bg-white/20 text-white rounded-lg disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setFlashcards([])}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg"
                    >
                      New Flashcards
                    </button>
                    <button
                      onClick={nextCard}
                      disabled={currentCard === flashcards.length - 1}
                      className="px-4 py-2 bg-white/20 text-white rounded-lg disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quiz Tab */}
          {activeTab === 'quiz' && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">📝 Quiz Maker</h2>
              
              {quiz.length === 0 && !showResults ? (
                <div>
                  <textarea
                    value={quizText}
                    onChange={(e) => setQuizText(e.target.value)}
                    placeholder="Paste text here and I'll create a quiz for you..."
                    className="w-full h-40 p-4 rounded-lg border-0 bg-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-white/30"
                  />
                  <button
                    onClick={generateQuiz}
                    disabled={loading || !quizText.trim()}
                    className="mt-4 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating Quiz...' : 'Create Quiz'}
                  </button>
                  
                  {streamingProgress && (
                    <div className="mt-2 text-white/80 text-sm animate-pulse">
                      ⚡ {streamingProgress}
                    </div>
                  )}
                </div>
              ) : showResults ? (
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-white mb-4">Quiz Complete!</h3>
                  <p className="text-xl text-white mb-6">
                    You scored {score} out of {quiz.length} ({Math.round((score / quiz.length) * 100)}%)
                  </p>
                  <button
                    onClick={() => {
                      setQuiz([])
                      setShowResults(false)
                      setScore(0)
                    }}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg"
                  >
                    Take Another Quiz
                  </button>
                </div>
              ) : (
                <div>
                  <div className="mb-4 text-white">
                    Question {currentQuestion + 1} of {quiz.length}
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-4">
                      {quiz[currentQuestion]?.question}
                    </h3>
                    
                    <div className="space-y-3">
                      {quiz[currentQuestion]?.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => selectAnswer(index)}
                          disabled={selectedAnswer !== null}
                          className={`w-full p-4 text-left rounded-lg transition-all quiz-option ${
                            selectedAnswer === null
                              ? 'bg-white/20 text-white hover:bg-white/30'
                              : selectedAnswer === index
                              ? index === quiz[currentQuestion].correct
                                ? 'correct'
                                : 'incorrect'
                              : index === quiz[currentQuestion].correct
                              ? 'correct'
                              : 'bg-white/10 text-white/60'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    
                    {selectedAnswer !== null && (
                      <div className="mt-4 p-4 bg-white/20 rounded-lg">
                        <p className="text-white font-medium">Explanation:</p>
                        <p className="text-white/90">{quiz[currentQuestion]?.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Study Buddy Tab */}
          {activeTab === 'study-buddy' && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">🤖 Ask-Me Study Buddy</h2>
              
              <div className="mb-6">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask me anything you want to learn about..."
                    className="flex-1 p-4 rounded-lg border-0 bg-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-white/30"
                    onKeyDown={(e) => e.key === 'Enter' && askStudyBuddy()}
                  />
                  <button
                    onClick={askStudyBuddy}
                    disabled={loading || !question.trim()}
                    className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Thinking...' : 'Ask'}
                  </button>
                </div>
                
                {streamingProgress && (
                  <div className="mb-4 text-white/80 text-sm animate-pulse">
                    🤖 {streamingProgress}
                  </div>
                )}
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {chatHistory.map((chat, index) => (
                  <div key={index} className="space-y-2">
                    <div className="bg-blue-500/20 p-4 rounded-lg">
                      <p className="text-white font-medium">You:</p>
                      <p className="text-white/90">{chat.question}</p>
                    </div>
                    <div className="bg-green-500/20 p-4 rounded-lg">
                      <p className="text-white font-medium">Study Buddy:</p>
                      <p className="text-white/90">{chat.answer}</p>
                    </div>
                  </div>
                ))}
                
                {chatHistory.length === 0 && (
                  <div className="text-center text-white/60 py-8">
                    Ask me anything and I'll help you learn! I can explain concepts, provide examples, and answer your questions.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 