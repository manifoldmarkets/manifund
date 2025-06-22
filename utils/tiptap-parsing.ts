import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Mention from '@tiptap/extension-mention'
import { NodeHtmlMarkdown } from 'node-html-markdown'
import { JSONContent, generateText } from '@tiptap/core'

const extensions = [StarterKit, Link, Image, Mention]

export function toMarkdown(content: JSONContent): string {
  try {
    const html = generateHTML(content, extensions)
    const nhm = new NodeHtmlMarkdown()
    return nhm.translate(html)
  } catch (e) {
    console.error('Error converting Tiptap content:', e)
    return ''
  }
}

export function toPlaintext(content: JSONContent): string {
  try {
    const text = generateText(content, extensions)
    return text.trim()
  } catch (e) {
    console.error('Error converting Tiptap content:', e)
    return ''
  }
}
