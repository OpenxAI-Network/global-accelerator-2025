'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Users, BookOpen, LogOut, User, GraduationCap, Plus, Calendar, AlertCircle, HelpCircle, RefreshCw } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useFriends } from '../contexts/FriendsContext'
import ProtectedRoute from '../components/ProtectedRoute'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
// import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { permissions, getRoleDisplayName, getRoleColor } from '../utils/permissions'
import ClassManagement from '../components/ClassManagement'
import JoinClass from '../components/JoinClass'
import ClassUnansweredQuestions from '../components/ClassUnansweredQuestions'

// Demo class data
const demoClasses = [
  {
    id: 'finc3012',
    name: 'Derivative Securities',
    code: 'FINC3012',
    description: 'Advanced study of derivative instruments and their applications in financial markets.',
    instructor: 'Dr. Sarah Chen',
    semester: 'Semester 1, 2024',
    students: 45,
    discussions: 12,
    studentCount: 45,
    recentActivity: '2 new questions this week',
    color: 'bg-blue-500'
  },
  {
    id: 'amme2000',
    name: 'Engineering Analysis',
    code: 'AMME2000',
    description: 'Mathematical and computational methods for engineering problem solving.',
    instructor: 'Prof. Michael Rodriguez',
    semester: 'Semester 1, 2024',
    students: 78,
    discussions: 23,
    studentCount: 78,
    recentActivity: '5 new answers today',
    color: 'bg-green-500'
  },
  {
    id: 'buss1000',
    name: 'Future of Business',
    code: 'BUSS1000',
    description: 'Exploring emerging business trends and digital transformation strategies.',
    instructor: 'Dr. Emily Watson',
    semester: 'Semester 1, 2024',
    students: 120,
    discussions: 34,
    studentCount: 120,
    recentActivity: '1 new discussion started',
    color: 'bg-purple-500'
  },
  {
    id: 'engg1810',
    name: 'Introduction to Engineering Computing',
    code: 'ENGG1810',
    description: 'Fundamentals of programming and computational thinking for engineers.',
    instructor: 'Prof. David Kim',
    semester: 'Semester 1, 2024',
    students: 95,
    discussions: 18,
    studentCount: 95,
    recentActivity: '3 new questions yesterday',
    color: 'bg-orange-500'
  }
]

