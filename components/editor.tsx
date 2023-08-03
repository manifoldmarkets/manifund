'use client'
import { EditorContent, Editor, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import clsx from 'clsx'
import { DisplayMention } from './user-mention/mention-extension'
import { generateReact } from './tiptap-utils'
import { DisplayLink } from '@/utils/use-text-editor'

export function TextEditor(props: {
  editor: Editor | null
  children?: React.ReactNode // additional toolbar buttons
}) {
  const { editor, children } = props
  return (
    <div className="relative w-full rounded-lg shadow-sm transition-colors">
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="flex items-center rounded bg-white py-2 shadow"
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={clsx(
              'border-r border-gray-300 px-2 font-bold',
              editor.isActive('bold') ? 'is-active' : ''
            )}
          >
            B
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={clsx(
              'border-r border-gray-300 px-2 italic',
              editor.isActive('bold') ? 'is-active' : ''
            )}
          >
            I
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={clsx(
              'border-r border-gray-300 px-2 line-through',
              editor.isActive('bold') ? 'is-active' : ''
            )}
          >
            S
          </button>
          <span className="px-2 text-sm font-thin">Ctrl + V for hyperlink</span>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} className="w-full" />
      {children}
    </div>
  )
}

// TODO: Extract to server component
export function RichContent(props: {
  content: any // JSONContent | null
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const { className, content, size = 'md' } = props
  if (!content) return null

  const jsxContent = generateReact(content, [
    StarterKit,
    DisplayLink,
    DisplayMention,
  ])

  function proseClass(size: string): import('clsx').ClassValue {
    throw new Error('Function not implemented.')
  }

  return (
    <div
      className={clsx(
        'ProseMirror',
        className,
        proseClass(size),
        String.raw`empty:prose-p:after:content-["\00a0"]` // Make empty paragraphs have height
      )}
    >
      {jsxContent}
    </div>
  )
}
