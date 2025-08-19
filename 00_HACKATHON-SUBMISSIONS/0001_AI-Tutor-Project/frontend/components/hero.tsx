'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Sparkles, Brain, Target } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-6">
            <Sparkles className="mr-2 h-3 w-3" />
            Powered by Local Ollama AI
          </Badge>
          
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Your Personal
            <span className="text-primary"> AI Learning</span>
            <br />
            Companion
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Experience personalized tutoring, practice questions, and intelligent grading 
            powered by advanced AI. Learn faster, understand deeper, and achieve your goals 
            with adaptive learning technology.
          </p>
          
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/tutor">
              <Button size="lg" className="group">
                Start Learning
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/practice">
              <Button variant="outline" size="lg">
                Try Practice Mode
              </Button>
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-8">
          <div className="flex gap-x-4 rounded-xl bg-card p-6 ring-1 ring-inset ring-border">
            <Brain className="h-7 w-7 flex-none text-primary" />
            <div className="text-base leading-7">
              <h3 className="font-semibold text-foreground">Smart Tutoring</h3>
              <p className="mt-2 text-muted-foreground">
                AI-powered conversations that adapt to your learning style and pace.
              </p>
            </div>
          </div>
          
          <div className="flex gap-x-4 rounded-xl bg-card p-6 ring-1 ring-inset ring-border">
            <Target className="h-7 w-7 flex-none text-primary" />
            <div className="text-base leading-7">
              <h3 className="font-semibold text-foreground">Practice Questions</h3>
              <p className="mt-2 text-muted-foreground">
                Generate unlimited practice problems tailored to your skill level.
              </p>
            </div>
          </div>
          
          <div className="flex gap-x-4 rounded-xl bg-card p-6 ring-1 ring-inset ring-border">
            <Sparkles className="h-7 w-7 flex-none text-primary" />
            <div className="text-base leading-7">
              <h3 className="font-semibold text-foreground">Auto Grading</h3>
              <p className="mt-2 text-muted-foreground">
                Instant feedback with detailed explanations and improvement suggestions.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary to-secondary opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </section>
  )
}