export default function ClassDashboard() {
  const { user, logout, updateUser } = useAuth()
  const { isFriend } = useFriends()
  const router = useRouter()
  const [userProfilePicture, setUserProfilePicture] = useState('')
  const [classes, setClasses] = useState(demoClasses)
  // Removed drag and drop state
  const [stats, setStats] = useState({
    totalClasses: 0,
    activeDiscussions: 0,
    classmates: 0,
    weeklyActivity: 0,
    activityLabel: 'Questions Asked'
  })
  const [unansweredCount, setUnansweredCount] = useState(0)
  const [classUnansweredCounts, setClassUnansweredCounts] = useState<Array<{
    classId: string
    className: string
    classCode: string
    unansweredCount: number
  }>>([])
  const [selectedClassForUnanswered, setSelectedClassForUnanswered] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Debug useEffect to monitor state changes
  useEffect(() => {
    console.log('State updated - Classes:', classes.length, 'Unanswered counts:', classUnansweredCounts.length, 'Total unanswered:', unansweredCount)
    if (classUnansweredCounts.length > 0) {
      console.log('Unanswered counts details:', classUnansweredCounts)
    }
  }, [classes, classUnansweredCounts, unansweredCount])

    // Load user profile picture
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`/api/profile?userId=${user.id}`)
          if (response.ok) {
            const data = await response.json()
            if (data.user && data.user.profilePicture) {
              setUserProfilePicture(data.user.profilePicture)
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
          // Fallback to localStorage if API fails
          const savedProfile = localStorage.getItem(`userProfile_${user.id}`)
          if (savedProfile) {
            try {
              const parsedProfile = JSON.parse(savedProfile)
              if (parsedProfile.profilePicture) {
                setUserProfilePicture(parsedProfile.profilePicture)
              }
            } catch (error) {
              console.error('Error loading profile picture from localStorage:', error)
            }
          }
        }
      } else if (user?.isDemo) {
        // Handle demo user profile picture
        const demoProfile = localStorage.getItem('demoUserProfile')
        if (demoProfile) {
          try {
            const parsedDemoProfile = JSON.parse(demoProfile)
            if (parsedDemoProfile.profilePicture) {
              setUserProfilePicture(parsedDemoProfile.profilePicture)
            }
          } catch (error) {
            console.error('Error loading demo profile picture:', error)
          }
        }
      }
    }

    fetchUserProfile()
  }, [user])

  // Load classes from database
  useEffect(() => {
    if (user?.id) {
      console.log('User loaded, fetching data for:', user.id, 'Role:', user.role)
      fetchClasses()
      fetchStats()
      fetchUnansweredCount()
      // fetchClassUnansweredCounts() is called from fetchClasses when needed
    }
    
    // Removed drag and drop functionality
  }, [user])

    const fetchClasses = async () => {
    try {
      console.log('Fetching classes for user:', user?.id, 'Role:', user?.role)
      const response = await fetch(`/api/classes?userId=${user?.id}&userRole=${user?.role}`)
      const data = await response.json()
      
      if (data.classes && data.classes.length > 0) {
        console.log('Received classes from database:', data.classes)
        setClasses(data.classes)
        // If we're using database classes, fetch database unanswered counts
        if (user?.role === 'teacher') {
          console.log('User is teacher, fetching unanswered counts from database')
          fetchClassUnansweredCounts()
        }
      } else {
        console.log('No classes found in database, using demo data')
        setClasses(demoClasses)
        if (user?.role === 'teacher') {
          setClassUnansweredCounts([
            {
              classId: 'finc3012',
              className: 'Financial Management',
              classCode: 'FINC3012',
              unansweredCount: 6
            },
            {
              classId: 'engg1810',
              className: 'Introduction to Engineering Computing',
              classCode: 'ENGG1810',
              unansweredCount: 3
            }
          ])
          setUnansweredCount(9)
        }
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
      console.log('Falling back to demo classes')
      // Fallback to demo data if database fails
      setClasses(demoClasses)
      // If using demo classes, set demo unanswered counts
      if (user?.role === 'teacher') {
        console.log('Setting demo unanswered counts for teacher')
        setClassUnansweredCounts([
          {
            classId: 'finc3012',
            className: 'Financial Management',
            classCode: 'FINC3012',
            unansweredCount: 6
          },
          {
            classId: 'engg1810',
            className: 'Introduction to Engineering Computing',
            classCode: 'ENGG1810',
            unansweredCount: 3
          }
        ])
        setUnansweredCount(9)
      }
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/user-stats?userId=${user?.id}&userRole=${user?.role}`)
      const data = await response.json()
      
      if (data.totalClasses !== undefined) {
        setStats({
          totalClasses: data.totalClasses,
          activeDiscussions: data.activeDiscussions,
          classmates: data.classmates,
          weeklyActivity: data.weeklyActivity,
          activityLabel: data.activityLabel || 'Questions Asked'
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchUnansweredCount = async () => {
    if (user?.role === 'teacher') {
      try {
        const response = await fetch(`/api/unanswered-questions?teacherId=${user?.id}`)
        const data = await response.json()
        
        if (data.success) {
          setUnansweredCount(data.totalUnanswered)
        } else {
          console.error('Failed to fetch total unanswered count:', data.error)
          // Fallback to demo total
          setUnansweredCount(9) // 6 + 3 from demo data
        }
      } catch (error) {
        console.error('Error fetching unanswered count:', error)
        // Fallback to demo total
        setUnansweredCount(9) // 6 + 3 from demo data
      }
    }
  }

  const fetchClassUnansweredCounts = async () => {
    if (user?.role === 'teacher') {
      try {
        console.log('Fetching unanswered counts for teacher:', user?.id)
        const response = await fetch(`/api/unanswered-questions-per-class?teacherId=${user?.id}`)
        const data = await response.json()
        
        if (data.success) {
          console.log('Received unanswered counts:', data.classUnansweredCounts)
          setClassUnansweredCounts(data.classUnansweredCounts)
        } else {
          console.error('Failed to fetch unanswered counts:', data.error)
          // Fallback to demo data if API fails
          setClassUnansweredCounts([
            {
              classId: 'finc3012',
              className: 'Financial Management',
              classCode: 'FINC3012',
              unansweredCount: 6
            },
            {
              classId: 'engg1810',
              className: 'Introduction to Engineering Computing',
              classCode: 'ENGG1810',
              unansweredCount: 3
            }
          ])
        }
      } catch (error) {
        console.error('Error fetching class unanswered counts:', error)
        // Fallback to demo data if API fails
        setClassUnansweredCounts([
          {
            classId: 'finc3012',
            className: 'Financial Management',
            classCode: 'FINC3012',
            unansweredCount: 6
          },
          {
            classId: 'engg1810',
            className: 'Introduction to Engineering Computing',
            classCode: 'ENGG1810',
            unansweredCount: 3
          }
        ])
      }
    }
  }

  const handleLogout = () => {
    logout()
  }

  const handleClassClick = (classId: string) => {
    router.push(`/class/${classId}`)
  }

  const handleShowUnansweredQuestions = (classId: string, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent triggering the class click
    setSelectedClassForUnanswered(classId)
  }

  const handleCloseUnansweredQuestions = () => {
    setSelectedClassForUnanswered(null)
    // Refresh the counts when closing
    if (user?.role === 'teacher') {
      fetchClassUnansweredCounts()
      fetchUnansweredCount()
    }
  }
    
  const handleClassCreated = async (newClass: any) => {
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newClass,
          teacherId: user?.id
        })
      })
      
      const data = await response.json()
      if (data.class) {
        await fetchClasses() // Refresh the classes list
        await fetchStats() // Refresh the stats
      }
    } catch (error) {
      console.error('Error creating class:', error)
    }
  }

  const handleClassDeleted = async (classId: string) => {
    try {
      await fetch(`/api/classes?classId=${classId}&userId=${user?.id}`, {
        method: 'DELETE'
      })
      
      await fetchClasses() // Refresh the classes list
      await fetchStats() // Refresh the stats
    } catch (error) {
      console.error('Error deleting class:', error)
    }
  }

  const handleClassUpdated = async (updatedClass: any) => {
    try {
      // Update the local state immediately for better UX
      setClasses(prevClasses => 
        prevClasses.map(cls => 
          cls.id === updatedClass.id ? updatedClass : cls
        )
      )
      
      // Refresh the classes list to ensure consistency
      await fetchClasses()
      await fetchStats()
    } catch (error) {
      console.error('Error updating class:', error)
    }
  }

  const handleClassJoined = async (newClass: any) => {
    // Refresh the classes list and stats after joining
    await fetchClasses()
    await fetchStats()
  }

  const handleRefreshData = async () => {
    if (user?.role === 'teacher') {
      setIsRefreshing(true)
      try {
        await Promise.all([
          fetchClasses(),
          fetchStats(),
          fetchUnansweredCount(),
          fetchClassUnansweredCounts()
        ])
      } finally {
        setIsRefreshing(false)
      }
    }
  }

  // Removed drag and drop functionality

  // If no user, redirect to login
  if (!user) {
    return null // ProtectedRoute will handle the redirect
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              {/* Left side - Logo and Title */}
              <div className="flex items-center space-x-6">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    {user?.role === 'teacher' ? 'Teacher Dashboard' : 'Student Dashboard'}
                  </h1>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-white/80 text-sm">
                      {user?.role === 'teacher' ? 'Manage your classes and help students' : 'Welcome to your learning hub'}
                    </span>
                    <span className="text-white/60 text-xs">•</span>
                    <span className="text-white/80 text-sm">
                      {user?.role === 'teacher' ? `${classes.length} classes taught` : `${classes.length} classes enrolled`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right side - User Info and Actions */}
              <div className="flex items-center space-x-4">
                {/* User Profile Section */}
                <div className="flex items-center space-x-3">
                  {userProfilePicture ? (
                    <img 
                      src={userProfilePicture} 
                      alt="Profile" 
                      className="h-12 w-12 rounded-full border-2 border-white/20 object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <User className="h-6 w-6 text-white" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">
                      {user?.name || 'User'}
                    </span>
                    {/* User Role Badge */}
                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium w-fit ${
                      user?.role === 'teacher' 
                        ? 'bg-purple-200 text-purple-900' 
                        : 'bg-blue-200 text-blue-900'
                    }`}>
                      {user ? getRoleDisplayName(user.role) : 'User'}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/profile/${user?.id || ''}`}
                    className="flex items-center px-3 py-1 text-sm text-white/90 bg-white/20 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"
                  >
                    <User className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>
                  <Link
                    href="/friends"
                    className="flex items-center px-3 py-1 text-sm text-white/90 bg-white/20 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"
                  >
                    <Users className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Friends</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-white/80 hover:text-white transition-colors px-3 py-1 rounded-full hover:bg-white/10"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm hidden sm:inline">Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user.name}! 👋
            </h2>
            <p className="text-gray-600">
              {user.role === 'teacher' 
                ? 'Manage your classes and track student engagement.' 
                : 'Here are your enrolled classes for this semester. Click on any class to access its discussion forum.'
              }
            </p>
                  </div>
                  
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {user?.role === 'teacher' ? 'Classes Teaching' : 'Enrolled Classes'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
                      </div>
                    </div>
                  </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Discussions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeDiscussions}</p>
                  </div>
                </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {user?.role === 'teacher' ? 'Total Students' : 'Classmates'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{stats.classmates}</p>
                </div>
                </div>
                  </div>
                  
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${
                  user?.role === 'teacher' ? 'bg-indigo-100' : 'bg-orange-100'
                }`}>
                  {user?.role === 'teacher' ? (
                    <MessageSquare className="h-6 w-6 text-indigo-600" />
                  ) : (
                    <Plus className="h-6 w-6 text-orange-600" />
                  )}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.weeklyActivity}</p>
                  <p className="text-xs text-gray-500">
                    {user?.role === 'teacher' ? 'Answers Provided' : 'Questions Asked'}
                  </p>
                </div>
                </div>
                </div>
                    </div>
                    
                    {/* Teacher Unanswered Questions Summary */}
                    {user.role === 'teacher' && (
                      <div className="mb-6">
                        <div className={`rounded-lg p-4 ${
                          unansweredCount > 0 
                            ? 'bg-orange-50 border border-orange-200' 
                            : 'bg-green-50 border border-green-200'
                        }`}>
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              {unansweredCount > 0 ? (
                                <AlertCircle className="h-5 w-5 text-orange-400" />
                              ) : (
                                <MessageSquare className="h-5 w-5 text-green-400" />
                              )}
                            </div>
                            <div className="ml-3">
                              <h3 className={`text-sm font-medium ${
                                unansweredCount > 0 ? 'text-orange-800' : 'text-green-800'
                              }`}>
                                {unansweredCount > 0 ? 'Unanswered Questions Summary' : 'All Questions Answered!'}
                              </h3>
                              <div className={`mt-2 text-sm ${
                                unansweredCount > 0 ? 'text-orange-700' : 'text-green-700'
                              }`}>
                                {unansweredCount > 0 ? (
                                  <>
                                    <p>You have <span className="font-bold">{unansweredCount}</span> total unanswered questions across all classes.</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {classUnansweredCounts
                                        .filter(c => c.unansweredCount > 0)
                                        .map((classUnanswered) => {
                                          // Find the corresponding class to get the correct ID for navigation
                                          const correspondingClass = classes.find(cls => 
                                            cls.id === classUnanswered.classId || cls.code === classUnanswered.classCode
                                          )
                                          return (
                                            <button
                                              key={classUnanswered.classId}
                                              onClick={(e) => handleShowUnansweredQuestions(correspondingClass?.id || classUnanswered.classId, e)}
                                              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors"
                                            >
                                              {classUnanswered.classCode}: {classUnanswered.unansweredCount}
                                            </button>
                                          )
                                        })}
                                    </div>
                                  </>
                                ) : (
                                  <p>Great job! All questions in your classes have been answered. Keep up the excellent work!</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Teacher Class Management */}
          {user.role === 'teacher' && (
            <div className="mb-8">
              <ClassManagement
                classes={classes}
                onClassCreated={handleClassCreated}
                onClassDeleted={handleClassDeleted}
                onClassUpdated={handleClassUpdated}
              />
            </div>
          )}



          {/* Student Join Class */}
          {user.role === 'student' && (
            <JoinClass onClassJoined={handleClassJoined} />
          )}

          {/* Classes Grid */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {user.role === 'teacher' ? 'All Classes' : 'Your Classes'}
              </h3>

            </div>
                    
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {classes.map((classItem) => {
                  console.log('Rendering class:', classItem.code, 'ID:', classItem.id, 'Available unanswered counts:', classUnansweredCounts)
                  return (
                  <div
                    key={classItem.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => handleClassClick(classItem.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className={`p-3 rounded-lg ${classItem.color} flex-shrink-0`}>
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {classItem.name}
                          </h4>
                          <p className="text-sm text-gray-500 font-mono">{classItem.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
                          Active
                        </span>
                        {user?.role === 'teacher' && (() => {
                          // Try to find by ID first, then by code as fallback
                          let classUnanswered = classUnansweredCounts.find(c => c.classId === classItem.id)
                          if (!classUnanswered) {
                            classUnanswered = classUnansweredCounts.find(c => c.classCode === classItem.code)
                          }
                          const unansweredCount = classUnanswered ? classUnanswered.unansweredCount : 0
                          console.log(`Class ${classItem.code} (${classItem.id}): Found unanswered count: ${unansweredCount}`)
                          return (
                            <div
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                                unansweredCount > 0 
                                  ? 'bg-orange-100 text-orange-800 hover:bg-orange-200 cursor-pointer' 
                                  : 'bg-green-100 text-green-700'
                              }`}
                              onClick={unansweredCount > 0 ? (e) => handleShowUnansweredQuestions(classItem.id, e) : undefined}
                            >
                              <HelpCircle className="h-3 w-3 mr-1" />
                              {unansweredCount} unanswered
                            </div>
                          )
                        })()}
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {classItem.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-2" />
                        <span>{classItem.instructor}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{classItem.semester}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{classItem.studentCount} students</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">{classItem.recentActivity}</p>
                    </div>
                  </div>
                )
                })}
              </div>
          </div>

          {/* Class Unanswered Questions Modal */}
          {selectedClassForUnanswered && user?.role === 'teacher' && (
            <ClassUnansweredQuestions
              classId={selectedClassForUnanswered}
              teacherId={user.id}
              onClose={handleCloseUnansweredQuestions}
              onQuestionAnswered={(questionId) => {
                // Refresh stats when a question is answered
                fetchStats()
              }}
            />
          )}
          
        </main>
    </div>
    </ProtectedRoute>
  )
} 