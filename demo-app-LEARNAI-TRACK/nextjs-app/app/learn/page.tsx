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
  Star,
  ArrowRight,
  Lightbulb,
  Target,
  Zap
} from 'lucide-react';
import { StudyBuddy } from '@/components/StudyBuddy';
import FlashcardMaker from "@/components/flashcard-maker";
import QuizGenerator from '@/components/QuizGenerator';

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
    const savedProgress = localStorage.getItem('learningProgress');
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
  }, []);

  const tabs = [
    {
      id: 'flashcards' as const,
      label: 'Flashcards',
      description: 'Create smart flashcards from your notes',
      icon: <BookOpen className="w-5 h-5" />,
      color: 'from-cyber-blue to-blue-500'
    },
    {
      id: 'quiz' as const,
      label: 'Quiz',
      description: 'Generate practice quizzes instantly',
      icon: <Brain className="w-5 h-5" />,
      color: 'from-electric-purple to-purple-500'
    },
    {
      id: 'study-buddy' as const,
      label: 'Study Buddy',
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
            📚 Learning Hub
          </h1>
          <p className="text-lg text-white/80 max-w-3xl mx-auto leading-relaxed mb-8">
            Supercharge your career learning with AI-powered study tools. Create flashcards, generate quizzes,
            and get personalized assistance for any topic.
          </p>

          {/* Progress Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
            {[
              { value: userProgress.flashcardsCreated, label: 'Flashcards Created', color: 'text-cyber-blue' },
              { value: userProgress.quizzesCompleted, label: 'Quizzes Completed', color: 'text-electric-purple' },
              { value: userProgress.questionsAsked, label: 'Questions Asked', color: 'text-neon-pink' },
              { value: Math.round(userProgress.totalStudyTime / 60), label: 'Hours Studied', color: 'text-matrix-green' }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                className="bg-white/10 rounded-lg p-4 backdrop-blur-sm shadow hover:shadow-lg transition-all"
                whileHover={{ scale: 1.05 }}
              >
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-white/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <Link href="/career-suggestions">
            <Button variant="outline" className="glassmorphism border-white/30 mb-8">
              Back to Career Suggestions
            </Button>
          </Link>
        </motion.div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 glassmorphism border-white/20 hover:border-white/40 transition-all duration-300 rounded-xl">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/70 text-sm mb-3">{feature.description}</p>
                <div className="text-xs text-cyber-blue font-medium">{feature.stats}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Horizontal Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-6 py-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-1 transition-all duration-300 ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white border-transparent shadow-lg`
                  : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Main Content */}
     
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
              )}
              {activeTab === 'quiz' && (
                <QuizGenerator
                  onComplete={() => {
                    updateProgress('quiz');
                  }}
                />
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
   

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="p-8 glassmorphism border-white/20 max-w-2xl mx-auto rounded-xl">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Accelerate Your Learning?
            </h3>
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
    </div>
  );
}