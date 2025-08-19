'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { BookOpen, CheckCircle, AlertTriangle, FileText } from 'lucide-react'

interface GradingResult {
  score: number
  feedback: string
  rubric_breakdown: {
    category: string
    score: number
    max_score: number
    feedback: string
  }[]
}

export default function GradingPage() {
  const [submission, setSubmission] = useState('')
  const [rubric, setRubric] = useState('')
  const [result, setResult] = useState<GradingResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const submitForGrading = async () => {
    if (!submission.trim()) return

    setIsLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/grading/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission, rubric }),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        console.error('Grading error:', res.status, text)
        throw new Error(`Failed to grade: ${res.status}`)
      }
      const data: GradingResult = await res.json()
      setResult(data)
    } catch (e) {
      console.error(e)
      setResult({
        score: 0,
        feedback: 'There was an error grading your submission. Please try again.',
        rubric_breakdown: [
          { category: 'Content Knowledge', score: 0, max_score: 25, feedback: '' },
          { category: 'Analysis & Reasoning', score: 0, max_score: 25, feedback: '' },
          { category: 'Organization & Structure', score: 0, max_score: 25, feedback: '' },
          { category: 'Writing Quality', score: 0, max_score: 25, feedback: '' },
        ],
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 80) return 'text-blue-600'
    if (percentage >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default'
    if (score >= 80) return 'secondary'
    if (score >= 70) return 'outline'
    return 'destructive'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">AI Grading System</h1>
        <p className="text-muted-foreground">
          Submit your work for instant AI-powered grading and feedback
        </p>
        <Badge variant="secondary" className="mt-2">
          <BookOpen className="mr-1 h-3 w-3" />
          Rubric-Based Assessment
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Submission Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Submit Your Work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Your Submission</label>
              <Textarea
                value={submission}
                onChange={(e) => setSubmission(e.target.value)}
                placeholder="Paste or type your assignment, essay, or answer here..."
                rows={8}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Grading Rubric (Optional)</label>
              <Textarea
                value={rubric}
                onChange={(e) => setRubric(e.target.value)}
                placeholder="Provide specific grading criteria or rubric points..."
                rows={4}
                className="mt-1"
              />
            </div>

            <Button
              onClick={submitForGrading}
              disabled={!submission.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? 'Grading in Progress...' : 'Submit for Grading'}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Grading Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!result && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Submit your work to receive AI grading and feedback</p>
              </div>
            )}

            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">AI is reviewing your submission...</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Overall Score */}
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold mb-2">
                    <Badge variant={getScoreBadgeVariant(result.score)} className="text-lg px-3 py-1">
                      {result.score}/100
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Overall Score</p>
                </div>

                {/* Rubric Breakdown */}
                <div className="space-y-3">
                  <h4 className="font-medium">Detailed Breakdown</h4>
                  {result.rubric_breakdown.map((item, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">{item.category}</span>
                        <span className={`font-bold ${getScoreColor(item.score, item.max_score)}`}>
                          {item.score}/{item.max_score}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.feedback}</p>
                    </div>
                  ))}
                </div>

                {/* Overall Feedback */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Overall Feedback</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {result.feedback}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}