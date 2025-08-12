'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
// import StarRating from '@/components/features/StarRating';
// import AIAvatar from '@/components/features/AIAvatar';
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
  Volume2
} from 'lucide-react';

export default function FeedbackPage() {
  const router = useRouter();
  const [feedbackType, setFeedbackType] = useState<'general' | 'career_advice' | 'platform_feedback' | 'feature_request'>('general');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiRecap, setAiRecap] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const feedbackTypes = [
    {
      id: 'general' as const,
      title: 'General Feedback',
      description: 'Share your overall experience',
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'from-cyber-blue to-blue-500'
    },
    {
      id: 'career_advice' as const,
      title: 'Career Guidance',
      description: 'Rate the quality of career recommendations',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'from-electric-purple to-purple-500'
    },
    {
      id: 'platform_feedback' as const,
      title: 'Platform Experience',
      description: 'Help us improve the user interface',
      icon: <Brain className="w-5 h-5" />,
      color: 'from-neon-pink to-pink-500'
    },
    {
      id: 'feature_request' as const,
      title: 'Feature Request',
      description: 'Suggest new features or improvements',
      icon: <Star className="w-5 h-5" />,
      color: 'from-matrix-green to-green-500'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim() || rating === 0) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/save-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: feedbackType,
          rating,
          content: feedback,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        setSubmitted(true);
        generateAIRecap();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateAIRecap = async () => {
    try {
      const response = await fetch('/api/ai/feedback-recap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          feedback,
          feedbackType
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiRecap(data.recap);
      } else {
        // Fallback AI recap
        setAiRecap(generateFallbackRecap());
      }
    } catch (error) {
      console.error('Error generating AI recap:', error);
      setAiRecap(generateFallbackRecap());
    }
  };

  const generateFallbackRecap = () => {
    const ratingText = rating >= 4 ? 'excellent' : rating >= 3 ? 'good' : 'mixed';
    return `Thank you for your ${ratingText} feedback! Your input about ${feedbackType.replace('_', ' ')} is valuable to us. We're continuously working to improve CareerCompass AI based on user insights like yours. Your ${rating}-star rating helps us understand what's working well and what needs enhancement.`;
  };

  const handleVoiceRecap = () => {
    if (!aiRecap) return;
    
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
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white flex items-center justify-center">
        <motion.div
          className="max-w-2xl mx-auto text-center p-8"
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
            <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-electric-purple mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Thank You for Your Feedback!
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6 glassmorphism border-white/20 mb-8">
              <div className="flex items-center justify-center mb-4">
                {/* <AIAvatar className="mb-4" /> */}<div>AI avatat</div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-center space-x-2">
                <Brain className="w-5 h-5 text-cyber-blue" />
                <span>AI Summary</span>
                {aiRecap && (
                  <Button
                    onClick={handleVoiceRecap}
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                  >
                    <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-red-400' : 'text-cyber-blue'}`} />
                  </Button>
                )}
              </h3>
              
              {aiRecap ? (
                <p className="text-white/80 leading-relaxed">{aiRecap}</p>
              ) : (
                <motion.div
                  className="flex items-center justify-center space-x-2"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <div className="w-2 h-2 bg-cyber-blue rounded-full"></div>
                  <div className="w-2 h-2 bg-electric-purple rounded-full"></div>
                  <div className="w-2 h-2 bg-neon-pink rounded-full"></div>
                  <span className="text-white/60 ml-2">Generating personalized summary...</span>
                </motion.div>
              )}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-cyber-blue to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-white mb-2">Valued Input</h4>
                <p className="text-white/70 text-sm">Your feedback helps us improve the platform for everyone</p>
              </motion.div>
              
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-electric-purple to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-white mb-2">Community Impact</h4>
                <p className="text-white/70 text-sm">Join thousands of users shaping the future of career guidance</p>
              </motion.div>
              
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-neon-pink to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-white mb-2">Continuous Growth</h4>
                <p className="text-white/70 text-sm">We're always evolving based on your suggestions</p>
              </motion.div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/career-suggestions">
                <Button className="bg-gradient-to-r from-cyber-blue to-electric-purple hover:from-cyber-blue/80 hover:to-electric-purple/80">
                  Continue Learning Journey
                </Button>
              </Link>
              <Link href="/learn">
                <Button variant="outline" className="glassmorphism border-white/30">
                  Explore Learning Hub
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/learn">
            <Button variant="ghost" className="text-white/60 hover:text-white mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Learning Hub
            </Button>
          </Link>

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-electric-purple mb-4">
              Share Your Experience
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Your feedback helps us improve CareerCompass AI and create better experiences for everyone.
            </p>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-8 glassmorphism border-white/20">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Feedback Type Selection */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-6">What would you like to share feedback about?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {feedbackTypes.map((type) => (
                      <motion.button
                        key={type.id}
                        type="button"
                        onClick={() => setFeedbackType(type.id)}
                        className={`p-4 rounded-lg border transition-all text-left ${
                          feedbackType === type.id
                            ? `bg-gradient-to-r ${type.color} text-white border-transparent`
                            : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/40'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          {type.icon}
                          <span className="font-medium">{type.title}</span>
                        </div>
                        <div className="text-sm opacity-90">{type.description}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">How would you rate your experience?</h3>
                  <div className="flex items-center justify-center space-x-4">
                    {/* <StarRating
                      rating={rating}
                      onRatingChange={setRating}
                      size="lg"
                      interactive={true}
                    /> */} <div>star Rating</div>
                    {rating > 0 && (
                      <motion.span
                        className="text-white/80 ml-4"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {rating === 5 ? 'Excellent!' : 
                         rating === 4 ? 'Very Good!' : 
                         rating === 3 ? 'Good' : 
                         rating === 2 ? 'Fair' : 'Needs Improvement'}
                      </motion.span>
                    )}
                  </div>
                </div>

                {/* Feedback Text */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Tell us more about your experience</h3>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Share your thoughts, suggestions, or any issues you encountered..."
                    className="w-full h-32 p-4 rounded-lg border-0 bg-white/10 text-white placeholder-white/50 focus:ring-2 focus:ring-cyber-blue/50 resize-none"
                    required
                  />
                  <div className="text-right text-sm text-white/60 mt-2">
                    {feedback.length}/500 characters
                  </div>
                </div>

                {/* Quick Feedback Buttons */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Quick feedback (optional)</h4>
                  <div className="flex flex-wrap gap-3">
                    {[
                      '🚀 Easy to use',
                      '🎯 Accurate recommendations',
                      '🧠 Helpful AI assistant',
                      '💡 Great features',
                      '📱 Mobile-friendly',
                      '⚡ Fast and responsive',
                      '🎨 Beautiful design',
                      '🔊 Love the voice feature'
                    ].map((quickFeedback) => (
                      <motion.button
                        key={quickFeedback}
                        type="button"
                        onClick={() => {
                          if (!feedback.includes(quickFeedback)) {
                            setFeedback(prev => prev ? `${prev} ${quickFeedback}` : quickFeedback);
                          }
                        }}
                        className="px-3 py-2 bg-white/10 border border-white/20 rounded-full text-sm text-white/80 hover:bg-white/20 hover:border-white/40 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {quickFeedback}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-4">
                  <Button
                    type="submit"
                    disabled={!feedback.trim() || rating === 0 || isSubmitting}
                    className="bg-gradient-to-r from-cyber-blue to-electric-purple hover:from-cyber-blue/80 hover:to-electric-purple/80 px-8 py-3 text-lg"
                  >
                    {isSubmitting ? (
                      <motion.div
                        className="flex items-center space-x-2"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </motion.div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Send className="w-5 h-5" />
                        <span>Submit Feedback</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="p-6 glassmorphism border-white/20">
              <h4 className="text-lg font-medium text-white mb-3">🔒 Your Privacy Matters</h4>
              <p className="text-white/70 text-sm leading-relaxed">
                Your feedback is anonymous and used solely to improve our platform. We don't share personal information 
                and all data is processed securely according to our privacy policy.
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}