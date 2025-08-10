import React, { useState, useRef } from "react";
import { Mic, MicOff } from "lucide-react";

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscript, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsRecording(false);
    };

    recognition.onerror = (err) => {
      console.error("Speech recognition error:", err);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      disabled={disabled}
      className={`p-3 rounded-full transition-all duration-200 ${
        isRecording
          ? "bg-red-500 hover:bg-red-600 animate-pulse"
          : "bg-blue-500 hover:bg-blue-600"
      } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
      title={isRecording ? "Stop recording" : "Start voice input"}
    >
      {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
    </button>
  );
};

export default VoiceRecorder;