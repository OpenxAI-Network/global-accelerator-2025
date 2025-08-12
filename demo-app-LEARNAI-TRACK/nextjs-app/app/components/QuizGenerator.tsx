// src/components/features/QuizGenerator.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Quiz } from '@/types/learn';

export default function QuizGenerator({ onComplete }: { onComplete: (quiz: Quiz) => void }) {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: topic }),
      });
      const data = await res.json();
      const quizData = data.data || data.quiz || data;
      setQuiz(quizData);
      onComplete(quizData);
    } catch (err) {
      console.error('Quiz generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 backdrop-blur-md">
      <h2 className="text-xl font-bold text-cyan-300">AI Quiz Generator</h2>
      <input
        type="text"
        placeholder="Enter topic (e.g. Web3 Security)"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="px-4 py-2 bg-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-400 outline-none"
      />
      <motion.button
        whileTap={{ scale: 0.95 }}
        disabled={loading}
        onClick={handleGenerate}
        className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium"
      >
        {loading ? 'Generating...' : 'Generate Quiz'}
      </motion.button>

      {quiz && (
        <div className="mt-4 space-y-4">
          {quiz.question.map((q) => (
            <div key={q.id} className="p-3 rounded-lg bg-white/5">
              <p className="font-medium text-white">{q.question}</p>
              <ul className="mt-2 space-y-1 text-sm text-gray-300">
                {q.options.map((opt, idx) => (
                  <li key={idx}>• {opt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
