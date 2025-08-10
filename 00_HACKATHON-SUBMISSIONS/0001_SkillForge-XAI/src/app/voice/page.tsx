"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mic, Volume2, Brain, Zap, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import AIChat from '@/components/ai/AIChat';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function VoicePage() {
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check if speech recognition and synthesis are supported
    const speechRecognitionSupported = 
      'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    const speechSynthesisSupported = 'speechSynthesis' in window;
    
    setIsSupported(speechRecognitionSupported && speechSynthesisSupported);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="text-center mb-8">
            <div className="flex justify-end mb-4">
              <ThemeToggle />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
              🎤 Voice Learning Studio
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg md:text-xl max-w-3xl mx-auto">
              Experience the future of AI-powered education through natural voice interaction. 
              Speak your questions, hear intelligent responses, and learn hands-free.
            </p>
          </div>
        </div>

        {/* Browser Support Check */}
        {!isSupported && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <div className="text-yellow-400 mr-3">⚠️</div>
              <div>
                <h3 className="text-yellow-800 font-medium">Limited Browser Support</h3>
                <p className="text-yellow-700 text-sm mt-1">
                  For the best voice experience, please use Chrome, Edge, or Safari. 
                  Some features may not work in your current browser.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Features Showcase */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-lg border hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="text-blue-600" size={32} />
              </div>
              <h3 className="font-bold text-gray-800 mb-3 text-xl">Speech Recognition</h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced speech-to-text powered by Web Speech API. 
                Simply click the microphone and speak naturally - your voice becomes text instantly.
              </p>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg border hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Volume2 className="text-green-600" size={32} />
              </div>
              <h3 className="font-bold text-gray-800 mb-3 text-xl">Text-to-Speech</h3>
              <p className="text-gray-600 leading-relaxed">
                Natural-sounding AI voice responses using advanced text-to-speech synthesis. 
                Every AI response is automatically spoken aloud for hands-free learning.
              </p>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg border hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="text-purple-600" size={32} />
              </div>
              <h3 className="font-bold text-gray-800 mb-3 text-xl">AI Intelligence</h3>
              <p className="text-gray-600 leading-relaxed">
                Powered by advanced AI models for intelligent tutoring, personalized responses, 
                and adaptive learning experiences tailored to your voice interactions.
              </p>
            </div>
          </div>
        </div>

        {/* Voice Learning Interface */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
            {/* Interface Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageCircle size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">AI Voice Assistant</h2>
                    <p className="text-blue-100">Speak naturally or type your questions</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Ready</span>
                </div>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="p-6">
              <AIChat 
                className="h-[600px] border-0 shadow-none"
                userId="voice-user"
              />
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            🎯 How to Use Voice Learning
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 text-lg flex items-center">
                <Zap className="mr-2 text-blue-500" size={20} />
                Voice Input
              </h4>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-3 mt-0.5">1</span>
                  <span>Click the microphone button in the chat interface</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-3 mt-0.5">2</span>
                  <span>Speak your question clearly and naturally</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-3 mt-0.5">3</span>
                  <span>Your speech is automatically converted to text</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-3 mt-0.5">4</span>
                  <span>The AI processes and responds intelligently</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 text-lg flex items-center">
                <Volume2 className="mr-2 text-green-500" size={20} />
                Voice Output
              </h4>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm mr-3 mt-0.5">1</span>
                  <span>AI responses are automatically read aloud</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm mr-3 mt-0.5">2</span>
                  <span>Click the speaker icon to replay any message</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm mr-3 mt-0.5">3</span>
                  <span>Control playback with the volume controls</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm mr-3 mt-0.5">4</span>
                  <span>Enjoy hands-free learning experience</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sample Questions */}
        <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg border">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            💡 Try These Voice Commands
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "Explain machine learning in simple terms",
              "What are the best practices for React development?",
              "How do I improve my coding skills?",
              "Tell me about data structures and algorithms",
              "What's the difference between AI and ML?",
              "Help me understand JavaScript closures",
              "Explain the concept of recursion",
              "What are design patterns in programming?",
              "How does blockchain technology work?"
            ].map((question, index) => (
              <div 
                key={index}
                className="p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => {
                  // This would trigger the voice input with the sample question
                  console.log('Sample question:', question);
                }}
              >
                <p className="text-gray-700 text-sm">"{question}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Info */}
        <div className="mt-12 text-center text-gray-600">
          <p className="text-sm">
            Voice Learning uses Web Speech API for speech recognition and synthesis. 
            For optimal performance, use Chrome, Edge, or Safari browsers.
          </p>
        </div>
      </div>
    </div>
  );
}