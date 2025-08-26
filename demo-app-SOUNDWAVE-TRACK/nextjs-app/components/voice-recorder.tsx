'use client'

import { useState, useRef } from 'react'
import { Mic, Square, Play, Pause, FileText } from 'lucide-react'

interface Note {
  id: string
  title: string
  content: string
  timestamp: string
  duration: string
  category: 'meeting' | 'class' | 'personal' | 'other'
  summary?: string
}

interface VoiceRecorderProps {
  onNoteCreated: (note: Note) => void
}

export default function VoiceRecorder({ onNoteCreated }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteCategory, setNoteCategory] = useState<'meeting' | 'class' | 'personal' | 'other'>('meeting')
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        const url = URL.createObjectURL(blob)
        setAudioURL(url)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const transcribeAndCreateNote = async () => {
    if (!audioURL) return

    setIsTranscribing(true)
    try {
      // Convert audio URL to blob
      const response = await fetch(audioURL)
      const audioBlob = await response.blob()

      // Create form data for transcription
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')

      // Send to transcription API
      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      })

      if (!transcribeResponse.ok) {
        throw new Error('Transcription failed')
      }

      const data = await transcribeResponse.json()
      
      // Create note object
      const note: Note = {
        id: Date.now().toString(),
        title: noteTitle || `Recording ${new Date().toLocaleDateString()}`,
        content: data.transcription,
        timestamp: new Date().toLocaleString(),
        duration: Math.ceil(recordingTime / 60).toString(),
        category: noteCategory
      }

      // Add note to parent component
      onNoteCreated(note)

      // Reset form
      setNoteTitle('')
      setNoteCategory('meeting')
      setAudioURL(null)
      setRecordingTime(0)

    } catch (error) {
      console.error('Error transcribing audio:', error)
      alert('Failed to transcribe audio. Please try again.')
    } finally {
      setIsTranscribing(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <div className="flex justify-center space-x-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full transition-colors"
          >
            <Mic size={20} />
            <span>Start Recording</span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full transition-colors"
          >
            <Square size={20} />
            <span>Stop Recording</span>
          </button>
        )}
      </div>

      {/* Recording Timer */}
      {isRecording && (
        <div className="text-center">
          <div className="text-2xl font-mono text-white">
            {formatTime(recordingTime)}
          </div>
          <div className="flex justify-center mt-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Audio Playback and Note Creation */}
      {audioURL && (
        <div className="space-y-4">
          <audio
            ref={audioRef}
            src={audioURL}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
          
          {/* Audio Controls */}
          <div className="flex justify-center space-x-4">
            {!isPlaying ? (
              <button
                onClick={playAudio}
                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full transition-colors"
              >
                <Play size={20} />
                <span>Play Recording</span>
              </button>
            ) : (
              <button
                onClick={pauseAudio}
                className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full transition-colors"
              >
                <Pause size={20} />
                <span>Pause</span>
              </button>
            )}
          </div>

          {/* Note Creation Form */}
          <div className="bg-black/20 rounded-lg p-4 space-y-4">
            <h3 className="text-white font-bold text-center">Create Note</h3>
            
            <div>
              <label className="block text-white text-sm mb-2">Note Title</label>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Enter note title..."
                className="w-full bg-white/10 text-white p-2 rounded border border-white/20 focus:border-white/40 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-white text-sm mb-2">Category</label>
              <select
                value={noteCategory}
                onChange={(e) => setNoteCategory(e.target.value as any)}
                className="w-full bg-white/10 text-white p-2 rounded border border-white/20 focus:border-white/40 focus:outline-none"
              >
                <option value="meeting">Meeting</option>
                <option value="class">Class</option>
                <option value="personal">Personal</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button
              onClick={transcribeAndCreateNote}
              disabled={isTranscribing}
              className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors"
            >
              {isTranscribing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Transcribing...</span>
                </>
              ) : (
                <>
                  <FileText size={20} />
                  <span>Create Note</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!audioURL && !isRecording && (
        <div className="text-center text-white/80 text-sm">
          <p>Click "Start Recording" to begin capturing your voice</p>
          <p className="mt-1">Perfect for meetings, classes, and personal notes</p>
        </div>
      )}
    </div>
  )
} 