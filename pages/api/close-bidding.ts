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
    const bids = await getBids(supabase, id);

    if (!bids) return NextResponse.error();
let i = 0;
let total_funding = 0;
let investor_shares = 10000000 - founder_portion;
let project_funded = false;
while (i < bids.length && !project_funded) {
    let valuation = bids[i].valuation;
    total_funding += bids[i].amount;
    let unbought_shares = investor_shares - total_funding * 10000000/valuation;
    if (unbought_shares <= 0) {
        createTxns(supabase, id, bids, i, bids[i].amount * 10000000/valuation - unbought_shares);
        project_funded = true;
    } else if (i == bids.length - 1 && total_funding > min_funding) {
        createTxns(supabase, id, bids, i, bids[i].amount);
        project_funded = true;
    }
    i++;
}

if (!project_funded){
    return NextResponse.json('project not funded')
}
  return NextResponse.json('project funded!')
}


async function getBids(supabase: SupabaseClient, project_id: string) {   
    
    const { data, error } = await supabase
        .from('bids')
        .select()
        .eq('project', project_id)
        .order('valuation', { ascending: false })
    if (error) {
        console.error(error)
    }
    return data;
}

async function createTxns(supabase: SupabaseClient, project_id: string, bids: Bid[], last_bid_idx: number, last_bid_amount: number) {
    //create txn for each bid that goes through
    let valuation = bids[last_bid_idx].valuation;
    for (let i = 0; i < last_bid_idx + 1; i++) {
            let amount = i == last_bid_idx ? Math.round(last_bid_amount) : Math.round(bids[i].amount * 10000000/valuation);
            createTxn(supabase, bids[i].bidder, amount, project_id)
        }
    }

async function createTxn(supabase: SupabaseClient, to_id: string, amount: number, token: string) {
    let txn = {
        from_id: null,
        to_id: to_id,
        amount: amount,
        token: token
    }
    const { error } = await supabase.from('txns').insert([txn])
    if (error) {
        console.error(error)
    }
}