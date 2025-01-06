import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SupabaseClient } from '@supabase/supabase-js'

export async function listProjectsPaginated(
  supabase: SupabaseClient,
  before?: string | null
) {
  let query = supabase
    .from('projects')
    .select(
      `
      title, 
      id, 
      created_at, 
      creator,
      slug,
      blurb,
      description,
      stage,
      funding_goal,
      min_funding,
      type,
      profiles!projects_creator_fkey(username, full_name),
      txns(amount, token),
      bids(amount, status),
      causes(title, slug)
    `
    )
    .neq('stage', 'hidden')
    .neq('stage', 'draft')
    .order('created_at', { ascending: false })
    .limit(100)

  if (before) {
    const timestamp = new Date(before).toISOString()
    query = query.filter('created_at', 'lt', timestamp)
  }

  const { data } = await query.throwOnError()
  return data
}

// TODO: Could maybe replace all this with static-renderer, once that's more stable
// https://github.com/ueberdosis/tiptap/pull/5528
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Mention from '@tiptap/extension-mention'
import { NodeHtmlMarkdown } from 'node-html-markdown'
import { JSONContent } from '@tiptap/core'

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

  const supabase = createRouteHandlerClient({ cookies })
  const projects = await listProjectsPaginated(supabase, before)

  projects?.map((project) => {
    // Convert Tiptap description to markdown
    project.description = toMarkdown(project.description)

    // Remove txns that are not token = USD
    project.txns = project.txns.filter((txn) => txn.token === 'USD')

    // Remove bids that are not pending
    project.bids = project.bids.filter((bid) => bid.status === 'pending')

    // Convert created_at to ISO string
    project.created_at = new Date(project.created_at).toISOString()
  })

  return NextResponse.json(projects)
}
