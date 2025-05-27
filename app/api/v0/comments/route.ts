import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/db/database.types'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/db/env'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Mention from '@tiptap/extension-mention'
import { NodeHtmlMarkdown } from 'node-html-markdown'
import { JSONContent } from '@tiptap/core'

async function listCommentsPaginated(
  supabase: SupabaseClient,
  before?: string | null
) {
  let query = supabase
    .from('comments')
    .select(
      `
      id,
      created_at,
      content,
      commenter,
      project,
      profiles!comments_commenter_fkey(username, full_name),
      projects(title, slug)
    `
    )
    .order('created_at', { ascending: false })
    .limit(100)

  if (before) {
    const timestamp = new Date(before).toISOString()
    query = query.filter('created_at', 'lt', timestamp)
  }

  const { data } = await query.throwOnError()
  return data
}

const extensions = [StarterKit, Link, Image, Mention]

function toMarkdown(content: JSONContent) {
  try {
    const html = generateHTML(content, extensions)
    const nhm = new NodeHtmlMarkdown()
    return nhm.translate(html)
  } catch (e) {
    console.error(e)
    return content
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const before = searchParams.get('before')

  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    SUPABASE_URL!,
    SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
  const comments = await listCommentsPaginated(supabase, before)

  comments?.map((comment) => {
    // Convert Tiptap content to markdown
    comment.content = toMarkdown(comment.content)
    // Convert created_at to ISO string
    comment.created_at = new Date(comment.created_at).toISOString()
  })

  return NextResponse.json(comments)
}
