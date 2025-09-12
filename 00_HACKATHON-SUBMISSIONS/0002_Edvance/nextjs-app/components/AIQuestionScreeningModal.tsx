'use client'

import { useState, useEffect } from 'react'
import { X, Bot, CheckCircle, AlertCircle, ArrowRight, Loader2, FileText, MessageSquare, ThumbsUp, ThumbsDown, BarChart3, Download, AlertTriangle } from 'lucide-react'
import RichTextEditorWrapper from './RichTextEditorWrapper'

interface AIQuestionScreeningModalProps {
  isOpen: boolean
  onClose: () => void
  classId: string
  onProceedToForum: (questionTitle: string, questionContent: string, questionTags: string) => void
}

interface AIResponse {
  aiResponse: string
  confidence: number
  sources: Array<{
    type: 'document' | 'qa'
    title: string
    relevance: string
    filename?: string
    questionId?: string
  }>
  similarQuestions: Array<{
    question: string
    relevance: string
  }>
  shouldPostToForum: boolean
  answer?: string
  recommendation: string
  hasAnswer: boolean
  showFeedback: boolean
}

export default function AIQuestionScreeningModal({ isOpen, onClose, classId, onProceedToForum }: AIQuestionScreeningModalProps) {
  const [currentStep, setCurrentStep] = useState<'input' | 'analyzing' | 'result'>('input')
  const [questionTitle, setQuestionTitle] = useState('')
  const [questionContent, setQuestionContent] = useState('')
  const [questionTags, setQuestionTags] = useState('')
  const [aiResponse, setAIResponse] = useState<AIResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [showRetry, setShowRetry] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setCurrentStep('input')
      setQuestionTitle('')
      setQuestionContent('')
      setQuestionTags('')
      setAIResponse(null)
      setError(null)
      setFeedbackSubmitted(false)
      setRetryCount(0)
      setShowRetry(false)
    }
  }, [isOpen])

  const handleAnalyzeQuestion = async () => {
    const textContent = questionContent.replace(/<[^>]*>/g, '').trim()
    if (!questionTitle.trim() || !textContent) return

    setLoading(true)
    setCurrentStep('analyzing')
    setError(null)

    try {
      // Get user from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (!user.id) {
        throw new Error('User not authenticated')
      }

      const response = await fetch('/api/ai-prefilter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionTitle + ' ' + questionContent,
          classId
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Map API response to expected interface
        const mappedResponse: AIResponse = {
          aiResponse: data.aiResponse || '',
          confidence: data.confidence || 0,
          sources: data.sources || [],
          similarQuestions: [],
          shouldPostToForum: data.shouldPostToForum || false,
          answer: data.aiResponse || '',
          recommendation: data.recommendation || 'No analysis available',
          hasAnswer: data.hasAnswer || false,
          showFeedback: data.showFeedback || false
        }
        setAIResponse(mappedResponse)
        setCurrentStep('result')
      } else {
        throw new Error(data.error || 'AI analysis failed')
      }
    } catch (error) {
      console.error('Error analyzing question:', error)
      setError(error instanceof Error ? error.message : 'Failed to analyze question')
      // Fallback to forum posting
      setCurrentStep('result')
      setAIResponse({
        aiResponse: '',
        confidence: 0,
        sources: [],
        similarQuestions: [],
        shouldPostToForum: true,
        answer: 'Unable to analyze question. Please post to the forum.',
        recommendation: 'Unable to analyze question. Please post to the forum.',
        hasAnswer: false,
        showFeedback: false
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptAnswer = () => {
    onClose()
  }

  const handlePostToForum = () => {
    onProceedToForum(questionTitle, questionContent, questionTags)
    onClose()
  }

  const handleFeedback = async (wasHelpful: boolean) => {
    if (!aiResponse || feedbackSubmitted) return

    setFeedbackLoading(true)
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const response = await fetch('/api/ai-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionTitle + ' ' + questionContent,
          aiResponse: aiResponse.aiResponse,
          wasHelpful,
          classId,
          userId: user.id
        })
      })

      const data = await response.json()
      if (data.success) {
        setFeedbackSubmitted(true)
        // If feedback was negative, show retry option
        if (!wasHelpful && retryCount < 2) {
          setShowRetry(true)
        }
      } else {
        throw new Error(data.error || 'Failed to submit feedback')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      setError('Failed to submit feedback')
    } finally {
      setFeedbackLoading(false)
    }
  }

  const handleRetry = async () => {
    if (retryCount >= 2) return // Limit to 2 retries
    
    setRetryCount(prev => prev + 1)
    setShowRetry(false)
    setFeedbackSubmitted(false)
    setAIResponse(null)
    setError(null)
    
    // Retry the analysis with the same question
    await handleAnalyzeQuestion()
  }


  const handleDownloadDocument = async (filename: string) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (!user.id) {
        throw new Error('User not authenticated')
      }

      // Create download URL
      const downloadUrl = `/api/documents/${encodeURIComponent(filename)}?userId=${user.id}&classId=${classId}`
      
      // Create a temporary link element and trigger download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading document:', error)
      setError('Failed to download document')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Bot className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              AI Question Screening
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${currentStep === 'input' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                currentStep === 'input' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <span className="text-sm font-medium">Ask Your Question</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center space-x-2 ${currentStep === 'analyzing' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                currentStep === 'analyzing' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <span className="text-sm font-medium">AI Review</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center space-x-2 ${currentStep === 'result' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                currentStep === 'result' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Results</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 'input' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Bot className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-900">AI Question Screening</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      I'll check if your question can be answered from course materials or previous discussions. 
                      If I can answer confidently, you'll get an instant response. Otherwise, I'll recommend posting to the forum.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Title *
                </label>
                <input
                  type="text"
                  value={questionTitle}
                  onChange={(e) => setQuestionTitle(e.target.value)}
                  placeholder="What would you like to ask?"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Details *
                </label>
                <RichTextEditorWrapper
                  content={questionContent}
                  onChange={setQuestionContent}
                  placeholder="Provide more details about your question..."
                  className="min-h-[120px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (optional)
                </label>
                <input
                  type="text"
                  value={questionTags}
                  onChange={(e) => setQuestionTags(e.target.value)}
                  placeholder="e.g., assignment, due-date, grading"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAnalyzeQuestion}
                  disabled={!questionTitle.trim() || !questionContent.replace(/<[^>]*>/g, '').trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Bot className="h-4 w-4" />
                  <span>Submit for AI Review</span>
                </button>
              </div>
            </div>
          )}

          {currentStep === 'analyzing' && (
            <div className="text-center py-12 relative overflow-hidden">
              {/* Floating geometric shapes with movement */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Triangles */}
                <div className="absolute top-0 left-0 w-4 h-4 bg-purple-400 transform rotate-45 animate-[float_8s_ease-in-out_infinite] opacity-60"></div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-pink-400 transform rotate-45 animate-[float_6s_ease-in-out_infinite_1s] opacity-60"></div>
                <div className="absolute bottom-0 left-0 w-3.5 h-3.5 bg-blue-400 transform rotate-45 animate-[float_7s_ease-in-out_infinite_2s] opacity-60"></div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-purple-300 transform rotate-45 animate-[float_9s_ease-in-out_infinite_0.5s] opacity-60"></div>
                
                {/* Squares */}
                <div className="absolute top-1/4 left-0 w-3 h-3 bg-pink-300 animate-[float_5s_ease-in-out_infinite_1.5s] opacity-60"></div>
                <div className="absolute top-3/4 right-0 w-4 h-4 bg-blue-300 animate-[float_8.5s_ease-in-out_infinite_3s] opacity-60"></div>
                <div className="absolute bottom-1/4 left-0 w-2.5 h-2.5 bg-purple-500 animate-[float_6.5s_ease-in-out_infinite_0.8s] opacity-60"></div>
                <div className="absolute top-1/2 right-0 w-3.5 h-3.5 bg-pink-500 animate-[float_7.5s_ease-in-out_infinite_2.2s] opacity-60"></div>
                
                {/* Hexagons (using clip-path) */}
                <div className="absolute top-0 left-1/3 w-3 h-3 bg-blue-500 animate-[float_9.5s_ease-in-out_infinite_1.2s] opacity-60" style={{clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'}}></div>
                <div className="absolute bottom-0 right-1/3 w-4 h-4 bg-purple-600 animate-[float_6.8s_ease-in-out_infinite_0.3s] opacity-60" style={{clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'}}></div>
                <div className="absolute top-1/3 left-1/2 w-2.5 h-2.5 bg-pink-600 animate-[float_8.2s_ease-in-out_infinite_1.8s] opacity-60" style={{clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'}}></div>
                
                {/* Cross-pattern shapes */}
                <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-blue-600 transform rotate-45 animate-[float_7.2s_ease-in-out_infinite_0.7s] opacity-60"></div>
                <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-purple-400 transform rotate-45 animate-[float_8.8s_ease-in-out_infinite_2.5s] opacity-60"></div>
                <div className="absolute top-3/4 left-1/3 w-2.5 h-2.5 bg-pink-400 transform rotate-45 animate-[float_6.3s_ease-in-out_infinite_1.6s] opacity-60"></div>
                <div className="absolute bottom-1/3 right-1/4 w-3.5 h-3.5 bg-blue-500 transform rotate-45 animate-[float_9.2s_ease-in-out_infinite_0.9s] opacity-60"></div>
              </div>

              {/* Main animation container */}
              <div className="relative z-10">
                {/* Enhanced bot animation */}
                <div className="flex items-center justify-center space-x-4 mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                    <Bot className="h-12 w-12 text-blue-600 relative z-10 animate-bounce" />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full blur-lg opacity-30 animate-pulse delay-300"></div>
                    <Loader2 className="h-12 w-12 text-purple-600 animate-spin relative z-10" />
                  </div>
                </div>

                {/* Animated title with gradient */}
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
                  AI is reviewing your question...
                </h3>

                {/* Animated progress steps */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-center space-x-3 text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Searching through course materials</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3 text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-500"></div>
                    <span className="text-sm font-medium">Analyzing previous discussions</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3 text-gray-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-1000"></div>
                    <span className="text-sm font-medium">Generating comprehensive answer</span>
                  </div>
                </div>

                {/* Enhanced progress indicator */}
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-4">
                  <BarChart3 className="h-5 w-5 text-blue-500 animate-pulse" />
                  <span className="font-medium">Analyzing knowledge base</span>
                </div>

                {/* Animated progress bar */}
                <div className="w-64 mx-auto bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>

                {/* Floating action indicators */}
                <div className="mt-6 flex justify-center space-x-4">
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                    <span>Processing</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-200"></div>
                    <span>Analyzing</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce delay-400"></div>
                    <span>Generating</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'result' && aiResponse && (
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium text-red-900">Error: {error}</span>
                  </div>
                </div>
              )}

              {/* AI Answer - Prominent Display */}
              {(aiResponse.aiResponse || aiResponse.answer) && (
                <div className="bg-white border-2 border-green-200 rounded-lg p-6 shadow-sm">
                  {/* Main Answer */}
                  <div className="mb-4">
                    <div className="text-lg font-semibold text-gray-900 mb-2">
                      Answer:
                    </div>
                    <div className="text-xl leading-relaxed text-gray-800 font-medium">
                      {aiResponse.aiResponse || aiResponse.answer || aiResponse.recommendation}
                    </div>
                  </div>
                  
                </div>
              )}

              {/* No Confident Answer Found */}
              {(!aiResponse.aiResponse && !aiResponse.answer && aiResponse.confidence === 0) && (
                <div className="bg-white border-2 border-orange-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-6 w-6 text-orange-600 mt-1" />
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-gray-900 mb-2">
                        AI Could Not Answer This Question
                      </div>
                      <div className="text-lg leading-relaxed text-gray-700">
                        I couldn't find enough relevant information in the course materials or previous discussions to provide a confident answer.
                      </div>
                      <div className="mt-3 text-sm text-gray-600">
                        <strong>Recommendation:</strong> Post this question to the forum so your classmates and instructor can help!
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sources */}
              {aiResponse.sources && aiResponse.sources.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Sources Used:</h4>
                  <div className="space-y-2">
                    {aiResponse.sources.slice(0, 3).map((source, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        {source.type === 'document' && source.document?.filename ? (
                          <button
                            onClick={() => source.document?.filename && handleDownloadDocument(source.document.filename)}
                            className="h-4 w-4 text-blue-600 hover:text-blue-800 cursor-pointer transition-colors mt-0.5"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        ) : (
                          <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
                        )}
                        {source.type === 'qa' && (
                          <MessageSquare className="h-4 w-4 text-green-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          {source.type === 'document' && source.document?.filename ? (
                            <button
                              onClick={() => source.document?.filename && handleDownloadDocument(source.document.filename)}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                            >
                              {source.title}
                            </button>
                          ) : source.type === 'qa' && source.questionId ? (
                            <button
                              onClick={() => window.open(`/questions/${source.questionId}`, '_blank')}
                              className="text-sm font-medium text-green-600 hover:text-green-800 hover:underline cursor-pointer transition-colors"
                            >
                              {source.title}
                            </button>
                          ) : (
                            <p className="text-sm font-medium text-gray-900">
                              {source.title}
                            </p>
                          )}
                          <p className="text-xs text-gray-600">
                            {source.relevance}
                          </p>
                        </div>
                        {source.type === 'document' && source.document?.filename && (
                          <Download className="h-4 w-4 text-blue-600 hover:text-blue-800 cursor-pointer transition-colors" 
                                   onClick={() => source.document?.filename && handleDownloadDocument(source.document.filename)} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Similar Questions */}
              {aiResponse.similarQuestions && aiResponse.similarQuestions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Similar Questions Found:</h4>
                  <div className="space-y-2">
                    {aiResponse.similarQuestions.slice(0, 2).map((similar, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-900 font-medium">
                          {similar.question}
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          {similar.relevance}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}



              {/* Feedback Section */}
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={handlePostToForum}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Post to Forum
                </button>
                <button
                  onClick={handleAcceptAnswer}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>This Answers My Question</span>
                </button>
                <button
                  onClick={handleRetry}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Bot className="h-4 w-4" />
                  <span>Try Again with AI</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
