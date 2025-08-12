'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Users, BookOpen, Award } from 'lucide-react'

const stats = [
  {
    label: 'Active Learning Sessions',
    value: '12.3K',
    change: '+2.5%',
    icon: TrendingUp,
    color: 'text-green-500',
  },
  {
    label: 'Students Helped',
    value: '5.8K',
    change: '+12%',
    icon: Users,
    color: 'text-blue-500',
  },
  {
    label: 'Practice Questions',
    value: '45.2K',
    change: '+18%',
    icon: BookOpen,
    color: 'text-purple-500',
  },
  {
    label: 'Success Rate',
    value: '94%',
    change: '+5%',
    icon: Award,
    color: 'text-orange-500',
  },
]

export function StatsSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Trusted by learners worldwide
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of students who are already achieving their learning goals with AI assistance.
          </p>
        </div>
        
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-4 lg:gap-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                      <p className={`text-sm ${stat.color}`}>
                        {stat.change} from last month
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
      </div>
    </section>
  )
}