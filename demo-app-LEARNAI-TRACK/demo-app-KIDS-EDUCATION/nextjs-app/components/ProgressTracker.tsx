'use client';

import { useState, useEffect } from 'react';

interface ProgressData {
  totalGames: number;
  totalScore: number;
  gamesPlayed: {
    flashcards: number;
    memory: number;
    multipleChoice: number;
  };
  categoriesPlayed: string[];
  lastPlayed: string;
}

export default function ProgressTracker() {
  const [progress, setProgress] = useState<ProgressData>({
    totalGames: 0,
    totalScore: 0,
    gamesPlayed: {
      flashcards: 0,
      memory: 0,
      multipleChoice: 0
    },
    categoriesPlayed: [],
    lastPlayed: 'Never'
  });

  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = localStorage.getItem('kids-education-progress');
    if (savedProgress) {
      try {
        setProgress(JSON.parse(savedProgress));
      } catch (error) {
        console.error('Error parsing saved progress:', error);
      }
    }
  }, []);

  const resetProgress = () => {
    const defaultProgress: ProgressData = {
      totalGames: 0,
      totalScore: 0,
      gamesPlayed: {
        flashcards: 0,
        memory: 0,
        multipleChoice: 0
      },
      categoriesPlayed: [],
      lastPlayed: 'Never'
    };
    setProgress(defaultProgress);
    localStorage.setItem('kids-education-progress', JSON.stringify(defaultProgress));
  };

  const getAchievementEmoji = (score: number) => {
    if (score >= 100) return '🏆';
    if (score >= 50) return '🥇';
    if (score >= 25) return '🥈';
    if (score >= 10) return '🥉';
    return '🌟';
  };

  const getProgressPercentage = (current: number, total: number) => {
    if (total === 0) return 0;
    return Math.min((current / total) * 100, 100);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">📊 Your Learning Journey</h2>
        <p className="text-gray-300">Track your progress and celebrate your achievements!</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
          <div className="text-4xl mb-2">🎮</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Total Games</h3>
          <p className="text-3xl font-bold text-blue-600">{progress.totalGames}</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
          <div className="text-4xl mb-2">{getAchievementEmoji(progress.totalScore)}</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Total Score</h3>
          <p className="text-3xl font-bold text-green-600">{progress.totalScore}</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
          <div className="text-4xl mb-2">📅</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Last Played</h3>
          <p className="text-lg font-semibold text-purple-600">{progress.lastPlayed}</p>
        </div>
      </div>

      {/* Game Type Breakdown */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">🎯 Games by Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">🃏</div>
            <h4 className="font-bold text-gray-700 mb-2">Flashcards</h4>
            <p className="text-2xl font-bold text-blue-600">{progress.gamesPlayed.flashcards}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage(progress.gamesPlayed.flashcards, progress.totalGames)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl mb-2">🧠</div>
            <h4 className="font-bold text-gray-700 mb-2">Memory Match</h4>
            <p className="text-2xl font-bold text-green-600">{progress.gamesPlayed.memory}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage(progress.gamesPlayed.memory, progress.totalGames)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl mb-2">❓</div>
            <h4 className="font-bold text-gray-700 mb-2">Multiple Choice</h4>
            <p className="text-2xl font-bold text-purple-600">{progress.gamesPlayed.multipleChoice}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage(progress.gamesPlayed.multipleChoice, progress.totalGames)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Explored */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">🎨 Categories Explored</h3>
        {progress.categoriesPlayed.length > 0 ? (
          <div className="flex flex-wrap gap-2 justify-center">
            {progress.categoriesPlayed.map((category, index) => (
              <span
                key={index}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium"
              >
                {category}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No categories explored yet. Start playing to discover new topics!</p>
        )}
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">🏆 Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border-2 ${progress.totalGames >= 5 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{progress.totalGames >= 5 ? '🥇' : '🥉'}</span>
              <div>
                <h4 className="font-bold text-gray-800">First Steps</h4>
                <p className="text-sm text-gray-600">Play 5 games</p>
              </div>
            </div>
          </div>
          
          <div className={`p-4 rounded-xl border-2 ${progress.totalScore >= 50 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{progress.totalScore >= 50 ? '🏆' : '🥈'}</span>
              <div>
                <h4 className="font-bold text-gray-800">Score Master</h4>
                <p className="text-sm text-gray-600">Earn 50 points</p>
              </div>
            </div>
          </div>
          
          <div className={`p-4 rounded-xl border-2 ${progress.categoriesPlayed.length >= 3 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{progress.categoriesPlayed.length >= 3 ? '🌟' : '⭐'}</span>
              <div>
                <h4 className="font-bold text-gray-800">Explorer</h4>
                <p className="text-sm text-gray-600">Try 3 categories</p>
              </div>
            </div>
          </div>
          
          <div className={`p-4 rounded-xl border-2 ${progress.totalGames >= 10 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{progress.totalGames >= 10 ? '👑' : '👑'}</span>
              <div>
                <h4 className="font-bold text-gray-800">Learning Champion</h4>
                <p className="text-sm text-gray-600">Play 10 games</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="text-center">
        <button
          onClick={resetProgress}
          className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-colors"
        >
          🔄 Reset Progress
        </button>
        <p className="text-sm text-gray-400 mt-2">This will clear all your progress data</p>
      </div>
    </div>
  );
}
