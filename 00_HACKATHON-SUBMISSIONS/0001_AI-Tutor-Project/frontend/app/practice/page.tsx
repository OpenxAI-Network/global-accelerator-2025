'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PenTool, Brain, CheckCircle, XCircle } from 'lucide-react'

interface Question {
  id: number | string
  question: string
  type: 'multiple_choice' | 'short_answer'
  options?: string[]
  correct_answer: string
  explanation: string
  difficulty: number
}

export default function PracticePage() {
  const [subject, setSubject] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [count, setCount] = useState(20)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const subjects = [
    { value: 'math', label: 'Mathematics' },
    { value: 'science', label: 'Science' },
    { value: 'history', label: 'History' },
    { value: 'english', label: 'English' },
  ]

  const difficulties = [
    { value: '1', label: 'Beginner' },
    { value: '2', label: 'Easy' },
    { value: '3', label: 'Medium' },
    { value: '4', label: 'Hard' },
    { value: '5', label: 'Expert' },
  ]

  const normalizeQuestions = (qs: Question[]) => {
    const seen = new Set<string>()
    return qs.map((q, idx) => {
      let id = String(q.id ?? `${subject}-${idx}`)
      if (seen.has(id)) id = `${id}-${idx}-${Date.now()}`
      seen.add(id)
      return { ...q, id }
    })
  }

  const generateQuestions = async () => {
    if (!subject || !difficulty) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/practice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          difficulty: parseInt(difficulty, 10),
          num_questions: Math.max(1, Math.min(50, count)),
        }),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        console.error('Practice generate error:', res.status, text)
        throw new Error(`Failed to generate questions: ${res.status}`)
      }
      const data = await res.json()
      const qs: Question[] = normalizeQuestions(data.questions || [])
      setQuestions(qs)
      setAnswers(new Array(qs.length).fill(''))
      setCurrentQuestion(0)
      setShowResults(false)
    } catch (e) {
      console.error(e)
      setQuestions([])
      setAnswers([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answer
    setAnswers(newAnswers)
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setShowResults(true)
    }
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach((question, index) => {
      if (answers[index]?.toLowerCase() === question.correct_answer.toLowerCase()) {
        correct++
      }
    })
    return { correct, total: questions.length, percentage: Math.round((correct / questions.length) * 100) }
  }

  if (showResults) {
    const score = calculateScore()
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Practice Results</h1>
          <p className="text-muted-foreground">
            Here's how you performed on your practice session
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              Score: {score.correct}/{score.total} ({score.percentage}%)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((question, index) => {
              const isCorrect = answers[index]?.toLowerCase() === question.correct_answer.toLowerCase()
              return (
                <div key={`${question.id}-${index}`} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{question.question}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your answer: <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                          {answers[index] || 'No answer'}
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Correct answer: <span className="text-green-600">{question.correct_answer}</span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Button onClick={() => {
            setQuestions([])
            setAnswers([])
            setShowResults(false)
            setCurrentQuestion(0)
          }}>
            Practice Again
          </Button>
          <Button variant="outline" onClick={() => generateQuestions()}>
            New Questions
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Practice Generator</h1>
        <p className="text-muted-foreground">
          Generate personalized practice questions for any subject
        </p>
        <Badge variant="secondary" className="mt-2">
          <PenTool className="mr-1 h-3 w-3" />
          AI-Generated Questions
        </Badge>
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Generate Practice Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="text-sm font-medium">Subject</label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((sub) => (
                      <SelectItem key={sub.value} value={sub.value}>
                        {sub.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-1">
                <label className="text-sm font-medium">Difficulty</label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((diff) => (
                      <SelectItem key={diff.value} value={diff.value}>
                        {diff.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-1">
                <label className="text-sm font-medium">Number of Questions (1–50)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={count}
                  onChange={(e) => setCount(Math.max(1, Math.min(50, parseInt(e.target.value || '1', 10))))}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>

            <Button
              onClick={generateQuestions}
              disabled={!subject || !difficulty || isLoading}
              className="w-full"
            >
              {isLoading ? 'Generating Questions...' : 'Generate Questions'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                Question {currentQuestion + 1} of {questions.length}
              </CardTitle>
              <Badge variant="outline">
                {subjects.find(s => s.value === subject)?.label} - Level {difficulty}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                {questions[currentQuestion]?.question}
              </h3>

              {questions[currentQuestion]?.type === 'multiple_choice' ? (
                <div className="space-y-2">
                  {questions[currentQuestion]?.options?.map((option, index) => (
                    <Button
                      key={`${questions[currentQuestion]?.id}-${index}`}
                      variant={answers[currentQuestion] === option ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => handleAnswer(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter your answer"
                    value={answers[currentQuestion] || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              <Button
                onClick={nextQuestion}
                disabled={!answers[currentQuestion]}
              >
                {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}