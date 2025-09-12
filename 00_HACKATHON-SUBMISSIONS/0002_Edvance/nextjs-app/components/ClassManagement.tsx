'use client'

import { useState } from 'react'
import { Plus, X, Users, Settings, Trash2, UserPlus, UserMinus, MessageSquare, Edit } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { permissions } from '../utils/permissions'

interface Class {
  id: string
  name: string
  code: string
  description: string
  instructor: string
  semester: string
  students: number
  discussions: number
}

interface ClassManagementProps {
  classes: Class[]
  onClassCreated?: (newClass: Class) => void
  onClassDeleted?: (classId: string) => void
  onClassUpdated?: (updatedClass: Class) => void
}

export default function ClassManagement({ classes, onClassCreated, onClassDeleted, onClassUpdated }: ClassManagementProps) {
  const { user } = useAuth()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [newClass, setNewClass] = useState({
    name: '',
    code: '',
    semester: ''
  })
  const [editClass, setEditClass] = useState({
    name: '',
    code: '',
    semester: '',
    description: '',
    instructor: ''
  })

  // Only show for teachers
  if (!permissions.canCreateClass(user)) {
    return null
  }

  const handleCreateClass = () => {
    if (!newClass.name.trim() || !newClass.code.trim()) return

    const classToCreate: Class = {
      id: newClass.code.toLowerCase().replace(/\s+/g, ''),
      name: newClass.name,
      code: newClass.code,
      description: 'Advanced study of course materials and collaborative learning.',
      instructor: user?.name || 'Teacher',
      semester: newClass.semester || 'Current Semester',
      students: 0,
      discussions: 0
    }

    if (onClassCreated) {
      onClassCreated(classToCreate)
    }

    // Reset form
    setNewClass({ name: '', code: '', semester: '' })
    setShowCreateForm(false)
  }

  const handleDeleteClass = (classId: string, className: string) => {
    if (confirm(`Are you sure you want to delete "${className}"? This will remove all discussions and cannot be undone.`)) {
      if (onClassDeleted) {
        onClassDeleted(classId)
      }
    }
  }

  const handleEditClass = (cls: Class) => {
    setEditingClass(cls)
    setEditClass({
      name: cls.name,
      code: cls.code,
      semester: cls.semester,
      description: cls.description,
      instructor: cls.instructor
    })
    setShowEditForm(true)
  }

  const handleUpdateClass = async () => {
    if (!editingClass || !editClass.name.trim() || !editClass.code.trim()) return

    try {
      const response = await fetch('/api/classes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingClass.id,
          name: editClass.name,
          code: editClass.code,
          semester: editClass.semester || 'Current Semester',
          description: editClass.description || 'Advanced study of course materials and collaborative learning.',
          teacherId: user?.id
        })
      })

      const data = await response.json()

      if (response.ok && data.class) {
        if (onClassUpdated) {
          onClassUpdated(data.class)
        }
        
        // Reset form
        setEditClass({ name: '', code: '', semester: '', description: '', instructor: '' })
        setEditingClass(null)
        setShowEditForm(false)
      } else {
        console.error('Failed to update class:', data.error)
        alert(`Failed to update class: ${data.error}`)
      }
    } catch (error) {
      console.error('Error updating class:', error)
      alert('Failed to update class. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Class Management</h2>
          <p className="text-sm text-gray-600">Create and manage your classes</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Class
        </button>
      </div>

      {/* Create Class Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Create New Class</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Name
                </label>
                <input
                  type="text"
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  placeholder="e.g., Derivative Securities"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Code
                </label>
                <input
                  type="text"
                  value={newClass.code}
                  onChange={(e) => setNewClass({ ...newClass, code: e.target.value })}
                  placeholder="e.g., FINC3012"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester
                </label>
                <input
                  type="text"
                  value={newClass.semester}
                  onChange={(e) => setNewClass({ ...newClass, semester: e.target.value })}
                  placeholder="e.g., Semester 1, 2024"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateClass}
                disabled={!newClass.name.trim() || !newClass.code.trim()}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {showEditForm && editingClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit Class</h3>
              <button
                onClick={() => setShowEditForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Name
                </label>
                <input
                  type="text"
                  value={editClass.name}
                  onChange={(e) => setEditClass({ ...editClass, name: e.target.value })}
                  placeholder="e.g., Derivative Securities"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Code
                </label>
                <input
                  type="text"
                  value={editClass.code}
                  onChange={(e) => setEditClass({ ...editClass, code: e.target.value })}
                  placeholder="e.g., FINC3012"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editClass.description}
                  onChange={(e) => setEditClass({ ...editClass, description: e.target.value })}
                  placeholder="Brief description of the class..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructor
                </label>
                <input
                  type="text"
                  value={editClass.instructor}
                  onChange={(e) => setEditClass({ ...editClass, instructor: e.target.value })}
                  placeholder="e.g., Dr. Sarah Chen"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester
                </label>
                <input
                  type="text"
                  value={editClass.semester}
                  onChange={(e) => setEditClass({ ...editClass, semester: e.target.value })}
                  placeholder="e.g., Semester 1, 2024"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowEditForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateClass}
                disabled={!editClass.name.trim() || !editClass.code.trim()}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher's Classes List */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Your Classes</h3>
        
        {classes.filter(cls => cls.instructor === user?.name).length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Settings className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No classes yet</h3>
            <p className="text-gray-600 mb-4">Create your first class to get started!</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Class
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {classes
              .filter(cls => cls.instructor === user?.name)
              .map((cls) => (
                <div key={cls.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                          {cls.code}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {cls.students} students
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {cls.discussions} discussions
                        </div>
                        <span>{cls.semester}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditClass(cls)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit class"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(cls.id, cls.name)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete class"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
