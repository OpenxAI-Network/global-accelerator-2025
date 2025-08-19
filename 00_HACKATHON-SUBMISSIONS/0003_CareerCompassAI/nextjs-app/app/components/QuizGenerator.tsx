'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Trophy, RefreshCw, Sparkles, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizResponse {
  success: boolean;
  quiz?: QuizQuestion[];
  error?: string;
  source?: 'ollama' | 'fallback';
}

export default function QuizGenerator({ 
  onComplete 
}: { 
  onComplete: (quiz: QuizQuestion[], score: number) => void 
}) {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>('');
  
  // New state for interactivity
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim() || topic.trim().length < 10) {
      setError('Please enter a topic with at least 10 characters');
      return;
    }

    // Reset everything
    setLoading(true);
    setError(null);
    setQuiz(null);
    setSource('');
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);

    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: topic.trim() }),
      });

      const data: QuizResponse = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      if (data.success && data.quiz && data.quiz.length > 0) {
        setQuiz(data.quiz);
        setSource(data.source || 'unknown');
      } else {
        throw new Error(data.error || 'Invalid or empty quiz data received');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Quiz generation error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (isAnswered) return;

    setSelectedAnswer(optionIndex);
    setIsAnswered(true);

    if (optionIndex === quiz![currentQuestionIndex].correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz!.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
      onComplete(quiz!, score);
    }
  };
  
  const handleRestart = () => {
    setQuiz(null);
    setSource('');
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
    setError(null);
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && !quiz) {
      handleGenerate();
    }
  };

  const currentQuestion = quiz ? quiz[currentQuestionIndex] : null;
  const progressPercentage = quiz ? ((currentQuestionIndex + 1) / quiz.length) * 100 : 0;

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl -z-10" />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 via-transparent to-violet-600/5 rounded-3xl -z-10" />
      
      {/* Main Container */}
      <motion.div 
        className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl min-h-[400px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <AnimatePresence mode="wait">
          {!quiz ? (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center text-center space-y-8"
            >
              {/* Header */}
              <div className="space-y-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-600/20 border border-cyan-400/30"
                >
                  <Brain className="w-10 h-10 text-cyan-400" />
                  <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400 animate-pulse" />
                </motion.div>
                
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    AI Quiz Generator
                  </h2>
                  <p className="text-gray-300 text-lg max-w-md mx-auto leading-relaxed">
                    Transform any topic into an interactive quiz with AI-powered questions
                  </p>
                </div>
              </div>

              {/* Input Section */}
              <div className="w-full max-w-md space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter your topic (e.g. Smart Contracts, DeFi, Web3 Security)"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    className="w-full px-6 py-4 text-white placeholder-gray-400 bg-white/10 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 text-center backdrop-blur-sm"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
                  >
                    <XCircle className="w-4 h-4" />
                    {error}
                  </motion.div>
                )}
              </div>

              {/* Generate Button */}
              <motion.button
                whileHover={{ scale: loading || !topic.trim() ? 1 : 1.05 }}
                whileTap={{ scale: loading || !topic.trim() ? 1 : 0.95 }}
                disabled={loading || !topic.trim()}
                onClick={handleGenerate}
                className={`relative group px-8 py-4 rounded-2xl font-semibold text-white text-lg transition-all duration-300 ${
                  loading || !topic.trim()
                    ? 'bg-gray-600/50 opacity-50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-lg hover:shadow-cyan-500/25'
                }`}
              >
                <div className="flex items-center gap-3">
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <RefreshCw className="w-5 h-5" />
                      </motion.div>
                      <span>Generating Quiz...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      <span>Generate Quiz</span>
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </div>
                {!loading && !(!topic.trim()) && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
              </motion.button>

              {/* Features List */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 w-full max-w-2xl text-sm">
                {[
                  { icon: Brain, text: "AI-Powered Questions" },
                  { icon: Trophy, text: "Interactive Learning" },
                  { icon: Sparkles, text: "Instant Feedback" }
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-gray-300"
                  >
                    <feature.icon className="w-4 h-4 text-cyan-400" />
                    {feature.text}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : quizFinished ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center space-y-8"
            >
              {/* Trophy Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-yellow-400/30"
              >
                <Trophy className="w-12 h-12 text-yellow-400" />
              </motion.div>

              {/* Results */}
              <div className="space-y-4">
                <h3 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Quiz Complete!
                </h3>
                <div className="text-2xl text-white">
                  Final Score: <span className="font-bold text-cyan-400">{score}</span> / <span className="font-bold text-purple-400">{quiz.length}</span>
                </div>
                <div className="text-lg text-gray-300">
                  Accuracy: <span className="font-semibold">{Math.round((score / quiz.length) * 100)}%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md mx-auto">
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-green-400 via-cyan-400 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(score / quiz.length) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Restart Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRestart}
                className="px-8 py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5" />
                  Create Another Quiz
                </div>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Quiz Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-gray-300 text-sm font-medium">
                      Question {currentQuestionIndex + 1} of {quiz.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20">
                      <Trophy className="w-4 h-4 text-cyan-400" />
                      <span className="text-cyan-400 font-semibold">{score}</span>
                    </div>
                    {source && (
                      <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400">
                        {source === 'ollama' ? '🤖 AI' : '📚 Fallback'}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full md:w-48">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>

              {/* Question */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-white leading-relaxed">
                  {currentQuestion?.question}
                </h3>

                {/* Options */}
                <div className="grid gap-3">
                  {currentQuestion?.options.map((opt, idx) => {
                    const isCorrect = idx === currentQuestion.correct;
                    const isSelected = selectedAnswer === idx;
                    
                    let buttonStyles = 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20';
                    let iconColor = 'text-gray-400';
                    let statusIcon = null;
                    
                    if (isAnswered) {
                      if (isCorrect) {
                        buttonStyles = 'bg-green-500/20 border-green-500/50 text-green-100';
                        iconColor = 'text-green-400';
                        statusIcon = <CheckCircle className="w-5 h-5 text-green-400" />;
                      } else if (isSelected) {
                        buttonStyles = 'bg-red-500/20 border-red-500/50 text-red-100';
                        iconColor = 'text-red-400';
                        statusIcon = <XCircle className="w-5 h-5 text-red-400" />;
                      } else {
                        buttonStyles = 'bg-white/5 border-white/10 opacity-60';
                        iconColor = 'text-gray-500';
                      }
                    }

                    return (
                      <motion.button
                        key={idx}
                        onClick={() => handleAnswerSelect(idx)}
                        disabled={isAnswered}
                        whileHover={{ scale: isAnswered ? 1 : 1.02 }}
                        whileTap={{ scale: isAnswered ? 1 : 0.98 }}
                        className={`group relative w-full text-left p-4 rounded-xl border transition-all duration-300 ${buttonStyles} ${!isAnswered ? 'cursor-pointer' : 'cursor-default'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-bold text-sm transition-colors ${iconColor.replace('text-', 'text-')} ${iconColor.replace('text-', 'border-')}`}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span className="flex-1 text-white font-medium">{opt}</span>
                          {statusIcon && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              {statusIcon}
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Explanation and Next Button */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4 pt-6 border-t border-white/10"
                  >
                    <div className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl">
                      <div className="flex items-start gap-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${selectedAnswer === currentQuestion?.correct ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {selectedAnswer === currentQuestion?.correct ? 
                            <CheckCircle className="w-5 h-5" /> : 
                            <XCircle className="w-5 h-5" />
                          }
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-bold text-lg mb-2 ${selectedAnswer === currentQuestion?.correct ? 'text-green-400' : 'text-red-400'}`}>
                            {selectedAnswer === currentQuestion?.correct ? 'Correct!' : 'Incorrect'}
                          </h4>
                          <p className="text-gray-300 leading-relaxed">{currentQuestion?.explanation}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleNextQuestion}
                        className="px-8 py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">
                          {currentQuestionIndex < quiz.length - 1 ? (
                            <>
                              <span>Next Question</span>
                              <ArrowRight className="w-5 h-5" />
                            </>
                          ) : (
                            <>
                              <Trophy className="w-5 h-5" />
                              <span>Finish Quiz</span>
                            </>
                          )}
                        </div>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
