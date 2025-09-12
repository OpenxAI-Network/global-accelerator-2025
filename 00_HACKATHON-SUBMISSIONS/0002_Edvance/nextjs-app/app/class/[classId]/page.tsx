'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageSquare, Plus, Users, BookOpen, LogOut, ArrowLeft, Search, Bot, GraduationCap, User, ChevronUp, ChevronDown, Trash2, Download, Eye, FileText, File, Edit } from 'lucide-react'
import { MarkdownRendererWrapper } from '../../../components/RichTextEditorWrapper'
import Toast from '../../../components/Toast'
import { useAuth } from '../../../contexts/AuthContext'
import ProtectedRoute from '../../../components/ProtectedRoute'
import { useRouter, useParams } from 'next/navigation'
import AIQuestionScreeningModal from '../../../components/AIQuestionScreeningModal'
import DocumentUpload from '../../../components/DocumentUpload'
import { permissions, getRoleDisplayName, getRoleColor } from '../../../utils/permissions'

// Fallback class data for demo classes
const classData = {
  finc3012: {
    id: 'finc3012',
    name: 'Derivative Securities',
    code: 'FINC3012',
    description: 'Advanced study of derivative instruments and their applications in financial markets.',
    instructor: 'Dr. Sarah Chen',
    semester: 'Semester 1, 2024',
    studentCount: 45,
    color: 'bg-blue-500'
  },
  amme2000: {
    id: 'amme2000',
    name: 'Engineering Analysis',
    code: 'AMME2000',
    description: 'Mathematical and computational methods for engineering problem solving.',
    instructor: 'Prof. Michael Rodriguez',
    semester: 'Semester 1, 2024',
    studentCount: 78,
    color: 'bg-green-500'
  },
  buss1000: {
    id: 'buss1000',
    name: 'Future of Business',
    code: 'BUSS1000',
    description: 'Exploring emerging business trends and digital transformation strategies.',
    instructor: 'Dr. Emily Watson',
    semester: 'Semester 1, 2024',
    studentCount: 120,
    color: 'bg-purple-500'
  },
  engg1810: {
    id: 'engg1810',
    name: 'Introduction to Engineering Computing',
    code: 'ENGG1810',
    description: 'Programming and computational thinking for engineering applications.',
    instructor: 'Dr. James Liu',
    semester: 'Semester 1, 2024',
    studentCount: 95,
    color: 'bg-yellow-500'
  },
  math1021: {
    id: 'math1021',
    name: 'Calculus of One Variable',
    code: 'MATH1021',
    description: 'Fundamental concepts of differential and integral calculus.',
    instructor: 'Prof. Anna Thompson',
    semester: 'Semester 1, 2024',
    studentCount: 200,
    color: 'bg-red-500'
  },
  phys1001: {
    id: 'phys1001',
    name: 'Physics 1A',
    code: 'PHYS1001',
    description: 'Mechanics, waves, and thermodynamics for science and engineering students.',
    instructor: 'Dr. Robert Kim',
    semester: 'Semester 1, 2024',
    studentCount: 150,
    color: 'bg-indigo-500'
  }
}

