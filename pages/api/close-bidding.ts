import { Database } from '@/db/database.types'
import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { SupabaseClient } from '@supabase/supabase-js'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

type Bid = Database['public']['Tables']['bids']['Row']
type Txn = Database['public']['Tables']['txns']['Row']

type BidProps = {
  created_at: Date
  project: string
  bidder: string
  amount: number
  valuation: number
}

type ProjectProps = {
    id: string
    title: string
    blurb: string
    min_funding: number
    founder_portion: number
}

export default async function handler(req: NextRequest) {
  const { id, title, blurb, min_funding, founder_portion 
} =
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
    console.log('project id as seen by server', id);
    const { data, error } = await supabase
    .from('bids')
    .select()
    .eq('project', id)
    .order('amount', { ascending: false })
if (error) {
    console.error(error)
}
console.log('og bids', data)

const bids = data;
  console.log('bids', bids)

//   const project = {
//     title,
//     blurb,
//     min_funding,
//     founder_portion,
//     creator: user?.id,
//     slug,
//   }

//   const { error } = await supabase.from('projects').insert([project])
//   if (error) {
//     console.error(error)
//   }
  return NextResponse.json('ok')
}


async function getBids(supabase: SupabaseClient, project_id: string) {   
    
    const { data, error } = await supabase
        .from('bids')
        .select()
        .eq('project', project_id)
        .order('amount', { ascending: false })
    if (error) {
        console.error(error)
    }
    console.log('og bids', data)
    return data;
}