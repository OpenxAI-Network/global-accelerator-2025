'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Play, Square, Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/Button';

interface VoiceRecorderProps {
  onTranscript?: (transcript: string, confidence: number) => void;
  onAudioData?: (audioBlob: Blob) => void;
  onError?: (error: string) => void;
  language?: string;
  autoStart?: boolean;
  className?: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscript,
  onAudioData,
  onError,
  language = 'en-US',
  autoStart = false,
  className = ''
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number>();

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = language;

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPart = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcriptPart;
            } else {
              interimTranscript += transcriptPart;
            }
          }

          const fullTranscript = finalTranscript + interimTranscript;
          setTranscript(fullTranscript);
          
          if (onTranscript && finalTranscript) {
            onTranscript(finalTranscript, event.results[event.results.length - 1][0].confidence || 0.8);
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          onError?.(event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, [language, onTranscript, onError]);

  // Audio level visualization
  const updateAudioLevel = useCallback(() => {
    if (analyzerRef.current) {
      const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
      analyzerRef.current.getByteFrequencyData(dataArray);
      
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average / 255);
    }
    
    if (isListening) {
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    }
  }, [isListening]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });

      // Set up audio context for visualization
      audioContextRef.current = new AudioContext();
      analyzerRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyzerRef.current);
      analyzerRef.current.fftSize = 256;

      // Set up media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onAudioData?.(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      setIsListening(true);
      updateAudioLevel();
    } catch (error) {
      console.error('Error starting recording:', error);
      onError?.('Failed to start recording. Please check microphone permissions.');
    }
  }, [onAudioData, onError, updateAudioLevel]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setIsListening(false);
    setAudioLevel(0);
  }, []);

  const toggleRecording = useCallback(() => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isListening, startRecording, stopRecording]);

  const playAudio = useCallback(() => {
    if (audioUrl && !isMuted) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onplay = () => setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.play();
    }
  }, [audioUrl, isMuted]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  }, [audioUrl]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && !isListening) {
      startRecording();
    }
  }, [autoStart, isListening, startRecording]);

  return (
    <motion.div 
      className={`voice-recorder-container ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col items-center space-y-4">
        {/* Voice Level Visualization */}
        <motion.div 
          className="relative w-32 h-32 flex items-center justify-center"
          animate={{ 
            scale: isListening ? 1 + (audioLevel * 0.3) : 1,
            boxShadow: isListening 
              ? `0 0 ${20 + audioLevel * 30}px rgba(0, 245, 255, ${0.3 + audioLevel * 0.4})` 
              : '0 0 10px rgba(0, 245, 255, 0.2)'
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <motion.div
            className={`absolute inset-0 rounded-full border-2 ${
              isListening ? 'border-cyber-blue' : 'border-gray-400'
            }`}
            animate={{ 
              scale: isListening ? 1 + (audioLevel * 0.2) : 1,
              opacity: isListening ? 0.8 : 0.4 
            }}
          />
          
          {/* Pulse rings */}
          {isListening && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full border border-cyber-blue/30"
                animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border border-cyber-blue/20"
                animate={{ scale: [1, 2], opacity: [0.4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
              />
            </>
          )}

          <Button
            onClick={toggleRecording}
            variant={isListening ? 'destructive' : 'default'}
            size="lg"
            className={`relative z-10 w-16 h-16 rounded-full ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-cyber-blue hover:bg-cyber-blue/80'
            }`}
          >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          </Button>
        </motion.div>

        {/* Audio Controls */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={playAudio}
            disabled={!audioUrl || isPlaying}
            variant="outline"
            size="sm"
            className="glassmorphism"
          >
            <Play size={16} />
          </Button>
          
          <Button
            onClick={stopAudio}
            disabled={!isPlaying}
            variant="outline"
            size="sm"
            className="glassmorphism"
          >
            <Square size={16} />
          </Button>
          
          <Button
            onClick={() => setIsMuted(!isMuted)}
            variant="outline"
            size="sm"
            className="glassmorphism"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </Button>
        </div>

        {/* Transcript Display */}
        {transcript && (
          <motion.div
            className="w-full max-w-md p-4 rounded-lg glassmorphism border border-white/20"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-medium text-white/80">Transcript:</h4>
              <Button
                onClick={clearTranscript}
                variant="ghost"
                size="sm"
                className="text-xs text-white/60 hover:text-white"
              >
                Clear
              </Button>
            </div>
            <p className="text-sm text-white leading-relaxed">{transcript}</p>
          </motion.div>
        )}

        {/* Status */}
        <div className="text-center">
          <motion.p
            className={`text-sm ${isListening ? 'text-cyber-blue' : 'text-white/60'}`}
            animate={{ opacity: isListening ? [1, 0.5, 1] : 1 }}
            transition={{ duration: 1.5, repeat: isListening ? Infinity : 0 }}
          >
            {isListening ? 'Listening...' : 'Click to start voice recording'}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

export default VoiceRecorder;