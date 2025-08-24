import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stranded Island Adventure - Choose Your Own Adventure Game",
  description: "An AI-powered choose-your-own-adventure story where you wake up stranded on a mysterious tropical island. Make choices, survive, and discover the truth about what happened to you.",
  keywords: "choose your own adventure, AI game, stranded island, survival game, interactive story",
  authors: [{ name: "AI Adventure Game" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
