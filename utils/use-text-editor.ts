'use client'
import Link from '@tiptap/extension-link'
import { mergeAttributes, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import clsx from 'clsx'
import { DisplayMention } from '@/components/user-mention/mention-extension'
import Placeholder from '@tiptap/extension-placeholder'

export function useTextEditor(
  content?: any,
  className?: string,
  placeholder?: string
) {
  const editor = useEditor({
    editorProps: {
      attributes: {
        class: clsx(
          proseClass('md'),
          'p-3 h-full bg-white border border-gray-300 rounded-md focus:outline-orange-500',
          className
        ),
      },
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
      // BubbleMenu.configure({
      //   element: document?.querySelector('.menu') as HTMLElement,
      // }),
    ],
    content: content ?? '',
  })
  return editor
}

// From Manifold's editor
export const proseClass = (size: 'sm' | 'md' | 'lg') =>
  clsx(
    'prose leading-relaxed max-w-none',
    'prose-a:text-orange-600 prose-a:no-underline',
    size === 'sm' ? 'prose-sm' : 'text-md',
    size === 'sm' && 'prose-p:my-0 prose-ul:my-0 prose-ol:my-0 prose-li:my-0',
    size === 'md' && 'prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-2',
    '[&>p]:prose-li:my-0',
    'text-gray-900 prose-blockquote:text-gray-600',
    'prose-a:font-light prose-blockquote:font-light font-light',
    'break-anywhere'
  )

export const DisplayLink = Link.extend({
  renderHTML({ HTMLAttributes }) {
    delete HTMLAttributes.class // Only use our classes (don't duplicate on paste)
    return [
      'a',
      mergeAttributes(HTMLAttributes, {
        class: 'text-orange-600 hover:underline font-normal',
      }),
      0,
    ]
  },
})
