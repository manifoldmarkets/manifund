'use client'
import Link from '@tiptap/extension-link'
import {
  useEditor,
  EditorContent,
  Editor,
  mergeAttributes,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import clsx from 'clsx'
import { DisplayMention } from './user-mention/mention-extension'
import { linkClass } from './site-link'
import { generateReact } from './tiptap-utils'
import Placeholder from '@tiptap/extension-placeholder'
import useLocalStorage from '@/hooks/use-local-storage'
import { noop } from 'lodash'

export function useTextEditor(
  defaultContent?: any,
  className?: string,
  placeholder?: string,
  key?: string
) {
  const [content, saveContent] = useLocalStorage('', key)

  const editor = useEditor({
    editorProps: {
      attributes: {
        class: clsx(
          proseClass('md'),
          'py-[.5em] px-4 h-full bg-white border border-gray-300 rounded-md min-h-[5em] focus:outline-orange-500',
          className
        ),
      },
    },
    onUpdate: !key
      ? noop
      : ({ editor }) => {
          saveContent(editor.getJSON())
        },
    extensions: [
      StarterKit,
      DisplayLink,
      DisplayMention,
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          'before:content-[attr(data-placeholder)] before:text-gray-500 before:float-left before:h-0 cursor-text',
      }),
    ],
    content: (key && content ? content : '') ?? defaultContent,
  })
  return editor
}

export function TextEditor(props: {
  editor: Editor | null
  children?: React.ReactNode // Additional toolbar buttons
}) {
  const { editor, children } = props
  return (
    <div className="relative w-full rounded-lg shadow-sm transition-colors">
      <EditorContent editor={editor} className="w-full" />
      {children}
    </div>
  )
}

// From Manifold's editor
const proseClass = (size: 'sm' | 'md' | 'lg') =>
  clsx(
    'prose max-w-none leading-relaxed',
    'prose-a:text-orange-600 prose-a:no-underline',
    size === 'sm' ? 'prose-sm' : 'text-md',
    size === 'sm' && 'prose-p:my-0 prose-ul:my-0 prose-ol:my-0 prose-li:my-0',
    size === 'md' && 'prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-2',
    '[&>p]:prose-li:my-0',
    'text-gray-900 prose-blockquote:text-gray-600',
    'prose-a:font-light prose-blockquote:font-light font-light',
    'break-anywhere'
  )

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

export const DisplayLink = Link.extend({
  renderHTML({ HTMLAttributes }) {
    delete HTMLAttributes.class // Only use our classes (don't duplicate on paste)
    return ['a', mergeAttributes(HTMLAttributes, { class: linkClass }), 0]
  },
})
