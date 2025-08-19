'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flashcard, FlashcardSet } from '../../app/types/career';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  BookOpen, 
  Brain, 
  AlertCircle,
  Sparkles,
  Target,
  TrendingUp,
  CheckCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
  Zap
} from 'lucide-react';

interface FlashcardsResponse {
  success: boolean;
  flashcards?: Array<{
    front: string;
    back: string;
  }>;
  error?: string;
  source?: 'ollama' | 'fallback';
}

interface FlashcardMakerProps {
  notes?: string;
  onFlashcardsGenerated?: (flashcards: Flashcard[]) => void;
  className?: string;
}

const FlashcardMaker: React.FC<FlashcardMakerProps> = ({
  notes,
  onFlashcardsGenerated,
  className = ''
}) => {
  const [inputText, setInputText] = useState(notes || '');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>('');
  const [studyMode, setStudyMode] = useState(false);
  const [reviewStats, setReviewStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0
  });

  const generateFlashcards = async () => {
    if (!inputText.trim()) {
      setError('Please enter some notes to generate flashcards');
      return;
    }

    if (inputText.trim().length < 20) {
      setError('Please provide more detailed notes (at least 20 characters)');
      return;
    }

    setLoading(true);
    setError(null);
    setFlashcards([]);

    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: inputText.trim() })
      });

      const data: FlashcardsResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate flashcards');
      }

      if (data.success && data.flashcards && data.flashcards.length > 0) {
        const generatedFlashcards: Flashcard[] = data.flashcards.map((card, index) => ({
          id: `card_${Date.now()}_${index}`,
          front: card.front,
          back: card.back,
          category: detectCategory(inputText),
          difficulty: 'intermediate' as const,
          tags: generateTags(inputText),
          createdAt: new Date(),
          reviewCount: 0,
          correctCount: 0
        }));

        setFlashcards(generatedFlashcards);
        setCurrentCard(0);
        setFlipped(false);
        setSource(data.source || 'unknown');
        onFlashcardsGenerated?.(generatedFlashcards);
      } else {
        throw new Error('No valid flashcards received');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Flashcard generation error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const detectCategory = (text: string): string => {
    const textLower = text.toLowerCase();
    if (textLower.includes('blockchain') || textLower.includes('web3')) return 'Blockchain';
    if (textLower.includes('programming') || textLower.includes('coding')) return 'Programming';
    if (textLower.includes('career') || textLower.includes('job')) return 'Career';
    return 'Study Notes';
  };

  const generateTags = (text: string): string[] => {
    const textLower = text.toLowerCase();
    const tags: string[] = [];
    
    if (textLower.includes('blockchain')) tags.push('blockchain');
    if (textLower.includes('web3')) tags.push('web3');
    if (textLower.includes('smart contract')) tags.push('smart-contracts');
    if (textLower.includes('defi')) tags.push('defi');
    if (textLower.includes('javascript')) tags.push('javascript');
    if (textLower.includes('react')) tags.push('react');
    if (textLower.includes('career')) tags.push('career');
    
    return tags.length > 0 ? tags : ['study'];
  };

  const nextCard = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1);
      setFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setFlipped(false);
    }
  };

  const flipCard = () => {
    setFlipped(!flipped);
  };

  const markAnswer = (correct: boolean) => {
    if (studyMode && flipped) {
      const updatedCards = [...flashcards];
      updatedCards[currentCard].reviewCount += 1;
      if (correct) {
        updatedCards[currentCard].correctCount += 1;
      }
      
      setFlashcards(updatedCards);
      setReviewStats(prev => ({
        correct: prev.correct + (correct ? 1 : 0),
        incorrect: prev.incorrect + (correct ? 0 : 1),
        total: prev.total + 1
      }));

      // Auto-advance to next card
      setTimeout(() => {
        if (currentCard < flashcards.length - 1) {
          nextCard();
        } else {
          // End of deck
          setStudyMode(false);
          const finalScore = reviewStats.correct + (correct ? 1 : 0);
          const finalTotal = reviewStats.total + 1;
          alert(`Study session complete! Score: ${finalScore}/${finalTotal} (${Math.round((finalScore/finalTotal)*100)}%)`);
        }
      }, 1000);
    }
  };

  const resetStudySession = () => {
    setCurrentCard(0);
    setFlipped(false);
    setStudyMode(false);
    setReviewStats({ correct: 0, incorrect: 0, total: 0 });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && inputText.trim()) {
      generateFlashcards();
    }
  };

  const progressPercentage = flashcards.length > 0 ? ((currentCard + 1) / flashcards.length) * 100 : 0;

  return (
    <div className={`relative w-full max-w-4xl mx-auto ${className}`}>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-cyan-500/10 to-pink-500/10 rounded-3xl blur-xl -z-10" />
      <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/5 via-transparent to-blue-600/5 rounded-3xl -z-10" />
      
      {/* Main Container */}
      <motion.div
        className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl min-h-[500px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <AnimatePresence mode="wait">
          {flashcards.length === 0 ? (
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
                  className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-400/20 to-cyan-600/20 border border-purple-400/30"
                >
                  <BookOpen className="w-10 h-10 text-purple-400" />
                  <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400 animate-pulse" />
                </motion.div>
                
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    AI Flashcard Maker
                  </h2>
                  <p className="text-gray-300 text-lg max-w-md mx-auto leading-relaxed">
                    Transform your study notes into interactive flashcards with AI
                  </p>
                </div>
              </div>

              {/* Input Section */}
              <div className="w-full max-w-2xl space-y-6">
                <div className="relative">
                  <label className="block text-sm font-medium text-white/80 mb-3 text-left">
                    Paste your study notes or learning material:
                  </label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Paste your study notes here and I'll create flashcards for you... (minimum 20 characters)"
                    disabled={loading}
                    className="w-full h-40 p-6 text-white placeholder-gray-400 bg-white/10 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 backdrop-blur-sm resize-none"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 to-cyan-500/5 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Generate Button */}
                <div className="flex justify-center">
                  <motion.button
                    whileHover={{ scale: loading || !inputText.trim() || inputText.trim().length < 20 ? 1 : 1.05 }}
                    whileTap={{ scale: loading || !inputText.trim() || inputText.trim().length < 20 ? 1 : 0.95 }}
                    disabled={loading || !inputText.trim() || inputText.trim().length < 20}
                    onClick={generateFlashcards}
                    className={`relative group px-8 py-4 rounded-2xl font-semibold text-white text-lg transition-all duration-300 ${
                      loading || !inputText.trim() || inputText.trim().length < 20
                        ? 'bg-gray-600/50 opacity-50 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-cyan-600 hover:from-purple-400 hover:to-cyan-500 shadow-lg hover:shadow-purple-500/25'
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
                          <span>Generating Flashcards...</span>
                        </>
                      ) : (
                        <>
                          <Brain className="w-5 h-5" />
                          <span>Generate Flashcards</span>
                          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </div>
                    {!loading && inputText.trim().length >= 20 && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}
                  </motion.button>
                </div>

                {/* Tips */}
                <div className="text-center space-y-3">
                  <div className="text-xs text-white/60">
                    💡 Include key concepts, definitions, and important facts for better flashcards
                  </div>
                  
                  {/* Features */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
                    {[
                      { icon: Target, text: "Smart Questions", color: "text-purple-400" },
                      { icon: Zap, text: "Instant Generation", color: "text-cyan-400" },
                      { icon: TrendingUp, text: "Study Progress", color: "text-pink-400" }
                    ].map((feature, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + idx * 0.1 }}
                        className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-gray-300"
                      >
                        <feature.icon className={`w-4 h-4 ${feature.color}`} />
                        <span className="text-sm">{feature.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="flashcards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/10">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                    <span className="text-gray-300 text-sm font-medium">
                      Card {currentCard + 1} of {flashcards.length}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-wrap">
                    {source && (
                      <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs text-gray-400">
                        {source === 'ollama' ? '🤖 AI Generated' : '📚 Fallback'}
                      </div>
                    )}
                    
                    {studyMode && (
                      <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/10 to-red-500/10 border border-white/20">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 font-semibold">{reviewStats.correct}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-400" />
                          <span className="text-red-400 font-semibold">{reviewStats.incorrect}</span>
                        </div>
                        <span className="text-white/70 text-sm">
                          ({reviewStats.total > 0 ? Math.round((reviewStats.correct/reviewStats.total)*100) : 0}%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStudyMode(!studyMode)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      studyMode 
                        ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30' 
                        : 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-purple-400 hover:from-purple-500/30 hover:to-cyan-500/30'
                    }`}
                  >
                    {studyMode ? 'Exit Study Mode' : 'Study Mode'}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetStudySession}
                    className="p-2 rounded-xl bg-white/10 border border-white/20 text-gray-400 hover:bg-white/20 hover:text-white transition-all duration-300"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-purple-400 to-cyan-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-2 text-center">
                  Progress: {Math.round(progressPercentage)}%
                </div>
              </div>

              {/* Flashcard Display */}
              <div className="flex justify-center">
                <motion.div
                  className="relative w-full max-w-2xl h-80"
                  style={{ perspective: '1000px' }}
                >
                  <motion.div
                    className="relative w-full h-full cursor-pointer group"
                    onClick={flipCard}
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                    style={{ transformStyle: 'preserve-3d' }}
                    whileHover={{ scale: 1.02 }}
                  >
                    {/* Front of card */}
                    <div 
                      className="absolute inset-0 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-white/20 flex items-center justify-center p-8 shadow-2xl"
                      style={{
                        opacity: flipped ? 0 : 1,
                        transition: 'opacity 0.3s ease-in-out',
                        backfaceVisibility: 'hidden'
                      }}
                    >
                      <div className="text-center space-y-6">
                        <div className="flex items-center justify-center gap-2 text-purple-400 font-medium">
                          <BookOpen className="w-5 h-5" />
                          <span>Question</span>
                        </div>
                        <p className="text-white text-xl font-medium leading-relaxed max-w-lg">
                          {flashcards[currentCard]?.front}
                        </p>
                        <div className="flex items-center justify-center gap-2 text-xs text-white/50">
                          <Sparkles className="w-4 h-4" />
                          <span>Click to reveal answer</span>
                        </div>
                      </div>
                    </div>

                    {/* Back of card */}
                    <div 
                      className="absolute inset-0 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 to-pink-500/10 border border-white/20 flex items-center justify-center p-8 shadow-2xl"
                      style={{ 
                        transform: 'rotateY(180deg)',
                        opacity: flipped ? 1 : 0,
                        transition: 'opacity 0.3s ease-in-out',
                        backfaceVisibility: 'hidden'
                      }}
                    >
                      <div className="text-center space-y-6">
                        <div className="flex items-center justify-center gap-2 text-cyan-400 font-medium">
                          <Brain className="w-5 h-5" />
                          <span>Answer</span>
                        </div>
                        <p className="text-white text-xl font-medium leading-relaxed max-w-lg">
                          {flashcards[currentCard]?.back}
                        </p>
                        
                        {studyMode && (
                          <motion.div 
                            className="flex justify-center gap-4 mt-6"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                markAnswer(false);
                              }}
                              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all duration-300"
                            >
                              <XCircle className="w-5 h-5" />
                              <span>Incorrect</span>
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                markAnswer(true);
                              }}
                              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all duration-300"
                            >
                              <CheckCircle className="w-5 h-5" />
                              <span>Correct</span>
                            </motion.button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Navigation Controls */}
              <div className="flex justify-center items-center gap-6">
                <motion.button
                  whileHover={{ scale: currentCard === 0 ? 1 : 1.1 }}
                  whileTap={{ scale: currentCard === 0 ? 1 : 0.9 }}
                  onClick={prevCard}
                  disabled={currentCard === 0}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    currentCard === 0 
                      ? 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed' 
                      : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  <ChevronLeft className="w-6 h-6" />
                </motion.button>

                {/* Card Indicators */}
                <div className="flex gap-2">
                  {flashcards.map((_, index) => (
                    <motion.button
                      key={index}
                      onClick={() => {
                        setCurrentCard(index);
                        setFlipped(false);
                      }}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentCard 
                          ? 'bg-purple-400 scale-125' 
                          : 'bg-white/30 hover:bg-white/50'
                      }`}
                      whileHover={{ scale: index === currentCard ? 1.25 : 1.3 }}
                      whileTap={{ scale: 1 }}
                    />
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: currentCard === flashcards.length - 1 ? 1 : 1.1 }}
                  whileTap={{ scale: currentCard === flashcards.length - 1 ? 1 : 0.9 }}
                  onClick={nextCard}
                  disabled={currentCard === flashcards.length - 1}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    currentCard === flashcards.length - 1 
                      ? 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed' 
                      : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  <ChevronRight className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 pt-6 border-t border-white/10">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setFlashcards([]);
                    setInputText('');
                    setError(null);
                    resetStudySession();
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-gray-500/20 to-gray-600/20 border border-gray-500/30 text-gray-300 hover:from-gray-500/30 hover:to-gray-600/30 transition-all duration-300 font-medium"
                >
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    <span>Create New Set</span>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default FlashcardMaker;
