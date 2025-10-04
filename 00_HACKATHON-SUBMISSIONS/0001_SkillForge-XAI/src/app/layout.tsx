import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { ThemeProvider } from '@/contexts/ThemeContext'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: '🏆 SkillForge-XAI | OpenxAI Global Accelerator 2025 | Revolutionary AI Learning Platform',
  description: '🚀 Award-winning AI-powered learning platform built for OpenxAI Global Accelerator 2025. Experience GPT-4 tutoring, voice learning, adaptive assessments, and personalized education paths. Transform your learning journey with cutting-edge artificial intelligence.',
  keywords: [
    'OpenxAI Global Accelerator 2025',
    'AI learning platform',
    'GPT-4 tutoring',
    'OpenAI education',
    'adaptive learning',
    'voice AI learning',
    'personalized education',
    'hackathon project',
    'LearnAI track',
    'Next.js 15',
    'TypeScript',
    'artificial intelligence',
    'machine learning education',
    'smart assessment',
    'educational technology'
  ].join(', '),
  authors: [{ name: 'Chikamso Chidebe', url: 'https://github.com/ChikamsoChidebe' }],
  creator: 'Chikamso Chidebe',
  publisher: 'SkillForge-XAI',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://skillforge-xai.vercel.app',
    title: '🏆 SkillForge-XAI | OpenxAI Global Accelerator 2025',
    description: '🚀 Revolutionary AI-powered learning platform with GPT-4 intelligence, voice learning, and adaptive assessments.',
    siteName: 'SkillForge-XAI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SkillForge-XAI - AI-Powered Learning Platform'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: '🏆 SkillForge-XAI | OpenxAI Global Accelerator 2025',
    description: '🚀 Revolutionary AI-powered learning platform with GPT-4 intelligence',
    images: ['/og-image.png']
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('skillforge-theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.toggle('dark', theme === 'dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="font-inter antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
        <ThemeProvider>
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}