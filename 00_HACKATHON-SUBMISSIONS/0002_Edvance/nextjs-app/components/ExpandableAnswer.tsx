'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { MarkdownRendererWrapper } from './RichTextEditorWrapper'

interface ExpandableAnswerProps {
  content: string
  className?: string
  maxLines?: number
}

export default function ExpandableAnswer({ 
  content, 
  className = "", 
  maxLines = 10 
}: ExpandableAnswerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [shouldShowExpand, setShouldShowExpand] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      const element = contentRef.current
      
      // Use a more reliable method to check if content is truncated
      const isTruncated = element.scrollHeight > element.clientHeight
      setShouldShowExpand(isTruncated)
    }
  }, [content])

  // Calculate the max height based on line height and max lines
  const getMaxHeight = () => {
    if (contentRef.current) {
      const computedStyle = window.getComputedStyle(contentRef.current)
      const lineHeight = parseFloat(computedStyle.lineHeight) || 24 // fallback to 24px
      return `${lineHeight * maxLines}px`
    }
    return `${24 * maxLines}px` // fallback
  }

  return (
    <div className={className}>
      <div 
        ref={contentRef}
        className={`overflow-hidden transition-all duration-300 ease-in-out`}
        style={{
          maxHeight: isExpanded ? 'none' : getMaxHeight()
        }}
      >
        <MarkdownRendererWrapper content={content} />
      </div>
      
      {shouldShowExpand && (
        <div className="mt-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors hover:bg-blue-50 px-2 py-1 rounded"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show more
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
