'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ChevronUp, ChevronDown, MessageSquare, User, Clock, Download, Code, FileText, Edit, Trash2 } from 'lucide-react'
import RichTextEditorWrapper, { MarkdownRendererWrapper } from '../../../components/RichTextEditorWrapper'
import ExpandableAnswer from '../../../components/ExpandableAnswer'
import { useAuth } from '../../../contexts/AuthContext'
import ProtectedRoute from '../../../components/ProtectedRoute'

interface Question {
  id: string
  title: string
  content: string
  tags: string[]
  username: string
  created_at: string
  answer_count: number
  votes: number
  authorId: string
  userVote: 'up' | 'down' | null
  authorProfilePicture?: string
}

interface Answer {
  id: string
  content: string
  username: string
  created_at: string
  is_ai_generated: boolean
  votes: number
  authorId: string
  userVote: 'up' | 'down' | null
  sourceCode?: string
  sourceCodeFilename?: string
  hasSourceCode?: boolean
  sourceDocumentContent?: string
  sourceDocumentFilename?: string
  hasSourceDocument?: boolean
  sourceDocumentType?: string
  sourceDocumentTitle?: string
  authorProfilePicture?: string
}

export default function QuestionDetail() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [question, setQuestion] = useState<Question | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)
  const [answersLoading, setAnswersLoading] = useState(false)
  const [newAnswer, setNewAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  // Edit/Delete state
  const [editingAnswer, setEditingAnswer] = useState<any>(null)
  const [editAnswerContent, setEditAnswerContent] = useState('')
  const [showEditAnswerModal, setShowEditAnswerModal] = useState(false)

  const fetchQuestion = async () => {
    try {
      const url = user 
        ? `/api/questions/${id}?userId=${user.id}`
        : `/api/questions/${id}`
      const response = await fetch(url)
      const data = await response.json()
      
      if (response.ok && data.question) {
        setQuestion(data.question)
      } else {
        console.error('Question not found')
      }
    } catch (error) {
      console.error('Error fetching question:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnswers = async () => {
    setAnswersLoading(true)
    try {
      const url = user 
        ? `/api/answers?questionId=${id}&userId=${user.id}`
        : `/api/answers?questionId=${id}`
      const response = await fetch(url)
      const data = await response.json()
      
      if (response.ok && data.answers) {
        setAnswers(data.answers)
      }
    } catch (error) {
      console.error('Error fetching answers:', error)
    } finally {
      setAnswersLoading(false)
    }
  }

  const handleVote = async (questionId: string, voteType: 'UP' | 'DOWN', isAnswer: boolean = false) => {
    if (!user) return

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          [isAnswer ? 'answerId' : 'questionId']: questionId,
          type: voteType
        })
      })

      if (response.ok) {
        // Refresh data to show updated vote counts
        await fetchQuestion()
        await fetchAnswers()
      }
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!user || !newAnswer.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newAnswer.trim(),
          questionId: id,
          authorId: user.id
        })
      })

      if (response.ok) {
        setNewAnswer('')
        await fetchAnswers()
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownloadSourceCode = async (sourceCode: string, filename: string, questionTitle: string) => {
    try {
      const url = `/api/source-code/${filename}?code=${encodeURIComponent(sourceCode)}&title=${encodeURIComponent(questionTitle)}`
      const response = await fetch(url)
      
      if (response.ok) {
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(downloadUrl)
        document.body.removeChild(a)
      } else {
        console.error('Failed to download source code')
      }
    } catch (error) {
      console.error('Error downloading source code:', error)
    }
  }

  const handleDownloadSourceDocument = async (content: string, filename: string, documentType: string, title: string) => {
    try {
      const url = `/api/source-document/${filename}?content=${encodeURIComponent(content)}&type=${encodeURIComponent(documentType)}&title=${encodeURIComponent(title)}`
      const response = await fetch(url)
      
      if (response.ok) {
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(downloadUrl)
        document.body.removeChild(a)
      } else {
        console.error('Failed to download source document')
      }
    } catch (error) {
      console.error('Error downloading source document:', error)
    }
  }

  const handleEditAnswer = (answer: any) => {
    // Set the answer to edit mode
    setEditingAnswer(answer)
    setEditAnswerContent(answer.content)
    setShowEditAnswerModal(true)
  }

  const handleDeleteAnswer = async (answerId: string) => {
    if (!user) return

    if (!confirm('Are you sure you want to delete this answer? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/answers?answerId=${answerId}&userId=${user.id}&userRole=${user.role}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (data.success) {
        // Remove the answer from the list
        setAnswers(prev => prev.filter(a => a.id !== answerId))
        // Update the question's answer count
        setQuestion(prev => prev ? { ...prev, answer_count: prev.answer_count - 1 } : null)
      } else {
        console.error('Failed to delete answer:', data.error)
      }
    } catch (error) {
      console.error('Error deleting answer:', error)
    }
  }

  const handleUpdateAnswer = async () => {
    if (!editingAnswer || !user) return

    if (!editAnswerContent.trim()) {
      return
    }

    try {
      const response = await fetch('/api/answers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answerId: editingAnswer.id,
          content: editAnswerContent,
          userId: user.id
        }),
      })

      const data = await response.json()
      if (data.success) {
        // Update the answer in the list
        setAnswers(prev => prev.map(a => 
          a.id === editingAnswer.id 
            ? { ...a, ...data.answer }
            : a
        ))
        setShowEditAnswerModal(false)
        setEditingAnswer(null)
      } else {
        console.error('Failed to update answer:', data.error)
      }
    } catch (error) {
      console.error('Error updating answer:', error)
    }
  }

  useEffect(() => {
    if (id) {
      fetchQuestion()
      fetchAnswers()
    }
  }, [id, user])

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!question) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Question Not Found</h1>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Class
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Question */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-start space-x-4">
              {/* Voting Section */}
              <div className="flex flex-col items-center space-y-1">
                <button
                  onClick={() => handleVote(question.id, 'UP')}
                  className={`p-2 rounded-md transition-colors ${
                    question.userVote === 'up' 
                      ? 'text-orange-600 bg-orange-50 hover:bg-orange-100' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ChevronUp className="h-6 w-6" />
                </button>
                <span className={`text-lg font-bold ${
                  question.votes > 0 ? 'text-green-600' : 
                  question.votes < 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {question.votes || 0}
                </span>
                <button
                  onClick={() => handleVote(question.id, 'DOWN')}
                  className={`p-2 rounded-md transition-colors ${
                    question.userVote === 'down' 
                      ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ChevronDown className="h-6 w-6" />
                </button>
              </div>

              {/* Question Content */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{question.title}</h1>
                
                <div className="prose max-w-none mb-4">
                  <MarkdownRendererWrapper content={question.content} />
                </div>

                {question.tags && question.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {question.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2 overflow-hidden">
                      {question.authorProfilePicture ? (
                        <img
                          src={question.authorProfilePicture}
                          alt={question.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {(question.username || 'U')[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="font-medium">{question.username}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Asked {new Date(question.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>{question.answer_count} answer{question.answer_count !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Answers Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {answers.length} Answer{answers.length !== 1 ? 's' : ''}
            </h2>

            {answersLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading answers...</p>
              </div>
            ) : answers.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No answers yet. Be the first to answer!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {answers.map((answer) => (
                  <div key={answer.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-start space-x-4">
                      {/* Voting Section */}
                      <div className="flex flex-col items-center space-y-1">
                        <button
                          onClick={() => handleVote(answer.id, 'UP', true)}
                          className={`p-1 rounded-md transition-colors ${
                            answer.userVote === 'up' 
                              ? 'text-orange-600 bg-orange-50 hover:bg-orange-100' 
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <ChevronUp className="h-5 w-5" />
                        </button>
                        <span className={`text-sm font-medium ${
                          answer.votes > 0 ? 'text-green-600' : 
                          answer.votes < 0 ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {answer.votes || 0}
                        </span>
                        <button
                          onClick={() => handleVote(answer.id, 'DOWN', true)}
                          className={`p-1 rounded-md transition-colors ${
                            answer.userVote === 'down' 
                              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <ChevronDown className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Answer Content */}
                      <div className="flex-1">
                        <div className="mb-3">
                          <ExpandableAnswer content={answer.content} />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <div className="flex items-center">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center mr-2 overflow-hidden">
                                {answer.authorProfilePicture ? (
                                  <img
                                    src={answer.authorProfilePicture}
                                    alt={answer.username}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-green-500 flex items-center justify-center">
                                    <span className="text-xs font-medium text-white">
                                      {(answer.username || 'U')[0].toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <span className="font-medium">{answer.username}</span>
                            </div>
                            <span>Answered {new Date(answer.created_at).toLocaleDateString()}</span>
                            
                            {/* Edit/Delete Buttons for Answer Author */}
                            {user && answer.authorId === user.id && (
                              <div className="flex items-center space-x-1 ml-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEditAnswer(answer)
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                  title="Edit answer"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteAnswer(answer.id)
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                  title="Delete answer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {answer.is_ai_generated && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                AI Generated
                              </span>
                            )}
                            
                            {answer.hasSourceCode && answer.sourceCode && answer.sourceCodeFilename && (
                              <button
                                onClick={() => handleDownloadSourceCode(answer.sourceCode!, answer.sourceCodeFilename!, question?.title || 'Unknown Question')}
                                className="inline-flex items-center px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                                title="Download Source Code"
                              >
                                <Code className="h-3 w-3 mr-1" />
                                Download Code
                              </button>
                            )}
                            
                            {answer.hasSourceDocument && answer.sourceDocumentContent && answer.sourceDocumentFilename && (
                              <button
                                onClick={() => handleDownloadSourceDocument(answer.sourceDocumentContent!, answer.sourceDocumentFilename!, answer.sourceDocumentType || 'Unknown', answer.sourceDocumentTitle || 'Unknown')}
                                className="inline-flex items-center px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
                                title="Download Source Document"
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                Download Source
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Answer Form */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Answer</h3>
              <div className="space-y-4">
                <RichTextEditorWrapper
                  content={newAnswer}
                  onChange={setNewAnswer}
                  placeholder="Write your answer here... Use the toolbar above to format your text, add code blocks, lists, and more!"
                  className="w-full"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={submitting || !newAnswer.trim()}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Post Answer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Answer Modal */}
      {showEditAnswerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h2 className="text-xl font-bold mb-4">Edit Answer</h2>
            <div className="mb-4">
              <RichTextEditorWrapper
                content={editAnswerContent}
                onChange={setEditAnswerContent}
                placeholder="Edit your answer..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditAnswerModal(false)
                  setEditingAnswer(null)
                  setEditAnswerContent('')
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateAnswer}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Update Answer
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  )
}
