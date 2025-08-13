// 'use client';

// import { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { Mic, Square } from 'lucide-react';

// interface VoiceRecorderProps {
//   onTranscript?: (text: string) => void;
// }

// export default function VoiceRecorder({ onTranscript }: VoiceRecorderProps) {
//   const [isRecording, setIsRecording] = useState(false);
//   const [transcript, setTranscript] = useState('');

//   useEffect(() => {
//     let recognition: any;
//     if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
//       recognition = new (window as any).webkitSpeechRecognition();
//       recognition.continuous = true;
//       recognition.interimResults = true;
//       recognition.lang = 'en-IN';

//       recognition.onresult = (event: any) => {
//         const text = Array.from(event.results)
//           .map((result: any) => result[0].transcript)
//           .join('');
//         setTranscript(text);
//         onTranscript && onTranscript(text);
//       };

//       if (isRecording) recognition.start();
//       else recognition.stop();
//     }
//     return () => recognition && recognition.stop();
//   }, [isRecording, onTranscript]);

//   return (
//     <div className="flex items-center gap-3">
//       <motion.button
//         whileTap={{ scale: 0.9 }}
//         onClick={() => setIsRecording(!isRecording)}
//         className={`p-4 rounded-full transition-all duration-300 
//                    ${isRecording ? 'bg-red-500' : 'bg-cyan-500'} shadow-lg`}
//       >
//         {isRecording ? <Square className="text-white" /> : <Mic className="text-white" />}
//       </motion.button>
//       <div className="min-w-[200px] text-gray-300 text-sm font-mono">
//         {isRecording ? transcript || 'Listening...' : 'Tap to start'}
//       </div>
//     </div>
//   );
// }
