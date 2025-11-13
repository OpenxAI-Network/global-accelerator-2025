'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  Target,
  BookOpen,
  MessageSquare,
  PenTool
} from 'lucide-react'

type FetchedStat = {
  title: string
  value: string
  change: string
}

type StatUI = FetchedStat & {
  icon: any
  color: string
}

type Subject = {
  name: string
  level: number
  sessions: number
  lastActivity: string
}

type RecentActivity = {
  type: 'practice' | 'chat' | 'grading' | string
  subject: string
  description: string
  score?: number
  time: string
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'practice': return PenTool
    case 'chat': return MessageSquare
    case 'grading': return BookOpen
    default: return Target
  }
}

const getLevelColor = (level: number) => {
  if (level >= 85) return 'text-green-600'
  if (level >= 70) return 'text-blue-600'
  if (level >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

const decorateStats = (stats: FetchedStat[]): StatUI[] => {
  return (stats || []).map((s) => {
    let icon = BarChart3
    let color = 'text-blue-500'
    switch (s.title) {
      case 'Total Study Sessions':
        icon = Clock
        color = 'text-blue-500'
        break
      case 'Practice Questions':
        icon = PenTool
        color = 'text-green-500'
        break
      case 'Average Score':
        icon = Award
        color = 'text-purple-500'
        break
      case 'Chat Messages':
        icon = MessageSquare
        color = 'text-orange-500'
        break
      default:
        icon = BarChart3
        color = 'text-blue-500'
    }
    return { ...s, icon, color }
  })
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatUI[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/dashboard')
        if (!res.ok) {
          const text = await res.text().catch(() => '')
          throw new Error(`Dashboard fetch failed: ${res.status} ${text}`)
        }
        const data = await res.json()
        setStats(decorateStats(data.stats || []))
        setSubjects(data.subjects || [])
        setRecentActivity(data.recent_activity || [])
      } catch (e: any) {
        console.error(e)
        setError('Failed to load dashboard data.')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Learning Dashboard</h1>
        <p className="text-muted-foreground">
          Track your progress and see how you're improving across all subjects
        </p>
        <Badge variant="secondary" className="mt-2">
          <BarChart3 className="mr-1 h-3 w-3" />
          Analytics & Progress Tracking
        </Badge>
      </div>

      {isLoading && (
        <div className="text-center text-muted-foreground py-10">
          Loading dashboard...
        </div>
      )}

      {error && !isLoading && (
        <div className="text-center text-red-600 py-10">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* Stats Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.title}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className={`text-sm ${stat.color}`}>
                          {stat.change} from last week
                        </p>
                      </div>
                      <div className={`p-3 rounded-full bg-muted ${stat.color}/10`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Subject Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Subject Mastery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subjects.map((subject) => (
                  <div key={subject.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{subject.name}</span>
                      <span className={`font-bold ${getLevelColor(subject.level)}`}>
                        {subject.level}%
                      </span>
                    </div>
                    <Progress value={subject.level} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{subject.sessions} sessions</span>
                      <span>{subject.lastActivity}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const Icon = getActivityIcon(activity.type)
                  return (
                    <div key={`${activity.subject}-${index}`} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="p-2 rounded-md bg-background">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {activity.score !== undefined && (
                            <Badge variant="outline" className="text-xs">
                              {activity.score}%
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {activity.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Achievement Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <h4 className="font-medium">Math Streak</h4>
                  <p className="text-sm text-muted-foreground">5 days in a row</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Award className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <h4 className="font-medium">High Scorer</h4>
                  <p className="text-sm text-muted-foreground">90%+ on last 3 tests</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <h4 className="font-medium">Study Buddy</h4>
                  <p className="text-sm text-muted-foreground">100+ chat messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}