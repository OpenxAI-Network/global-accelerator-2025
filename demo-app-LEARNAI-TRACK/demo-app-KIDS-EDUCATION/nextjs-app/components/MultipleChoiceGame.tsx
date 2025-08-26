'use client';

import { useState, useEffect } from 'react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface MultipleChoiceGameProps {
  category: string;
}

export default function MultipleChoiceGame({ category }: MultipleChoiceGameProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    generateQuestions();
  }, [category]);

  const generateQuestions = async () => {
    setIsLoading(true);
    
    try {
      const prompt = `Create 5 multiple choice questions about ${category} for 5-year-olds. Each question should have 4 options with one correct answer. Format as JSON array with properties: question, options (array of 4 strings), correctAnswer (string), explanation (string). Only respond with the JSON array.`;
      
      const response = await fetch('/api/ollama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.response) {
          try {
            const parsedQuestions = JSON.parse(data.response);
            if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
              const formattedQuestions: Question[] = parsedQuestions.map((q: any, index: number) => ({
                id: index,
                question: q.question || q.Question || `Question ${index + 1}`,
                options: q.options || q.Options || ['Option A', 'Option B', 'Option C', 'Option D'],
                correctAnswer: q.correctAnswer || q.CorrectAnswer || q.correct_answer || 'Option A',
                explanation: q.explanation || q.Explanation || 'This is the correct answer!'
              }));
              setQuestions(formattedQuestions);
              setIsLoading(false);
              return;
            }
          } catch (parseError) {
            console.log('Failed to parse JSON, using fallback');
          }
        }
      }
      
      // Fallback to default questions
      generateDefaultQuestions();
    } catch (error) {
      console.error('Error generating questions:', error);
      generateDefaultQuestions();
    }
  };

  const generateDefaultQuestions = () => {
    const defaultQuestions: Question[] = [
      {
        id: 0,
        question: 'What sound does a dog make?',
        options: ['Meow', 'Woof', 'Moo', 'Oink'],
        correctAnswer: 'Woof',
        explanation: 'Dogs say "Woof woof!" when they want to play or protect their family!'
      },
      {
        id: 1,
        question: 'What color is the sky on a sunny day?',
        options: ['Green', 'Blue', 'Red', 'Yellow'],
        correctAnswer: 'Blue',
        explanation: 'The sky is blue because of how sunlight travels through the air!'
      },
      {
        id: 2,
        question: 'How many legs does a cat have?',
        options: ['2', '4', '6', '8'],
        correctAnswer: '4',
        explanation: 'Cats have 4 legs - 2 in front and 2 in back!'
      },
      {
        id: 3,
        question: 'What shape is a circle?',
        options: ['Square', 'Triangle', 'Circle', 'Rectangle'],
        correctAnswer: 'Circle',
        explanation: 'A circle is round like a ball or the sun!'
      },
      {
        id: 4,
        question: 'What do fish breathe in?',
        options: ['Air', 'Water', 'Fire', 'Earth'],
        correctAnswer: 'Water',
        explanation: 'Fish breathe oxygen that is dissolved in water!'
      }
    ];
    
    setQuestions(defaultQuestions);
    setIsLoading(false);
  };

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer !== null) return; // Already answered
    
    setSelectedAnswer(answer);
    const currentQuestion = questions[currentQuestionIndex];
    const correct = answer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + 10);
    }
    
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowExplanation(false);
    }
  };

  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setScore(0);
    setShowExplanation(false);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-xl">🤖 Generating Quiz...</p>
        <p className="text-white text-lg">AI is creating fun {category} questions for you!</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white text-lg">No questions available</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const gameCompleted = isLastQuestion && selectedAnswer !== null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress and Score */}
      <div className="flex justify-between items-center mb-6 text-white">
        <div className="text-center">
          <p className="text-sm text-gray-300">Question</p>
          <p className="text-xl font-bold">{currentQuestionIndex + 1} / {questions.length}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-300">Score</p>
          <p className="text-2xl font-bold text-green-400">{score}</p>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
          {currentQuestion.question}
        </h3>
        
        {/* Answer Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              disabled={selectedAnswer !== null}
              className={`
                w-full p-4 rounded-xl text-left font-medium transition-all duration-200
                ${selectedAnswer === null
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  : selectedAnswer === option
                    ? option === currentQuestion.correctAnswer
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    : option === currentQuestion.correctAnswer
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                }
                ${selectedAnswer !== null ? 'cursor-default' : 'cursor-pointer hover:scale-105'}
              `}
            >
              <span className="mr-3 font-bold">
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h4 className="font-bold text-blue-800 mb-2">
            {isCorrect ? '✅ Correct!' : '❌ Not quite right'}
          </h4>
          <p className="text-blue-700">{currentQuestion.explanation}</p>
        </div>
      )}

      {/* Game Controls */}
      <div className="text-center space-y-4">
        {gameCompleted && (
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl p-6 mb-6">
            <h3 className="text-3xl font-bold mb-2">🎉 Quiz Complete! 🎉</h3>
            <p className="text-xl">Final Score: {score} / {questions.length * 10}</p>
            <p className="text-lg">Great job learning about {category}!</p>
          </div>
        )}
        
        <div className="flex justify-center gap-4">
          {!isLastQuestion && selectedAnswer !== null && (
            <button
              onClick={nextQuestion}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl font-bold hover:from-purple-500 hover:to-blue-500 transition-all duration-300 transform hover:scale-105"
            >
              Next Question →
            </button>
          )}
          
          <button
            onClick={resetGame}
            className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-8 py-3 rounded-xl font-bold hover:from-teal-500 hover:to-green-500 transition-all duration-300 transform hover:scale-105"
          >
            🔄 {gameCompleted ? 'Play Again' : 'Reset Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}
