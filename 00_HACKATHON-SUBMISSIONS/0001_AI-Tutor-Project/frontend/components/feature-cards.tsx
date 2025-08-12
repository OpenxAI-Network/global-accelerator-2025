'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  MessageSquare, 
  PenTool, 
  BookOpen, 
  BarChart3,
  ArrowRight 
} from 'lucide-react'

const features = [
  {
    title: 'AI Tutor Chat',
    description: 'Get personalized help with streaming AI responses that guide you through problems step by step.',
    icon: MessageSquare,
    href: '/tutor',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Practice Generator',
    description: 'Generate unlimited practice questions across multiple subjects with varying difficulty levels.',
    icon: PenTool,
    href: '/practice',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    title: 'Smart Grading',
    description: 'Submit your work for AI-powered grading with detailed feedback and improvement suggestions.',
    icon: BookOpen,
    href: '/grading',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    title: 'Progress Tracking',
    description: 'Monitor your learning journey with detailed analytics and performance insights.',
    icon: BarChart3,
    href: '/dashboard',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
]

export function FeatureCards() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to excel
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Comprehensive AI-powered learning tools designed to help you master any subject.
          </p>
        </div>
        
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-8">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="group relative overflow-hidden hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${feature.bgColor} mb-4`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={feature.href}>
                    <Button variant="ghost" className="group/button p-0 h-auto font-medium">
                      Try it now
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/button:translate-x-1" />
                    </Button>
                  </Link>
                </CardContent>
                
                {/* Hover effect */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 transition-opacity group-hover:opacity-100" />
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}