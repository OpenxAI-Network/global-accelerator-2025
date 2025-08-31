"use client";

import { useState, useEffect } from "react";
import { Brain, Check, X, RotateCcw, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { fetchFromPerplexity } from "@/lib/perplexity";

interface RevisionModeProps {
  selectedNodes: any[];
  onClose: () => void;
  chatId: string;
}

interface MCQOption {
  text: string;
  isCorrect: boolean;
}

interface MCQ {
  id: number;
  question: string;
  options: MCQOption[];
  explanation: string;
  nodeTitle: string;
}

export default function RevisionMode({ selectedNodes, onClose, chatId }: RevisionModeProps) {
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    if (selectedNodes.length > 0) {
      generateMCQs();
    }
  }, [selectedNodes]);

  const generateMCQs = async () => {
    setLoading(true);
    const generatedMCQs: MCQ[] = [];

    try {
      for (let i = 0; i < selectedNodes.length; i++) {
        const node = selectedNodes[i];
        
        // Create a prompt to generate MCQ based on node content
        const prompt = `Based on this topic: "${node.title}" and context: "${node.subtitle || node.answer || ''}", 
        create a multiple choice question with 4 options where only 1 is correct. 
        Format the response as JSON:
        {
          "question": "Your question here",
          "options": [
            {"text": "Option A", "isCorrect": false},
            {"text": "Option B", "isCorrect": true},
            {"text": "Option C", "isCorrect": false},
            {"text": "Option D", "isCorrect": false}
          ],
          "explanation": "Explain why the correct answer is right"
        }`;

        const response = await fetchFromPerplexity(prompt);
        
        try {
          // Try to parse JSON from the response
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const mcqData = JSON.parse(jsonMatch[0]);
            
            generatedMCQs.push({
              id: i,
              question: mcqData.question,
              options: mcqData.options,
              explanation: mcqData.explanation,
              nodeTitle: node.title
            });
          } else {
            // Fallback: create a simple MCQ
            generatedMCQs.push({
              id: i,
              question: `What is the main concept related to "${node.title}"?`,
              options: [
                { text: "Option A", isCorrect: false },
                { text: node.title, isCorrect: true },
                { text: "Option C", isCorrect: false },
                { text: "Option D", isCorrect: false }
              ],
              explanation: `The correct answer relates to the concept of ${node.title}`,
              nodeTitle: node.title
            });
          }
        } catch (parseError) {
          console.error("Error parsing MCQ JSON:", parseError);
          // Fallback MCQ
          generatedMCQs.push({
            id: i,
            question: `What is the main concept related to "${node.title}"?`,
            options: [
              { text: "Option A", isCorrect: false },
              { text: node.title, isCorrect: true },
              { text: "Option C", isCorrect: false },
              { text: "Option D", isCorrect: false }
            ],
            explanation: `The correct answer relates to the concept of ${node.title}`,
            nodeTitle: node.title
          });
        }
      }

      setMcqs(generatedMCQs);
    } catch (error) {
      console.error("Error generating MCQs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(optionIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = mcqs[currentQuestion].options[selectedAnswer].isCorrect;
    if (isCorrect) {
      setScore(score + 1);
    }

    setAnswers([...answers, selectedAnswer]);
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < mcqs.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
    setQuizCompleted(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Generating Quiz</h3>
            <p className="text-slate-600">Creating questions based on selected topics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Quiz Completed!</h3>
            <p className="text-slate-600 mb-6">
              You scored {score} out of {mcqs.length} questions correctly
            </p>

            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <div className="text-3xl font-bold text-indigo-600 mb-1">
                {Math.round((score / mcqs.length) * 100)}%
              </div>
              <div className="text-sm text-slate-500">
                {score >= mcqs.length * 0.7 ? "Great job!" : "Keep practicing!"}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleRestart}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restart Quiz</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mcqs.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Questions Generated</h3>
            <p className="text-slate-600 mb-6">
              Unable to generate questions from the selected nodes. Please try again.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentMCQ = mcqs[currentQuestion];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <Brain className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Revision Quiz</h3>
                <p className="text-sm text-slate-500">
                  Question {currentQuestion + 1} of {mcqs.length}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="bg-slate-200 rounded-full h-2">
              <div
                className="bg-indigo-600 rounded-full h-2 transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / mcqs.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Node Context */}
          <div className="bg-slate-50 rounded-lg p-3 mb-6">
            <p className="text-xs text-slate-500 mb-1">Topic:</p>
            <p className="text-sm font-medium text-slate-700">{currentMCQ.nodeTitle}</p>
          </div>

          {/* Question */}
          <div className="mb-6">
            <h4 className="text-lg font-medium text-slate-900 mb-4">
              {currentMCQ.question}
            </h4>

            {/* Options */}
            <div className="space-y-3">
              {currentMCQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedAnswer === index
                      ? showResult
                        ? option.isCorrect
                          ? "border-green-500 bg-green-50"
                          : "border-red-500 bg-red-50"
                        : "border-indigo-500 bg-indigo-50"
                      : showResult && option.isCorrect
                      ? "border-green-500 bg-green-50"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  } ${showResult ? "cursor-default" : "cursor-pointer"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-800">{option.text}</span>
                    {showResult && selectedAnswer === index && (
                      option.isCorrect ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <X className="w-5 h-5 text-red-600" />
                      )
                    )}
                    {showResult && option.isCorrect && selectedAnswer !== index && (
                      <Check className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Explanation */}
          {showResult && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h5 className="font-medium text-blue-900 mb-2">Explanation:</h5>
              <p className="text-blue-800 text-sm">{currentMCQ.explanation}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <div className="text-sm text-slate-500">
              Score: {score}/{currentQuestion + (showResult ? 1 : 0)}
            </div>
            
            <div className="flex space-x-3">
              {!showResult ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {currentQuestion < mcqs.length - 1 ? "Next Question" : "Finish Quiz"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