export default function ClassForum() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const params = useParams()
  const classId = params.classId as string
  
  const [activeTab, setActiveTab] = useState<'questions' | 'discussion' | 'documents' | 'class-info'>('questions')
  const [questions, setQuestions] = useState<any[]>([])
  const [questionsLoading, setQuestionsLoading] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [documentsAccessError, setDocumentsAccessError] = useState<string | null>(null)
  const [downloadingDocument, setDownloadingDocument] = useState<string | null>(null)
  const [showAIModal, setShowAIModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'answered' | 'unanswered'>('all')
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [votingQuestionId, setVotingQuestionId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [userProfilePicture, setUserProfilePicture] = useState('')
  
  // Edit/Delete state
  const [editingQuestion, setEditingQuestion] = useState<any>(null)
  const [editQuestionTitle, setEditQuestionTitle] = useState('')
  const [editQuestionContent, setEditQuestionContent] = useState('')
  const [editQuestionTags, setEditQuestionTags] = useState<string[]>([])
  const [showEditQuestionModal, setShowEditQuestionModal] = useState(false)
  
  const [editingAnswer, setEditingAnswer] = useState<any>(null)
  const [editAnswerContent, setEditAnswerContent] = useState('')
  const [showEditAnswerModal, setShowEditAnswerModal] = useState(false)

  // Debug function to log profile picture state
  const setUserProfilePictureWithLog = (picture: string) => {
    console.log('Setting profile picture:', picture ? 'Found' : 'Not found')
    setUserProfilePicture(picture)
  }

  // Filter questions based on search and status
  const filteredQuestions = questions.filter(question => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (question.tags && question.tags.some((tag: string) => 
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    
    // Status filter
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'answered' && question.answer_count > 0) ||
      (filterStatus === 'unanswered' && question.answer_count === 0);
    
    return matchesSearch && matchesStatus;
  });

  const [currentClass, setCurrentClass] = useState<any>(null)
  const [classLoading, setClassLoading] = useState(true)

  // Helper function to get file type icon
  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />
      case 'doc':
      case 'docx':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'txt':
        return <FileText className="h-4 w-4 text-gray-500" />
      case 'rtf':
        return <FileText className="h-4 w-4 text-green-500" />
      default:
        return <File className="h-4 w-4 text-gray-400" />
    }
  }

  const fetchClassDetails = useCallback(async () => {
    setClassLoading(true)
    try {
      // First try to get from database using the ID
      const response = await fetch(`/api/class-details?classId=${classId}`)
      const data = await response.json()
      
      if (data.success && data.class) {
        setCurrentClass(data.class)
      } else {
        // Fallback to demo data
        const demoClass = classData[classId as keyof typeof classData]
        if (demoClass) {
          setCurrentClass(demoClass)
        }
      }
    } catch (error) {
      console.error('Error fetching class details:', error)
      // Fallback to demo data
      const demoClass = classData[classId as keyof typeof classData]
      if (demoClass) {
        setCurrentClass(demoClass)
      }
    } finally {
      setClassLoading(false)
    }
  }, [classId])

  const fetchQuestions = useCallback(async () => {
    setQuestionsLoading(true)
    try {
      const url = user 
        ? `/api/questions?classId=${classId}&userId=${user.id}`
        : `/api/questions?classId=${classId}`
      const response = await fetch(url)
      const data = await response.json()
      if (data.success) {
        setQuestions(data.questions || [])
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
      setQuestions([])
    } finally {
      setQuestionsLoading(false)
    }
  }, [classId, user])

  const fetchDocuments = useCallback(async () => {
    if (!user) return
    
    setDocumentsLoading(true)
    setDocumentsAccessError(null)
    try {
      const response = await fetch(`/api/upload-documents?classId=${classId}&userId=${user.id}`)
      const data = await response.json()
      if (data.success) {
        setDocuments(data.documents || [])
      } else {
        console.error('Error fetching documents:', data.error)
        setDocuments([])
        if (response.status === 403) {
          setDocumentsAccessError(data.error || 'Access denied')
        }
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      setDocuments([])
    } finally {
      setDocumentsLoading(false)
    }
  }, [classId, user])

  const fetchEnrolledStudents = useCallback(async () => {
    setStudentsLoading(true)
    try {
      const response = await fetch(`/api/class-enrolled-students?classId=${classId}`)
      const data = await response.json()
      if (data.success) {
        setEnrolledStudents(data.students || [])
      } else {
        console.error('Error fetching enrolled students:', data.error)
        setEnrolledStudents([])
      }
    } catch (error) {
      console.error('Error fetching enrolled students:', error)
      setEnrolledStudents([])
    } finally {
      setStudentsLoading(false)
    }
  }, [classId])

  const handleDocumentUploadSuccess = (document: any) => {
    setDocuments(prev => [document, ...prev])
  }

  const handleDocumentDelete = async (documentId: string) => {
    if (!user) return
    
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/upload-documents?documentId=${documentId}&userId=${user.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (data.success) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId))
      } else {
        alert('Failed to delete document: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Failed to delete document')
    }
  }

  const handleViewDocument = (doc: any) => {
    if (!user) return
    
    const url = `/api/documents/${doc.filename}?userId=${user.id}&classId=${classId}`
    window.open(url, '_blank')
  }

  const handleDownloadDocument = async (doc: any) => {
    if (!user) return
    
    setDownloadingDocument(doc.id)
    
    // For PDFs, try a simpler approach first
    const isPDF = doc.filename.toLowerCase().endsWith('.pdf')
    
    if (isPDF) {
      // Method 1: Direct link for PDFs
      try {
        const downloadUrl = `/api/documents/${doc.filename}?userId=${user.id}&classId=${classId}`
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = doc.title || doc.filename
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        console.log('PDF download initiated via direct link')
        return
      } catch (error) {
        console.log('Direct link failed, trying blob method...')
      }
    }
    
    // Method 2: Blob download for all files
    try {
      const response = await fetch(`/api/documents/${doc.filename}?userId=${user.id}&classId=${classId}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      // Check if response is JSON (error) or binary (file)
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to download document')
      }
      
      const blob = await response.blob()
      console.log('Blob created successfully:', {
        size: blob.size,
        type: blob.type,
        filename: doc.filename
      })
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.title || doc.filename
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      console.log('Download link clicked')
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }, 100)
      
    } catch (error) {
      console.error('Error downloading document:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to download document: ${errorMessage}`)
    } finally {
      setDownloadingDocument(null)
    }
  }

  const handleProceedToForum = async (questionTitle: string, questionContent: string, questionTags: string) => {
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: questionTitle,
          content: questionContent,
          tags: questionTags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
          classId: classId,
          authorId: user?.id, // Add the user ID as authorId
        }),
      })

      const data = await response.json()
      if (data.success) {
        setQuestions(prev => [data.question, ...prev])
        setShowAIModal(false)
      } else {
        console.error('Failed to create question:', data.error)
      }
    } catch (error) {
      console.error('Error creating question:', error)
    }
  }

  const handleVote = async (questionId: string, voteType: 'UP' | 'DOWN') => {
    if (!user) return

    setVotingQuestionId(questionId)
    
    // Store the current question state for rollback
    const currentQuestion = questions.find(q => q.id === questionId)
    const currentVote = currentQuestion?.userVote
    const currentVoteCount = currentQuestion?.votes || 0
    
    // Optimistic update - immediately update the UI
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        let newVoteCount = currentVoteCount
        let newUserVote: 'up' | 'down' | null = null
        
        // Convert voteType to lowercase for comparison with currentVote
        const voteTypeLower = voteType.toLowerCase() as 'up' | 'down'
        
        // Calculate the new vote count based on the current state
        if (currentVote === voteTypeLower) {
          // User is clicking the same vote type - remove the vote
          newVoteCount = voteType === 'UP' ? currentVoteCount - 1 : currentVoteCount + 1
          newUserVote = null
        } else if (currentVote === null) {
          // User is voting for the first time
          newVoteCount = voteType === 'UP' ? currentVoteCount + 1 : currentVoteCount - 1
          newUserVote = voteTypeLower
        } else {
          // User is changing their vote
          newVoteCount = voteType === 'UP' ? currentVoteCount + 2 : currentVoteCount - 2
          newUserVote = voteTypeLower
        }
        
        return {
          ...q,
          votes: newVoteCount,
          userVote: newUserVote
        }
      }
      return q
    }))
    
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          questionId: questionId,
          type: voteType
        }),
      })

      const data = await response.json()
      if (data.success) {
        // Update with server response to ensure accuracy
        setQuestions(prev => prev.map(q => 
          q.id === questionId 
            ? { 
                ...q, 
                votes: data.newVoteCount || data.votes || q.votes, 
                userVote: data.userVote 
              }
            : q
        ))
        
        // Show success toast
        setToast({ message: 'Vote recorded successfully!', type: 'success' })
      } else {
        console.error('Failed to vote:', data.error)
        // Rollback optimistic update on failure
        setQuestions(prev => prev.map(q => 
          q.id === questionId 
            ? { 
                ...q, 
                votes: currentVoteCount, 
                userVote: currentVote 
              }
            : q
        ))
        setToast({ message: 'Failed to vote. Please try again.', type: 'error' })
      }
    } catch (error) {
      console.error('Error voting:', error)
      // Rollback optimistic update on error
      setQuestions(prev => prev.map(q => 
        q.id === questionId 
          ? { 
              ...q, 
              votes: currentVoteCount, 
              userVote: currentVote 
            }
          : q
      ))
      setToast({ message: 'Network error. Please check your connection and try again.', type: 'error' })
    } finally {
      setVotingQuestionId(null)
    }
  }

  const handleEditQuestion = (question: any) => {
    // Set the question to edit mode
    setEditingQuestion(question)
    setEditQuestionTitle(question.title)
    setEditQuestionContent(question.content)
    setEditQuestionTags(question.tags || [])
    setShowEditQuestionModal(true)
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!user) return

    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/questions?questionId=${questionId}&userId=${user.id}&userRole=${user.role}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (data.success) {
        // Remove the question from the list
        setQuestions(prev => prev.filter(q => q.id !== questionId))
        setToast({ message: 'Question deleted successfully!', type: 'success' })
      } else {
        setToast({ message: data.error || 'Failed to delete question', type: 'error' })
      }
    } catch (error) {
      console.error('Error deleting question:', error)
      setToast({ message: 'Network error. Please try again.', type: 'error' })
    }
  }

  const handleUpdateQuestion = async () => {
    if (!editingQuestion || !user) return

    if (!editQuestionTitle.trim() || !editQuestionContent.trim()) {
      setToast({ message: 'Title and content are required', type: 'error' })
      return
    }

    try {
      const response = await fetch('/api/questions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: editingQuestion.id,
          title: editQuestionTitle,
          content: editQuestionContent,
          tags: editQuestionTags,
          userId: user.id
        }),
      })

      const data = await response.json()
      if (data.success) {
        // Update the question in the list
        setQuestions(prev => prev.map(q => 
          q.id === editingQuestion.id 
            ? { ...q, ...data.question }
            : q
        ))
        setToast({ message: 'Question updated successfully!', type: 'success' })
        setShowEditQuestionModal(false)
        setEditingQuestion(null)
      } else {
        setToast({ message: data.error || 'Failed to update question', type: 'error' })
      }
    } catch (error) {
      console.error('Error updating question:', error)
      setToast({ message: 'Network error. Please try again.', type: 'error' })
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
        setToast({ message: 'Answer deleted successfully!', type: 'success' })
      } else {
        setToast({ message: data.error || 'Failed to delete answer', type: 'error' })
      }
    } catch (error) {
      console.error('Error deleting answer:', error)
      setToast({ message: 'Network error. Please try again.', type: 'error' })
    }
  }

  const handleUpdateAnswer = async () => {
    if (!editingAnswer || !user) return

    if (!editAnswerContent.trim()) {
      setToast({ message: 'Content is required', type: 'error' })
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
        setToast({ message: 'Answer updated successfully!', type: 'success' })
        setShowEditAnswerModal(false)
        setEditingAnswer(null)
      } else {
        setToast({ message: data.error || 'Failed to update answer', type: 'error' })
      }
    } catch (error) {
      console.error('Error updating answer:', error)
      setToast({ message: 'Network error. Please try again.', type: 'error' })
    }
  }

  useEffect(() => {
    if (classId && user) {
      fetchClassDetails()
      fetchQuestions()
      fetchDocuments()
      fetchEnrolledStudents()
    }
  }, [classId, user, fetchClassDetails, fetchQuestions, fetchDocuments, fetchEnrolledStudents])

  // Load user profile picture
  useEffect(() => {
    if (user?.id) {
      // First try localStorage
      const savedProfile = localStorage.getItem(`userProfile_${user.id}`)
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile)
          if (profile.profilePicture) {
            setUserProfilePictureWithLog(profile.profilePicture)
            return
          }
        } catch (error) {
          console.error('Error loading profile picture from localStorage:', error)
        }
      }
      
      // For demo user, try to load from a generic demo profile key as fallback
      if (user.isDemo) {
        const demoProfile = localStorage.getItem('demoUserProfile')
        if (demoProfile) {
          try {
            const parsedDemoProfile = JSON.parse(demoProfile)
            if (parsedDemoProfile.profilePicture) {
              setUserProfilePictureWithLog(parsedDemoProfile.profilePicture)
              return
            }
          } catch (error) {
            console.error('Error loading demo profile picture:', error)
          }
        }
      }
      
      // If not found in localStorage, try to fetch from database
      const fetchProfileFromDB = async () => {
        try {
          const response = await fetch(`/api/profile?userId=${user.id}`)
          const data = await response.json()
          if (data.user && data.user.profilePicture) {
            setUserProfilePictureWithLog(data.user.profilePicture)
            // Also save to localStorage for future use
            const profileData = {
              profilePicture: data.user.profilePicture,
              bio: data.user.bio,
              graduationYear: data.user.graduationYear,
              degree: data.user.degree,
              major: data.user.major
            }
            localStorage.setItem(`userProfile_${user.id}`, JSON.stringify(profileData))
          }
        } catch (error) {
          console.error('Error fetching profile from database:', error)
        }
      }
      
      fetchProfileFromDB()
    }
  }, [user])

  if (!user) {
    return null
  }

  if (classLoading || !currentClass) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            {classLoading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading class details...</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Class Not Found</h1>
                <p className="text-gray-600 mb-4">The class "{classId}" could not be found.</p>
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Back to Dashboard
                </button>
              </>
            )}
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Toast Notifications */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{currentClass.name}</h1>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-white/80 text-sm">{currentClass.code} • {currentClass.semester}</span>
                    <span className="text-white/60 text-xs">•</span>
                    <span className="text-white/80 text-sm">Instructor: {currentClass.instructor}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-3 text-white/80 text-sm">
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{questions.length} questions</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{documents.length} materials</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center backdrop-blur-sm overflow-hidden">
                      {userProfilePicture ? (
                        <img
                          src={userProfilePicture}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/20 flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-white">
                      {user.name}
                    </span>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user?.role === 'teacher' 
                        ? 'bg-purple-200 text-purple-900' 
                        : 'bg-blue-200 text-blue-900'
                    }`}>
                      {getRoleDisplayName(user.role)}
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/')}
                    className="flex items-center px-3 py-1 text-sm text-white/90 bg-white/20 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Dashboard
                  </button>
                  <button
                    onClick={logout}
                    className="flex items-center px-3 py-1 text-sm text-white/90 bg-white/20 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-t border-white/20 mt-4">
              <nav className="flex space-x-8 pt-4">
                <button
                  onClick={() => setActiveTab('questions')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'questions'
                      ? 'border-white text-white'
                      : 'border-transparent text-white/70 hover:text-white hover:border-white/50'
                  }`}
                >
                  <MessageSquare className="h-4 w-4 inline mr-2" />
                  Questions & Discussion
                  {questions.length > 0 && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                      {questions.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'documents'
                      ? 'border-white text-white'
                      : 'border-transparent text-white/70 hover:text-white hover:border-white/50'
                  }`}
                >
                  <BookOpen className="h-4 w-4 inline mr-2" />
                  Course Materials
                  {documents.length > 0 && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                      {documents.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('class-info')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'class-info'
                      ? 'border-white text-white'
                      : 'border-transparent text-white/70 hover:text-white hover:border-white/50'
                  }`}
                >
                  <Users className="h-4 w-4 inline mr-2" />
                  Class Info
                  {enrolledStudents.length > 0 && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                      {enrolledStudents.length}
                    </span>
                  )}
                </button>
              </nav>
            </div>
          </div>
        </header>

        {/* Teacher Notification Banner */}
        {user?.role === 'teacher' && questions.filter(q => q.answer_count === 0).length > 0 && (
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-5 w-5 text-orange-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-orange-700">
                  <span className="font-medium">Attention:</span> You have{' '}
                  <span className="font-bold">{questions.filter(q => q.answer_count === 0).length}</span> unanswered questions in this class.
                  Consider answering them to help your students.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Questions Tab */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              {/* Enhanced Header */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Questions & Discussion</h2>
                    <p className="text-gray-600 text-lg">Ask questions and collaborate with your classmates</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowAIModal(true)}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Bot className="h-5 w-5 mr-2" />
                      Ask Question (AI Screening)
                    </button>
                  </div>
                </div>
                
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
                    <div className="text-sm text-gray-600">Total Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {questions.filter(q => q.answer_count > 0).length}
                    </div>
                    <div className="text-sm text-gray-600">Answered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {questions.filter(q => q.answer_count === 0).length}
                    </div>
                    <div className="text-sm text-gray-600">Unanswered</div>
                  </div>
                </div>
                
                {/* Search and Filter Row */}
                <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-gray-100 mt-4">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search questions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  
                  {/* Filter Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setFilterStatus('all')}
                      className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                        filterStatus === 'all'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterStatus('answered')}
                      className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                        filterStatus === 'answered'
                          ? 'bg-green-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Answered
                    </button>
                    <button
                      onClick={() => setFilterStatus('unanswered')}
                      className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                        filterStatus === 'unanswered'
                          ? 'bg-yellow-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Unanswered
                    </button>
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {/* Ranking System Explanation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-white">i</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-blue-900 mb-1">Smart Question Ranking</h4>
                      <p className="text-sm text-blue-800">
                        Questions are automatically ranked by priority: <strong>unanswered questions first</strong>, then by age and popularity. 
                        Older questions with more upvotes get higher priority. Numbers show ranking position.
                      </p>
                    </div>
                  </div>
                </div>
                {questionsLoading ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading questions...</p>
                  </div>
                ) : questions.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageSquare className="h-10 w-10 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">No Questions Yet</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">Be the first to ask a question in this class and start the discussion!</p>
                    <button
                      onClick={() => setShowAIModal(true)}
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Ask Question
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredQuestions.length === 0 && (searchQuery || filterStatus !== 'all') ? (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Search className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">No questions found</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          {searchQuery 
                            ? `No questions match "${searchQuery}"`
                            : `No ${filterStatus} questions found`
                          }
                        </p>
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setFilterStatus('all');
                          }}
                          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                        >
                          Clear filters
                        </button>
                      </div>
                    ) : (
                      filteredQuestions.map((question, index) => (
                        <div 
                          key={question.id} 
                          className={`bg-white rounded-xl shadow-sm border transition-all duration-200 cursor-pointer group relative ${
                            question._ranking && !question._ranking.isAnswered && question._ranking.score > 0.7
                              ? 'border-orange-300 hover:shadow-lg hover:border-orange-400'
                              : 'border-gray-200 hover:shadow-md'
                          }`}
                          onClick={() => window.location.href = `/questions/${question.id}`}
                        >
                          {/* Priority Indicator for High-Priority Unanswered Questions */}
                          {question._ranking && !question._ranking.isAnswered && question._ranking.score > 0.7 && (
                            <div className="absolute top-4 right-4 z-10">
                              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                            </div>
                          )}
                          
                          <div className="p-6">
                            <div className="flex items-start space-x-4">
                              
                              {/* Enhanced Voting Section */}
                              <div className="flex flex-col items-center space-y-2 pt-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVote(question.id, 'UP');
                                  }}
                                  disabled={votingQuestionId === question.id}
                                  className={`p-2 rounded-lg transition-all duration-200 ${
                                    question.userVote === 'up' 
                                      ? 'text-orange-600 bg-orange-50 hover:bg-orange-100 shadow-sm' 
                                      : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                                  } ${votingQuestionId === question.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  {votingQuestionId === question.id ? (
                                    <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                  ) : (
                                    <ChevronUp className="h-6 w-6" />
                                  )}
                                </button>
                                <span className={`text-lg font-bold px-2 py-1 rounded-md ${
                                  question.votes > 0 ? 'text-green-600 bg-green-50' : 
                                  question.votes < 0 ? 'text-red-600 bg-red-50' : 'text-gray-500 bg-gray-50'
                                }`}>
                                  {question.votes || 0}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVote(question.id, 'DOWN');
                                  }}
                                  disabled={votingQuestionId === question.id}
                                  className={`p-2 rounded-lg transition-all duration-200 ${
                                    question.userVote === 'down' 
                                      ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 shadow-sm' 
                                      : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                                  } ${votingQuestionId === question.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  {votingQuestionId === question.id ? (
                                    <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                  ) : (
                                    <ChevronDown className="h-6 w-6" />
                                  )}
                                </button>
                              </div>

                              {/* Enhanced Question Content */}
                              <div className="flex-1 min-w-0">
                                {/* Question Header */}
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                                      {question.authorProfilePicture ? (
                                        <img
                                          src={question.authorProfilePicture}
                                          alt={question.username}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                          <span className="text-sm font-semibold text-white">
                                            {(question.username || 'U')[0].toUpperCase()}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-semibold text-gray-900">{question.username}</span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(question.created_at).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric'
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Status Badge */}
                                  <div className="flex items-center space-x-2">
                                    {question.answer_count > 0 ? (
                                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                                        <MessageSquare className="h-3 w-3 mr-1" />
                                        {question.answer_count} answer{question.answer_count !== 1 ? 's' : ''}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                                        <MessageSquare className="h-3 w-3 mr-1" />
                                        No answers yet
                                      </span>
                                    )}
                                    
                                    {/* Ranking Indicator */}
                                    {question._ranking && (
                                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                        question._ranking.isAnswered 
                                          ? 'bg-gray-100 text-gray-600' 
                                          : question._ranking.score > 0.5 
                                            ? 'bg-orange-100 text-orange-700' 
                                            : 'bg-blue-100 text-blue-700'
                                      }`} title={`Ranking score: ${question._ranking.score.toFixed(3)}`}>
                                        #{index + 1}
                                      </span>
                                    )}
                                    
                                    {/* Edit/Delete Buttons for Question Author */}
                                    {user && question.authorId === user.id && (
                                      <div className="flex items-center space-x-1">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleEditQuestion(question)
                                          }}
                                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                          title="Edit question"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteQuestion(question.id)
                                          }}
                                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                          title="Delete question"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Question Title */}
                                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                                  {question.title}
                                </h3>

                                {/* Question Content */}
                                <div className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                                  <MarkdownRendererWrapper content={question.content} />
                                </div>

                                {/* Tags */}
                                {question.tags && question.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    {question.tags.map((tag: string, index: number) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Question Footer */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span className="flex items-center">
                                      <MessageSquare className="h-4 w-4 mr-1" />
                                      {question.answer_count || 0} answer{(question.answer_count || 0) !== 1 ? 's' : ''}
                                    </span>
                                    <span className="flex items-center">
                                      <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                      Asked {new Date(question.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                  
                                  {/* View Details Button */}
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                      View details →
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Course Materials</h2>
                  <p className="text-gray-600 mt-1">
                    Access course documents, assignments, and lecture notes (RTF supported!)
                  </p>
                </div>
                {permissions.canUploadDocuments(user) && currentClass && (
                  <DocumentUpload 
                    classId={classId} 
                    onUploadSuccess={handleDocumentUploadSuccess}
                  />
                )}
              </div>

              {/* Documents List */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {documentsLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading documents...</p>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="p-8 text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Yet</h3>
                    <p className="text-gray-600 mb-4">
                      {permissions.canUploadDocuments(user)
                        ? 'Upload course materials to get started. RTF files are supported!'
                        : 'Your instructor hasn\'t uploaded any course materials yet.'}
                    </p>
                  </div>
                ) : documentsAccessError ? (
                  <div className="p-8 text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
                    <p className="text-gray-600 mb-4">
                      {documentsAccessError}
                    </p>
                    <button
                      onClick={() => router.push('/')}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {documents.map((document) => (
                      <div key={document.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="flex items-center space-x-2">
                                {getFileIcon(document.filename)}
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {document.documentType}
                                </span>
                              </div>
                              <span className="text-sm text-gray-500">
                                {(document.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                              <span className="text-sm text-gray-500">
                                by {document.uploader?.name || 'Unknown'}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(document.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">{document.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Filename:</strong> {document.filename}
                            </p>
                            {document.content && (
                              <p className="text-sm text-gray-500 mt-2">
                                <strong>Content Preview:</strong> {document.content.substring(0, 200)}...
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            {/* View button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewDocument(document)
                              }}
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View document"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            
                            {/* Download button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDownloadDocument(document)
                              }}
                              disabled={downloadingDocument === document.id}
                              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Download document"
                            >
                              {downloadingDocument === document.id ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                              ) : (
                                <Download className="h-5 w-5" />
                              )}
                            </button>
                            
                            {/* Delete button for teachers */}
                            {permissions.canUploadDocuments(user) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDocumentDelete(document.id)
                                }}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete document"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Class Info Tab */}
          {activeTab === 'class-info' && (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Class Information</h2>
                <p className="text-gray-600 mt-1">
                  View class details and enrolled students
                </p>
              </div>

              {/* Creative Class Info Panel */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-lg border border-blue-200 p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Description Section - Left Side */}
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{currentClass?.name}</h3>
                          <p className="text-blue-600 font-medium">{currentClass?.code}</p>
                        </div>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Course Description</h4>
                        <p className="text-gray-700 leading-relaxed text-base">
                          {currentClass?.description || 'No description available'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Bubbles - Right Side */}
                  <div className="lg:col-span-1">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Instructor Bubble */}
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg transform hover:scale-105 transition-transform duration-200">
                        <div className="flex flex-col items-center text-center">
                          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-2">
                            <User className="h-4 w-4" />
                          </div>
                          <div className="text-xs font-medium opacity-90 mb-1">Instructor</div>
                          <div className="text-sm font-bold truncate w-full" title={currentClass?.instructor}>
                            {currentClass?.instructor}
                          </div>
                        </div>
                      </div>

                      {/* Students Bubble */}
                      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white shadow-lg transform hover:scale-105 transition-transform duration-200">
                        <div className="flex flex-col items-center text-center">
                          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-2">
                            <Users className="h-4 w-4" />
                          </div>
                          <div className="text-xs font-medium opacity-90 mb-1">Students</div>
                          <div className="text-2xl font-bold">{enrolledStudents.length}</div>
                        </div>
                      </div>

                      {/* Semester Bubble */}
                      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white shadow-lg transform hover:scale-105 transition-transform duration-200">
                        <div className="flex flex-col items-center text-center">
                          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-2">
                            <GraduationCap className="h-4 w-4" />
                          </div>
                          <div className="text-xs font-medium opacity-90 mb-1">Semester</div>
                          <div className="text-sm font-bold truncate w-full" title={currentClass?.semester}>
                            {currentClass?.semester}
                          </div>
                        </div>
                      </div>

                      {/* Discussions Bubble */}
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg transform hover:scale-105 transition-transform duration-200">
                        <div className="flex flex-col items-center text-center">
                          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-2">
                            <MessageSquare className="h-4 w-4" />
                          </div>
                          <div className="text-xs font-medium opacity-90 mb-1">Discussions</div>
                          <div className="text-2xl font-bold">{questions.length}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enrolled Students */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Enrolled Students</h3>
                  <p className="text-gray-600 mt-1">
                    {enrolledStudents.length} student{enrolledStudents.length !== 1 ? 's' : ''} enrolled
                  </p>
                </div>
                
                {studentsLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading students...</p>
                  </div>
                ) : enrolledStudents.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Enrolled</h3>
                    <p className="text-gray-600">
                      No students have enrolled in this class yet.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {enrolledStudents.map((student) => (
                      <div key={student.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="h-10 w-10 rounded-full flex items-center justify-center overflow-hidden">
                                {student.profilePicture ? (
                                  <img
                                    src={student.profilePicture}
                                    alt={student.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-white">
                                      {(student.name || 'U')[0].toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="text-lg font-medium text-gray-900">{student.name}</h4>
                                <p className="text-sm text-gray-500">{student.email}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                              {student.bio && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                  <p className="text-sm text-gray-900">{student.bio}</p>
                                </div>
                              )}
                              {student.degree && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                                  <p className="text-sm text-gray-900">{student.degree}</p>
                                </div>
                              )}
                              {student.major && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
                                  <p className="text-sm text-gray-900">{student.major}</p>
                                </div>
                              )}
                              {student.graduationYear && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                                  <p className="text-sm text-gray-900">{student.graduationYear}</p>
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-4 text-sm text-gray-500">
                              Enrolled: {new Date(student.enrolledAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Question Screening Modal */}
          <AIQuestionScreeningModal
            isOpen={showAIModal}
            onClose={() => setShowAIModal(false)}
            classId={classId}
            onProceedToForum={handleProceedToForum}
          />
        </div>
      </div>
    </ProtectedRoute>
  )
}