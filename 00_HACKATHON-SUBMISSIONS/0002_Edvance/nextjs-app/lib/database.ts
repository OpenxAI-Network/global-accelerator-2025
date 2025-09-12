import { Pool } from 'pg'

// Check if we're in demo mode (no database)
const isDemoMode = process.env.NODE_ENV === 'development' && !process.env.DB_HOST

let pool: Pool | null = null

if (!isDemoMode) {
  pool = new Pool({
    user: process.env.DB_USER || 'forum_user',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'ai_forum',
    password: process.env.DB_PASSWORD || 'forum_password',
    port: parseInt(process.env.DB_PORT || '5432'),
  })
}

export default pool

// Demo data for when database is not available
export const demoData = {
  questions: [
    {
      id: 1,
      title: 'What is the difference between a stack and a queue?',
      content: 'I\'m studying data structures and I\'m confused about when to use a stack vs a queue. Can someone explain the key differences and provide real-world examples?',
      tags: ['data-structures', 'algorithms', 'computer-science'],
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      username: 'alice_student',
      answer_count: 2,
      votes: 5
    },
    {
      id: 2,
      title: 'How does recursion work in programming?',
      content: 'I understand that recursion is when a function calls itself, but I\'m having trouble visualizing how it works. Can someone break it down with a simple example?',
      tags: ['recursion', 'programming', 'algorithms'],
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      username: 'bob_student',
      answer_count: 1,
      votes: 3
    },
    {
      id: 3,
      title: 'What are the main sorting algorithms and when to use each?',
      content: 'I know there are many sorting algorithms like bubble sort, quick sort, merge sort, etc. What are the time complexities and when should I use each one?',
      tags: ['sorting', 'algorithms', 'complexity'],
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
      username: 'charlie_student',
      answer_count: 1,
      votes: 4
    },
    {
      id: 4,
      title: 'Best practices for teaching algorithms to beginners',
      content: 'As a professor, I\'m looking for effective ways to teach algorithmic thinking to students who are new to computer science. What approaches have worked well for others?',
      tags: ['teaching', 'algorithms', 'education'],
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      username: 'professor_smith',
      answer_count: 3,
      votes: 8
    },
    {
      id: 5,
      title: 'Understanding time complexity analysis',
      content: 'I\'m struggling with Big O notation and analyzing algorithm efficiency. Can someone provide a clear explanation with examples?',
      tags: ['complexity', 'algorithms', 'analysis'],
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      username: 'dr_johnson',
      answer_count: 2,
      votes: 6
    }
  ],
  answers: [
    {
      id: 1,
      question_id: 1,
      content: 'A stack follows LIFO (Last In, First Out) principle - like a stack of plates. You can only add or remove from the top. A queue follows FIFO (First In, First Out) - like a line of people. You add at the back and remove from the front. Stacks are great for undo operations, while queues are perfect for task scheduling.',
      username: 'professor_smith',
      created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // 1.5 hours ago
      is_ai_generated: false,
      votes: 8
    },
    {
      id: 2,
      question_id: 1,
      content: 'Think of a stack like a browser\'s back button - the last page you visited is the first one you go back to. A queue is like a printer queue - the first document sent is the first one printed.',
      username: 'charlie_student',
      created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
      is_ai_generated: false,
      votes: 3
    },
    {
      id: 3,
      question_id: 2,
      content: 'Recursion is like Russian dolls - each doll contains a smaller version of itself. In programming, a recursive function solves a problem by breaking it into smaller, identical sub-problems. The key is having a base case to stop the recursion.',
      username: 'dr_johnson',
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
      is_ai_generated: false,
      votes: 12
    },
    {
      id: 4,
      question_id: 3,
      content: 'Here\'s a comprehensive overview of sorting algorithms:\n\n**Bubble Sort**: O(n²) - Simple but inefficient\n**Quick Sort**: O(n log n) average - Very efficient\n**Merge Sort**: O(n log n) - Stable and predictable\n**Heap Sort**: O(n log n) - Good for large datasets\n\nUse Quick Sort for general purpose, Merge Sort when stability matters, and Heap Sort for memory-constrained environments.',
      username: 'alice_student',
      created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
      is_ai_generated: false,
      votes: 5
    }
  ]
}

// Helper function to get persisted answers from localStorage
export const getPersistedAnswers = () => {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('ai-forum-answers')
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error reading persisted answers:', error)
    return []
  }
}

// Helper function to persist answers to localStorage
export const persistAnswer = (answer: any) => {
  if (typeof window === 'undefined') return
  try {
    const existing = getPersistedAnswers()
    const updated = [...existing, answer]
    localStorage.setItem('ai-forum-answers', JSON.stringify(updated))
  } catch (error) {
    console.error('Error persisting answer:', error)
  }
}

export interface User {
  id: number
  username: string
  email: string
  created_at: Date
  avatar_url?: string
}

export interface Question {
  id: number
  user_id: number
  title: string
  content: string
  tags: string[]
  created_at: string
  updated_at: string
  views: number
  votes: number
  username?: string
  answer_count?: number
}

export interface Answer {
  id: number
  question_id: number
  user_id: number
  content: string
  is_ai_generated: boolean
  created_at: string
  updated_at: string
  votes: number
  username?: string
}

export interface Content {
  id: number
  filename: string
  file_path: string
  content_type: string
  uploaded_at: Date
  processed: boolean
  extracted_text?: string
}
