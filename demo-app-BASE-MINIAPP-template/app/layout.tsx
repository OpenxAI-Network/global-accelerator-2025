import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Vibe Trading AI - AI-Powered Trading Signals',
  description: 'AI-powered trading signals for Base chain tokens. Get insights, track performance, and trade smarter.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress Farcaster deprecation warning from Coinbase OnchainKit
              const originalWarn = console.warn;
              console.warn = function(...args) {
                if (args[0] && typeof args[0] === 'string' && args[0].includes('@farcaster/frame-sdk is deprecated')) {
                  return; // Suppress this specific warning
                }
                return originalWarn.apply(console, args);
              };
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
