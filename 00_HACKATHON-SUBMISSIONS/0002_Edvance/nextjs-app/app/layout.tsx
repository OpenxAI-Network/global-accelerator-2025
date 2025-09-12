import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import { FriendsProvider } from '../contexts/FriendsContext'
import ErrorBoundary from '../components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Discussion Forum',
  description: 'A Q&A forum for university students with AI-powered answers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            <FriendsProvider>
              {children}
            </FriendsProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
} 