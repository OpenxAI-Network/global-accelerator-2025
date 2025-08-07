'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flashcard, FlashcardSet } from '../../types/career';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ChevronLeft, ChevronRight, RotateCcw, BookOpen, Brain } from 'lucide-react';

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
  const [studyMode, setStudyMode] = useState(false);
  const [reviewStats, setReviewStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0
  });

  const generateFlashcards = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    try {
      // First try local Ollama (from LearnAI integration)
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: inputText })
      });

      if (!response.ok) {
        throw new Error('Failed to generate flashcards');
      }

      const data = await response.json();
      
      if (data.flashcards && Array.isArray(data.flashcards)) {
        const generatedFlashcards: Flashcard[] = data.flashcards.map((card: any, index: number) => ({
          id: `card_${Date.now()}_${index}`,
          front: card.front,
          back: card.back,
          category: 'Career Skills',
          difficulty: 'intermediate' as const,
          tags: ['career', 'skills'],
          createdAt: new Date(),
          reviewCount: 0,
          correctCount: 0
        }));

        setFlashcards(generatedFlashcards);
        setCurrentCard(0);
        setFlipped(false);
        onFlashcardsGenerated?.(generatedFlashcards);
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      
      // Fallback to creating sample flashcards
      const fallbackCards: Flashcard[] = [
        {
          id: `fallback_${Date.now()}_1`,
          front: "What are the key skills for career advancement?",
          back: "Communication, leadership, problem-solving, adaptability, and continuous learning are essential for career growth.",
          category: 'Career Skills',
          difficulty: 'intermediate',
          tags: ['career', 'skills'],
          createdAt: new Date(),
          reviewCount: 0,
          correctCount: 0
        }
      ];
      
      setFlashcards(fallbackCards);
      onFlashcardsGenerated?.(fallbackCards);
    }
    setLoading(false);
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
          alert(`Study session complete! Score: ${reviewStats.correct + (correct ? 1 : 0)}/${reviewStats.total + 1}`);
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

  return (
    <motion.div
      className={`flashcard-maker w-full max-w-4xl mx-auto ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-6">
        <div className="text-center mb-8">
          <motion.h2 
            className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-electric-purple mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            🃏 AI Flashcard Maker
          </motion.h2>
          <p className="text-white/70">Generate interactive flashcards from your career notes</p>
        </div>

        {flashcards.length === 0 ? (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 glassmorphism border-white/20">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-white/80">
                  Paste your career notes or study material:
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste your study notes here and I'll create flashcards for you..."
                  className="w-full h-40 p-4 rounded-lg border-0 bg-white/10 text-white placeholder-white/50 focus:ring-2 focus:ring-cyber-blue/50 resize-none"
                />
                <Button
                  onClick={generateFlashcards}
                  disabled={loading || !inputText.trim()}
                  className="w-full bg-gradient-to-r from-cyber-blue to-electric-purple hover:from-cyber-blue/80 hover:to-electric-purple/80"
                >
                  {loading ? (
                    <motion.div
                      className="flex items-center space-x-2"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Brain className="w-5 h-5 animate-pulse" />
                      <span>Generating Flashcards...</span>
                    </motion.div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5" />
                      <span>Generate Flashcards</span>
                    </div>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Study Mode Controls */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <span className="text-white/70">
                  Card {currentCard + 1} of {flashcards.length}
                </span>
                {studyMode && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-green-400">Correct: {reviewStats.correct}</span>
                    <span className="text-red-400">Incorrect: {reviewStats.incorrect}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setStudyMode(!studyMode)}
                  variant={studyMode ? 'destructive' : 'default'}
                  size="sm"
                  className="glassmorphism"
                >
                  {studyMode ? 'Exit Study Mode' : 'Study Mode'}
                </Button>
                <Button
                  onClick={resetStudySession}
                  variant="outline"
                  size="sm"
                  className="glassmorphism"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Flashcard Display */}
            <div className="flex justify-center">
              <motion.div
                className="relative w-full max-w-lg h-64 perspective-1000"
                style={{ perspective: '1000px' }}
              >
                <motion.div
                  className="relative w-full h-full cursor-pointer"
                  onClick={flipCard}
                  animate={{ rotateY: flipped ? 180 : 0 }}
                  transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front of card */}
                  <Card className="absolute inset-0 glassmorphism border-white/30 flex items-center justify-center p-6 backface-hidden">
                    <div className="text-center space-y-4">
                      <div className="text-sm text-cyber-blue font-medium">Question</div>
                      <p className="text-white text-lg leading-relaxed">
                        {flashcards[currentCard]?.front}
                      </p>
                      <div className="text-xs text-white/50">Click to reveal answer</div>
                    </div>
                  </Card>

                  {/* Back of card */}
                  <Card 
                    className="absolute inset-0 glassmorphism border-white/30 flex items-center justify-center p-6 backface-hidden"
                    style={{ transform: 'rotateY(180deg)' }}
                  >
                    <div className="text-center space-y-4">
                      <div className="text-sm text-electric-purple font-medium">Answer</div>
                      <p className="text-white text-lg leading-relaxed">
                        {flashcards[currentCard]?.back}
                      </p>
                      {studyMode && (
                        <div className="flex justify-center space-x-4 mt-4">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAnswer(false);
                            }}
                            variant="destructive"
                            size="sm"
                          >
                            Incorrect
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAnswer(true);
                            }}
                            className="bg-green-500 hover:bg-green-600"
                            size="sm"
                          >
                            Correct
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-center items-center space-x-4">
              <Button
                onClick={prevCard}
                disabled={currentCard === 0}
                variant="outline"
                className="glassmorphism"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <div className="flex space-x-2">
                {flashcards.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => {
                      setCurrentCard(index);
                      setFlipped(false);
                    }}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentCard 
                        ? 'bg-cyber-blue' 
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>

              <Button
                onClick={nextCard}
                disabled={currentCard === flashcards.length - 1}
                variant="outline"
                className="glassmorphism"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-cyber-blue to-electric-purple h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentCard + 1) / flashcards.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Generate New Set Button */}
            <div className="text-center">
              <Button
                onClick={() => {
                  setFlashcards([]);
                  setInputText('');
                  resetStudySession();
                }}
                variant="outline"
                className="glassmorphism"
              >
                Create New Set
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        .backface-hidden {
          backface-visibility: hidden;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </motion.div>
  );
};

export default FlashcardMaker;