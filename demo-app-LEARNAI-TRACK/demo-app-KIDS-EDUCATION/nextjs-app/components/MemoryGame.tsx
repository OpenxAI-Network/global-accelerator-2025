'use client';

import { useState, useEffect } from 'react';

interface Card {
  id: number;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameProps {
  category: string;
}

export default function MemoryGame({ category }: MemoryGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    generateCards();
  }, [category]);

  const generateCards = async () => {
    setIsLoading(true);
    
    try {
      const prompt = `Create 6 pairs of matching cards for a memory game about ${category} for 5-year-olds. Each pair should have the same content. Format as JSON array with pairs like [{"pair1": "dog", "pair2": "dog"}, {"pair1": "cat", "pair2": "cat"}]. Only respond with the JSON array.`;
      
      const response = await fetch('/api/ollama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.response) {
          try {
            const parsedPairs = JSON.parse(data.response);
            if (Array.isArray(parsedPairs) && parsedPairs.length > 0) {
              const newCards: Card[] = [];
              parsedPairs.forEach((pair: any, index: number) => {
                const content = pair.pair1 || pair.Pair1 || pair.content || `Item ${index + 1}`;
                newCards.push(
                  { id: index * 2, content, isFlipped: false, isMatched: false },
                  { id: index * 2 + 1, content, isFlipped: false, isMatched: false }
                );
              });
              setCards(newCards);
              setIsLoading(false);
              return;
            }
          } catch (parseError) {
            console.log('Failed to parse JSON, using fallback');
          }
        }
      }
      
      // Fallback to default cards
      generateDefaultCards();
    } catch (error) {
      console.error('Error generating cards:', error);
      generateDefaultCards();
    }
  };

  const generateDefaultCards = () => {
    const defaultPairs = [
      '🐕 Dog', '🐱 Cat', '🐰 Rabbit', '🐦 Bird', '🐠 Fish', '🐸 Frog'
    ];
    
    const newCards: Card[] = [];
    defaultPairs.forEach((content, index) => {
      newCards.push(
        { id: index * 2, content, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, content, isFlipped: false, isMatched: false }
      );
    });
    
    setCards(newCards);
    setIsLoading(false);
  };

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2 || cards.find(c => c.id === cardId)?.isMatched) {
      return;
    }

    const newCards = cards.map(card =>
      card.id === cardId ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstId, secondId] = newFlippedCards;
      const firstCard = newCards.find(c => c.id === firstId);
      const secondCard = newCards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.content === secondCard.content) {
        // Match found
        setScore(prev => prev + 10);
        setCards(prev => prev.map(card =>
          card.id === firstId || card.id === secondId
            ? { ...card, isMatched: true }
            : card
        ));
        setFlippedCards([]);
      } else {
        // No match, flip back after delay
        setTimeout(() => {
          setCards(prev => prev.map(card =>
            card.id === firstId || card.id === secondId
              ? { ...card, isFlipped: false }
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    setCards(prev => prev.map(card => ({
      ...card,
      isFlipped: false,
      isMatched: false
    })));
    setFlippedCards([]);
    setScore(0);
    setMoves(0);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-xl">🤖 Generating Memory Game...</p>
        <p className="text-white text-lg">AI is creating fun {category} pairs for you!</p>
      </div>
    );
  }

  const allMatched = cards.every(card => card.isMatched);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Game Stats */}
      <div className="flex justify-between items-center mb-6 text-white">
        <div className="text-center">
          <p className="text-sm text-gray-300">Score</p>
          <p className="text-2xl font-bold text-green-400">{score}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-300">Moves</p>
          <p className="text-2xl font-bold text-blue-400">{moves}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-300">Pairs Found</p>
          <p className="text-2xl font-bold text-purple-400">{score / 10}</p>
        </div>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`
              aspect-square rounded-xl cursor-pointer transform transition-all duration-300 hover:scale-105
              ${card.isMatched 
                ? 'bg-green-500 text-white' 
                : card.isFlipped 
                  ? 'bg-white text-gray-800' 
                  : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
              }
              ${card.isMatched ? 'animate-pulse' : ''}
            `}
          >
            <div className="h-full flex items-center justify-center text-center p-2">
              {card.isFlipped || card.isMatched ? (
                <span className="text-lg font-bold">{card.content}</span>
              ) : (
                <span className="text-2xl">❓</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Game Controls */}
      <div className="text-center space-y-4">
        {allMatched && (
          <div className="bg-green-500 text-white rounded-2xl p-6 mb-6">
            <h3 className="text-3xl font-bold mb-2">🎉 Congratulations! 🎉</h3>
            <p className="text-xl">You found all the pairs!</p>
            <p className="text-lg">Final Score: {score} | Moves: {moves}</p>
          </div>
        )}
        
        <button
          onClick={resetGame}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl font-bold hover:from-purple-500 hover:to-blue-500 transition-all duration-300 transform hover:scale-105"
        >
          🔄 {allMatched ? 'Play Again' : 'Reset Game'}
        </button>
      </div>
    </div>
  );
}
