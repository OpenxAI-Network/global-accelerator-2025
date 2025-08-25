'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  TrendingUp, 
  MessageCircle, 
  Play,
  Star,
  Calendar,
  Target,
  Zap,
  Award,
  BarChart3,
  Users,
  Brain,
  Mic,
  MicOff,
  Send,
  Settings,
  Bell,
  Search,
  Filter,
  ChevronRight,
  Plus,
  Bookmark,
  Download,
  Share2,
  Lightbulb,
  Menu,
  X,
  Rocket
} from 'lucide-react';
import { Header } from '@/components/ui/Header';
import AIChat from '@/components/ai/AIChat';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
// import { useTheme } from '@/contexts/ThemeContext';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_name: string;
  difficulty_level: string;
  estimated_duration_hours: number;
  thumbnail_url?: string;
  progress?: number;
  rating: number;
  total_enrollments: number;
  category?: { name: string; color: string };
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon?: string;
  badge_color: string;
  rarity: string;
  points_reward: number;
  earned_at?: string;
}

export default function Dashboard() {
  // const { theme } = useTheme();
  const [courses, setCourses] = useState<Course[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userEnrollments, setUserEnrollments] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
  };

  // Fetch real data on component mount
  useEffect(() => {
    fetchDashboardData();
    fetchUserData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch courses from Supabase with fallback data
      const { data: coursesData } = await supabase
        .from('courses')
        .select(`
          *,
          categories(name, color, icon)
        `)
        .eq('is_published', true)
        .order('total_enrollments', { ascending: false })
        .limit(4);
      
      if (coursesData && coursesData.length > 0) {
        setCourses(coursesData);
      } else {
        // Fallback sample courses for demo
        setCourses([
          {
            id: '1',
            title: 'Introduction to Machine Learning',
            description: 'Learn the fundamentals of ML with hands-on projects',
            instructor_name: 'Dr. Sarah Chen',
            difficulty_level: 'beginner',
            estimated_duration_hours: 8,
            rating: 4.8,
            total_enrollments: 1250,
            is_published: true,
            categories: { name: 'AI & Machine Learning', color: '#8B5CF6' }
          },
          {
            id: '2', 
            title: 'Advanced React Development',
            description: 'Master React with advanced patterns and best practices',
            instructor_name: 'Alex Rodriguez',
            difficulty_level: 'advanced',
            estimated_duration_hours: 12,
            rating: 4.9,
            total_enrollments: 890,
            is_published: true,
            categories: { name: 'Web Development', color: '#10B981' }
          }
        ]);
      }

      // Fetch achievements from Supabase with fallback
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('points_reward', { ascending: false })
        .limit(4);
      
      if (achievementsData && achievementsData.length > 0) {
        setAchievements(achievementsData);
      } else {
        // Fallback sample achievements
        setAchievements([
          {
            id: '1',
            name: 'First Steps',
            description: 'Complete your first lesson',
            badge_color: '#10B981',
            rarity: 'common',
            points_reward: 50,
            is_active: true
          },
          {
            id: '2',
            name: 'Quick Learner', 
            description: 'Complete 5 lessons in one day',
            badge_color: '#F59E0B',
            rarity: 'rare',
            points_reward: 200,
            is_active: true
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set fallback data on error
      setCourses([]);
      setAchievements([]);
    }
  };

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Use auth user data directly, fallback to profile if needed
        const userData = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          ...user.user_metadata
        };
        
        setUser(userData);
        
        // Create or update user profile
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .upsert({
            id: user.id,
            email: user.email,
            full_name: userData.full_name,
            created_at: user.created_at,
            updated_at: new Date().toISOString(),
            total_points: 0,
            current_streak: 0,
            total_time_minutes: 0
          }, { onConflict: 'id' })
          .select()
          .single();
        
        if (profile) {
          setUser({ ...userData, ...profile });
        }
        
        // Fetch user enrollments
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('*, courses(*)')
          .eq('user_id', user.id);
        
        setUserEnrollments(enrollments || []);
        
        // Fetch user achievements
        const { data: achievements } = await supabase
          .from('user_achievements')
          .select('*, achievements(*)')
          .eq('user_id', user.id);
        
        setUserAchievements(achievements || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };



  const stats = [
    { label: 'Courses Enrolled', value: userEnrollments.length || 0, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Hours Learned', value: user?.total_time_minutes ? Math.round(user.total_time_minutes / 60) : 0, icon: Clock, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Achievements', value: userAchievements.length || 0, icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Streak Days', value: user?.current_streak || 0, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' }
  ];

  if (isLoading) {
    return <LoadingScreen userName={user?.full_name} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header variant="dashboard" showSearch={showSearch} onSearchToggle={handleSearchToggle} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI-Powered Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-4 sm:p-6 lg:p-8 text-white relative overflow-hidden"
            >
              {/* Animated Background */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16 animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12 animate-bounce"></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-2">Welcome back, {user?.full_name || user?.email?.split('@')[0] || 'User'}! <Rocket className="w-6 h-6" /></h2>
                    <p className="text-blue-100 mb-2 text-sm sm:text-base">Your AI-powered learning companion is ready</p>
                    <div className="flex items-center space-x-4 text-sm text-blue-200">
                      <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{user?.current_streak || 0} day streak</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{Math.floor((user?.total_time_minutes || 0) / 60)}h learned</span>
                      <span className="flex items-center gap-1"><Trophy className="w-3 h-3" />Level {Math.floor((user?.total_points || 0) / 1000) + 1}</span>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                      <Brain className="w-10 h-10 text-white animate-pulse" />
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button className="bg-white/20 hover:bg-white/30 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base hover:scale-105">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Continue Learning</span>
                  </button>
                  <Link href="/voice" className="bg-white/10 hover:bg-white/20 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base hover:scale-105">
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>AI Coach</span>
                  </Link>
                  <Link href="/insights" className="bg-white/10 hover:bg-white/20 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base hover:scale-105">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>AI Insights</span>
                  </Link>
                  <button 
                    onClick={() => setShowGoalsModal(true)}
                    className="bg-white/10 hover:bg-white/20 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base hover:scale-105"
                  >
                    <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Smart Goals</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* AI Learning Path Recommendation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI-Curated Learning Path</h3>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">Personalized for your goals</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium">
                  97% Match
                </span>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { title: 'Advanced React Patterns', progress: 0, duration: '4h', difficulty: 'Advanced' },
                  { title: 'AI/ML Fundamentals', progress: 25, duration: '6h', difficulty: 'Intermediate' },
                  { title: 'System Design Basics', progress: 0, duration: '8h', difficulty: 'Advanced' }
                ].map((course, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">{course.title}</h4>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <span>{course.duration}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        course.difficulty === 'Advanced' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {course.difficulty}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <button className="w-full px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors">
                      {course.progress > 0 ? 'Continue' : 'Start Learning'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Real-time Learning Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Zap className="w-6 h-6 mr-2 text-yellow-500" />
                  Real-time Analytics
                </h3>
                <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Focus Score', value: '94%', change: '+5%', color: 'text-blue-600' },
                  { label: 'Retention Rate', value: '87%', change: '+12%', color: 'text-green-600' },
                  { label: 'Learning Velocity', value: '2.3x', change: '+0.4x', color: 'text-purple-600' },
                  { label: 'AI Confidence', value: '96%', change: '+3%', color: 'text-orange-600' }
                ].map((metric, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className={`text-2xl font-bold ${metric.color} mb-1`}>{metric.value}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{metric.label}</div>
                    <div className="text-xs text-green-600 dark:text-green-400">{metric.change}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div className="mb-2 sm:mb-0">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                    <div className={`p-2 sm:p-3 rounded-lg ${stat.bg} self-end sm:self-auto`}>
                      <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${stat.color}`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Courses Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Courses</h3>
                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center space-x-1">
                  <span>View All</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {courses.slice(0, 4).map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 self-center sm:self-start">
                        <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                          {course.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                          by {course.instructor_name}
                        </p>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 mt-2">
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{course.rating}</span>
                          </div>
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            {course.estimated_duration_hours}h
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            course.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            course.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {course.difficulty_level}
                          </span>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Progress</span>
                            <span className="text-gray-900 dark:text-white font-medium">0%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2 mt-1">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                              style={{ width: '0%' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Gamification & Achievement System */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-700"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Achievement System</h3>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">Level up your learning journey</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{user?.total_points || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">XP Points</div>
                </div>
              </div>

              {/* Level Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Level {Math.floor((user?.total_points || 0) / 1000) + 1}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{((user?.total_points || 0) % 1000)}/1000 XP</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${((user?.total_points || 0) % 1000) / 10}%` }}
                  />
                </div>
              </div>

              {/* Recent Achievements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Speed Learner', desc: 'Completed 3 lessons in 1 hour', icon: Zap, rarity: 'rare', points: 150, new: true },
                  { name: 'AI Whisperer', desc: 'Had 50+ AI conversations', icon: Brain, rarity: 'epic', points: 300, new: false },
                  { name: 'Streak Master', desc: '7-day learning streak', icon: TrendingUp, rarity: 'uncommon', points: 100, new: false },
                  { name: 'Voice Pioneer', desc: 'Used voice learning 25 times', icon: Mic, rarity: 'rare', points: 200, new: true }
                ].map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg border transition-all hover:shadow-lg ${
                      achievement.new ? 'border-yellow-300 dark:border-yellow-600 shadow-yellow-100 dark:shadow-yellow-900/20' : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {achievement.new && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                    )}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      achievement.rarity === 'epic' ? 'bg-purple-100 dark:bg-purple-900/30' :
                      achievement.rarity === 'rare' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      achievement.rarity === 'uncommon' ? 'bg-green-100 dark:bg-green-900/30' :
                      'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <achievement.icon className={`w-6 h-6 ${
                        achievement.rarity === 'epic' ? 'text-purple-600 dark:text-purple-400' :
                        achievement.rarity === 'rare' ? 'text-blue-600 dark:text-blue-400' :
                        achievement.rarity === 'uncommon' ? 'text-green-600 dark:text-green-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{achievement.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.desc}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                          achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          achievement.rarity === 'uncommon' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {achievement.rarity}
                        </span>
                        <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                          +{achievement.points} XP
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Smart Study Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Brain className="w-6 h-6 mr-2 text-purple-500" />
                  AI Study Recommendations
                </h3>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                  Powered by GPT-4
                </span>
              </div>
              
              <div className="space-y-4">
                {[
                  {
                    type: 'optimal_time',
                    title: 'Peak Learning Window',
                    desc: 'Your focus is highest between 9-11 AM. Schedule complex topics during this time.',
                    action: 'Schedule Session',
                    icon: Clock,
                    color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                  },
                  {
                    type: 'weak_area',
                    title: 'Knowledge Gap Detected',
                    desc: 'You might benefit from reviewing JavaScript fundamentals before advanced topics.',
                    action: 'Review Now',
                    icon: BarChart3,
                    color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700'
                  },
                  {
                    type: 'learning_style',
                    title: 'Adaptive Learning Mode',
                    desc: 'Switch to visual learning mode for better retention of complex concepts.',
                    action: 'Enable Mode',
                    icon: Lightbulb,
                    color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                  }
                ].map((rec, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${rec.color}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <rec.icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{rec.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{rec.desc}</p>
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        {rec.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* AI Learning Assistant */}
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="h-fit lg:sticky lg:top-24"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">AI Learning Assistant</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your personal AI coach with voice support</p>
              </div>
              <AIChat className="h-[600px]" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Goals Modal */}
      {showGoalsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Set Learning Goals</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Weekly Learning Hours
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  defaultValue="5"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Courses to Complete This Month
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  defaultValue="2"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Focus Area
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>Programming</option>
                  <option>Data Science</option>
                  <option>AI & Machine Learning</option>
                  <option>Web Development</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowGoalsModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowGoalsModal(false);
                  // Add toast notification
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Save Goals
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}