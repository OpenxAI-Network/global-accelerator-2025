'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  Send,
  ArrowLeft,
  Heart,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Star,
  TrendingUp,
  Users,
  Brain,
  CheckCircle,
  Volume2,
  Sparkles,
  Mic,
  MicOff,
  Save,
  Smile,
  Moon,
  Sun,
  Type,
  Zap,
  BookOpen,
  GraduationCap,
  Award,
  Target,
  Lightbulb,
  ChevronRight,
  Play,
  Pause,
  RefreshCw,
  Shield,
  Lock,
  Trash2,
  AlertCircle
} from 'lucide-react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  id: string;
}

interface FeedbackData {
  rating: number;
  feedback: string;
  category: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  timestamp: Date;
}

type FontSize = 'small' | 'medium' | 'large';
type FeedbackStep = 1 | 2 | 3 | 4;

const ACADEMIC_FEEDBACK_OPTIONS = [
  '📚 Excellent study resources',
  '🎓 Great learning experience', 
  '📖 Comprehensive course content',
  '💡 Innovative teaching methods',
  '🔬 Practical research tools',
  '📊 Clear progress tracking',
  '🏆 Achievement system works well',
  '👨‍🏫 Helpful academic guidance',
  '📝 Easy assignment submission',
  '🎯 Goal-oriented learning',
  '🧠 Intellectual growth',
  '📈 Academic performance improved'
];

const ACADEMIC_CATEGORIES = {
  course: { icon: '📚', label: 'Course Content' },
  research: { icon: '🔬', label: 'Research Tools' },
  assessment: { icon: '📝', label: 'Assessment System' },
  guidance: { icon: '👨‍🏫', label: 'Academic Guidance' },
  platform: { icon: '💻', label: 'Platform Experience' },
  progress: { icon: '📈', label: 'Progress Tracking' }
} as const;

const EMOJIS = ['😊', '😍', '🤔', '😎', '🥳', '👍', '💡', '🔥', '⭐', '🎯', '📚', '🎓', '💪', '🚀', '✨', '🌟'];

const ACADEMIC_STATS = [
  { label: 'Student Feedback', value: '15,000+', icon: Users },
  { label: 'Courses Improved', value: '500+', icon: BookOpen },
  { label: 'Learning Outcomes', value: '95%', icon: TrendingUp },
  { label: 'Satisfaction Rate', value: '4.8/5', icon: Star }
];

