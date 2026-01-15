import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import MobileChrome from './_components/MobileChrome'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SurpriseMePH',
  description: 'Save surplus food in the Philippines with Surprise Bags and delivery.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MobileChrome>{children}</MobileChrome>
        <div className="max-w-md mx-auto text-center text-xs text-[#064E3B] py-4">© 2025 SurpriseMePH</div>
      </body>
    </html>
  )
} 