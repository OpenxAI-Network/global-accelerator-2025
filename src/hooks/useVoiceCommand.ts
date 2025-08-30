import { useState, useRef, useCallback, useEffect } from 'react';

interface VoiceCommandState {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  confidence: number;
  error: string | null;
}

interface WaveformData {
  data: number[];
  timestamp: number;
}

export const useVoiceCommand = () => {
  const [state, setState] = useState<VoiceCommandState>({
    isListening: false,
    isProcessing: false,
    transcript: '',
    confidence: 0,
    error: null
  });

  const [waveformData, setWaveformData] = useState<WaveformData[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for browser support
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        // Configure recognition settings
        recognitionRef.current.maxAlternatives = 3;
        
        // Set up event handlers
        recognitionRef.current.onstart = () => {
          setState(prev => ({ ...prev, isListening: true, error: null }));
        };
        
        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';
          let maxConfidence = 0;
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            const confidence = event.results[i][0].confidence;
            
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
              maxConfidence = Math.max(maxConfidence, confidence);
            } else {
              interimTranscript += transcript;
            }
          }
          
          setState(prev => ({
            ...prev,
            transcript: finalTranscript || interimTranscript,
            confidence: maxConfidence
          }));
        };
        
        recognitionRef.current.onerror = (event) => {
          let errorMessage = 'Speech recognition error';
          
          switch (event.error) {
            case 'no-speech':
              errorMessage = 'No speech detected. Please try again.';
              break;
            case 'audio-capture':
              errorMessage = 'Microphone access denied. Please check permissions.';
              break;
            case 'not-allowed':
              errorMessage = 'Microphone access blocked. Please allow microphone access.';
              break;
            case 'network':
              errorMessage = 'Network error. Please check your connection.';
              break;
            case 'service-not-allowed':
              errorMessage = 'Speech recognition service not available.';
              break;
            default:
              errorMessage = `Speech recognition error: ${event.error}`;
          }
          
          setState(prev => ({ 
            ...prev, 
            isListening: false, 
            error: errorMessage 
          }));
        };
        
        recognitionRef.current.onend = () => {
          setState(prev => ({ ...prev, isListening: false }));
        };
      } else {
        setState(prev => ({ 
          ...prev, 
          error: 'Speech recognition not supported in this browser' 
        }));
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Initialize audio context for waveform visualization
  const initializeAudioContext = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      // Configure analyser
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      // Connect audio nodes
      microphoneRef.current.connect(analyserRef.current);
      
      // Start waveform visualization
      startWaveformVisualization();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to access microphone. Please check permissions.' 
      }));
      return false;
    }
  }, []);

  // Start waveform visualization
  const startWaveformVisualization = useCallback(() => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateWaveform = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate average audio level
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      setAudioLevel(average);
      
      // Store waveform data for visualization
      setWaveformData(prev => {
        const newData = Array.from(dataArray).slice(0, 64); // Take first 64 samples
        return [...prev.slice(-50), { data: newData, timestamp: Date.now() }];
      });
      
      animationFrameRef.current = requestAnimationFrame(updateWaveform);
    };
    
    updateWaveform();
  }, []);

  // Start listening
  const startListening = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null, transcript: '' }));
      
      // Initialize audio context for waveform
      const audioInitialized = await initializeAudioContext();
      if (!audioInitialized) return;
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Failed to start listening:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to start voice recognition' 
      }));
    }
  }, [initializeAudioContext]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Stop waveform visualization
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setState(prev => ({ ...prev, isListening: false }));
    setAudioLevel(0);
    setWaveformData([]);
  }, []);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '', error: null }));
  }, []);

  // Get current waveform data for visualization
  const getCurrentWaveform = useCallback(() => {
    if (waveformData.length === 0) return [];
    return waveformData[waveformData.length - 1]?.data || [];
  }, [waveformData]);

  // Get audio level as percentage
  const getAudioLevelPercentage = useCallback(() => {
    return Math.min(100, (audioLevel / 255) * 100);
  }, [audioLevel]);

  return {
    // State
    isListening: state.isListening,
    isProcessing: state.isProcessing,
    transcript: state.transcript,
    confidence: state.confidence,
    error: state.error,
    
    // Waveform data
    waveformData,
    currentWaveform: getCurrentWaveform(),
    audioLevel: getAudioLevelPercentage(),
    
    // Actions
    startListening,
    stopListening,
    toggleListening,
    clearTranscript,
    
    // Utility
    isSupported: !!recognitionRef.current,
  };
};
