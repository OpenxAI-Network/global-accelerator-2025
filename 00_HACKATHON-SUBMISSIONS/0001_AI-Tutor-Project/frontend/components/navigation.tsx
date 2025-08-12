'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { 
  GraduationCap, 
  MessageSquare, 
  PenTool, 
  BarChart3, 
  BookOpen 
} from 'lucide-react'

const navigation = [
  { name: 'Home', href: '/', icon: GraduationCap },
  { name: 'Tutor Chat', href: '/tutor', icon: MessageSquare },
  { name: 'Practice', href: '/practice', icon: PenTool },
  { name: 'Grading', href: '/grading', icon: BookOpen },
  { name: 'Progress', href: '/dashboard', icon: BarChart3 },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">LearnAI</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary',
                      pathname === item.href
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button asChild variant="outline" size="sm">
              <Link href="/tutor">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}