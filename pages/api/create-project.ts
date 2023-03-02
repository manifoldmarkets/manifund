import { Database } from '@/db/database.types'
import { SupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'
import uuid from 'react-uuid'
import { createEdgeClient } from './_db'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

type ProjectProps = {
  title: string
  blurb: string
  description: any
  min_funding: number
  founder_portion: number
  round: string
  auction_close: string
}

export default async function handler(req: NextRequest) {
  const {
    title,
    blurb,
    description,
    min_funding,
    founder_portion,
    round,
    auction_close,
  } = (await req.json()) as ProjectProps
  const supabase = createEdgeClient(req)
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
  const id = uuid()
  const project = {
    id,
    title,
    blurb,
    description,
    min_funding,
    founder_portion,
    creator: user?.id,
    slug,
    round,
    auction_close,
  }

  const { error } = await supabase.from('projects').insert([project])
  if (error) {
    console.error('create-project', error)
  }
  addTxn(supabase, id, user.id)
  return NextResponse.json(project)
}

async function addTxn(supabase: SupabaseClient, id: string, creator: string) {
  const txn = {
    from_id: null,
    to_id: creator,
    amount: 10000000,
    token: id,
    project: id,
  }
  const { error } = await supabase.from('txns').insert([txn])
  if (error) {
    console.error('create-project', error)
  }
}
