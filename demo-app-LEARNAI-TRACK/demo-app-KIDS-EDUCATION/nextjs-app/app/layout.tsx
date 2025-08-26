import type { Metadata } from 'next';
import { MiniKitContextProvider } from '../providers/MiniKitProvider';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  return {
    title: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || '🌟 Kids Learning Adventure 🌟',
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Fun games and AI learning buddy for curious minds!',
    icons: {
      icon: process.env.NEXT_PUBLIC_APP_ICON || '⭐',
      shortcut: process.env.NEXT_PUBLIC_APP_ICON || '⭐',
      apple: process.env.NEXT_PUBLIC_APP_ICON || '⭐',
    },
    other: {
      'fc:frame': JSON.stringify({
        version: 'next',
        imageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE || `${URL}/og.png`,
        button: {
          title: `Launch ${process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || 'Kids Learning Adventure'}`,
          action: {
            type: 'launch_frame',
            name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || 'Kids Learning Adventure',
            url: URL,
            splashImageUrl: process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE || `${URL}/splash.png`,
            splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || '#6366f1',
          },
        },
      }),
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⭐</text></svg>" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress Farcaster warnings in development
              if (typeof window !== 'undefined') {
                window.addEventListener('error', function(e) {
                  if (e.message.includes('Farcaster')) {
                    e.preventDefault();
                    return false;
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body>
        <MiniKitContextProvider>
          {children}
        </MiniKitContextProvider>
      </body>
    </html>
  );
}
