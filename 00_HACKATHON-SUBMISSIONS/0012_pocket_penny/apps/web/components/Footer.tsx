import Link from "next/link";

import { Facebook, Instagram, Linkedin, Mail, Twitter } from "lucide-react";

export const Footer = () => (
  <footer id="contact" className="bg-gray-900 py-12 text-white">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-8 grid gap-8 md:grid-cols-4">
        <div>
          <div className="mb-4 flex items-center space-x-2">
            <span className="text-2xl font-bold">💰</span>
            <span className="text-xl font-bold">Pocket Penny</span>
          </div>
          <p className="mb-4 text-gray-400">
            Empowering financial literacy through interactive education and smart technology.
          </p>
          <div className="flex space-x-4">
            {[Twitter, Linkedin, Facebook, Instagram].map((Icon, index) => (
              <Link
                key={index}
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition-colors duration-300 hover:bg-blue-600"
              >
                <Icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-semibold">Platform</h3>
          <ul className="space-y-2 text-gray-400">
            {["Learning Tracks", "Features", "Demo", "API Access"].map((item, index) => (
              <li key={index}>
                <Link href="#" className="transition-colors duration-300 hover:text-white">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-semibold">Support</h3>
          <ul className="space-y-2 text-gray-400">
            {["Help Center", "Documentation", "Community", "Contact Us"].map((item, index) => (
              <li key={index}>
                <Link href="#" className="transition-colors duration-300 hover:text-white">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-semibold">Contact</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center">
              <Mail className="mr-2 h-4 w-4" />
              hello@pocketpenny.io
            </li>
            <li>📞 (555) 123-4567</li>
            <li>📍 San Francisco, CA</li>
            <li>🕒 Mon-Fri 9AM-6PM PST</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
        <p>
          &copy; {new Date().getFullYear()} Pocket Penny. All rights reserved. |
          <Link href="#" className="ml-1 text-blue-400 hover:text-blue-300">
            Privacy Policy
          </Link>{" "}
          |
          <Link href="#" className="ml-1 text-blue-400 hover:text-blue-300">
            Terms of Service
          </Link>
        </p>
      </div>
    </div>
  </footer>
);
