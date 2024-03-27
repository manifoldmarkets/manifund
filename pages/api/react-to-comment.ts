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
  const { error } = await supabase
    .from('comment_rxns')
    .insert({ comment_id: commentId, reaction, reactor_id: user.id })
  if (error) {
    console.error(error)
    return NextResponse.error()
  }
  console.log(reaction)
  return NextResponse.json('success')
}
