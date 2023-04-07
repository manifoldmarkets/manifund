'use client'
import Link from '@tiptap/extension-link'
import {
  useEditor,
  EditorContent,
  Editor,
  mergeAttributes,
  generateHTML,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import clsx from 'clsx'
import { DisplayMention } from './user-mention/mention-extension'
import { linkClass } from './site-link'
import { generateReact } from './tiptap-utils'

export function useTextEditor(content?: any) {
  console.log('content', content)
  const editor = useEditor({
    editorProps: {
      attributes: {
        class: clsx(
          proseClass('md'),
          'focus:border-orange-500 focus:ring-orange-500 py-[.5em] px-4 h-full bg-white border border-gray-300 rounded-md min-h-[5em]'
        ),
      },
    },
    extensions: [StarterKit, DisplayLink, DisplayMention],
    content: content ?? '<p>Edit here...</p>',
  })
  return editor
}

export function TextEditor(props: { editor: Editor | null }) {
  const { editor } = props
  return <EditorContent editor={editor} />
}

// From Manifold's editor
const proseClass = (size: 'sm' | 'md' | 'lg') =>
  clsx(
    'prose max-w-none leading-relaxed',
    'prose-a:text-orange-600 prose-a:no-underline',
    size === 'sm' ? 'prose-sm' : 'text-md',
    size !== 'lg' && 'prose-p:my-0 prose-ul:my-0 prose-ol:my-0 prose-li:my-0',
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

  console.log(jsxContent)
  return (
    <div
      className={clsx(
        'ProseMirror',
        className,
        proseClass(size),
        String.raw`empty:prose-p:after:content-["\00a0"]` // make empty paragraphs have height
      )}
    >
      {jsxContent}
    </div>
  )
}

const DisplayLink = Link.extend({
  renderHTML({ HTMLAttributes }) {
    delete HTMLAttributes.class // only use our classes (don't duplicate on paste)
    return ['a', mergeAttributes(HTMLAttributes, { class: linkClass }), 0]
  },
})
