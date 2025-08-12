'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  BookOpen,
  Brain,
  MessageSquare,
  Award,
  TrendingUp,
  Users,
  Clock,
  Star,
  ArrowRight,
  Lightbulb,
  Target,
  Zap
} from 'lucide-react';
import { StudyBuddy } from '@/components/StudyBuddy';
import FlashcardMaker from "@/components/flashcard-maker";
import QuizGenerator from '@/components/QuizGenerator'

export default function LearnPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'flashcards' | 'quiz' | 'study-buddy'>('flashcards');
  const [userProgress, setUserProgress] = useState({
    flashcardsCreated: 0,
    quizzesCompleted: 0,
    questionsAsked: 0,
    totalStudyTime: 0
  });

  useEffect(() => {
    // Load user progress from localStorage
    const savedProgress = localStorage.getItem('learningProgress');
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
  }, []);

  const tabs = [
    {
      id: 'flashcards' as const,
      label: '🃏 Flashcards',
      title: 'Flashcard Maker',
      description: 'Create smart flashcards from your notes',
      icon: <BookOpen className="w-5 h-5" />,
      color: 'from-cyber-blue to-blue-500'
    },
    {
      id: 'quiz' as const,
      label: '📝 Quiz',
      title: 'Quiz Generator', 
      description: 'Generate practice quizzes instantly',
      icon: <Brain className="w-5 h-5" />,
      color: 'from-electric-purple to-purple-500'
    },
    {
      id: 'study-buddy' as const,
      label: '🤖 Study Buddy',
      title: 'AI Study Assistant',
      description: 'Get personalized help with any topic',
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'from-neon-pink to-pink-500'
    }
  ];

  const features = [
    {
      icon: <Zap className="w-8 h-8 text-yellow-400" />,
      title: "AI-Powered Learning",
      description: "Advanced AI creates personalized study materials from your career notes and goals.",
      stats: "10x faster than traditional methods"
    },
    {
      icon: <Target className="w-8 h-8 text-green-400" />,
      title: "Career-Focused Content",
      description: "All learning materials are tailored to your specific career path and skill requirements.",
      stats: "98% relevancy rate"
    },
    {
      icon: <Users className="w-8 h-8 text-blue-400" />,
      title: "Adaptive Learning",
      description: "Content difficulty adjusts based on your progress and understanding level.",
      stats: "40% better retention"
    },
    {
      icon: <Award className="w-8 h-8 text-purple-400" />,
      title: "Progress Tracking",
      description: "Comprehensive analytics to monitor your learning journey and achievements.",
      stats: "Complete visibility"
    }
  ];

  const handleTabChange = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
  };

  const updateProgress = (type: string, increment: number = 1) => {
    const newProgress = { ...userProgress };
    switch (type) {
      case 'flashcards':
        newProgress.flashcardsCreated += increment;
        break;
      case 'quiz':
        newProgress.quizzesCompleted += increment;
        break;
      case 'questions':
        newProgress.questionsAsked += increment;
        break;
      case 'studyTime':
        newProgress.totalStudyTime += increment;
        break;
    }
    setUserProgress(newProgress);
    localStorage.setItem('learningProgress', JSON.stringify(newProgress));
  };

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue via-electric-purple to-neon-pink mb-6">
            <span className="text-black" >📚</span> Learning Hub
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-8">
            Supercharge your career learning with AI-powered study tools. Create flashcards, generate quizzes, 
            and get personalized assistance for any topic.
          </p>

          {/* Progress Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-cyber-blue">{userProgress.flashcardsCreated}</div>
              <div className="text-xs text-white/60">Flashcards Created</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-electric-purple">{userProgress.quizzesCompleted}</div>
              <div className="text-xs text-white/60">Quizzes Completed</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-neon-pink">{userProgress.questionsAsked}</div>
              <div className="text-xs text-white/60">Questions Asked</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-matrix-green">{Math.round(userProgress.totalStudyTime / 60)}</div>
              <div className="text-xs text-white/60">Hours Studied</div>
            </div>
          </motion.div>

          <Link href="/career-suggestions">
            <Button variant="outline" className="glassmorphism border-white/30 mb-8">
              Back to Career Suggestions
            </Button>
          </Link>
        </motion.div>

        {/* Features Section */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              >
                <Card className="p-6 glassmorphism border-white/20 hover:border-white/40 transition-all duration-300 h-full group">
                  <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/70 text-sm mb-3 leading-relaxed">{feature.description}</p>
                  <div className="text-xs text-cyber-blue font-medium">{feature.stats}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          className="flex flex-col lg:flex-row gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        > tabs</motion.div>
          {/* Sidebar Tabs */}
          <div className="lg:w-1/4">
            <Card className="p-6 glassmorphism border-white/20 sticky top-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <span>Study Tools</span>
              </h3>
              
              <div className="space-y-3">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full p-4 rounded-lg border transition-all text-left group ${
                      activeTab === tab.id
                        ? `bg-gradient-to-r ${tab.color} text-white border-transparent`
                        : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/40'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      {tab.icon}
                      <span className="font-medium">{tab.label}</span>
                    </div>
                    <div className="text-sm opacity-90">{tab.description}</div>
                    {activeTab === tab.id && (
                      <motion.div
                        className="mt-2 flex items-center text-xs"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <span>Active</span>
                        <ArrowRight className="w-3 h-3 ml-2" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="mt-8 pt-6 border-t border-white/20">
                <h4 className="text-sm font-medium text-white/80 mb-4">Today's Progress</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Study Time</span>
                    <span className="text-cyber-blue">2.5 hrs</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Accuracy</span>
                    <span className="text-electric-purple">87%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Streak</span>
                    <span className="text-neon-pink">12 days</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <Card className="glassmorphism border-white/20 min-h-[600px]">
              <div className="p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    {activeTab === 'flashcards' && (
                      <FlashcardMaker
                        onFlashcardsGenerated={(flashcards) => {
                          updateProgress('flashcards', flashcards.length);
                        }}
                      />
                      // <div>flash card here..</div>
                    )}
                    
                    {activeTab === 'quiz' && (
                      <QuizGenerator
                        onComplete={(quiz) => {
                          updateProgress('quiz');
                        }}
                      />
                      // <div>generated quiz here.</div>
                    )}
                    
                    {activeTab === 'study-buddy' && (
                      <StudyBuddy
                        onQuestionAsked={() => {
                          updateProgress('questions');
                        }}
                      />
                 
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="p-8 glassmorphism border-white/20 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Accelerate Your Learning?</h3>
            <p className="text-white/70 mb-6 leading-relaxed">
              Combine AI-powered study tools with your personalized career roadmap for maximum impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/roadmap">
                <Button className="bg-gradient-to-r from-cyber-blue to-electric-purple hover:from-cyber-blue/80 hover:to-electric-purple/80">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View My Roadmap
                </Button>
              </Link>
              <Link href="/feedback">
                <Button variant="outline" className="glassmorphism border-white/30">
                  <Star className="w-4 h-4 mr-2" />
                  Share Feedback
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    
  
  );
}