"use client"

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import audio_logo from "../../../public/audio-up-logo.png"
import search_logo from "../../../public/search-logo.png"
import img_up_logo from "../../../public/img-up.png"

// Dummy data for search results
const searchData = [
  { id: 1, title: "Heart Beat Detect", link: "/heartbeatDetect" },
  { id: 2, title: "Lung Cancer", link: "/lungprediction" },
  { id: 3, title: "Contribute", link: "/contribute" },
  { id: 4, title: "Recommendation", link: "/recommend-hospitals" },
  { id: 5, title: "Register Record", link: "/register-record" },
  { id: 6, title: "Contact", link: "/contact" },
  { id: 7, title: "Chatbot", link: "/chatbot" },
  { id: 8, title: "Bone Fracture Detect", link: "/boneFractureDetect" },
]

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<typeof searchData>([])
  const [isDropdownVisible, setIsDropdownVisible] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)

    if (term.length > 0) {
      const filteredResults = searchData.filter(item =>
        item.title.toLowerCase().includes(term.toLowerCase())
      )
      setSearchResults(filteredResults)
      setIsDropdownVisible(true)
    } else {
      setSearchResults([])
      setIsDropdownVisible(false)
    }
  }

  return (
    <div className="relative w-[30vw]  mt-3">
      <div className="input-sec flex border shadow-gray-300 bg-white w-full gap-2 p-3 rounded-3xl mt-5 relative z-40">
        <input
          className="bg-transparent outline-none border-none flex-grow"
          type="text"
          placeholder="Search Your Product"
          value={searchTerm}
          onChange={handleSearch}
        />
        <div className="myicons flex gap-3">
          <Image className="h-8 w-8 cursor-pointer" src={search_logo || "/placeholder.svg"} alt="Search" />
          <Image className="h-8 w-8 cursor-pointer" src={img_up_logo || "/placeholder.svg"} alt="Image Upload" />
          <Image className="h-8 w-8 cursor-pointer" src={audio_logo || "/placeholder.svg"} alt="Audio Search" />
        </div>
      </div>
      {isDropdownVisible && searchResults.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute w-full mt-2 bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out z-50"
        >
          {searchResults.map((result) => (
            <Link key={result.id} href={result.link}>
              <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-200">
                {result.title}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchBar
