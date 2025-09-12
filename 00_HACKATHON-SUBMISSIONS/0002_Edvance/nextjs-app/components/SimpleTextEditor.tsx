'use client'

import { useState } from 'react'

interface SimpleTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

export default function SimpleTextEditor({ content, onChange, placeholder = "Write your answer here...", className = "" }: SimpleTextEditorProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Simple Toolbar */}
      <div className="border-b border-gray-200 p-3 bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 font-medium">Simple Text Editor</span>
          <span className="text-xs text-gray-500">(Rich text editor loading...)</span>
        </div>
      </div>
      
      {/* Textarea */}
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={`w-full min-h-[200px] p-4 focus:outline-none resize-y ${
          isFocused ? 'bg-white' : 'bg-gray-50'
        }`}
        style={{ fontFamily: 'inherit' }}
      />
    </div>
  )
}

export function SimpleTextDisplay({ content, className = "" }: { content: string; className?: string }) {
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
        {content}
      </div>
    </div>
  )
}
