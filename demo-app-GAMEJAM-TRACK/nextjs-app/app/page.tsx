'use client'

import { useState } from 'react'

type GameMode = 'character-chat' | 'guess-ai' | 'puzzle-game'
type Character = 'zara' | 'elric' | 'shadow' | 'luna'

interface ChatMessage {
  id: string
  text: string
  isPlayer: boolean
  character?: Character
}

interface PuzzleLevel {
  id: string
  question: string
  answer: string
  hint: string
}

export default function Home() {
  const [gameMode, setGameMode] = useState<GameMode>('character-chat')
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Guess AI Game State
  const [guessGameState, setGuessGameState] = useState<'waiting' | 'playing' | 'result'>('waiting')
  const [aiSentence, setAiSentence] = useState('')
  const [humanSentence, setHumanSentence] = useState('')
  const [userGuess, setUserGuess] = useState<'ai' | 'human' | null>(null)
  const [score, setScore] = useState(0)
  const [totalGuesses, setTotalGuesses] = useState(0)
  
  // Puzzle Game State
  const [currentPuzzle, setCurrentPuzzle] = useState<PuzzleLevel | null>(null)
  const [puzzleAnswer, setPuzzleAnswer] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [puzzleScore, setPuzzleScore] = useState(0)

  const characters = [
    {
      id: 'zara' as Character,
      name: 'Zara the Warrior',
      description: 'A fierce battle-hardened warrior from the Northern Kingdoms',
      icon: '⚔️',
      color: 'bg-red-600',
      prompt: 'You are Zara, a fierce battle-hardened warrior from the Northern Kingdoms. You speak with courage, strength, and military discipline. You love talking about battles, weapons, honor, and protecting the innocent. Use warrior-like language and references to combat.'
    },
    {
      id: 'elric' as Character,
      name: 'Elric the Wise',
      description: 'An ancient wizard master of arcane arts',
      icon: '🧙‍♂️',
      color: 'bg-purple-600',
      prompt: 'You are Elric, an ancient wizard master of arcane arts. You speak with wisdom, using mystical language and references to magic, spells, ancient knowledge, and the arcane. You often quote ancient texts and speak in a mystical, philosophical manner.'
    },
    {
      id: 'shadow' as Character,
      name: 'Shadow',
      description: 'A cunning thief and master of stealth',
      icon: '🗡️',
      color: 'bg-gray-700',
      prompt: 'You are Shadow, a cunning thief and master of stealth. You speak with wit, cunning, and street-smart attitude. You use thieves\' cant, references to stealth, lockpicking, and the underground. You\'re always looking for angles and opportunities.'
    },
    {
      id: 'luna' as Character,
      name: 'Luna the Healer',
      description: 'A compassionate cleric who tends to the wounded',
      icon: '✨',
      color: 'bg-green-600',
      prompt: 'You are Luna, a compassionate cleric who tends to the wounded. You speak with kindness, empathy, and healing wisdom. You use gentle language, references to healing, faith, compassion, and helping others. You always try to comfort and support.'
    }
  ]

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedCharacter) return

    const playerMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      isPlayer: true,
      character: selectedCharacter
    }

    setChatMessages(prev => [...prev, playerMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/character-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          character: selectedCharacter
        })
      })

      const data = await response.json()
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        isPlayer: false,
        character: selectedCharacter
      }

      setChatMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I seem to be having trouble responding right now...',
        isPlayer: false,
        character: selectedCharacter
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const startGuessGame = async () => {
    setGuessGameState('playing')
    setUserGuess(null)
    
    try {
      const response = await fetch('/api/guess-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await response.json()
      setAiSentence(data.aiSentence)
      setHumanSentence(data.humanSentence)
    } catch (error) {
      console.error('Failed to start guess game:', error)
    }
  }

  const makeGuess = (guess: 'ai' | 'human') => {
    setUserGuess(guess)
    setTotalGuesses(prev => prev + 1)
    
    // For demo purposes, we'll assume the first sentence is AI
    const correct = guess === 'ai'
    if (correct) {
      setScore(prev => prev + 1)
    }
    
    setGuessGameState('result')
  }

  const generatePuzzle = async () => {
    try {
      const response = await fetch('/api/puzzle-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await response.json()
      setCurrentPuzzle(data.puzzle)
      setPuzzleAnswer('')
      setShowHint(false)
    } catch (error) {
      console.error('Failed to generate puzzle:', error)
    }
  }

  const checkPuzzleAnswer = () => {
    if (!currentPuzzle || !puzzleAnswer.trim()) return
    
    const isCorrect = puzzleAnswer.toLowerCase().trim() === currentPuzzle.answer.toLowerCase().trim()
    
    if (isCorrect) {
      setPuzzleScore(prev => prev + 10)
      alert('Correct! Well done! 🎉')
      generatePuzzle()
    } else {
      alert('Try again! 💪')
    }
  }

  const renderCharacterChat = () => (
    <div className="max-w-4xl mx-auto">
      {!selectedCharacter ? (
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">Choose Your Character</h2>
          <p className="text-lg mb-8 text-gray-300">Select an AI character to chat with. Each has their own unique personality!</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {characters.map((char, index) => (
              <div
                key={char.id}
                onClick={() => setSelectedCharacter(char.id)}
                className={`${char.color} p-6 rounded-lg cursor-pointer transform hover:scale-105 transition-all duration-200 hover:shadow-xl fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl mb-4">{char.icon}</div>
                <h3 className="text-xl font-bold mb-2">{char.name}</h3>
                <p className="text-sm opacity-90">{char.description}</p>
              </div>
            ))}
          </div>
          
          <div className="bg-black/20 p-6 rounded-lg backdrop-blur-sm text-left max-w-2xl mx-auto">
            <div className="flex items-center mb-4">
              <span className="text-purple-400 mr-2">🎮</span>
              <h3 className="font-bold">How to Play</h3>
            </div>
            <ul className="space-y-2 text-sm">
              <li>• Choose any character above to start chatting</li>
              <li>• Each character has their own unique personality and speaking style</li>
              <li>• Ask them questions, seek advice, or just have a conversation!</li>
              <li>• The AI will respond as that character would in a game</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-black/20 p-6 rounded-lg backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <span className="text-2xl mr-3">{characters.find(c => c.id === selectedCharacter)?.icon}</span>
              <div>
                <h2 className="text-2xl font-bold">{characters.find(c => c.id === selectedCharacter)?.name}</h2>
                <p className="text-sm opacity-80">{characters.find(c => c.id === selectedCharacter)?.description}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedCharacter(null)
                setChatMessages([])
              }}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
            >
              Change Character
            </button>
          </div>
          
          <div className="h-96 overflow-y-auto mb-4 p-4 bg-black/30 rounded-lg chat-scrollbar">
            {chatMessages.length === 0 ? (
              <p className="text-center text-gray-400 mt-20">Start chatting with your character!</p>
            ) : (
              <div className="space-y-4">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isPlayer ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                        msg.isPlayer
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-white'
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 text-white p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-6 py-3 rounded-lg transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )

  const renderGuessGame = () => (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-center">Guess the AI Game</h2>
      <p className="text-lg mb-8 text-center text-gray-300">Can you tell the difference between AI and human writing?</p>
      
      <div className="bg-black/20 p-6 rounded-lg backdrop-blur-sm">
        <div className="text-center mb-6">
          <div className="text-2xl mb-4">Score: {score}/{totalGuesses}</div>
          {guessGameState === 'waiting' && (
            <button
              onClick={startGuessGame}
              className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Start New Game
            </button>
          )}
        </div>
        
        {guessGameState === 'playing' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-600/20 p-4 rounded-lg border border-blue-500/30">
                <h3 className="font-bold mb-2">Sentence A:</h3>
                <p className="text-lg">{aiSentence}</p>
              </div>
              <div className="bg-green-600/20 p-4 rounded-lg border border-green-500/30">
                <h3 className="font-bold mb-2">Sentence B:</h3>
                <p className="text-lg">{humanSentence}</p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-lg mb-4">Which sentence was written by AI?</p>
              <div className="space-x-4">
                <button
                  onClick={() => makeGuess('ai')}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Sentence A
                </button>
                <button
                  onClick={() => makeGuess('human')}
                  className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Sentence B
                </button>
              </div>
            </div>
          </div>
        )}
        
        {guessGameState === 'result' && (
          <div className="text-center">
            <div className="text-2xl mb-4">
              {userGuess === 'ai' ? 'You guessed AI!' : 'You guessed Human!'}
            </div>
            <div className="text-lg mb-6">
              {userGuess === 'ai' ? 'Correct! Sentence A was written by AI.' : 'Incorrect! Sentence A was written by AI.'}
            </div>
            <button
              onClick={startGuessGame}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Next Round
            </button>
          </div>
        )}
      </div>
    </div>
  )

  const renderPuzzleGame = () => (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-center">AI Puzzle Generator</h2>
      <p className="text-lg mb-8 text-center text-gray-300">Every puzzle is uniquely generated by AI!</p>
      
      <div className="bg-black/20 p-6 rounded-lg backdrop-blur-sm">
        <div className="text-center mb-6">
          <div className="text-2xl mb-4">Score: {puzzleScore}</div>
          {!currentPuzzle && (
            <button
              onClick={generatePuzzle}
              className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Generate New Puzzle
            </button>
          )}
        </div>
        
        {currentPuzzle && (
          <div className="space-y-6">
            <div className="bg-purple-600/20 p-6 rounded-lg border border-purple-500/30">
              <h3 className="font-bold text-xl mb-4">Puzzle:</h3>
              <p className="text-lg">{currentPuzzle.question}</p>
            </div>
            
            {showHint && (
              <div className="bg-yellow-600/20 p-4 rounded-lg border border-yellow-500/30">
                <h4 className="font-bold mb-2">💡 Hint:</h4>
                <p>{currentPuzzle.hint}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <input
                type="text"
                value={puzzleAnswer}
                onChange={(e) => setPuzzleAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && checkPuzzleAnswer()}
                placeholder="Enter your answer..."
                className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
              />
              
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={checkPuzzleAnswer}
                  className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Submit Answer
                </button>
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
                <button
                  onClick={generatePuzzle}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  New Puzzle
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <span className="text-4xl mr-3">🎮</span>
            <h1 className="text-5xl font-bold text-white">GAMEJAM</h1>
          </div>
          <p className="text-xl text-gray-300">AI for Games - Interactive Gaming Experience</p>
        </div>

        {/* Game Mode Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-black/20 p-2 rounded-lg backdrop-blur-sm">
            <div className="flex space-x-2">
              <button
                onClick={() => setGameMode('character-chat')}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  gameMode === 'character-chat'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Character Chat
              </button>
              <button
                onClick={() => setGameMode('guess-ai')}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  gameMode === 'guess-ai'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Guess the AI
              </button>
              <button
                onClick={() => setGameMode('puzzle-game')}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  gameMode === 'puzzle-game'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Puzzle Generator
              </button>
            </div>
          </div>
        </div>

        {/* Game Content */}
        {gameMode === 'character-chat' && renderCharacterChat()}
        {gameMode === 'guess-ai' && renderGuessGame()}
        {gameMode === 'puzzle-game' && renderPuzzleGame()}
      </div>
    </main>
  )
} 