"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-background border-b border-border shadow-soft">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-primary font-bold text-2xl font-sans hover:text-primary-dark transition ease-in-out"
        >
          LearnTrace
        </Link>
        <div className="hidden md:flex space-x-10 font-sans text-text">
          <Link href="/" className="hover:text-primary transition">
            Home
          </Link>
          <Link href="/chat" className="hover:text-primary transition">
            Chat
          </Link>
          <Link href="/graph" className="hover:text-primary transition">
            Graph
          </Link>
          <Link href="/about" className="hover:text-primary transition">
            About
          </Link>
        </div>
      </div>
    </nav>
  );
}
