import { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { GeistSans } from 'geist/font/sans';
import { AnimatePresenceWrapper } from "@/components/animate-presence-wrapper";
import { AuthProvider } from "@/components/auth-context";

export const metadata: Metadata = {
  title: {
    default: "Campus Marketplace",
    template: "%s - Campus Marketplace",
  },
  description: "Buy and sell items with fellow students at your school. Safe, moderated marketplace for textbooks, electronics, and more.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning className={GeistSans.className}>
      <body className="antialiased">
        <ThemeProvider defaultTheme="system" storageKey="campus-marketplace-theme">
          <AuthProvider>
            <div className="fixed inset-0 w-full h-full bg-[radial-gradient(circle_800px_at_100%_200px,var(--gradient-start),var(--gradient-end))] -z-10 theme-bg" />
            <AnimatePresenceWrapper>
              <div className="relative min-h-screen flex flex-col">
                <main className="flex-grow">{children}</main>
              </div>
            </AnimatePresenceWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}