"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Calendar, Edit, Save, X, BookOpen, Trophy, Star, Target, Brain, TrendingUp, Zap, Clock, Globe, Code, Lightbulb, Award, Sparkles, Rocket } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/ui/Header';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    bio: '',
    learning_goals: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setProfile(profile);
          setFormData({
            full_name: profile.full_name || '',
            email: user.email || '',
            bio: profile.bio || '',
            learning_goals: profile.learning_goals || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          full_name: formData.full_name,
          bio: formData.bio,
          learning_goals: formData.learning_goals,
          updated_at: new Date().toISOString()
        });

      if (!error) {
        setProfile({ ...profile, ...formData });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header variant="dashboard" />
      
      <div className="max-w-4xl mx-auto px-6 py-8 pt-24">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link 
            href="/dashboard"
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </Link>
        </div>

        {/* Enhanced Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Dynamic Header with AI Insights */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-8 py-12 text-white relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-20 translate-x-20 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16 animate-bounce"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-6">
                  {/* Enhanced Avatar with Level Ring */}
                  <div className="relative">
                    <div className="w-28 h-28 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30">
                      <User size={56} />
                    </div>
                    {/* Level Badge */}
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-white">
                      <span className="text-yellow-900 font-bold text-sm">{Math.floor((user?.total_points || 0) / 1000) + 1}</span>
                    </div>
                    {/* Online Status */}
                    <div className="absolute top-0 right-0 w-6 h-6 bg-green-400 rounded-full border-4 border-white animate-pulse"></div>
                  </div>
                  
                  <div>
                    <h1 className="text-3xl font-bold mb-2">
                      {profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Welcome Back!'}
                    </h1>
                    <p className="text-blue-100 mb-3 text-lg">
                      {user?.email}
                    </p>
                    {/* Dynamic Status */}
                    <div className="flex items-center space-x-4 text-sm text-blue-200">
                      <span className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>Active Learner</span>
                      </span>
                      <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{user?.current_streak || 0} day streak</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{Math.floor((user?.total_time_minutes || 0) / 60)}h learned</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-300 flex items-center space-x-2 hover:scale-105"
                  >
                    {isEditing ? <X size={18} /> : <Edit size={18} />}
                    <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                  </button>
                  
                  {/* AI Profile Analysis */}
                  <div className="px-4 py-2 bg-white/10 rounded-lg">
                    <div className="text-xs text-blue-200 mb-1">AI Profile Score</div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-white/20 rounded-full h-2">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '87%' }}></div>
                      </div>
                      <span className="text-sm font-bold">87%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Courses', value: 0, icon: BookOpen },
                  { label: 'Certificates', value: 0, icon: Trophy },
                  { label: 'XP Points', value: user?.total_points || 0, icon: Star },
                  { label: 'Rank', value: '#' + (Math.floor(Math.random() * 100) + 1), icon: Target }
                ].map((stat, index) => {
                  const IconComponent = stat.icon
                  return (
                    <div key={index} className="text-center">
                      <IconComponent className="w-6 h-6 mx-auto mb-1 text-yellow-300" />
                      <div className="text-xl font-bold">{stat.value}</div>
                      <div className="text-xs text-blue-200">{stat.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Enhanced Content */}
          <div className="p-8">
            {isEditing ? (
              <div className="space-y-8">
                {/* Enhanced Form Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Learning Style
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option>Visual Learner</option>
                      <option>Auditory Learner</option>
                      <option>Kinesthetic Learner</option>
                      <option>Reading/Writing Learner</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Professional Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Tell us about your professional background and interests..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Learning Goals & Aspirations
                  </label>
                  <textarea
                    value={formData.learning_goals}
                    onChange={(e) => setFormData({ ...formData, learning_goals: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="What do you want to achieve? What skills do you want to master?"
                  />
                </div>
                
                {/* Skills Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Skills & Interests
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {['JavaScript', 'React', 'Python', 'AI/ML', 'Data Science', 'Web Development'].map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add new skills (press Enter)"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <Save size={18} />
                    <span>Save Changes</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* AI-Powered Learning Insights */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Learning Profile</h3>
                      <p className="text-sm text-purple-600 dark:text-purple-400">Powered by advanced analytics</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">Visual</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Learning Style</div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">Fast</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Learning Pace</div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">High</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Retention Rate</div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills Radar Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Skill Mastery Map
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Technical Skills</h4>
                      <div className="space-y-3">
                        {[
                          { skill: 'JavaScript', level: 85, color: 'bg-yellow-500' },
                          { skill: 'React', level: 78, color: 'bg-blue-500' },
                          { skill: 'Python', level: 65, color: 'bg-green-500' },
                          { skill: 'AI/ML', level: 45, color: 'bg-purple-500' }
                        ].map((item, index) => (
                          <div key={index}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-700 dark:text-gray-300">{item.skill}</span>
                              <span className="text-gray-600 dark:text-gray-400">{item.level}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div className={`${item.color} h-2 rounded-full transition-all duration-1000`} style={{ width: `${item.level}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Soft Skills</h4>
                      <div className="space-y-3">
                        {[
                          { skill: 'Problem Solving', level: 92, color: 'bg-red-500' },
                          { skill: 'Communication', level: 88, color: 'bg-indigo-500' },
                          { skill: 'Leadership', level: 75, color: 'bg-pink-500' },
                          { skill: 'Creativity', level: 82, color: 'bg-orange-500' }
                        ].map((item, index) => (
                          <div key={index}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-700 dark:text-gray-300">{item.skill}</span>
                              <span className="text-gray-600 dark:text-gray-400">{item.level}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div className={`${item.color} h-2 rounded-full transition-all duration-1000`} style={{ width: `${item.level}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Learning Journey Timeline */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Learning Journey
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      { date: '2024-01-15', event: 'Completed React Fundamentals', type: 'achievement', icon: Trophy },
                      { date: '2024-01-10', event: 'Started AI/ML Specialization', type: 'milestone', icon: Rocket },
                      { date: '2024-01-05', event: 'Earned JavaScript Expert Badge', type: 'achievement', icon: Award },
                      { date: '2024-01-01', event: 'Joined SkillForge-XAI', type: 'milestone', icon: Sparkles }
                    ].map((item, index) => {
                      const IconComponent = item.icon
                      return (
                        <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <IconComponent className="w-6 h-6 text-blue-500" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{item.event}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{new Date(item.date).toLocaleDateString()}</div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.type === 'achievement' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {item.type}
                        </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">About Me</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {profile?.bio || 'Passionate learner exploring the intersection of technology and innovation. Always eager to tackle new challenges and expand my skill set through hands-on projects and continuous learning.'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Learning Goals</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {profile?.learning_goals || 'Master full-stack development, dive deep into AI/ML technologies, and build impactful projects that solve real-world problems.'}
                    </p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">{user?.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Member since {new Date(user?.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut()
                      router.push('/')
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Social Learning Features */}
        <div className="mt-8 grid md:grid-cols-2 gap-8">
          {/* Learning Network */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Learning Network
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Study Buddies</span>
                <span className="font-semibold text-gray-900 dark:text-white">12 Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Mentors</span>
                <span className="font-semibold text-gray-900 dark:text-white">3 Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Study Groups</span>
                <span className="font-semibold text-gray-900 dark:text-white">5 Joined</span>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex -space-x-2 mb-3">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-bold">
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 text-xs">
                    +7
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium">
                  Connect with Learners
                </button>
              </div>
            </div>
          </div>
          
          {/* Achievement Showcase */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Achievement Showcase
            </h3>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { name: 'Speed Demon', icon: Zap, rarity: 'rare' },
                { name: 'AI Pioneer', icon: Brain, rarity: 'epic' },
                { name: 'Code Master', icon: Code, rarity: 'legendary' },
                { name: 'Team Player', icon: User, rarity: 'uncommon' },
                { name: 'Innovator', icon: Lightbulb, rarity: 'rare' },
                { name: 'Mentor', icon: Award, rarity: 'epic' }
              ].map((badge, index) => {
                const IconComponent = badge.icon
                return (
                  <div key={index} className={`relative p-3 rounded-lg text-center transition-transform hover:scale-105 ${
                    badge.rarity === 'legendary' ? 'bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30' :
                    badge.rarity === 'epic' ? 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30' :
                    badge.rarity === 'rare' ? 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30' :
                    'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600'
                  }`}>
                    <IconComponent className="w-6 h-6 mx-auto mb-1 text-gray-700 dark:text-gray-300" />
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{badge.name}</div>
                  {badge.rarity === 'legendary' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-yellow-900 text-xs">★</span>
                    </div>
                  )}
                </div>
                )
              })}
            </div>
            
            <div className="text-center">
              <button className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all text-sm font-medium">
                View All Achievements
              </button>
            </div>
          </div>
        </div>
        
        {/* AI Recommendations */}
        <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI-Powered Recommendations</h3>
                <p className="text-sm text-indigo-600 dark:text-indigo-400">Personalized just for you</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">
              Updated Daily
            </span>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                type: 'course',
                title: 'Advanced React Patterns',
                desc: 'Perfect match for your JavaScript expertise',
                confidence: 95,
                icon: BookOpen
              },
              {
                type: 'skill',
                title: 'TypeScript Mastery',
                desc: 'Complement your React knowledge',
                confidence: 88,
                icon: Code
              },
              {
                type: 'project',
                title: 'Build an AI Chatbot',
                desc: 'Apply your skills in a real project',
                confidence: 92,
                icon: Brain
              }
            ].map((rec, index) => {
              const IconComponent = rec.icon
              return (
                <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <IconComponent className="w-6 h-6 text-indigo-500" />
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                    {rec.confidence}% match
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{rec.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{rec.desc}</p>
                <button className="w-full px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors">
                  Explore Now
                </button>
              </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
}