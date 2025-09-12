'use client'

import { useState, useEffect } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { permissions } from '../utils/permissions'

interface DocumentUploadProps {
  classId: string
  onUploadSuccess?: (document: any) => void
}

export default function DocumentUpload({ classId, onUploadSuccess }: DocumentUploadProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [documentType, setDocumentType] = useState('syllabus')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Only show for teachers
  if (!permissions.canUploadDocuments(user)) {
    return null
  }

  // Additional check: verify teacher has access to this class
  const [hasClassAccess, setHasClassAccess] = useState<boolean | null>(null)

  // Check if teacher has access to this class
  useEffect(() => {
    const checkClassAccess = async () => {
      if (!user?.id) return
      
      try {
        const response = await fetch(`/api/class-details?classId=${classId}`)
        const data = await response.json()
        
        if (data.success && data.class) {
          // For now, we'll assume teachers can upload to any class
          // In a real implementation, you'd check if the teacher is assigned to this class
          setHasClassAccess(true)
        } else {
          setHasClassAccess(false)
        }
      } catch (error) {
        console.error('Error checking class access:', error)
        setHasClassAccess(false)
      }
    }
    
    checkClassAccess()
  }, [classId, user?.id])

  if (hasClassAccess === false) {
    return null
  }

  const handleFileSelect = (file: File) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    
    if (!allowedTypes.includes(fileExtension)) {
      setMessage({ type: 'error', text: 'Please select a PDF, Word document (.doc/.docx), or text file (.txt).' })
      return
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setMessage({ type: 'error', text: 'File size must be less than 10MB.' })
      return
    }
    
    setSelectedFile(file)
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''))
    }
    setMessage(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      setMessage({ type: 'error', text: 'Please select a file and enter a title.' })
      return
    }

    if (!user?.id) {
      setMessage({ type: 'error', text: 'You must be logged in to upload documents.' })
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('classId', classId)
      formData.append('title', title)
      formData.append('documentType', documentType)
      formData.append('uploaderId', user.id)

      const response = await fetch('/api/upload-documents', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Document uploaded and processed successfully!' })
        
        // Reset form
        setSelectedFile(null)
        setTitle('')
        setDocumentType('syllabus')
        
        if (onUploadSuccess) {
          onUploadSuccess(data.document)
        }
        
        // Close modal after 2 seconds
        setTimeout(() => {
          setIsOpen(false)
          setMessage(null)
        }, 2000)
      } else {
        const errorMessage = data.error || 'Upload failed'
        const details = data.details ? ` (${JSON.stringify(data.details)})` : ''
        setMessage({ type: 'error', text: errorMessage + details })
      }
    } catch (error) {
      console.error('Upload error:', error)
      setMessage({ type: 'error', text: 'Upload failed. Please try again.' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        <Upload className="h-4 w-4 mr-2" />
        Upload Course Materials
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Upload Course Materials</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Message */}
              {message && (
                <div className={`p-3 rounded-lg flex items-center space-x-2 ${
                  message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span className="text-sm">{message.text}</span>
                </div>
              )}

              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                }`}
                onDragEnter={(e) => {
                  e.preventDefault()
                  setDragActive(true)
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  setDragActive(false)
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="flex items-center justify-center space-x-2">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop a file here, or click to select
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports PDF, Word documents (.doc/.docx), and text files (max 10MB)
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileInput}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 cursor-pointer"
                    >
                      Select File
                    </label>
                  </>
                )}
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Course Syllabus, Assignment 1 Brief"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="syllabus">Syllabus</option>
                  <option value="assignment">Assignment Brief</option>
                  <option value="lecture">Lecture Notes</option>
                  <option value="reading">Required Reading</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>How it helps:</strong> Students' questions will be automatically checked against 
                  this material before being posted to the forum, reducing repetitive questions.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || !title.trim() || uploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Upload</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
