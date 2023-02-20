import { Database } from '@/db/database.types'
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
  description: any
  min_funding: number
  founder_portion: number
}

export default async function handler(req: NextRequest) {
  const { title, blurb, description, min_funding, founder_portion } =
    (await req.json()) as ProjectProps
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

  console.log('founder_portion', founder_portion)

  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  if (!user) return NextResponse.error()

  let slug = title
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
  const { data } = await supabase
    .from('projects')
    .select('slug')
    .eq('slug', slug)
  if (data && data.length > 0) {
    slug = slug + '-' + Math.random().toString(36).substring(2, 15)
  }

  const project = {
    title,
    blurb,
    description,
    min_funding,
    founder_portion,
    creator: user?.id,
    slug,
  }

  const { error } = await supabase.from('projects').insert([project])
  if (error) {
    console.error(error)
  }
  return NextResponse.json(project)
}
