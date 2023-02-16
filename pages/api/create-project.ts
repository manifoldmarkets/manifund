import { Database } from '@/utils/database.types'
import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

type Project = Database['public']['Tables']['projects']['Row']

type ProjectProps = {
  title: string
  blurb: string
}

export default async function handler(req: NextRequest) {
  const { title, blurb } = (await req.json()) as ProjectProps
  const res = NextResponse.next()
  const supabase = createMiddlewareSupabaseClient<Database>(
    {
      req,
      res,
    },
    {
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    }
  )

  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  if (!user) return NextResponse.error()

  // TODO: Ensure slug is valid, and append a random string if not
  const slug = title.toLowerCase().replace(/ /g, '-')

  const project = {
    title,
    blurb,
    creator: user?.id,
    slug,
  }

  await supabase.from('projects').insert([project])
  return NextResponse.json(project)
}
