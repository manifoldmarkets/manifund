import { NextRequest, NextResponse } from 'next/server'
import { createEdgeClient } from './_db'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  // From https://github.com/lodash/lodash/issues/5525
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

type RxnProps = {
  commentId: string
  reaction: string
}

export default async function handler(req: NextRequest) {
  const { commentId, reaction } = (await req.json()) as RxnProps
  const supabase = createEdgeClient(req)
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  if (!user) return NextResponse.error()
  // TODO: add txn for paid reactions
  const newRxn = { comment_id: commentId, reactor_id: user.id, reaction }
  const { data: existingRxn, error: error0 } = await supabase
    .from('comment_rxns')
    .select('comment_id')
    .match(newRxn)
    .maybeSingle()
  if (error0) {
    console.error('0', error0)
    return NextResponse.error()
  }
  if (!!existingRxn) {
    const { error } = await supabase.from('comment_rxns').delete().match(newRxn)
    if (error) {
      console.error('1', error)
      return NextResponse.error()
    }
  } else {
    const { error } = await supabase.from('comment_rxns').insert(newRxn)
    if (error) {
      console.error('2', error)
      return NextResponse.error()
    }
  }

  console.log(reaction)
  return NextResponse.json('success')
}
