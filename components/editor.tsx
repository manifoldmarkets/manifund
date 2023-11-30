'use client'
import { EditorContent, Editor, BubbleMenu } from '@tiptap/react'
import clsx from 'clsx'
import { generateReact } from './tiptap-utils'
import { proseClass } from '@/hooks/use-text-editor'
import { LinkIcon, ListBulletIcon } from '@heroicons/react/20/solid'
import { useRouter } from 'next/navigation'
import { clearLocalStorageItem } from '@/hooks/use-local-storage'
import { Button } from './button'
import { DisplayMention } from '@/components/user-mention/mention-extension'
import { DisplayLink } from '@/hooks/use-text-editor'
import StarterKit from '@tiptap/starter-kit'
import { DisplayImage } from './editor/image'

export const TIPTAP_EXTENSIONS = [
  StarterKit,
  DisplayLink,
  DisplayMention,
  DisplayImage,
]

export function TextEditor(props: {
  editor: Editor | null
  children?: React.ReactNode // Additional toolbar buttons
}) {
  const { editor, children } = props
  return (
    <div className="relative min-h-[5em] w-full rounded-lg text-gray-900 shadow-sm transition-colors">
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="flex items-center rounded bg-white py-2 shadow"
        >
          <div className="border-r border-gray-300 px-1">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={clsx(
                'rounded px-2 py-0.5 font-bold',
                editor.isActive('bold') && 'bg-gray-200'
              )}
            >
              B
            </button>
          </div>
          <div className="border-r border-gray-300 px-1">
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={clsx(
                'rounded py-0.5 pl-2 pr-3 italic',
                editor.isActive('italic') && 'bg-gray-200'
              )}
            >
              I
            </button>
          </div>
          <div className="border-r border-gray-300 px-1">
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={clsx(
                'rounded px-2 py-0.5 line-through',
                editor.isActive('strike') && 'bg-gray-200'
              )}
            >
              S
            </button>
          </div>
          <div className="border-r border-gray-300 px-1">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={clsx(
                'flex flex-col justify-center rounded px-1.5 py-1',
                editor.isActive('bulletList') && 'bg-gray-200'
              )}
            >
              <ListBulletIcon className="h-5 w-5 stroke-2" />
            </button>
          </div>
          <div className="border-r border-gray-300 px-1">
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={clsx(
                'flex flex-col justify-center rounded px-2 py-0.5',
                editor.isActive('orderedList') && 'bg-gray-200'
              )}
            >
              1.
            </button>
          </div>
          <span className="px-2 text-xs font-thin">
            <LinkIcon className="mr-1 inline-block h-4 w-4 stroke-1" />
            paste url over text
          </span>
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
  const jsxContent = generateReact(content, TIPTAP_EXTENSIONS)
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

export function ResetEditor(props: {
  storageKey: string
  editor: Editor | null
  defaultContent: string
}) {
  const { storageKey, editor, defaultContent } = props
  const router = useRouter()
  return (
    <Button
      onClick={() => {
        clearLocalStorageItem(storageKey)
        editor?.commands.setContent(defaultContent)
        router.refresh()
      }}
      color="gray"
      size="xs"
    >
      Reset editor
    </Button>
  )
}
