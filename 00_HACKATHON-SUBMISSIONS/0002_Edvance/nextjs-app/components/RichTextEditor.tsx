'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CodeBlock from '@tiptap/extension-code-block'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  return (
    <div className="border-b border-gray-200 p-3 bg-gray-50 rounded-t-lg">
      <div className="flex items-center space-x-1">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('bold') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
          }`}
        >
          <Bold className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('italic') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
          }`}
        >
          <Italic className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
          }`}
        >
          <Heading1 className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
          }`}
        >
          <Heading2 className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
          }`}
        >
          <Heading3 className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('bulletList') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
          }`}
        >
          <List className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('orderedList') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
          }`}
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('blockquote') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
          }`}
        >
          <Quote className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('codeBlock') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
          }`}
        >
          <Code className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-600 disabled:opacity-50"
        >
          <Undo className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-600 disabled:opacity-50"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default function RichTextEditor({ content, onChange, placeholder = "Write your answer here...", className = "" }: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit,
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto',
        },
      }),
      Highlight,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
    immediatelyRender: false, // Fix SSR hydration issues
  })

  // Don't render on server-side to prevent hydration mismatch
  if (!isMounted || !editor) {
    return (
      <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
        <div className="border-b border-gray-200 p-3 bg-gray-50 rounded-t-lg">
          <div className="flex items-center space-x-1">
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="p-4 min-h-[200px] bg-white">
          <div className="text-gray-400">{placeholder}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      <MenuBar editor={editor} />
      <EditorContent 
        editor={editor} 
        className="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none"
      />
    </div>
  )
}

export function RichTextDisplay({ content, className = "" }: { content: string; className?: string }) {
  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
