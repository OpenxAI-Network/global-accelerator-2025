"use client"
import Link from "next/link"
import type React from "react"
import { useState } from "react"
import logo1 from "../../../public/logo1.png"
import logo2 from "../../../public/logo2.png"
import { signOut, useSession } from "next-auth/react"

interface DropdownProps {
  title: string
  items: { label: string; href: string }[]
}

const Dropdown: React.FC<DropdownProps> = ({ title, items }) => {
  return (
    <div className="group relative inline-block">
      <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 focus:outline-none">
        {title}
        <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <div className="absolute  left-0 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
        <div className="py-1" role="menu" aria-orientation="vertical">
          {items.map((item, index) => (
            <Link key={index} href={item.href}>
              <span
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
              >
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export const Navbar: React.FC = () => {
  const { data: session, status } = useSession()

  const resourcesDropdown = {
    title: "Models",
    items: [
      { label: "Pneunomia Detection", href: "/lungprediction" },
      { label: "Heart Beat Sensing", href: "/heartBeatDetect" },
      { label: "Bone Fracture", href: "/boneFractureDetect" },
      { label: "Chatbot", href: "/chatbot" },
    ],
  }

  const communityDropdown = {
    title: "Community",
    items: [
      { label: "contact", href: "/contact" },
      { label: "faq", href: "/faq" },
      { label: "aboutUs", href: "/aboutUs" },
    ],
  }
  const storageDropdown = {
    title: "Records",
    items: [
      { label: "Add Record", href: "/register-record" },
      { label: "Fetch Record", href: "/fetch-records" },
      { label: "Analysis Record", href: "/recommend-hospitals" },
    ],
  }

  return (
    <nav className="shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <div className="flex items-center gap-1">
              <img className="h-7" src={logo1.src || "/placeholder.svg"} alt="Logo 1" />
              <img className="h-12 mb-4" src={logo2.src || "/placeholder.svg"} alt="Logo 2" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/">
              <span className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                Home
              </span>
            </Link>
            <Dropdown {...resourcesDropdown} />
            <Link href="/stories">
              <span className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                Stories
              </span>
            </Link>
            <Dropdown {...communityDropdown} />
            <Dropdown {...storageDropdown} />
            {status === "authenticated" ? (
              <button
                onClick={() => signOut()}
                className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-700 hover:to-violet-700 transition-colors duration-300"
              >
                Log Out
              </button>
            ) : (
              <Link href="/verify">
                <span className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-700 hover:to-violet-700 transition-colors duration-300">
                  Log In
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

