import React from "react";
import { Github, Linkedin, Mail } from "lucide-react";
import { X } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-50 py-12 text-gray-600">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* About */}
        <div>
          <h3 className="text-lg font-bold text-blue-600">LearnTrace</h3>
          <p className="mt-2 text-sm">
            Visual learning made simple. Transform your conversations into
            beautiful, interactive knowledge maps.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>Home</li>
            <li>About</li>
            <li>Features</li>
            <li>Contact</li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="font-semibold mb-3">Connect</h4>
          <div className="flex space-x-4">
            <X className="w-5 h-5" />
            <Github className="w-5 h-5" />
            <Linkedin className="w-5 h-5" />
            <Mail className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} LearnTrace. All rights reserved.
      </div>
    </footer>
  );
}
