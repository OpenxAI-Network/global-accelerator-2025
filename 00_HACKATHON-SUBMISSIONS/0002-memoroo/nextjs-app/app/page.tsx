'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h1 className="text-6xl font-bold text-white mb-6">📚 Memoroo</h1>
        <p className="text-xl text-white/90 mb-8 leading-relaxed">
          AI-powered learning assistant with flashcards, quizzes, and study buddy features
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-4xl mb-4">🃏</div>
            <h3 className="text-xl font-bold text-white mb-2">Smart Flashcards</h3>
            <p className="text-white/80">Generate flashcards from your notes with AI</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-white mb-2">Quiz Generator</h3>
            <p className="text-white/80">Create interactive quizzes from any text</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-white mb-2">Study Buddy</h3>
            <p className="text-white/80">Get answers to all your study questions</p>
          </div>
        </div>
        
        <div className="space-x-4">
          <Link 
            href="/auth/signup"
            className="inline-block px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-lg transition-colors"
          >
            Get Started
          </Link>
          <Link 
            href="/auth/signin"
            className="inline-block px-8 py-4 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium text-lg transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}