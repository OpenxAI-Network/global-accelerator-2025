'use client';

import { useState, useRef } from 'react';

export default function FitnessBuddy() {
  const [isRecording, setIsRecording] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startWebcamRecording = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const file = new File([blob], 'recorded-video.webm', { type: 'video/webm' });
        setVideoFile(file);
        
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = url;
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Failed to access camera. Please check permissions.');
      console.error('Error accessing camera:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setError('');
      
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = url;
      }
    } else {
      setError('Please select a valid video file.');
    }
  };

  const analyzeVideo = async () => {
    if (!videoFile) {
      setError('Please upload or record a video first.');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAnalysis('');

    try {
      const formData = new FormData();
      formData.append('video', videoFile);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze video');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setError('Failed to analyze video. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearVideo = () => {
    setVideoFile(null);
    setVideoUrl('');
    setAnalysis('');
    setError('');
    if (videoRef.current) {
      videoRef.current.src = '';
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            💪 Fitness Buddy
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Upload your workout video or record with webcam to get AI-powered form analysis and corrections
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Video Upload/Recording Section */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Video Input
                  </h2>
                  
                  <div className="space-y-4">
                    {/* File Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Upload Video File
                      </label>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300 dark:hover:file:bg-gray-600 transition-colors"
                      />
                    </div>

                    {/* Webcam Recording */}
                    <div className="flex space-x-3">
                      {!isRecording ? (
                        <button
                          onClick={startWebcamRecording}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                          <span>🎥</span>
                          <span>Start Recording</span>
                        </button>
                      ) : (
                        <button
                          onClick={stopRecording}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                          <span>⏹️</span>
                          <span>Stop Recording</span>
                        </button>
                      )}
                      
                      {videoFile && (
                        <button
                          onClick={clearVideo}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Video Preview */}
                  {(videoUrl || isRecording) && (
                    <div className="mt-6">
                      <video
                        ref={videoRef}
                        controls={!isRecording}
                        autoPlay={isRecording}
                        muted={isRecording}
                        className="w-full h-64 bg-black rounded-lg object-cover"
                      />
                    </div>
                  )}

                  {/* Analyze Button */}
                  {videoFile && !isRecording && (
                    <button
                      onClick={analyzeVideo}
                      disabled={isAnalyzing}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <span>🧠</span>
                          <span>Analyze Form</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}
                </div>

                {/* Analysis Results Section */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Form Analysis
                  </h2>
                  
                  {analysis ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center space-x-2">
                        <span>✅</span>
                        <span>AI Analysis Complete</span>
                      </h3>
                      <div className="text-green-700 whitespace-pre-wrap leading-relaxed">
                        {analysis}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
                      <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">
                        Upload or record a workout video to get started with form analysis
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}