export default function FeedbackPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiRecap, setAiRecap] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentStep, setCurrentStep] = useState<FeedbackStep>(1);
  const [sentiment, setSentiment] = useState<'positive' | 'negative' | 'neutral'>('neutral');
  const [detectedCategory, setDetectedCategory] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [showConfetti, setShowConfetti] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load and save draft
  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return;
    
    const draft = localStorage.getItem('academic_feedback_draft');
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        setFeedback(parsedDraft.feedback || '');
        setRating(parsedDraft.rating || 0);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, [isClient]);

  // Auto-save draft
  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return;
    
    const timer = setTimeout(() => {
      if (feedback.length > 0 || rating > 0) {
        const draftData = { feedback, rating, timestamp: Date.now() };
        localStorage.setItem('academic_feedback_draft', JSON.stringify(draftData));
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [feedback, rating, isClient]);

  // Sentiment analysis
  useEffect(() => {
    if (!isClient || !feedback) return;
    
    const positiveWords = ['excellent', 'amazing', 'great', 'love', 'perfect', 'awesome', 'brilliant', 'outstanding', 'fantastic', 'wonderful'];
    const negativeWords = ['terrible', 'awful', 'bad', 'hate', 'worst', 'horrible', 'disappointing', 'useless', 'frustrating'];
    
    const words = feedback.toLowerCase().split(' ');
    const positiveCount = words.filter(word => positiveWords.some(pos => word.includes(pos))).length;
    const negativeCount = words.filter(word => negativeWords.some(neg => word.includes(neg))).length;
    
    if (positiveCount > negativeCount) {
      setSentiment('positive');
    } else if (negativeCount > positiveCount) {
      setSentiment('negative');
    } else {
      setSentiment('neutral');
    }

    // Category detection
    const categoryKeywords = {
      course: ['course', 'curriculum', 'syllabus', 'lesson', 'module', 'content', 'material'],
      research: ['research', 'paper', 'study', 'analysis', 'data', 'methodology'],
      assessment: ['exam', 'test', 'quiz', 'assignment', 'grade', 'evaluation', 'assessment'],
      guidance: ['teacher', 'mentor', 'advisor', 'guidance', 'help', 'support'],
      platform: ['platform', 'website', 'interface', 'navigation', 'design', 'user experience'],
      progress: ['progress', 'tracking', 'achievement', 'goal', 'milestone', 'improvement']
    };

    let detectedCat = '';
    let maxMatches = 0;
    
    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
      const matches = keywords.filter(keyword => feedback.toLowerCase().includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedCat = category;
      }
    });

    setDetectedCategory(detectedCat);
  }, [feedback, isClient]);

  // Step progression
  useEffect(() => {
    if (rating > 0 && currentStep === 1) {
      setCurrentStep(2);
    } else if (feedback.length > 10 && currentStep === 2) {
      setCurrentStep(3);
    }
  }, [rating, feedback, currentStep]);

  // Voice recognition
  const startListening = useCallback(() => {
    if (!isClient || typeof window === 'undefined') return;
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
          
        setFeedback(transcript);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setError('Voice recognition failed. Please try again.');
      };
      
      recognitionRef.current.start();
    } else {
      setError('Voice recognition not supported in this browser.');
    }
  }, [isClient]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isClient) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (feedback.trim() && rating > 0 && !isSubmitting) {
            handleSubmit(e as any);
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          handleClearForm();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [feedback, rating, isClient, isSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.trim() || feedback.length < 10 || rating === 0 || isSubmitting) {
      setError('Please provide a rating and at least 10 characters of feedback.');
      return;
    }

    setCurrentStep(4);
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitted(true);
      setShowConfetti(true);
      
      // Clear draft
      if (isClient && typeof window !== 'undefined') {
        localStorage.removeItem('academic_feedback_draft');
      }
      
      generateAIRecap();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError('Failed to submit feedback. Please try again.');
      setIsSubmitting(false);
    }
  };

  const generateAIRecap = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAiRecap(generateFallbackRecap());
    } catch (error) {
      console.error('Error generating AI recap:', error);
      setAiRecap(generateFallbackRecap());
    }
  };

  const generateFallbackRecap = () => {
    const ratingText = rating >= 4 ? 'excellent' : rating >= 3 ? 'good' : 'constructive';
    const categoryText = detectedCategory ? ` regarding ${ACADEMIC_CATEGORIES[detectedCategory as keyof typeof ACADEMIC_CATEGORIES]?.label || 'platform features'}` : '';
    return `Thank you for your ${ratingText} academic feedback${categoryText}! Your ${rating}-star rating and detailed insights about your learning experience help us enhance our educational platform. We're committed to improving academic outcomes based on valuable student feedback like yours. Your input contributes to our mission of advancing quality education for all learners.`;
  };

  const handleVoiceRecap = useCallback(() => {
    if (!isClient || typeof window === 'undefined' || !aiRecap) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(aiRecap);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }, [aiRecap, isSpeaking, isClient]);

  const addEmoji = useCallback((emoji: string) => {
    setFeedback(prev => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  }, []);

  const handleClearForm = useCallback(() => {
    setFeedback('');
    setRating(0);
    setCurrentStep(1);
    setError(null);
    if (isClient && typeof window !== 'undefined') {
      localStorage.removeItem('academic_feedback_draft');
    }
  }, [isClient]);

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };

  const themeClasses = darkMode 
    ? "bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white"
    : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-900";

  // Confetti Component
  const Confetti = () => {
    if (!isClient) return null;
    
    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'][i % 6],
              left: `${Math.random() * 100}%`,
              top: '-20px'
            }}
            initial={{ y: -20, rotate: 0, opacity: 1 }}
            animate={{ 
              y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, 
              rotate: 360,
              opacity: 0
            }}
            transition={{ 
              duration: Math.random() * 3 + 2,
              delay: Math.random() * 2,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    );
  };

  // Progress Steps Component
  const ProgressSteps = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {[
        { step: 1, label: 'Rate', icon: Star },
        { step: 2, label: 'Write', icon: MessageSquare },
        { step: 3, label: 'Submit', icon: Send },
        { step: 4, label: 'Success', icon: CheckCircle }
      ].map((item, index) => (
        <React.Fragment key={item.step}>
          <motion.div
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
              currentStep >= item.step
                ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                : `${darkMode ? 'bg-white/10 text-white/50' : 'bg-gray-200 text-gray-500'}`
            }`}
            whileHover={{ scale: 1.05 }}
          >
            <item.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{item.label}</span>
          </motion.div>
          {index < 3 && (
            <ChevronRight className={`w-4 h-4 ${currentStep > item.step ? 'text-purple-400' : `${darkMode ? 'text-white/30' : 'text-gray-400'}`}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // Success page after submission
  if (submitted) {
    return (
      <div className={`min-h-screen ${themeClasses} ${getFontSizeClass()} flex items-center justify-center relative`}>
        {showConfetti && <Confetti />}
        
        <motion.div
          className="max-w-4xl mx-auto text-center p-8 relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <GraduationCap className="w-12 h-12 text-white" />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-green-400"
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </motion.div>

          <motion.h1
            className={`text-4xl font-bold ${darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'} mb-6`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Academic Feedback Submitted! 🎓
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className={`p-8 ${darkMode ? 'glassmorphism border-white/20' : 'bg-white/80 border-gray-200'} mb-8`}>
              <div className="flex items-center justify-center mb-6">
                <div className={`w-16 h-16 bg-gradient-to-r ${darkMode ? 'from-purple-500 to-cyan-500' : 'from-blue-500 to-purple-500'} rounded-full flex items-center justify-center`}>
                  <Brain className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6 flex items-center justify-center space-x-2`}>
                <span>AI Academic Summary</span>
                {aiRecap && (
                  <Button
                    onClick={handleVoiceRecap}
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                  >
                    {isSpeaking ? <Pause className="w-5 h-5 text-red-400" /> : <Play className="w-5 h-5 text-purple-400" />}
                  </Button>
                )}
              </h3>
              
              {aiRecap ? (
                <p className={`${darkMode ? 'text-white/80' : 'text-gray-700'} leading-relaxed text-lg`}>{aiRecap}</p>
              ) : (
                <motion.div
                  className="flex items-center justify-center space-x-3"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-3 h-3 bg-purple-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                  <span className={`${darkMode ? 'text-white/60' : 'text-gray-500'} ml-2 text-lg`}>Analyzing your academic feedback...</span>
                </motion.div>
              )}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {[
                { icon: BookOpen, title: 'Educational Impact', description: 'Your input helps us improve learning outcomes for all students', color: 'from-blue-500 to-cyan-500' },
                { icon: Users, title: 'Academic Community', description: 'Join educators and students shaping the future of learning', color: 'from-purple-500 to-pink-500' },
                { icon: Award, title: 'Excellence Driven', description: 'Continuous improvement based on academic insights', color: 'from-green-500 to-teal-500' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.2 }}
                >
                  <div className={`w-20 h-20 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  <h4 className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>{item.title}</h4>
                  <p className={`${darkMode ? 'text-white/70' : 'text-gray-600'} leading-relaxed`}>{item.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/career-suggestions">
                <Button className={`bg-gradient-to-r ${darkMode ? 'from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400' : 'from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'} text-white px-8 py-4 text-lg`}>
                  Continue Academic Journey
                </Button>
              </Link>
              <Link href="/learn">
                <Button variant="outline" className={`px-8 py-4 text-lg ${darkMode ? 'glassmorphism border-white/30 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  Explore Learning Resources
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Main feedback form
  return (
    <div className={`min-h-screen ${themeClasses} ${getFontSizeClass()} relative`}>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-cyan-500/10 to-pink-500/10 rounded-3xl blur-xl -z-10" />
      <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/5 via-transparent to-blue-600/5 rounded-3xl -z-10" />
      
      {/* Accessibility & Theme Controls */}
      <div className="fixed top-6 right-6 z-40 flex items-center space-x-3">
        <Button
          onClick={() => setDarkMode(!darkMode)}
          variant="ghost"
          size="sm"
          className={`${darkMode ? 'text-white hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'} p-3`}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
        
        <select
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value as FontSize)}
          className={`px-3 py-2 rounded-lg text-sm ${darkMode ? 'bg-white/10 text-white border-white/20' : 'bg-white border-gray-200 text-gray-900'}`}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/learn">
            <Button variant="ghost" className={`${darkMode ? 'text-white/60 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mb-6`}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Academic Hub
            </Button>
          </Link>

          <div className="text-center">
            <motion.div
              className="flex items-center justify-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <GraduationCap className="w-12 h-12 text-yellow-400 mr-3" />
              <Sparkles className="w-12 h-12 text-yellow-400" />
            </motion.div>
            <h1 className={`text-5xl md:text-6xl font-bold ${darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'} mb-6`}>
              Academic Feedback Portal
            </h1>
            <p className={`${darkMode ? 'text-white/70' : 'text-gray-600'} text-xl max-w-3xl mx-auto leading-relaxed`}>
              Share your academic experience to help us enhance educational outcomes and learning resources for all students.
            </p>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <ProgressSteps />

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className={`p-10 ${darkMode ? 'glassmorphism border-white/20' : 'bg-white/90 border-gray-200 shadow-xl'} relative`}>
              {/* Draft Saved Notification */}
              <AnimatePresence>
                {draftSaved && (
                  <motion.div
                    className="absolute top-6 right-6 flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-xl text-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Save className="w-4 h-4" />
                    <span>Draft saved</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className="mb-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                    <Button
                      onClick={() => setError(null)}
                      variant="ghost"
                      size="sm"
                      className="ml-auto text-red-400 hover:text-red-300"
                    >
                      ×
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Rating Section */}
                <div className="text-center">
                  <h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-8`}>Rate Your Academic Experience</h3>
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        type="button"
                        className="focus:outline-none"
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setRating(star)}
                        whileHover={{ scale: 1.3, rotate: 15 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Star
                          className={`w-12 h-12 transition-all duration-200 ${
                            star <= (hoveredRating || rating)
                              ? 'text-yellow-400 fill-yellow-400 drop-shadow-2xl'
                              : `${darkMode ? 'text-white/30 hover:text-white/50' : 'text-gray-300 hover:text-gray-400'}`
                          }`}
                        />
                      </motion.button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center"
                    >
                      <span className={`text-2xl font-semibold ${darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500'}`}>
                        {rating === 5 ? '🌟 Outstanding Academic Experience!' : 
                         rating === 4 ? '⭐ Excellent Learning Journey!' : 
                         rating === 3 ? '👍 Good Educational Value' : 
                         rating === 2 ? '👌 Fair Academic Content' : '💭 Needs Academic Improvement'}
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* Sentiment & Category Detection */}
                <AnimatePresence>
                  {feedback.length > 20 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center justify-center space-x-8 p-6 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10"
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`text-lg font-medium ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>Sentiment:</span>
                        <span className={`px-4 py-2 rounded-xl text-sm font-medium ${
                          sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                          sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {sentiment === 'positive' ? '😊 Positive' : 
                           sentiment === 'negative' ? '😔 Needs Attention' : 
                           '😐 Neutral'}
                        </span>
                      </div>
                      
                      {detectedCategory && (
                        <div className="flex items-center space-x-3">
                          <span className={`text-lg font-medium ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>Category:</span>
                          <span className="px-4 py-2 rounded-xl text-sm font-medium bg-purple-500/20 text-purple-400">
                            {ACADEMIC_CATEGORIES[detectedCategory as keyof typeof ACADEMIC_CATEGORIES]?.icon} {ACADEMIC_CATEGORIES[detectedCategory as keyof typeof ACADEMIC_CATEGORIES]?.label}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Feedback Text Area */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Share Your Academic Experience</h3>
                    <div className="flex items-center space-x-3">
                      {/* Voice Input */}
                      <Button
                        type="button"
                        onClick={isListening ? stopListening : startListening}
                        variant="ghost"
                        size="sm"
                        className={`${isListening ? 'text-red-400' : `${darkMode ? 'text-white/60' : 'text-gray-500'}`} p-3`}
                      >
                        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </Button>
                      
                      {/* Emoji Picker */}
                      <div className="relative">
                        <Button
                          type="button"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          variant="ghost"
                          size="sm"
                          className={`${darkMode ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-700'} p-3`}
                        >
                          <Smile className="w-5 h-5" />
                        </Button>
                        
                        <AnimatePresence>
                          {showEmojiPicker && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: -10 }}
                              className={`absolute right-0 top-12 z-20 p-4 rounded-xl shadow-2xl border ${
                                darkMode ? 'bg-gray-800 border-white/20' : 'bg-white border-gray-200'
                              }`}
                            >
                              <div className="grid grid-cols-4 gap-3 max-w-64">
                                {EMOJIS.map((emoji, index) => (
                                  <motion.button
                                    key={index}
                                    type="button"
                                    onClick={() => addEmoji(emoji)}
                                    className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-2xl"
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    {emoji}
                                  </motion.button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Clear Button */}
                      <Button
                        type="button"
                        onClick={handleClearForm}
                        variant="ghost"
                        size="sm"
                        className={`${darkMode ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-700'} p-3`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Share your thoughts about courses, teaching methods, research tools, assessment systems, or overall academic experience..."
                      className={`w-full h-48 p-6 rounded-xl border-0 ${
                        darkMode 
                          ? 'bg-white/10 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400/50 focus:bg-white/15' 
                          : 'bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:bg-white'
                      } resize-none transition-all duration-300 text-lg`}
                      required
                      maxLength={1000}
                    />
                    
                    {/* Character Counter */}
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center space-x-6 text-sm">
                        <span className={`${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
                          {feedback.length < 10 ? 'Minimum 10 characters required' : '✓ Length requirement met'}
                        </span>
                        {isListening && (
                          <motion.span
                            className="text-red-400 flex items-center space-x-2"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <div className="w-2 h-2 bg-red-400 rounded-full" />
                            <span>Listening...</span>
                          </motion.span>
                        )}
                      </div>
                      <span className={`text-sm ${
                        feedback.length > 900 
                          ? 'text-yellow-400 font-semibold' 
                          : feedback.length > 800 
                            ? 'text-orange-400' 
                            : darkMode ? 'text-white/60' : 'text-gray-500'
                      }`}>
                        {feedback.length}/1000
                      </span>
                    </div>
                  </div>
                  
                  {/* Keyboard Shortcuts Info */}
                  <div className={`text-sm ${darkMode ? 'text-white/40' : 'text-gray-400'} mt-4 flex items-center space-x-6`}>
                    <span>💡 Pro tips:</span>
                    <span>Ctrl+Enter to submit</span>
                    <span>Esc to clear</span>
                    <span>Click mic for voice input</span>
                  </div>
                </div>

                {/* Academic Quick Feedback Tags */}
                <div>
                  <h4 className={`text-xl font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
                    Academic Experience Tags <span className="text-base opacity-60">(optional)</span>
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {ACADEMIC_FEEDBACK_OPTIONS.map((quickFeedback, index) => (
                      <motion.button
                        key={index}
                        type="button"
                        onClick={() => {
                          if (!feedback.includes(quickFeedback)) {
                            setFeedback(prev => prev ? `${prev} ${quickFeedback}` : quickFeedback);
                          }
                        }}
                        className={`px-5 py-3 border rounded-xl text-sm transition-all duration-200 ${
                          feedback.includes(quickFeedback)
                            ? 'bg-gradient-to-r from-green-400 to-green-600 text-white border-transparent'
                            : darkMode 
                              ? 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:border-white/40' 
                              : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200 hover:border-gray-300'
                        }`}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {quickFeedback}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-8">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={!feedback.trim() || feedback.length < 10 || rating === 0 || isSubmitting}
                      className={`${
                        darkMode 
                          ? 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400' 
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                      } px-16 py-5 text-xl font-semibold shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed min-w-[280px] text-white relative overflow-hidden`}
                    >
                      {/* Button Background Animation */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                        initial={{ x: '-100%' }}
                        animate={isSubmitting ? { x: '100%' } : {}}
                        transition={{ duration: 1.5, repeat: isSubmitting ? Infinity : 0 }}
                      />
                      
                      {isSubmitting ? (
                        <motion.div
                          className="flex items-center space-x-4 relative z-10"
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <RefreshCw className="w-6 h-6" />
                          </motion.div>
                          <span>Submitting Academic Feedback...</span>
                        </motion.div>
                      ) : (
                        <div className="flex items-center space-x-4 relative z-10">
                          <Send className="w-6 h-6" />
                          <span>Submit Academic Feedback</span>
                          <Sparkles className="w-5 h-5" />
                        </div>
                      )}
                    </Button>
                  </motion.div>
                </div>

                {/* Form Validation Summary */}
                <div className="text-center text-lg">
                  <div className={`flex items-center justify-center space-x-8 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
                    <span className={`flex items-center space-x-2 ${rating > 0 ? 'text-green-400' : ''}`}>
                      <div className={`w-3 h-3 rounded-full ${rating > 0 ? 'bg-green-400' : 'bg-gray-400'}`} />
                      <span>Rating</span>
                    </span>
                    <span className={`flex items-center space-x-2 ${feedback.length >= 10 ? 'text-green-400' : ''}`}>
                      <div className={`w-3 h-3 rounded-full ${feedback.length >= 10 ? 'bg-green-400' : 'bg-gray-400'}`} />
                      <span>Feedback (10+ chars)</span>
                    </span>
                  </div>
                </div>
              </form>
            </Card>
          </motion.div>

          {/* Privacy Notice */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className={`p-8 ${darkMode ? 'glassmorphism border-white/20' : 'bg-white/80 border-gray-200'}`}>
              <div className="flex items-center justify-center mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Shield className={`w-10 h-10 ${darkMode ? 'text-purple-400' : 'text-blue-500'}`} />
                </motion.div>
              </div>
              <h4 className={`text-2xl font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center justify-center space-x-2`}>
                <Lock className="w-6 h-6" />
                <span>Academic Privacy & Data Security</span>
              </h4>
              <p className={`${darkMode ? 'text-white/70' : 'text-gray-600'} text-lg leading-relaxed max-w-3xl mx-auto`}>
                Your academic feedback is completely anonymous and encrypted. We use this data solely to enhance educational 
                experiences and learning outcomes. All information is processed according to educational privacy standards 
                and FERPA compliance guidelines.
              </p>
              <div className="flex items-center justify-center space-x-8 mt-6 text-sm">
                {[
                  { icon: CheckCircle, text: 'FERPA Compliant', color: 'text-green-400' },
                  { icon: Lock, text: 'End-to-End Encrypted', color: 'text-blue-400' },
                  { icon: Shield, text: 'Anonymous Submission', color: 'text-purple-400' }
                ].map((item, index) => (
                  <span key={index} className={`flex items-center space-x-2 ${item.color}`}>
                    <item.icon className="w-4 h-4" />
                    <span>{item.text}</span>
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Academic Stats */}
          <motion.div
            className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {ACADEMIC_STATS.map((stat, index) => (
              <motion.div
                key={index}
                className={`text-center p-6 rounded-xl ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white/60 border border-gray-200'}`}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className={`flex justify-center mb-4 ${darkMode ? 'text-purple-400' : 'text-blue-500'}`}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                  {stat.value}
                </div>
                <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
