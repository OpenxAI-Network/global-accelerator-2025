'use client';

import { useState, useEffect } from 'react';

interface Flashcard {
  id: number;
  front: string;
  back: string;
  isFlipped: boolean;
}

interface Category {
  name: string;
  prompt: string;
}

interface FlashcardGameProps {
  category: string;
}

export default function FlashcardGame({ category }: FlashcardGameProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  const categories: Category[] = [
    { name: 'animals', prompt: 'Create 5 simple animal flashcards for 5-year-olds. Each card should have an animal name on the front and a fun fact on the back. Format as JSON array with front/back properties.' },
    { name: 'colors', prompt: 'Create 5 simple color flashcards for 5-year-olds. Each card should have a color name on the front and an example object of that color on the back. Format as JSON array with front/back properties.' },
    { name: 'numbers', prompt: 'Create 5 simple number flashcards for 5-year-olds. Each card should have a number (1-10) on the front and the word form on the back. Format as JSON array with front/back properties.' },
    { name: 'shapes', prompt: 'Create 5 simple shape flashcards for 5-year-olds. Each card should have a shape name on the front and a description on the back. Format as JSON array with front/back properties.' }
  ];

  useEffect(() => {
    checkOllamaConnection();
  }, []);

  const checkOllamaConnection = async () => {
    try {
      const response = await fetch('/api/ollama', { method: 'GET' });
      if (response.ok) {
        setOllamaStatus('connected');
        generateFlashcards();
      } else {
        setOllamaStatus('disconnected');
        generateFallbackCards();
      }
    } catch (error) {
      console.error('Error checking Ollama connection:', error);
      setOllamaStatus('disconnected');
      generateFallbackCards();
    }
  };

  const generateFlashcards = async () => {
    const selectedCategory = categories.find(cat => cat.name === category);
    if (!selectedCategory) {
      generateFallbackCards();
      return;
    }

    try {
      const response = await fetch('/api/ollama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: selectedCategory.prompt })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Ollama response:', data);
        
        if (data.response) {
          try {
            // Try to parse the response as JSON
            const parsedCards = JSON.parse(data.response);
            if (Array.isArray(parsedCards) && parsedCards.length > 0) {
              const formattedCards = parsedCards.map((card: any, index: number) => ({
                id: index,
                front: card.front || card.Front || card.question || 'Card',
                back: card.back || card.Back || card.answer || 'Answer',
                isFlipped: false
              }));
              setFlashcards(formattedCards);
              setIsLoading(false);
              return;
            }
          } catch (parseError) {
            console.log('Failed to parse JSON, trying regex extraction');
          }

          // Fallback: try to extract card-like content using regex
          const cardMatch = data.response.match(/\[.*\]/);
          if (cardMatch) {
            const extractedContent = cardMatch[0];
            const cards = extractedContent
              .replace(/[\[\]]/g, '')
              .split(',')
              .map((item: string, index: number) => ({
                id: index,
                front: item.trim().split(':')[0] || `Card ${index + 1}`,
                back: item.trim().split(':')[1] || `Answer ${index + 1}`,
                isFlipped: false
              }));
            setFlashcards(cards);
            setIsLoading(false);
            return;
          }
        }
      }
      
      // If all else fails, use fallback cards
      generateFallbackCards();
    } catch (error) {
      console.error('Error generating flashcards:', error);
      generateFallbackCards();
    }
  };

  const generateFallbackCards = () => {
    const fallbackCards: Flashcard[] = [
      { id: 0, front: '🐕 Dog', back: 'A friendly pet that loves to play!', isFlipped: false },
      { id: 1, front: '🐱 Cat', back: 'A soft pet that likes to sleep!', isFlipped: false },
      { id: 2, front: '🐰 Rabbit', back: 'A fluffy pet that hops around!', isFlipped: false },
      { id: 3, front: '🐦 Bird', back: 'A flying pet that sings songs!', isFlipped: false },
      { id: 4, front: '🐠 Fish', back: 'A swimming pet that lives in water!', isFlipped: false }
    ];
    setFlashcards(fallbackCards);
    setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-xl">🤖 Generating Flashcards...</p>
        <p className="text-white text-lg">AI is creating fun {category} flashcards for you!</p>
      </div>
    );
  }

  if (ollamaStatus === 'disconnected') {
    return (
      <div className="text-center py-8">
        <p className="text-yellow-300 text-lg mb-4">⚠️ Ollama not connected</p>
        <p className="text-white">Using fallback flashcards</p>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white text-lg">No flashcards available</p>
      </div>
    );
  }

  const currentCard = flashcards[currentCardIndex];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <p className="text-white text-lg">
          Card {currentCardIndex + 1} of {flashcards.length}
        </p>
      </div>

      <div className="relative">
        <div 
          className="bg-white rounded-2xl shadow-2xl p-8 min-h-[300px] flex items-center justify-center cursor-pointer transform transition-all duration-500 hover:scale-105"
          onClick={flipCard}
        >
          <div className="text-center">
            <div className={`transition-all duration-500 ${currentCard.isFlipped ? 'rotate-y-180' : ''}`}>
              {currentCard.isFlipped ? (
                <div className="text-gray-800">
                  <p className="text-2xl font-bold mb-4">{currentCard.back}</p>
                  <p className="text-sm text-gray-600">Click to see front</p>
                </div>
              ) : (
                <div className="text-gray-800">
                  <p className="text-3xl font-bold">{currentCard.front}</p>
                  <p className="text-sm text-gray-600 mt-4">Click to flip!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        <button
          onClick={previousCard}
          disabled={currentCardIndex === 0}
          className="bg-blue-500 text-white px-6 py-3 rounded-xl disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
        >
          ← Previous
        </button>
        
        <button
          onClick={flipCard}
          className="bg-purple-500 text-white px-6 py-3 rounded-xl hover:bg-purple-600 transition-colors"
        >
          {currentCard.isFlipped ? 'Show Front' : 'Flip Card'}
        </button>
        
        <button
          onClick={nextCard}
          disabled={currentCardIndex === flashcards.length - 1}
          className="bg-green-500 text-white px-6 py-3 rounded-xl disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-green-600 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
