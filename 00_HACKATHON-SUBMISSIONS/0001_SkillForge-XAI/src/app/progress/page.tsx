'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, Clock, BookOpen, Trophy, Target, Calendar,
  BarChart3, PieChart, Activity, Zap, Star, Award
} from 'lucide-react'
import { Header } from '@/components/ui/Header'
import { supabase } from '@/lib/supabase'

export default function ProgressPage() {
  const [user, setUser] = useState<any>(null)
  const [progressData, setProgressData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgressData()
  }, [])

  const fetchProgressData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        
        // Fetch user progress data
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('*, courses(*)')
          .eq('user_id', user.id)

        const { data: achievements } = await supabase
          .from('user_achievements')
          .select('*, achievements(*)')
          .eq('user_id', user.id)

        setProgressData({
          profile: profile || {},
          enrollments: enrollments || [],
          achievements: achievements || []
        })
      }
    } catch (error) {
      console.error('Error fetching progress data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header variant="dashboard" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading your progress...</p>
          </div>
        </div>
      </div>
    )
  }

  const stats = [
    { 
      label: 'Total Learning Time', 
      value: `${Math.floor((progressData?.profile?.total_time_minutes || 0) / 60)}h`, 
      icon: Clock, 
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20'
    },
    { 
      label: 'Courses Completed', 
      value: progressData?.enrollments?.filter((e: any) => e.completion_percentage === 100).length || 0, 
      icon: BookOpen, 
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20'
    },
    { 
      label: 'Current Streak', 
      value: `${progressData?.profile?.current_streak || 0} days`, 
      icon: Zap, 
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-900/20'
    },
    { 
      label: 'XP Points', 
      value: progressData?.profile?.total_points || 0, 
      icon: Star, 
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header variant="dashboard" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Learning Progress
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Track your learning journey and achievements
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Learning Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <Activity className="w-6 h-6 mr-2 text-blue-500" />
                Weekly Activity
              </h3>
            </div>
            
            <div className="space-y-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                const hours = Math.floor(Math.random() * 4) + 1
                return (
                  <div key={day} className="flex items-center space-x-4">
                    <span className="w-8 text-sm text-gray-600 dark:text-gray-400">{day}</span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${(hours / 4) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-sm text-gray-900 dark:text-white">{hours}h</span>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Course Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-green-500" />
                Course Progress
              </h3>
            </div>
            
            <div className="space-y-4">
              {progressData?.enrollments?.slice(0, 5).map((enrollment: any, index: number) => (
                <div key={enrollment.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {enrollment.courses?.title || 'Course Title'}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {enrollment.completion_percentage || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${enrollment.completion_percentage || 0}%` }}
                    />
                  </div>
                </div>
              )) || (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No courses enrolled yet</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
                Recent Achievements
              </h3>
            </div>
            
            <div className="space-y-4">
              {progressData?.achievements?.slice(0, 4).map((achievement: any, index: number) => (
                <div key={achievement.id} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {achievement.achievements?.name || 'Achievement'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {achievement.achievements?.description || 'Achievement description'}
                    </p>
                  </div>
                  <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                    +{achievement.achievements?.points_reward || 0} XP
                  </span>
                </div>
              )) || (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No achievements yet</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Learning Goals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <Target className="w-6 h-6 mr-2 text-purple-500" />
                Learning Goals
              </h3>
            </div>
            
            <div className="space-y-4">
              {[
                { goal: 'Complete 2 courses this month', progress: 50, target: 2, current: 1 },
                { goal: 'Study 20 hours this week', progress: 75, target: 20, current: 15 },
                { goal: 'Maintain 30-day streak', progress: 40, target: 30, current: 12 }
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.goal}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.current}/{item.target}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}