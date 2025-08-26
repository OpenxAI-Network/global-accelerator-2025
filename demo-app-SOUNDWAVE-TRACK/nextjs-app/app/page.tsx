'use client'

import { useState } from 'react'
import VoiceRecorder from '@/components/voice-recorder'

interface Note {
  id: string
  title: string
  content: string
  timestamp: string
  duration: string
  category: 'meeting' | 'class' | 'personal' | 'other'
  summary?: string
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const addNote = (note: Note) => {
    setNotes((prev: Note[]) => [note, ...prev])
  }

  const deleteNote = (id: string) => {
    setNotes((prev: Note[]) => prev.filter((note: Note) => note.id !== id))
    if (selectedNote?.id === id) {
      setSelectedNote(null)
    }
  }

  const generateSummary = async (noteId: string) => {
    const note = notes.find((n: Note) => n.id === noteId)
    if (!note) return

    setIsProcessing(true)
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: note.content })
      })

      const data = await response.json()
      
      setNotes((prev: Note[]) => prev.map((n: Note) => 
        n.id === noteId 
          ? { ...n, summary: data.summary }
          : n
      ))
    } catch (error) {
      console.error('Failed to generate summary:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center text-white mb-12">
          <div className="flex items-center justify-center mb-4">
            <span className="text-4xl mr-3">🎤</span>
            <h1 className="text-5xl font-bold">Voice to Notes</h1>
          </div>
          <p className="text-xl opacity-90">Transform your voice into organized, intelligent notes</p>
          <p className="text-lg opacity-80 mt-2">Perfect for classes, meetings, and personal notes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Voice Recorder Section */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 h-fit">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">🎙️</span>
                Voice Recorder
              </h2>
              <VoiceRecorder onNoteCreated={addNote} />
            </div>

            {/* Quick Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mt-6">
              <h3 className="text-lg font-bold text-white mb-4">📊 Quick Stats</h3>
              <div className="space-y-3 text-white">
                <div className="flex justify-between">
                  <span>Total Notes:</span>
                  <span className="font-bold">{notes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Duration:</span>
                  <span className="font-bold">
                    {notes.reduce((acc, note) => acc + parseInt(note.duration), 0)} min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Categories:</span>
                  <span className="font-bold">
                    {new Set(notes.map(n => n.category)).size}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes List */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 h-fit">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">📝</span>
                Your Notes
              </h2>
              
              {notes.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎤</div>
                  <p className="text-white/80">Start recording to create your first note!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => setSelectedNote(note)}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedNote?.id === note.id
                          ? 'bg-white/20 border-2 border-white/30'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-white truncate">{note.title}</h3>
                        <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded">
                          {note.category}
                        </span>
                      </div>
                      <p className="text-white/80 text-sm line-clamp-2 mb-2">
                        {note.content.substring(0, 100)}...
                      </p>
                      <div className="flex justify-between items-center text-xs text-white/60">
                        <span>{note.timestamp}</span>
                        <span>{note.duration} min</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Note Detail View */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 h-fit">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">📄</span>
                Note Details
              </h2>
              
              {selectedNote ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{selectedNote.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-white/60">
                        <span>{selectedNote.timestamp}</span>
                        <span>{selectedNote.duration} min</span>
                        <span className="bg-white/10 px-2 py-1 rounded">
                          {selectedNote.category}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteNote(selectedNote.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="bg-black/20 rounded-lg p-4">
                    <h4 className="font-bold text-white mb-2">Transcription:</h4>
                    <p className="text-white/90 text-sm leading-relaxed">
                      {selectedNote.content}
                    </p>
                  </div>

                  {selectedNote.summary ? (
                    <div className="bg-green-600/20 rounded-lg p-4">
                      <h4 className="font-bold text-white mb-2">AI Summary:</h4>
                      <p className="text-white/90 text-sm leading-relaxed">
                        {selectedNote.summary}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => generateSummary(selectedNote.id)}
                      disabled={isProcessing}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Generating Summary...
                        </>
                      ) : (
                        <>
                          <span className="mr-2">🤖</span>
                          Generate AI Summary
                        </>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📄</div>
                  <p className="text-white/80">Select a note to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12">
          <div className="bg-black/20 rounded-lg p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">✨ Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-3">🎙️</div>
                <h4 className="font-bold text-white mb-2">Voice Recording</h4>
                <p className="text-white/80 text-sm">High-quality audio recording with real-time feedback</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">📝</div>
                <h4 className="font-bold text-white mb-2">Auto Transcription</h4>
                <p className="text-white/80 text-sm">Convert speech to text automatically with AI</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">🤖</div>
                <h4 className="font-bold text-white mb-2">AI Summarization</h4>
                <p className="text-white/80 text-sm">Get intelligent summaries of your notes</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">📁</div>
                <h4 className="font-bold text-white mb-2">Note Organization</h4>
                <p className="text-white/80 text-sm">Categorize and manage your notes easily</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 