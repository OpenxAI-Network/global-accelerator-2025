'use client'

import { useState, useEffect } from 'react'
import { X, Bot, CheckCircle, AlertCircle, ArrowRight, Loader2, FileText, MessageSquare, AlertTriangle, ChevronDown, ChevronUp, Download } from 'lucide-react'
import RichTextEditor from './RichTextEditor'

interface AIQuestionModalProps {
  isOpen: boolean
  onClose: () => void
  classId: string
  onProceedToForum: (questionTitle: string, questionContent: string, questionTags: string) => void
}

interface AIResponse {
  aiResponse: string
  confidence: number
  sources: any[]
  shouldPostToForum: boolean
  recommendation: string
  hasAnswer: boolean
  showFeedback: boolean
}

export default function AIQuestionModal({ isOpen, onClose, classId, onProceedToForum }: AIQuestionModalProps) {
  const [currentStep, setCurrentStep] = useState<'input' | 'analyzing' | 'result'>('input')
  const [questionTitle, setQuestionTitle] = useState('')
  const [questionContent, setQuestionContent] = useState('')
  const [questionTags, setQuestionTags] = useState('')
  const [aiResponse, setAIResponse] = useState<AIResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [isAnswerExpanded, setIsAnswerExpanded] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setCurrentStep('input')
      setQuestionTitle('')
      setQuestionContent('')
      setQuestionTags('')
      setAIResponse(null)
      setIsAnswerExpanded(false)
    }
  }, [isOpen])

  const handleAnalyzeQuestion = async () => {
    const textContent = questionContent.replace(/<[^>]*>/g, '').trim()
    if (!questionTitle.trim() || !textContent) return

    setLoading(true)
    setCurrentStep('analyzing')

    try {
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
        console.log('Raw API response:', data)
        console.log('Raw confidence:', data.confidence, 'Type:', typeof data.confidence)
        console.log('Converted confidence:', Number(data.confidence), 'Type:', typeof Number(data.confidence))
        
        setAIResponse({
          aiResponse: data.aiResponse,
          confidence: Number(data.confidence),
          sources: data.sources,
          shouldPostToForum: data.shouldPostToForum,
          recommendation: data.recommendation,
          hasAnswer: data.hasAnswer,
          showFeedback: data.showFeedback
        })
        setCurrentStep('result')
      } else {
        console.error('AI analysis failed:', data.error)
        // Fallback to forum posting
        setCurrentStep('result')
        setAIResponse({
          aiResponse: '',
          confidence: 0,
          sources: [],
          shouldPostToForum: true,
          recommendation: 'Unable to analyze question. Please post to the forum.',
          hasAnswer: false,
          showFeedback: false
        })
      }
    } catch (error) {
      console.error('Error analyzing question:', error)
      // Fallback to forum posting
      setCurrentStep('result')
      setAIResponse({
        aiResponse: '',
        confidence: 0,
        sources: [],
        shouldPostToForum: true,
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

      if (response.ok) {
        setFeedbackSubmitted(true)
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setFeedbackLoading(false)
    }
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
              AI Question Assistant
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
              <span className="text-sm font-medium">AI Analysis</span>
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
                    <h3 className="text-sm font-medium text-blue-900">Let me check if this has been answered!</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      I'll search through past discussions and course materials to see if I can answer your question immediately.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Title
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
                  Question Details
                </label>
                <RichTextEditor
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
                  <span>Check with AI</span>
                </button>
              </div>
            </div>
          )}

          {currentStep === 'analyzing' && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                <Bot className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing your question...</h3>
              <p className="text-gray-600">
                Searching through course materials and past discussions
              </p>
            </div>
          )}

          {currentStep === 'result' && aiResponse && (
            <div className="space-y-6">
              {/* AI Response */}
              {aiResponse.aiResponse && (
                <div className={`border rounded-lg p-6 ${
                  aiResponse.confidence > 0.95 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-start space-x-3 mb-4">
                    {aiResponse.confidence > 0.95 ? (
                      <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-1 ${
                        aiResponse.confidence > 0.95 ? 'text-green-900' : 'text-yellow-900'
                      }`}>
                        {aiResponse.confidence > 0.95 ? '🎯 Exact Answer Found!' : '💡 Related Information Found'}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {aiResponse.confidence > 0.95 && (
                          <span className="text-xs px-2 py-1 rounded bg-blue-200 text-blue-800 font-medium">
                            From Course Materials
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Full AI Answer */}
                  <div className={`prose max-w-none ${
                    aiResponse.confidence > 0.95 ? 'text-green-900' : 'text-yellow-900'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {aiResponse.aiResponse.length > 300 && !isAnswerExpanded ? (
                        <>
                          {aiResponse.aiResponse.substring(0, 300)}...
                          <button
                            onClick={() => setIsAnswerExpanded(true)}
                            className="ml-2 inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-xs"
                          >
                            Show more <ChevronDown className="h-3 w-3 ml-1" />
                          </button>
                        </>
                      ) : (
                        <>
                          {aiResponse.aiResponse}
                          {aiResponse.aiResponse.length > 300 && isAnswerExpanded && (
                            <button
                              onClick={() => setIsAnswerExpanded(false)}
                              className="ml-2 inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-xs"
                            >
                              Show less <ChevronUp className="h-3 w-3 ml-1" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* No Answer Found */}
              {!aiResponse.aiResponse && (
                <div className="border border-orange-200 rounded-lg p-6 bg-orange-50">
                  <div className="flex items-start space-x-3 mb-4">
                    <AlertTriangle className="h-6 w-6 text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1 text-orange-900">
                        🤔 No Confident Answer Found
                      </h3>
                      <p className="text-sm text-orange-800">
                        The AI could not find a confident answer in the available course materials.
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-orange-800">
                    <p className="mb-2">
                      <strong>Why this happened:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Your question may be about content not covered in uploaded materials</li>
                      <li>The AI only provides answers based on exact matches from course documents</li>
                      <li>This prevents giving incorrect or misleading information</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Sources */}
              {aiResponse.sources && aiResponse.sources.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Sources:</h4>
                  <div className="space-y-2">
                    {aiResponse.sources.slice(0, 3).map((source, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        {source.type === 'document' && source.document?.filename ? (
                          <button
                            onClick={() => handleDownloadDocument(source.document.filename)}
                            className="h-4 w-4 text-blue-600 hover:text-blue-800 cursor-pointer transition-colors mt-0.5"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        ) : source.type === 'document' ? (
                          <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
                        ) : (
                          <MessageSquare className="h-4 w-4 text-green-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          {source.type === 'document' && source.document?.filename ? (
                            <button
                              onClick={() => handleDownloadDocument(source.document.filename)}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors text-left w-full"
                            >
                              {source.document?.title || source.title || 'Unknown Source'}
                            </button>
                          ) : source.type === 'qa' && source.questionId ? (
                            <button
                              onClick={() => window.open(`/questions/${source.questionId}`, '_blank')}
                              className="text-sm font-medium text-green-600 hover:text-green-800 hover:underline cursor-pointer transition-colors text-left w-full"
                            >
                              {source.question?.title || source.title || 'Unknown Source'}
                            </button>
                          ) : (
                            <p className="text-sm font-medium text-gray-900">
                              {source.document?.title || source.question?.title || source.title || 'Unknown Source'}
                            </p>
                          )}
                          <p className="text-xs text-gray-600">
                            {source.type === 'document' ? 'Course Material - Click to download' : 'Past Discussion - Click to view'}
                          </p>
                        </div>
                        {source.type === 'document' && source.document?.filename && (
                          <Download className="h-4 w-4 text-blue-600 hover:text-blue-800 cursor-pointer transition-colors" 
                                   onClick={() => handleDownloadDocument(source.document.filename)} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendation */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendation:</h4>
                <p className="text-sm text-gray-700">{aiResponse.recommendation}</p>
              </div>

              {/* Feedback Section */}
              {aiResponse.showFeedback && !feedbackSubmitted && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-3">Was this answer helpful?</h4>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleFeedback(true)}
                      disabled={feedbackLoading}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {feedbackLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      <span>Yes, it helped!</span>
                    </button>
                    <button
                      onClick={() => handleFeedback(false)}
                      disabled={feedbackLoading}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {feedbackLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      <span>No, not helpful</span>
                    </button>
                  </div>
                </div>
              )}

              {feedbackSubmitted && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Thank you for your feedback!</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                {aiResponse.confidence > 0.75 ? (
                  <>
                    <button
                      onClick={handlePostToForum}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Post to Forum Anyway
                    </button>
                    <button
                      onClick={handleAcceptAnswer}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Use This Answer</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handlePostToForum}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Post to Forum</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
