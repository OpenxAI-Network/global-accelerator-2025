'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';

type Section = 'learning-games' | 'ai-buddy' | 'progress';
type GameType = 'flashcards' | 'memory-match' | 'multiple-choice';
type Step = 'select-section' | 'select-game' | 'select-category' | 'play-game';

interface Flashcard {
  id: number;
  front: string;
  back: string;
  isFlipped: boolean;
}

export default function Home() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  
  const [currentSection, setCurrentSection] = useState<Section>('learning-games');
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('select-section');
  
  // Flashcard game state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // AI Study Buddy state
  const [aiMessage, setAiMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Memory Match game state
  const [memoryCards, setMemoryCards] = useState<{ id: number; content: string; isFlipped: boolean; isMatched: boolean; isHighlighted: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<{ id: number; content: string; isFlipped: boolean; isMatched: boolean; isHighlighted: boolean }[]>([]);
  const [memoryScore, setMemoryScore] = useState(0);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [isMemoryGenerating, setIsMemoryGenerating] = useState(false);

  // Multiple Choice game state
  const [quizQuestions, setQuizQuestions] = useState<{ id: number; question: string; options: string[]; correctAnswer: string; isAnswered: boolean }[]>([]);
  const [currentQuizQuestionIndex, setCurrentQuizQuestionIndex] = useState(0);
  const [isQuizGenerating, setIsQuizGenerating] = useState(false);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [showOptionResult, setShowOptionResult] = useState(false);
  const [quizSessionCorrect, setQuizSessionCorrect] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Progress tracking (stored in localStorage)
  type ProgressStats = {
    totalGamesCompleted: number;
    flashcardsViewed: number;
    memoryMatch: { games: number; bestScore: number; lastScore: number };
    quiz: { games: number; bestScore: number; lastScore: number };
  };
  const defaultProgress: ProgressStats = {
    totalGamesCompleted: 0,
    flashcardsViewed: 0,
    memoryMatch: { games: 0, bestScore: 0, lastScore: 0 },
    quiz: { games: 0, bestScore: 0, lastScore: 0 }
  };
  const [progress, setProgress] = useState<ProgressStats>(defaultProgress);
  const loadProgress = () => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('kla-progress') : null;
      if (raw) setProgress({ ...defaultProgress, ...JSON.parse(raw) });
    } catch {}
  };
  const saveProgress = (next: ProgressStats) => {
    setProgress(next);
    try { if (typeof window !== 'undefined') localStorage.setItem('kla-progress', JSON.stringify(next)); } catch {}
  };
  useEffect(() => { loadProgress(); }, []);

  // Initialize MiniKit when app is ready
  useEffect(() => {
    if (!isFrameReady) setFrameReady();
  }, [isFrameReady, setFrameReady]);

  const generateFlashcards = useCallback(async () => {
    console.log('generateFlashcards called with category:', selectedCategory);
    if (!selectedCategory) {
      console.log('No category selected, returning');
      return;
    }
    
    try {
      setIsGenerating(true);
      setFlashcards([]); // Clear existing cards
      
      // Generate 5 flashcards for the selected category
      const newCards = [];
      for (let i = 0; i < 5; i++) {
        const prompt = `Create ONE flashcard about ${selectedCategory} for 5-year-olds.
        Respond ONLY in this format: Front: [emoji] [word] | Back: [explanation]
        Example: Front: 🐕 Dog | Back: A friendly pet that loves to play!
        Just ONE card, no extra text.`;
        
        const response = await fetch('/api/ollama', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        
        if (response.ok) {
          const data = await response.json();
          const responseText = data.response;
          
          // Parse the response to extract front and back
          console.log('AI Response:', responseText);
          const parts = responseText.split('|');
          if (parts.length >= 2) {
            const front = parts[0].replace('Front:', '').trim();
            const back = parts[1].replace('Back:', '').trim();
            console.log('Parsed card:', { front, back });
            newCards.push({
              id: i,
              front,
              back,
              isFlipped: false
            });
          } else {
            // Try to extract from the response text
            const lines = responseText.split('\n');
            let foundFront = '';
            let foundBack = '';
            
            for (const line of lines) {
              if (line.includes('Front:') && !foundFront) {
                foundFront = line.replace('Front:', '').trim();
              }
              if (line.includes('Back:') && !foundBack) {
                foundBack = line.replace('Back:', '').trim();
              }
            }
            
            if (foundFront && foundBack) {
              console.log('Extracted from lines:', { front: foundFront, back: foundBack });
              newCards.push({
                id: i,
                front: foundFront,
                back: foundBack,
                isFlipped: false
              });
            } else {
              // Final fallback if parsing fails
              console.log('Using fallback card');
              newCards.push({
                id: i,
                front: `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} ${i + 1}`,
                back: data.response || 'Fun learning!',
                isFlipped: false
              });
            }
          }
        } else {
          // Use fallback cards on error
          const fallbackCards = {
            animals: [
              { id: 0, front: '🐕 Dog', back: 'A friendly pet that loves to play!', isFlipped: false },
              { id: 1, front: '🐱 Cat', back: 'A soft pet that likes to sleep!', isFlipped: false },
              { id: 2, front: '🐰 Rabbit', back: 'A fluffy pet that hops around!', isFlipped: false },
              { id: 3, front: '🐸 Frog', back: 'A green pet that hops and croaks!', isFlipped: false },
              { id: 4, front: '🦁 Lion', back: 'A big cat with a golden mane!', isFlipped: false }
            ],
            colors: [
              { id: 0, front: '🔴 Red', back: 'Like a fire truck or an apple!', isFlipped: false },
              { id: 1, front: '🔵 Blue', back: 'Like the sky or the ocean!', isFlipped: false },
              { id: 2, front: '🟡 Yellow', back: 'Like the sun or a banana!', isFlipped: false },
              { id: 3, front: '🟢 Green', back: 'Like grass or a tree!', isFlipped: false },
              { id: 4, front: '🟣 Purple', back: 'Like grapes or a flower!', isFlipped: false }
            ],
            numbers: [
              { id: 0, front: '1️⃣ One', back: 'The first number we learn!', isFlipped: false },
              { id: 1, front: '2️⃣ Two', back: 'Like the two eyes or two ears!', isFlipped: false },
              { id: 2, front: '3️⃣ Three', back: 'Like three little pigs!', isFlipped: false },
              { id: 3, front: '4️⃣ Four', back: 'Like four legs on a chair!', isFlipped: false },
              { id: 4, front: '5️⃣ Five', back: 'Like five fingers on your hand!', isFlipped: false }
            ],
            shapes: [
              { id: 0, front: '⭕ Circle', back: 'A round shape like a ball!', isFlipped: false },
              { id: 1, front: '⬜ Square', back: 'Four equal sides, like a box!', isFlipped: false },
              { id: 2, front: '🔺 Triangle', back: 'Three sides, like a mountain!', isFlipped: false },
              { id: 3, front: '⭐ Star', back: 'A shape with five points!', isFlipped: false },
              { id: 4, front: '💎 Diamond', back: 'A shape with many sides!', isFlipped: false }
            ]
          };
          
          const cards = fallbackCards[selectedCategory as keyof typeof fallbackCards] || fallbackCards.animals;
          newCards.push(cards[i]);
        }
      }
      
      console.log('Generated cards:', newCards);
      setFlashcards(newCards);
      setCurrentCardIndex(0);
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      // Use fallback cards on error
      const fallbackCards = {
        animals: [
          { id: 0, front: '🐕 Dog', back: 'A friendly pet that loves to play!', isFlipped: false },
          { id: 1, front: '🐱 Cat', back: 'A soft pet that likes to sleep!', isFlipped: false },
          { id: 2, front: '🐰 Rabbit', back: 'A fluffy pet that hops around!', isFlipped: false },
          { id: 3, front: '🐸 Frog', back: 'A green pet that hops and croaks!', isFlipped: false },
          { id: 4, front: '🦁 Lion', back: 'A big cat with a golden mane!', isFlipped: false }
        ],
        colors: [
          { id: 0, front: '🔴 Red', back: 'Like a fire truck or an apple!', isFlipped: false },
          { id: 1, front: '🔵 Blue', back: 'Like the sky or the ocean!', isFlipped: false },
          { id: 2, front: '🟡 Yellow', back: 'Like the sun or a banana!', isFlipped: false },
          { id: 3, front: '🟢 Green', back: 'Like grass or a tree!', isFlipped: false },
          { id: 4, front: '🟣 Purple', back: 'Like grapes or a flower!', isFlipped: false }
        ],
        numbers: [
          { id: 0, front: '1️⃣ One', back: 'The first number we learn!', isFlipped: false },
          { id: 1, front: '2️⃣ Two', back: 'Like the two eyes or two ears!', isFlipped: false },
          { id: 2, front: '3️⃣ Three', back: 'Like three little pigs!', isFlipped: false },
          { id: 3, front: '4️⃣ Four', back: 'Like four legs on a chair!', isFlipped: false },
          { id: 4, front: '5️⃣ Five', back: 'Like five fingers on your hand!', isFlipped: false }
        ],
        shapes: [
          { id: 0, front: '⭕ Circle', back: 'A round shape like a ball!', isFlipped: false },
          { id: 1, front: '⬜ Square', back: 'Four equal sides, like a box!', isFlipped: false },
          { id: 2, front: '🔺 Triangle', back: 'Three sides, like a mountain!', isFlipped: false },
          { id: 3, front: '⭐ Star', back: 'A shape with five points!', isFlipped: false },
          { id: 4, front: '💎 Diamond', back: 'A shape with many sides!', isFlipped: false }
        ]
      };
      
      const cards = fallbackCards[selectedCategory as keyof typeof fallbackCards] || fallbackCards.animals;
      setFlashcards(cards);
      setCurrentCardIndex(0);
      setIsGenerating(false);
    }
  }, [selectedCategory]);

  const askAIStudyBuddy = async () => {
    if (!aiMessage.trim()) return;
    
    try {
      setIsAiThinking(true);
      setAiResponse('');
      
      const response = await fetch('/api/ollama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `You are a friendly, encouraging teacher for 5-year-old children. A child asks: "${aiMessage}". 
          Please give a helpful, age-appropriate response that encourages learning and curiosity. 
          Keep it simple, fun, and under 100 words. Use emojis when appropriate!` 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAiResponse(data.response);
      } else {
        setAiResponse('I\'m here to help you learn! 🌟 Let\'s try asking something else!');
      }
    } catch (error) {
      console.error('AI Study Buddy error:', error);
      setAiResponse('I\'m your friendly learning buddy! 🤖 Let\'s learn together!');
    } finally {
      setIsAiThinking(false);
    }
  };

  // Generate games when category is selected
  useEffect(() => {
    if (selectedCategory && selectedGame === 'flashcards') {
      generateFlashcards();
    } else if (selectedCategory && selectedGame === 'memory-match') {
      // Only generate if we don't already have memory cards
      if (memoryCards.length === 0) {
        generateMemoryCards();
      }
    } else if (selectedCategory && selectedGame === 'multiple-choice') {
      generateQuizQuestions();
    }
  }, [selectedCategory, selectedGame]);

  // Helpers
  const resetMemoryGameState = () => {
    setMemoryCards([]);
    setFlippedCards([]);
    setMatchedPairs([]);
    setMemoryScore(0);
    setMemoryMoves(0);
  };

  const generateMemoryCards = async () => {
    if (!selectedCategory) return;
    
    setIsMemoryGenerating(true);
    
    try {
      // If category is colors, use curated list to avoid AI variance
      if (selectedCategory === 'colors') {
        const COLOR_ITEMS = ['🔴 Red','🔵 Blue','🟡 Yellow','🟢 Green','🟣 Purple','🟠 Orange'];
        const picked: string[] = [];
        const pool = [...COLOR_ITEMS];
        while (picked.length < 4 && pool.length > 0) {
          const idx = Math.floor(Math.random() * pool.length);
          picked.push(pool.splice(idx,1)[0]);
        }
        const newCards: { id:number; content:string; isFlipped:boolean; isMatched:boolean; isHighlighted:boolean }[] = [];
        for (let i = 0; i < picked.length; i++) {
          newCards.push(
            { id: i*2, content: picked[i], isFlipped: false, isMatched: false, isHighlighted: false },
            { id: i*2+1, content: picked[i], isFlipped: false, isMatched: false, isHighlighted: false }
          );
        }
        const shuffled = newCards.sort(() => Math.random() - 0.5);
        setMemoryCards(shuffled);
        setFlippedCards([]);
        setMatchedPairs([]);
        setMemoryScore(0);
        setMemoryMoves(0);
        return;
      }

      // Simple approach: ask AI for 4 unique animals from a curated list
      const prompt = `Pick exactly 4 different animals from this list. Each animal can only be used once.

      Choose from these animals only:
      🦊 Fox, 🐒 Monkey, 🐝 Bee, 🦁 Lion, 🐱 Cat, 🐕 Dog, 🐰 Rabbit, 🐸 Frog, 🐼 Panda, 🐨 Koala, 🦒 Giraffe, 🐘 Elephant, 🐺 Wolf, 🦝 Raccoon, 🦡 Badger, 🦃 Turkey, 🦆 Duck, 🦅 Eagle, 🦉 Owl, 🦋 Butterfly, 🐛 Caterpillar, 🦗 Cricket, 🕷️ Spider, 🦔 Hedgehog, 🦨 Skunk, 🦙 Llama, 🦘 Kangaroo, 🦥 Sloth, 🦦 Otter, 🦧 Gorilla, 🦎 Lizard, 🐍 Snake, 🐢 Turtle, 🐊 Crocodile, 🦈 Shark, 🐋 Whale, 🐳 Dolphin, 🐟 Fish, 🐠 Tropical Fish, 🐡 Blowfish, 🦐 Shrimp, 🦑 Squid, 🦞 Lobster, 🦀 Crab, 🦂 Scorpion, 🦟 Mosquito, 🦠 Microbe

      IMPORTANT: Pick 4 DIFFERENT animals from the list above. Do NOT copy the first 4 animals (Fox, Monkey, Bee, Lion) - choose different ones!

      Format: Just list 4 animals with emojis, one per line:
      [emoji] [animal name]
      [emoji] [animal name]
      [emoji] [animal name]
      [emoji] [animal name]

      No extra text, no descriptions, just 4 animals with emojis.`;
      
      const response = await fetch('/api/ollama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      if (response.ok) {
        const data = await response.json();
        const responseText = data.response.trim();
        
        console.log('AI Response:', responseText);
        
        // Parse the response - extract emoji and name from each line
        const lines = responseText.split('\n').filter((line: string) => line.trim());
        const animals = [];
        const usedNames = new Set<string>();
        
        for (const line of lines.slice(0, 4)) {
          const trimmed = line.trim();
          const [emojiToken, ...nameParts] = trimmed.split(' ');
          const cleanName = nameParts.join(' ').replace(/[^\w\s]/g, '').trim();
          if (emojiToken && cleanName && cleanName.length < 20 && !usedNames.has(cleanName.toLowerCase())) {
            animals.push(`${emojiToken} ${cleanName}`);
            usedNames.add(cleanName.toLowerCase());
          }
        }
        
        // If we don't have 4 animals, use fallbacks
        if (animals.length < 4) {
          const fallbacks = ['🦊 Fox', '🐒 Monkey', '🐝 Bee', '🦁 Lion'];
          for (const fallback of fallbacks) {
            if (animals.length >= 4) break;
            const fallbackName = fallback.split(' ')[1].toLowerCase();
            if (!usedNames.has(fallbackName)) {
              animals.push(fallback);
              usedNames.add(fallbackName);
            }
          }
        }
        
        console.log('Final animals:', animals);
        
        // Only proceed if we have exactly 4 animals
        if (animals.length === 4) {
          // Create pairs of cards
          const newCards = [];
          for (let i = 0; i < 4; i++) {
            const animal = animals[i];
            newCards.push(
              { id: i * 2, content: animal, isFlipped: false, isMatched: false, isHighlighted: false },
              { id: i * 2 + 1, content: animal, isFlipped: false, isMatched: false, isHighlighted: false }
            );
          }
          
          // Shuffle the cards
          const shuffledCards = newCards.sort(() => Math.random() - 0.5);
          
          console.log('=== CARD GENERATION DEBUG ===');
          console.log('Generated memory cards:', shuffledCards);
          console.log('Card pairs:', shuffledCards.reduce((pairs, card, index) => {
            if (index % 2 === 0) {
              pairs.push([card, shuffledCards[index + 1]]);
            }
            return pairs;
          }, [] as any[]));
          
          console.log('All content:', shuffledCards.map(card => card.content));
          console.log('Card generation complete - ready to play!');
          console.log('================================');
          
          setMemoryCards(shuffledCards);
          setFlippedCards([]);
          setMatchedPairs([]);
          setMemoryScore(0);
          setMemoryMoves(0);
        } else {
          throw new Error(`Failed to generate 4 unique animals. Got ${animals.length} instead.`);
        }
        
      } else {
        throw new Error('Failed to get AI response');
      }
      
    } catch (error) {
      console.error('Error generating memory cards:', error);
      // Use fallback cards on error
      const fallbackCards = [
        { id: 0, content: '🦊 Fox', isFlipped: false, isMatched: false, isHighlighted: false },
        { id: 1, content: '🦊 Fox', isFlipped: false, isMatched: false, isHighlighted: false },
        { id: 2, content: '🐒 Monkey', isFlipped: false, isMatched: false, isHighlighted: false },
        { id: 3, content: '🐒 Monkey', isFlipped: false, isMatched: false, isHighlighted: false },
        { id: 4, content: '🐝 Bee', isFlipped: false, isMatched: false, isHighlighted: false },
        { id: 5, content: '🐝 Bee', isFlipped: false, isMatched: false, isHighlighted: false },
        { id: 6, content: '🦁 Lion', isFlipped: false, isMatched: false, isHighlighted: false },
        { id: 7, content: '🦁 Lion', isFlipped: false, isMatched: false, isHighlighted: false }
      ];
      setMemoryCards(fallbackCards);
    } finally {
      setIsMemoryGenerating(false);
    }
  };

  const generateQuizQuestions = async () => {
    if (!selectedCategory) return;

    setIsQuizGenerating(true);

    try {
      // Simple approach: ask AI for 5 multiple choice questions
      const prompt = `Create 5 multiple choice questions about ${selectedCategory} for 5-year-olds.
      Each question should have 4 options, only one correct.
      Format:
      Question: [question text]
      Option A: [option A]
      Option B: [option B]
      Option C: [option C]
      Option D: [option D]
      Correct Answer: [correct answer (A, B, C, or D)]
      No extra text, just the questions and answers.`;

      const response = await fetch('/api/ollama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (response.ok) {
        const data = await response.json();
        const responseText = data.response.trim();

        console.log('AI Response:', responseText);

        // Parse the response - extract question, options, and correct answer
        const questions = [];
        const lines = responseText.split('\n').filter((line: string) => line.trim());
        let currentQuestion: { id: number; question: string; options: string[]; correctAnswer: string; isAnswered: boolean } | null = null;

        for (const line of lines) {
          if (line.startsWith('Question:')) {
            if (currentQuestion) {
              questions.push(currentQuestion);
            }
            currentQuestion = { id: questions.length, question: line.replace('Question:', '').trim(), options: [], correctAnswer: '', isAnswered: false };
          } else if (line.startsWith('Option A:')) {
            currentQuestion!.options.push(line.replace('Option A:', '').trim());
          } else if (line.startsWith('Option B:')) {
            currentQuestion!.options.push(line.replace('Option B:', '').trim());
          } else if (line.startsWith('Option C:')) {
            currentQuestion!.options.push(line.replace('Option C:', '').trim());
          } else if (line.startsWith('Option D:')) {
            currentQuestion!.options.push(line.replace('Option D:', '').trim());
          } else if (line.startsWith('Correct Answer:')) {
            currentQuestion!.correctAnswer = line.replace('Correct Answer:', '').trim();
          }
        }
        if (currentQuestion) {
          questions.push(currentQuestion);
        }

        console.log('Generated quiz questions:', questions);
        setQuizQuestions(questions);
        setCurrentQuizQuestionIndex(0);
      } else {
        throw new Error('Failed to get AI response for quiz questions');
      }
    } catch (error) {
      console.error('Error generating quiz questions:', error);
      // Fallback to static questions
      const fallbackQuestions = [
        { id: 0, question: 'What is a cat?', options: ['A friendly pet', 'A type of fruit', 'A type of bird', 'A type of vegetable'], correctAnswer: 'A friendly pet', isAnswered: false },
        { id: 1, question: 'What is a dog?', options: ['A type of fruit', 'A type of bird', 'A type of vegetable', 'A friendly pet'], correctAnswer: 'A friendly pet', isAnswered: false },
        { id: 2, question: 'What is a rabbit?', options: ['A type of fruit', 'A type of bird', 'A type of vegetable', 'A fluffy pet'], correctAnswer: 'A fluffy pet', isAnswered: false },
        { id: 3, question: 'What is a bee?', options: ['A type of fruit', 'A type of bird', 'A type of vegetable', 'A small insect'], correctAnswer: 'A small insect', isAnswered: false },
        { id: 4, question: 'What is a lion?', options: ['A type of fruit', 'A type of bird', 'A type of vegetable', 'A large cat'], correctAnswer: 'A large cat', isAnswered: false },
      ];
      setQuizQuestions(fallbackQuestions);
    } finally {
      setIsQuizGenerating(false);
    }
  };

  const flipCard = () => {
    setFlashcards(prev => 
      prev.map((card, index) => 
        index === currentCardIndex 
          ? { ...card, isFlipped: !card.isFlipped }
          : card
      )
    );
  };

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      // Reset flip state for new card
      setFlashcards(prev => 
        prev.map((card, index) => 
          index === currentCardIndex + 1 
            ? { ...card, isFlipped: false }
            : card
        )
      );
      // progress: viewed another card
      saveProgress({
        ...progress,
        flashcardsViewed: progress.flashcardsViewed + 1
      });
    }
  };

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      // Reset flip state for new card
      setFlashcards(prev => 
        prev.map((card, index) => 
          index === currentCardIndex - 1 
            ? { ...card, isFlipped: false }
            : card
        )
      );
    }
  };

  const handleSectionSelect = (section: Section) => {
    setCurrentSection(section);
    if (section === 'learning-games') {
      setCurrentStep('select-game');
    }
  };

  const handleGameSelect = (game: GameType) => {
    setSelectedGame(game);
    setCurrentStep('select-category');
    if (game === 'memory-match') {
      resetMemoryGameState();
    }
    if (game === 'multiple-choice') {
      setQuizQuestions([]);
      setCurrentQuizQuestionIndex(0);
      setSelectedOptionIndex(null);
      setShowOptionResult(false);
      setQuizSessionCorrect(0);
      setQuizFinished(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    console.log('Category selected:', category);
    setSelectedCategory(category);
    setCurrentStep('play-game');
    // Directly trigger flashcard generation for flashcards game
    if (selectedGame === 'flashcards') {
      console.log('Directly calling generateFlashcards for category:', category);
      setTimeout(() => generateFlashcards(), 100); // Small delay to ensure state is set
    }
    if (selectedGame === 'memory-match') {
      resetMemoryGameState();
    }
    if (selectedGame === 'multiple-choice') {
      setQuizQuestions([]);
      setCurrentQuizQuestionIndex(0);
      setSelectedOptionIndex(null);
      setShowOptionResult(false);
      setQuizSessionCorrect(0);
      setQuizFinished(false);
    }
  };

  const handleBackToGames = () => {
    setCurrentStep('select-game');
    setSelectedGame(null);
    setSelectedCategory(null);
  };

  const handleBackToCategories = () => {
    setCurrentStep('select-category');
    setSelectedCategory(null);
  };

  const handleBackToSections = () => {
    setCurrentStep('select-section');
    setCurrentSection('learning-games');
    setSelectedGame(null);
    setSelectedCategory(null);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'select-section':
        return (
          <div className="space-y-8 pt-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center text-white mb-6 animate-bounce drop-shadow-lg">
              🌟 Kids Learning Adventure 🌟
            </h1>
            <div className="text-center mb-10">
              <div className="text-8xl sm:text-9xl md:text-[10rem] lg:text-[12rem] animate-bounce" style={{ animationDelay: '0.2s' }}>
                🐕
              </div>
              <p className="text-white text-lg sm:text-xl font-semibold mt-4 animate-pulse">
                Welcome to your learning adventure! 🎉
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 max-w-lg mx-auto">
              <button
                onClick={() => handleSectionSelect('learning-games')}
                className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white text-2xl font-bold py-6 px-10 rounded-3xl shadow-2xl hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-110 hover:rotate-1 border-4 border-yellow-300 animate-pulse"
              >
                🎮 Learning Games
              </button>
              <button
                onClick={() => handleSectionSelect('ai-buddy')}
                className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-white text-2xl font-bold py-6 px-10 rounded-3xl shadow-2xl hover:from-blue-500 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-110 hover:-rotate-1 border-4 border-blue-300 animate-pulse"
                style={{ animationDelay: '0.2s' }}
              >
                🤖 AI Study Buddy
              </button>
              <button
                onClick={() => handleSectionSelect('progress')}
                className="bg-gradient-to-r from-green-400 via-teal-500 to-cyan-500 text-white text-2xl font-bold py-6 px-10 rounded-3xl shadow-2xl hover:from-green-500 hover:via-teal-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-110 hover:rotate-1 border-4 border-green-300 animate-pulse"
                style={{ animationDelay: '0.4s' }}
              >
                📊 Scoreboard
              </button>
            </div>
          </div>
        );

      case 'select-game':
        return (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-center text-white mb-8 animate-bounce drop-shadow-lg">
              Choose Your Game! 🎯
            </h2>
            <div className="grid grid-cols-1 gap-8 max-w-2xl mx-auto">
              <button
                onClick={() => handleGameSelect('flashcards')}
                className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 text-white text-3xl font-bold py-8 px-10 rounded-3xl shadow-2xl hover:from-yellow-400 hover:via-orange-500 hover:to-red-500 transition-all duration-300 transform hover:scale-110 hover:rotate-1 border-4 border-yellow-200 animate-pulse"
              >
                🃏 Flashcards
              </button>
              <button
                onClick={() => handleGameSelect('memory-match')}
                className="bg-gradient-to-r from-pink-300 via-rose-400 to-red-400 text-white text-3xl font-bold py-8 px-10 rounded-3xl shadow-2xl hover:from-pink-400 hover:via-rose-500 hover:to-red-500 transition-all duration-300 transform hover:scale-110 hover:-rotate-1 border-4 border-pink-200 animate-pulse"
                style={{ animationDelay: '0.2s' }}
              >
                🧠 Memory Match
              </button>
              <button
                onClick={() => handleGameSelect('multiple-choice')}
                className="bg-gradient-to-r from-indigo-300 via-purple-400 to-violet-400 text-white text-3xl font-bold py-8 px-10 rounded-3xl shadow-2xl hover:from-indigo-400 hover:via-purple-500 hover:to-violet-500 transition-all duration-300 transform hover:scale-110 hover:rotate-1 border-4 border-indigo-200 animate-pulse"
                style={{ animationDelay: '0.4s' }}
              >
                ❓ Multiple Choice
              </button>
            </div>
            <div className="text-center">
              <button
                onClick={handleBackToSections}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-4 rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 border-2 border-gray-400 font-semibold text-lg"
              >
                ← Back to Kids Learning Adventure
              </button>
            </div>
          </div>
        );

      case 'select-category':
        return (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-center text-white mb-8 animate-bounce drop-shadow-lg">
              Pick a Category! 🎨
            </h2>
            <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
              <button
                onClick={() => handleCategorySelect('animals')}
                className="bg-gradient-to-r from-green-300 via-emerald-400 to-teal-400 text-white text-2xl font-bold py-6 px-8 rounded-3xl shadow-2xl hover:from-green-400 hover:via-emerald-500 hover:to-teal-500 transition-all duration-300 transform hover:scale-110 hover:rotate-1 border-4 border-green-200 animate-pulse"
              >
                🐕 Animals
              </button>
              <button
                onClick={() => handleCategorySelect('colors')}
                className="bg-gradient-to-r from-red-300 via-pink-400 to-rose-400 text-white text-2xl font-bold py-6 px-8 rounded-3xl shadow-2xl hover:from-red-400 hover:via-pink-500 hover:to-rose-500 transition-all duration-300 transform hover:scale-110 hover:-rotate-1 border-4 border-red-200 animate-pulse"
                style={{ animationDelay: '0.1s' }}
              >
                🌈 Colors
              </button>
              <button
                onClick={() => handleCategorySelect('numbers')}
                className="bg-gradient-to-r from-blue-300 via-cyan-400 to-sky-400 text-white text-2xl font-bold py-6 px-8 rounded-3xl shadow-2xl hover:from-blue-400 hover:via-cyan-500 hover:to-sky-500 transition-all duration-300 transform hover:scale-110 hover:rotate-1 border-4 border-blue-200 animate-pulse"
                style={{ animationDelay: '0.2s' }}
              >
                🔢 Numbers
              </button>
              <button
                onClick={() => handleCategorySelect('shapes')}
                className="bg-gradient-to-r from-purple-300 via-violet-400 to-indigo-400 text-white text-2xl font-bold py-6 px-8 rounded-3xl shadow-2xl hover:from-purple-400 hover:via-violet-500 hover:to-indigo-500 transition-all duration-300 transform hover:scale-110 hover:-rotate-1 border-4 border-purple-200 animate-pulse"
                style={{ animationDelay: '0.3s' }}
              >
                ⭐ Shapes
              </button>
            </div>
            <div className="text-center">
              <button
                onClick={handleBackToGames}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-4 rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 border-2 border-gray-400 font-semibold text-lg"
              >
                ← Back to Games
              </button>
            </div>
          </div>
        );

      case 'play-game':
        return renderGameContent();

      default:
        return null;
    }
  };

  const renderGameContent = () => {
    if (!selectedGame || !selectedCategory) return null;

    switch (selectedGame) {
      case 'flashcards':
        if (isGenerating || flashcards.length === 0) {
          return (
            <div className="text-center py-16">
              <div className="text-8xl mb-6 animate-bounce">🤖</div>
              <h3 className="text-3xl font-bold text-white mb-4">AI is creating your flashcards!</h3>
              <div className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-8 py-4 rounded-2xl inline-block shadow-lg">
                <p className="text-xl font-bold animate-pulse">
                  {isGenerating ? 'Generating with Ollama AI (llama3.2:3b)...' : 'Loading flashcards...'}
                </p>
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center gap-2 bg-white/80 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold border border-blue-200">
                  <span className="text-base">🤖</span> Powered by Ollama
                </span>
              </div>
              <div className="mt-6 text-white text-lg">
                <p>🎯 Creating fun learning cards about {selectedCategory}</p>
              </div>
            </div>
          );
        }
        
        const currentCard = flashcards[currentCardIndex];
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                🃏 {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Flashcards
              </h2>
              <button
                onClick={handleBackToCategories}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 border-2 border-gray-400 font-semibold"
              >
                ← Back
              </button>
            </div>
            
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-2xl inline-block shadow-lg">
                <p className="text-xl font-bold">
                  Card {currentCardIndex + 1} of {flashcards.length}
                </p>
              </div>
              <div className="mt-4 text-sm text-white opacity-80">
              </div>
            </div>

            <div className="max-w-3xl mx-auto">
              <div 
                className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl shadow-2xl p-10 min-h-[350px] flex items-center justify-center cursor-pointer transform transition-all duration-500 hover:scale-105 border-4 border-yellow-200 hover:border-yellow-300"
                onClick={flipCard}
              >
                <div className="text-center">
                   {currentCard.isFlipped ? (
                     <div>
                       <div className="text-8xl font-bold mb-6 text-purple-600">{currentCard.front.split(' ').slice(1).join(' ')}</div>
                       <p className="text-lg text-gray-600 bg-yellow-100 px-4 py-2 rounded-xl">Click to see answer</p>
                     </div>
                   ) : (
                     <div>
                       <div className="text-8xl font-bold mb-4">{currentCard.front.split(' ')[0]}</div>
                       <p className="text-xs text-gray-700 mb-4 max-w-md mx-auto leading-tight">{currentCard.back}</p>
                       <p className="text-lg text-gray-600 bg-blue-100 px-4 py-2 rounded-xl">Click to see answer!</p>
                     </div>
                   )}
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <button
                onClick={generateFlashcards}
                disabled={isGenerating}
                className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-8 py-4 rounded-2xl hover:from-blue-500 hover:to-purple-600 transition-all duration-300 transform hover:scale-110 border-2 border-blue-300 font-bold text-lg shadow-lg disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
              >
                {isGenerating ? '🔄 Generating...' : '🔄 Generate New Cards'}
              </button>
            </div>

            <div className="flex justify-between items-center mt-10 max-w-3xl mx-auto">
              <button
                onClick={previousCard}
                disabled={currentCardIndex === 0}
                className="bg-gradient-to-r from-blue-400 to-blue-500 text-white px-8 py-4 rounded-2xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed hover:from-blue-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-110 border-2 border-blue-300 font-bold text-lg shadow-lg"
              >
                ← Previous
              </button>
              
              <button
                onClick={flipCard}
                className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white px-10 py-4 rounded-2xl hover:from-purple-500 hover:via-pink-600 hover:to-red-600 transition-all duration-300 transform hover:scale-110 border-2 border-purple-300 font-bold text-lg shadow-lg animate-pulse"
              >
                {currentCard.isFlipped ? 'Show Front' : 'Flip Card'}
              </button>
              
              <button
                onClick={nextCard}
                disabled={currentCardIndex === flashcards.length - 1}
                className="bg-gradient-to-r from-green-400 to-green-500 text-white px-8 py-4 rounded-2xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed hover:from-green-500 hover:to-green-600 transition-all duration-300 transform hover:scale-110 border-2 border-green-300 font-bold text-lg shadow-lg"
              >
                Next →
              </button>
            </div>
          </div>
        );

      case 'memory-match':
        if (isMemoryGenerating || memoryCards.length === 0) {
          return (
            <div className="text-center py-16">
              <div className="text-8xl mb-6 animate-bounce">🤖</div>
              <h3 className="text-3xl font-bold text-white mb-4">AI is creating your memory cards!</h3>
              <div className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-8 py-4 rounded-2xl inline-block shadow-lg">
                <p className="text-xl font-bold animate-pulse">
                  {isMemoryGenerating ? 'Generating with Ollama AI...' : 'Loading memory cards...'}
                </p>
              </div>
              <div className="mt-6 text-white text-lg">
                <p>🎯 Creating fun memory cards about {selectedCategory}</p>
              </div>
            </div>
          );
        }

        const currentMemoryCard = memoryCards[currentCardIndex];
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                🧠 {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Memory Match
              </h2>
              <button
                onClick={handleBackToCategories}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 border-2 border-gray-400 font-semibold"
              >
                ← Back
              </button>
            </div>
            <div className="bg-gradient-to-br from-white via-pink-50 to-rose-50 rounded-3xl p-10 text-center shadow-2xl border-4 border-pink-200">
              <div className="text-8xl mb-6 animate-bounce">🧠</div>
              <h3 className="text-4xl font-bold text-gray-800 mb-4 text-pink-600">Memory Match!</h3>
              <p className="text-xl text-gray-600 bg-gradient-to-r from-pink-100 to-rose-100 px-6 py-3 rounded-2xl inline-block">
                Find the matching pairs! 🎯
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-4xl mx-auto">
                {memoryCards.map((card) => (
                  <div
                    key={card.id}
                    className={`bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-2xl md:rounded-3xl shadow-lg md:shadow-2xl p-4 md:p-8 text-center cursor-pointer transform transition-all duration-300 hover:scale-105 border-2 md:border-4 min-h-[120px] md:min-h-[160px] flex flex-col items-center justify-center ${
                      card.isMatched
                        ? 'bg-green-100 border-green-400 shadow-green-200'
                        : card.isHighlighted
                        ? 'border-red-400 shadow-red-200 animate-pulse'
                        : 'border-blue-200 hover:border-blue-300'
                    }`}
                    onClick={() => handleMemoryCardClick(card.id)}
                  >
                    {card.isFlipped || card.isMatched ? (
                      <>
                        <div className="text-4xl md:text-6xl mb-2 md:mb-4">{card.content.split(' ')[0]}</div>
                        <p className="text-sm md:text-lg font-bold text-gray-800">{card.content.split(' ').slice(1).join(' ')}</p>
                      </>
                    ) : (
                      <>
                        <div className="text-4xl md:text-6xl mb-2 md:mb-4">❓</div>
                        <p className="text-sm md:text-lg font-bold text-gray-600">Click to flip!</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            <div className="text-center mt-8">
              <p className="text-white text-lg">Score: {memoryScore} | Moves: {memoryMoves}</p>
              <button
                onClick={generateMemoryCards}
                disabled={isMemoryGenerating}
                className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-110 border-2 border-yellow-300 font-bold text-lg shadow-lg disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
              >
                {isMemoryGenerating ? '🔄 Generating...' : '🔄 Generate New Cards'}
              </button>
            </div>
          </div>
        );

      case 'multiple-choice':
        if (isQuizGenerating || quizQuestions.length === 0) {
          return (
            <div className="text-center py-16">
              <div className="text-8xl mb-6 animate-bounce">🤖</div>
              <h3 className="text-3xl font-bold text-white mb-4">AI is creating your quiz questions!</h3>
              <div className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-8 py-4 rounded-2xl inline-block shadow-lg">
                <p className="text-xl font-bold animate-pulse">
                  {isQuizGenerating ? 'Generating with Ollama AI...' : 'Loading quiz questions...'}
                </p>
              </div>
              <div className="mt-6 text-white text-lg">
                <p>🎯 Creating fun quiz questions about {selectedCategory}</p>
              </div>
            </div>
          );
        }

        if (quizFinished) {
          const total = quizQuestions.length || 5;
          return (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white drop-shadow-lg">✅ Quiz Finished!</h2>
                <button onClick={handleBackToCategories} className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 border-2 border-gray-400 font-semibold">← Back</button>
              </div>
              <div className="bg-gradient-to-br from-white via-indigo-50 to-violet-50 rounded-3xl p-10 text-center shadow-2xl border-4 border-indigo-200">
                <div className="text-8xl mb-6">🎉</div>
                <h3 className="text-4xl font-bold text-gray-800 mb-2 text-indigo-600">Finished!</h3>
                <p className="text-xl text-gray-700">You got <span className="font-bold text-indigo-700">{quizSessionCorrect}</span> of <span className="font-bold">{total}</span> correct.</p>
                <div className="mt-8 flex gap-4 justify-center">
                  <button onClick={() => { setQuizFinished(false); setQuizSessionCorrect(0); setCurrentQuizQuestionIndex(0); setSelectedOptionIndex(null); }} className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-6 py-3 rounded-2xl border-2 border-blue-300 font-bold hover:from-blue-500 hover:to-purple-600 transition-all">Review</button>
                  <button onClick={() => { setQuizFinished(false); setQuizSessionCorrect(0); setSelectedOptionIndex(null); setCurrentQuizQuestionIndex(0); generateQuizQuestions(); }} className="bg-gradient-to-r from-green-400 to-teal-500 text-white px-6 py-3 rounded-2xl border-2 border-green-300 font-bold hover:from-green-500 hover:to-teal-600 transition-all">Play Again</button>
                </div>
              </div>
            </div>
          );
        }

        const currentQuizQuestion = quizQuestions[currentQuizQuestionIndex];
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                ❓ {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Quiz
              </h2>
              <button
                onClick={handleBackToCategories}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 border-2 border-gray-400 font-semibold"
              >
                ← Back
              </button>
            </div>
            <div className="bg-gradient-to-br from-white via-indigo-50 to-violet-50 rounded-3xl p-10 text-center shadow-2xl border-4 border-indigo-200">
              <div className="text-8xl mb-6 animate-bounce">❓</div>
              <h3 className="text-4xl font-bold text-gray-800 mb-4 text-indigo-600">Quiz Time!</h3>
              <p className="text-xl text-gray-600 bg-gradient-to-r from-indigo-100 to-violet-100 px-6 py-3 rounded-2xl inline-block">
                Question {currentQuizQuestionIndex + 1} of {quizQuestions.length}
              </p>
              <div className="mt-6 text-lg text-gray-700">
                <p>{currentQuizQuestion.question}</p>
                <div className="grid grid-cols-1 gap-4 mt-6">
                  {currentQuizQuestion.options.map((option, i) => {
                    const isSelected = selectedOptionIndex === i;
                    const ring = isSelected ? 'ring-4 ring-green-300 scale-[1.02]' : 'ring-2 ring-indigo-200';
                    const gradient = isSelected
                      ? 'from-green-400 via-teal-500 to-cyan-500'
                      : 'from-indigo-300 via-purple-400 to-violet-400';
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedOptionIndex(i)}
                        className={`flex items-center justify-between text-left w-full px-6 py-5 rounded-2xl text-white font-bold shadow-lg transform transition-all duration-300 hover:scale-[1.01] border-2 border-white/30 bg-gradient-to-r ${gradient} ${ring}`}
                      >
                        <span className="text-lg sm:text-xl pr-4">{option}</span>
                        <span className={`flex items-center justify-center w-10 h-10 rounded-full bg-white/90 transition-all duration-300 ${isSelected ? 'scale-110' : ''}`}>
                          <span className={`text-2xl ${isSelected ? 'text-green-500' : 'text-gray-400'}`}>{isSelected ? '✔' : ''}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mt-6 text-center">
                <button
                  onClick={submitQuizAnswer}
                  disabled={selectedOptionIndex === null}
                  className={`px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-110 font-bold text-lg shadow-lg border-2 ${selectedOptionIndex === null ? 'bg-gray-400 border-gray-300 text-white cursor-not-allowed' : 'bg-gradient-to-r from-green-400 to-teal-500 text-white border-green-300'}`}
                >
                  Submit Answer
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderSectionContent = () => {
    switch (currentSection) {
      case 'ai-buddy':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-bold text-white drop-shadow-lg">🤖 AI Study Buddy</h2>
              <button
                onClick={handleBackToSections}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-4 rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 border-2 border-gray-400 font-semibold text-lg"
              >
                ← Back to Kids Learning Adventure
              </button>
            </div>
            <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl p-10 shadow-2xl border-4 border-blue-200">
              <div className="text-center mb-8">
                <div className="text-8xl mb-6 animate-bounce">🤖</div>
                <h3 className="text-4xl font-bold text-gray-800 mb-4 text-blue-600">AI Study Buddy</h3>
                <p className="text-xl text-gray-600 mb-6">Ask me anything! I'm here to help you learn! 🌟</p>
              </div>
              
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    placeholder="Ask me anything about learning! 🎓"
                    className="flex-1 px-4 py-3 rounded-2xl border-2 border-blue-200 focus:border-blue-400 focus:outline-none text-lg"
                    onKeyPress={(e) => e.key === 'Enter' && askAIStudyBuddy()}
                  />
                  <button
                    onClick={askAIStudyBuddy}
                    disabled={isAiThinking || !aiMessage.trim()}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 border-2 border-blue-300 font-bold disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
                  >
                    {isAiThinking ? '🤔 Thinking...' : 'Ask! 🚀'}
                  </button>
                </div>
                
                {isAiThinking && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4 animate-bounce">🤔</div>
                    <p className="text-lg text-gray-600">Thinking of the best answer for you...</p>
                  </div>
                )}
                
                {aiResponse && !isAiThinking && (
                  <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-6 border-2 border-green-200">
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">🤖</div>
                      <h4 className="text-xl font-bold text-gray-800">AI Study Buddy says:</h4>
                    </div>
                    <p className="text-lg text-gray-700 text-center leading-relaxed">{aiResponse}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'progress':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-bold text-white drop-shadow-lg">📊 Scoreboard</h2>
              <button
                onClick={handleBackToSections}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-4 rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 border-2 border-gray-400 font-semibold text-lg"
              >
                ← Back to Kids Learning Adventure
              </button>
            </div>
            <div className="bg-gradient-to-br from-white via-green-50 to-teal-50 rounded-3xl p-10 shadow-2xl border-4 border-green-200">
              <div className="text-center mb-8">
                <div className="text-8xl mb-6 animate-bounce">📊</div>
                <h3 className="text-4xl font-bold text-gray-800 mb-4 text-green-600">Scoreboard</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                  <div className="bg-white/70 rounded-2xl p-4 border-2 border-green-200 shadow">
                    <p className="text-lg font-bold text-gray-700">Total games completed</p>
                    <p className="text-3xl text-green-600 mt-1">{progress.totalGamesCompleted}</p>
                  </div>
                  <div className="bg-white/70 rounded-2xl p-4 border-2 border-blue-200 shadow">
                    <p className="text-lg font-bold text-gray-700">Flashcards viewed</p>
                    <p className="text-3xl text-blue-600 mt-1">{progress.flashcardsViewed}</p>
                  </div>
                  <div className="bg-white/70 rounded-2xl p-4 border-2 border-pink-200 shadow">
                    <p className="text-lg font-bold text-gray-700">Memory Match</p>
                    <p className="text-sm text-gray-600">Games: {progress.memoryMatch.games}</p>
                    <p className="text-sm text-gray-600">Best Score: {progress.memoryMatch.bestScore}</p>
                    <p className="text-sm text-gray-600">Last Score: {progress.memoryMatch.lastScore}</p>
                  </div>
                  <div className="bg-white/70 rounded-2xl p-4 border-2 border-indigo-200 shadow">
                    <p className="text-lg font-bold text-gray-700">Quiz</p>
                    <p className="text-sm text-gray-600">Games: {progress.quiz.games}</p>
                    <p className="text-sm text-gray-600">Best Score: {progress.quiz.bestScore}</p>
                    <p className="text-sm text-gray-600">Last Score: {progress.quiz.lastScore}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleMemoryCardClick = (id: number) => {
    const card = memoryCards.find(c => c.id === id);
    if (!card || card.isMatched || card.isFlipped) return;
    if (flippedCards.length === 2) return;

    // flip this card
    setMemoryCards(prev => prev.map(c => (c.id === id ? { ...c, isFlipped: true } : c)));
    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMemoryMoves(prev => prev + 1);
      const [firstId, secondId] = newFlipped;
      const first = memoryCards.find(c => c.id === firstId);
      const second = memoryCards.find(c => c.id === secondId);
      if (first && second && first.content === second.content) {
        setMemoryScore(prev => prev + 10);
        setMemoryCards(prev => prev.map(c => (c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c)));
        setTimeout(() => setFlippedCards([]), 600);
        // if all matched, record completion
        setTimeout(() => {
          const allMatched = (current => current.every(c => c.isMatched || c.id === firstId || c.id === secondId))(memoryCards);
          if (allMatched) {
            const lastScore = memoryScore + 10;
            const bestScore = Math.max(progress.memoryMatch.bestScore, lastScore);
            saveProgress({
              ...progress,
              totalGamesCompleted: progress.totalGamesCompleted + 1,
              memoryMatch: { games: progress.memoryMatch.games + 1, bestScore, lastScore },
            });
          }
        }, 650);
      } else {
        setTimeout(() => {
          setMemoryCards(prev => prev.map(c => (c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c)));
          setFlippedCards([]);
        }, 900);
      }
    }
  };

  const submitQuizAnswer = () => {
    const current = quizQuestions[currentQuizQuestionIndex];
    if (selectedOptionIndex === null) return;
    const picked = current.options[selectedOptionIndex];
    const isCorrect = picked === current.correctAnswer || ['A','B','C','D'].includes(current.correctAnswer) &&
      selectedOptionIndex === {A:0,B:1,C:2,D:3}[current.correctAnswer as 'A'|'B'|'C'|'D'];
    setShowOptionResult(true);
    setTimeout(() => {
      // advance
      const nextIndex = currentQuizQuestionIndex + 1;
      const updatedCorrect = quizSessionCorrect + (isCorrect ? 1 : 0);
      if (nextIndex < quizQuestions.length) {
        setQuizSessionCorrect(updatedCorrect);
        setCurrentQuizQuestionIndex(nextIndex);
        setSelectedOptionIndex(null);
        setShowOptionResult(false);
      } else {
        // quiz completed: update progress
        const lastScore = updatedCorrect;
        const bestScore = Math.max(progress.quiz.bestScore, lastScore);
        saveProgress({
          ...progress,
          totalGamesCompleted: progress.totalGamesCompleted + 1,
          quiz: { games: progress.quiz.games + 1, bestScore, lastScore }
        });
        // show finished summary
        setQuizSessionCorrect(lastScore);
        setQuizFinished(true);
        setSelectedOptionIndex(null);
        setShowOptionResult(false);
      }
    }, 900);
  };

  // AI Study Buddy floating chat state
  const [showAIBuddy, setShowAIBuddy] = useState(false);
  const [aiBuddyMessage, setAiBuddyMessage] = useState('');
  const [aiBuddyThinking, setAiBuddyThinking] = useState(false);
  const [aiBuddyInput, setAiBuddyInput] = useState('');
  const aiBuddyInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (showAIBuddy) {
      requestAnimationFrame(() => aiBuddyInputRef.current?.focus());
    }
  }, [showAIBuddy]);

  const getGameContext = () => {
    if (!selectedGame || !selectedCategory) return '';
    switch (selectedGame) {
      case 'flashcards': 
        if (flashcards.length > 0 && currentCardIndex < flashcards.length) {
          const currentCard = flashcards[currentCardIndex];
          const animalName = currentCard.front.split(' ').slice(1).join(' ');
          const emoji = currentCard.front.split(' ')[0];
          return `flashcard game about ${selectedCategory} - currently showing ${emoji} ${animalName}`;
        }
        return `flashcard game about ${selectedCategory}`;
      case 'memory-match': return `memory matching game about ${selectedCategory}`;
      case 'multiple-choice': return `quiz about ${selectedCategory}`;
      default: return `learning game about ${selectedCategory}`;
    }
  };

  const askAIBuddyForHelp = async (userQuestion?: string) => {
    const context = getGameContext();
    let specificContext = context;

    // Add specific flashcard information if available
    let currentCardEmoji = '';
    let currentCardAnswer = '';
    let currentCardClue = '';
    if (selectedGame === 'flashcards' && flashcards.length > 0 && currentCardIndex < flashcards.length) {
      const currentCard = flashcards[currentCardIndex];
      currentCardAnswer = currentCard.front.split(' ').slice(1).join(' ');
      currentCardEmoji = currentCard.front.split(' ')[0];
      currentCardClue = currentCard.back;
      specificContext = `${context}. The current flashcard shows ${currentCardEmoji}. The clue is: "${currentCardClue}".`;
    }

    const question = userQuestion || `I need help with this ${context}. Can you give me a tip?`;

    // Decide whether the user explicitly asked for the answer
    const q = (userQuestion || '').toLowerCase();
    const wantsAnswer = /\b(answer|what is it|what's this|tell me|reveal|show.*answer|what animal|which animal)\b/.test(q);

    const prompt = `You are a friendly AI Study Buddy helping a 5-year-old with a ${specificContext}.
    The child is asking: "${question}"

    IMPORTANT:
    - Base your response on the actual flashcard content provided above.
    - If it's a rabbit, don't talk about fish or water animals.
    - ${wantsAnswer ? `They asked for the answer. Clearly state the answer as "${currentCardEmoji} ${currentCardAnswer}" in one short sentence, then add one tiny encouraging note.` : `Do NOT reveal the exact answer. Give a small clue or guiding question based on the clue text above, encouraging them to think. Keep it neutral and avoid naming the animal. Offer at most one simple hint.`}

    Style:
    - Supportive and fun (start with a friendly emoji)
    - Easy for a 5-year-old to understand
    - 1-2 short sentences only`;
    
    setAiBuddyThinking(true);
    setAiBuddyMessage('🤖 Thinking of a tip for you...');
    try {
      const response = await fetch('/api/ollama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      if (response.ok) {
        const data = await response.json();
        setAiBuddyMessage(data.response?.trim() || '🌟 Keep going! You can do it!');
        setAiBuddyInput('');
      } else {
        setAiBuddyMessage('🌟 Keep trying! You\'re doing great! I\'m here to help you learn!');
      }
    } catch (error) {
      setAiBuddyMessage('🌟 Keep trying! You\'re doing great! I\'m here to help you learn!');
    } finally {
      setAiBuddyThinking(false);
    }
  };

  const FloatingAIBuddy = () => (
    <>
      {showAIBuddy && (
        <div className="fixed bottom-24 right-6 z-50 bg-white rounded-2xl shadow-2xl border-2 border-blue-200 p-4 max-w-sm w-[320px]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-blue-600">🤖 AI Study Buddy</h4>
            <button 
              onClick={() => setShowAIBuddy(false)}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>
          <div className="mb-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={aiBuddyInput}
                onChange={(e) => { setAiBuddyInput(e.target.value); requestAnimationFrame(() => aiBuddyInputRef.current?.focus()); }}
                placeholder="Ask me anything about this game! 🎮"
                className="flex-1 px-3 py-2 rounded-lg border-2 border-blue-200 focus:border-blue-400 focus:outline-none text-sm"
                ref={aiBuddyInputRef}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && aiBuddyInput.trim()) {
                    e.preventDefault();
                    await askAIBuddyForHelp(aiBuddyInput);
                  }
                }}
              />
              <button
                onClick={async () => { if (aiBuddyInput.trim()) { await askAIBuddyForHelp(aiBuddyInput); } }}
                disabled={!aiBuddyInput.trim() || aiBuddyThinking}
                className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm"
              >
                Ask
              </button>
            </div>
          </div>
          {aiBuddyMessage ? (
            <div className="text-gray-700 text-sm mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              {aiBuddyMessage}
            </div>
          ) : (
            <div className="text-gray-500 text-sm mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              Need help? Ask me anything about this game! 🤖
            </div>
          )}
          <button
            onClick={() => askAIBuddyForHelp()}
            disabled={aiBuddyThinking}
            className="w-full bg-gradient-to-r from-blue-400 to-purple-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-blue-500 hover:to-purple-600 transition-all disabled:opacity-50"
          >
            {aiBuddyThinking ? '🤔 Thinking...' : '💡 Get a Tip!'}
          </button>
        </div>
      )}
      <button
        onClick={() => setShowAIBuddy(!showAIBuddy)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-400 to-purple-500 text-white w-16 h-16 rounded-full shadow-2xl hover:from-blue-500 hover:to-purple-600 transition-all duration-300 transform hover:scale-110 border-4 border-white"
      >
        <div className="text-2xl animate-bounce">🤖</div>
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 via-blue-500 to-green-400 p-4 relative overflow-hidden">
      {/* Animated Background Bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="bubble bubble-1"></div>
        <div className="bubble bubble-2"></div>
        <div className="bubble bubble-3"></div>
        <div className="bubble bubble-4"></div>
        <div className="bubble bubble-5"></div>
        <div className="bubble bubble-6"></div>
        <div className="bubble bubble-7"></div>
        <div className="bubble bubble-8"></div>
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {currentStep === 'play-game' ? (
          renderGameContent()
        ) : currentSection !== 'learning-games' ? (
          renderSectionContent()
        ) : (
          renderStepContent()
        )}
      </div>
      
      <footer className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white text-center py-4 text-sm shadow-lg mt-16">
        <div>
          <p className="font-bold">🌟 Kids Learning Adventure 🌟</p>
          <p className="text-xs opacity-90 italic">Another App Inspired by Arthur's Ideas</p>
          <p>
            <a 
              href="https://hackathon.openxai.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-yellow-300 hover:text-yellow-200 underline font-semibold"
            >
              Hack Node Demo App
            </a>
          </p>
        </div>
      </footer>
      <FloatingAIBuddy />
    </div>
  );
}
