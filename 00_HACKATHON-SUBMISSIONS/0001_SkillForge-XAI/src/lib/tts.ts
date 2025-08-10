// Text-to-Speech utility functions
export const speakText = (text: string, options?: {
  lang?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
}) => {
  if ("speechSynthesis" in window) {
    // Stop any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options?.lang || "en-US";
    utterance.pitch = options?.pitch || 1;
    utterance.rate = options?.rate || 0.9;
    utterance.volume = options?.volume || 1;
    
    speechSynthesis.speak(utterance);
    
    return utterance;
  } else {
    console.warn("Text-to-Speech not supported in this browser.");
    return null;
  }
};

export const stopSpeaking = () => {
  if ("speechSynthesis" in window) {
    speechSynthesis.cancel();
  }
};

export const isSpeaking = () => {
  if ("speechSynthesis" in window) {
    return speechSynthesis.speaking;
  }
  return false;
};

export const getVoices = () => {
  if ("speechSynthesis" in window) {
    return speechSynthesis.getVoices();
  }
  return [];
};