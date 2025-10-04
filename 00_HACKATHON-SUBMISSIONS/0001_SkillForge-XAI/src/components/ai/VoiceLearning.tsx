'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Volume2, VolumeX, Play, Square } from 'lucide-react'

interface VoiceLearningProps {
  onTranscript?: (text: string) => void
  onResponse?: (text: string) => void
}

export function VoiceLearning({ onTranscript, onResponse }: VoiceLearningProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    // Initialize Web Speech API
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  const initializeSpeechRecognition = () => {
    if (typeof window === 'undefined') return false
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser')
      return false
    }

    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = 'en-US'

    recognitionRef.current.onresult = (event: any) => {
      const current = event.resultIndex
      const transcript = event.results[current][0].transcript
      setTranscript(transcript)
      
      if (event.results[current].isFinal) {
        handleVoiceInput(transcript)
      }
    }

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access and try again.')
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Please try speaking again.')
      } else {
        setError(`Speech recognition error: ${event.error}`)
      }
      setIsListening(false)
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current.onstart = () => {
      setError('')
      console.log('Speech recognition started')
    }

    return true
  }

  const startListening = async () => {
    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true })
      
      if (!recognitionRef.current) {
        if (!initializeSpeechRecognition()) {
          return
        }
      }

      setError('')
      setTranscript('')
      setIsListening(true)
      recognitionRef.current!.start()
    } catch (err) {
      console.error('Microphone access error:', err)
      setError('Microphone access required. Please allow microphone access in your browser settings.')
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const handleVoiceInput = async (text: string) => {
    if (!text.trim()) return

    setIsProcessing(true)
    onTranscript?.(text)

    try {
      // Send to AI tutor
      const response = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          context: 'voice_learning',
          learningStyle: 'auditory'
        }),
      })

      const data = await response.json()
      
      if (data.response) {
        onResponse?.(data.response)
        speakText(data.response)
      }
    } catch (error) {
      setError('Failed to process voice input')
    } finally {
      setIsProcessing(false)
    }
  }

  const speakText = (text: string) => {
    if (!synthRef.current) {
      setError('Speech synthesis not supported')
      return
    }

    // Cancel any ongoing speech
    synthRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => {
      setIsSpeaking(false)
      setError('Speech synthesis failed')
    }

    synthRef.current.speak(utterance)
  }

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">🎤 Voice Learning</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Speak naturally and get instant AI responses
        </p>
      </div>

      {/* Voice Controls */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </button>

        <button
          onClick={isSpeaking ? stopSpeaking : () => {}}
          disabled={!isSpeaking}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
            isSpeaking
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          {isSpeaking ? 'Stop Speaking' : 'AI Speaking'}
        </button>
      </div>

      {/* Status Display */}
      <div className="space-y-4">
        {isListening && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Listening...</span>
            </div>
            {transcript && (
              <p className="text-gray-700 dark:text-gray-300 italic">
                "{transcript}"
              </p>
            )}
          </div>
        )}

        {isProcessing && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Processing your request...</span>
            </div>
          </div>
        )}

        {isSpeaking && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-green-500 animate-pulse" />
              <span className="text-sm font-medium">AI is speaking...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-2">{error}</p>
            {error.includes('Microphone access') && (
              <div className="text-xs text-red-500 dark:text-red-300">
                <p>To enable voice learning:</p>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Click the microphone icon in your browser's address bar</li>
                  <li>Select "Allow" for microphone access</li>
                  <li>Refresh the page and try again</li>
                </ol>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3">
          Quick voice commands:
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {['Explain this topic', 'Give me an example', 'What is...?', 'How does... work?'].map((command) => (
            <button
              key={command}
              onClick={() => handleVoiceInput(command)}
              disabled={isProcessing || isListening}
              className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors disabled:opacity-50"
            >
              "{command}"
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}