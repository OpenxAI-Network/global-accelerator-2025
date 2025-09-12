'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Clock, User, BookOpen, AlertCircle, CheckCircle, X, ArrowLeft } from 'lucide-react'
import { MarkdownRendererWrapper } from './RichTextEditorWrapper'

interface UnansweredQuestion {
  id: string
  title: string
  content: string
  tags: string[]
  username: string
  authorEmail: string
  created_at: string
  votes: number
  authorId: string
  classId: string
  className: string
  classCode: string
  timeSinceCreated: string
}

interface ClassUnansweredQuestionsProps {
  classId: string
  teacherId: string
  onClose: () => void
  onQuestionAnswered?: (questionId: string) => void
}

export default function ClassUnansweredQuestions({ 
  classId, 
  teacherId, 
  onClose, 
  onQuestionAnswered 
}: ClassUnansweredQuestionsProps) {
  const [unansweredQuestions, setUnansweredQuestions] = useState<UnansweredQuestion[]>([])
  const [classInfo, setClassInfo] = useState<{ id: string; name: string; code: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [answeringQuestion, setAnsweringQuestion] = useState<string | null>(null)
  const [answerContent, setAnswerContent] = useState('')
  const [submittingAnswer, setSubmittingAnswer] = useState(false)

  useEffect(() => {
    fetchUnansweredQuestions()
  }, [classId, teacherId])

  const fetchUnansweredQuestions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/unanswered-questions-by-class?classId=${classId}&teacherId=${teacherId}`)
      const data = await response.json()

      if (data.success) {
        setUnansweredQuestions(data.unansweredQuestions)
        setClassInfo(data.classInfo)
      } else {
        setError(data.error || 'Failed to fetch unanswered questions')
      }
    } catch (err) {
      setError('Failed to fetch unanswered questions')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSubmit = async (questionId: string) => {
    if (!answerContent.trim()) return

    try {
      setSubmittingAnswer(true)
      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          content: answerContent.trim(),
          authorId: teacherId,
          isAiGenerated: false
        }),
      })

      const data = await response.json()

      if (data.success) {
        setAnswerContent('')
        setAnsweringQuestion(null)
        // Remove the answered question from the list
        setUnansweredQuestions(prev => prev.filter(q => q.id !== questionId))
        onQuestionAnswered?.(questionId)
      } else {
        setError(data.error || 'Failed to submit answer')
      }
    } catch (err) {
      setError('Failed to submit answer')
    } finally {
      setSubmittingAnswer(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center text-red-600 mb-4">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={onClose}
                className="mr-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 text-orange-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Unanswered Questions - {classInfo?.code}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {unansweredQuestions.length} unanswered question{unansweredQuestions.length !== 1 ? 's' : ''} in {classInfo?.name}
          </p>
        </div>

        {/* Content */}
        {unansweredQuestions.length === 0 ? (
          <div className="p-6">
            <div className="flex items-center text-green-600 mb-4">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">All Caught Up!</span>
            </div>
            <p className="text-gray-600">No unanswered questions in this class.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {unansweredQuestions.map((question) => (
              <div key={question.id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">{question.timeSinceCreated}</span>
                    </div>
                    
                    <h4 className="text-xl font-medium text-gray-900 mb-2">
                      {question.title}
                    </h4>
                    
                    <div className="text-gray-600 text-sm mb-3 line-clamp-3">
                      <MarkdownRendererWrapper content={question.content} />
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        <span>{question.username}</span>
                      </div>
                      <span>•</span>
                      <span>{question.votes} votes</span>
                    </div>

                    {question.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {question.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {answeringQuestion === question.id ? (
                  <div className="mt-4">
                    <textarea
                      value={answerContent}
                      onChange={(e) => setAnswerContent(e.target.value)}
                      placeholder="Write your answer here..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                    />
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => handleAnswerSubmit(question.id)}
                        disabled={submittingAnswer || !answerContent.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submittingAnswer ? 'Submitting...' : 'Submit Answer'}
                      </button>
                      <button
                        onClick={() => {
                          setAnsweringQuestion(null)
                          setAnswerContent('')
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAnsweringQuestion(question.id)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Answer This Question
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

