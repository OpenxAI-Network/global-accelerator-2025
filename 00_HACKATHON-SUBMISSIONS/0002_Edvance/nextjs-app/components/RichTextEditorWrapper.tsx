'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import SimpleTextEditor, { SimpleTextDisplay } from './SimpleTextEditor'

// Dynamically import RichTextEditor to avoid SSR hydration issues
const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="border-b border-gray-200 p-3 bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-1">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
      <div className="p-4 min-h-[200px] bg-white">
        <div className="text-gray-400">Loading editor...</div>
      </div>
    </div>
  )
})

// Also create a dynamic import for the markdown renderer
const MarkdownRenderer = dynamic(() => import('./MarkdownRenderer'), {
  ssr: false,
  loading: () => <SimpleTextDisplay content="Loading..." />,
  onError: () => <SimpleTextDisplay content="Error loading rich text renderer" />
})

interface RichTextEditorWrapperProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

interface MarkdownRendererWrapperProps {
  content: string
  className?: string
}

export default function RichTextEditorWrapper({
  content,
  onChange,
  placeholder = "Write your answer here...",
  className = ""
}: RichTextEditorWrapperProps) {
  return (
    <RichTextEditor
      content={content}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  )
}

export function MarkdownRendererWrapper({ content, className = "" }: MarkdownRendererWrapperProps) {
  // Check if content contains HTML tags
  const hasHtmlTags = /<[^>]*>/g.test(content)
  
  if (hasHtmlTags) {
    // If content has HTML tags, render as HTML
    return (
      <div 
        className={`prose prose-sm max-w-none ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  } else {
    // If content is plain text or markdown, use the markdown renderer
    return (
      <MarkdownRenderer
        content={content}
        className={className}
      />
    )
  }
}

// Export the simple components for fallback use
export { SimpleTextEditor, SimpleTextDisplay }
