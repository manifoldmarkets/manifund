import { NextRequest, NextResponse } from 'next/server'
import { createEdgeClient } from './_db'
import { getTxnAndProjectsByUser } from '@/db/txn'
import { getPendingBidsByUser } from '@/db/bid'
import { calculateCharityBalance } from '@/utils/math'
import { getProfileById } from '@/db/profile'
import { tippedRxns } from '@/components/comment-rxn'
import { getMinimalCommentFromId } from '@/db/comment'
import uuid from 'react-uuid'
import { sendTemplateEmail, TEMPLATE_IDS } from '@/utils/email'

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

  const reactionPrice = tippedRxns[reaction] ?? 0
  const txnId = uuid()
  if (reactionPrice > 0) {
    const userProfile = await getProfileById(supabase, user.id)
    if (!userProfile) {
      return NextResponse.error()
    }
    const txns = await getTxnAndProjectsByUser(supabase, user.id)
    const bids = await getPendingBidsByUser(supabase, user.id)
    const userSpendableFunds = calculateCharityBalance(
      txns,
      bids,
      user.id,
      userProfile.accreditation_status
    )
    if (userSpendableFunds < reactionPrice) {
      console.error('not enough funds')
      return NextResponse.error()
    } else {
      const comment = await getMinimalCommentFromId(supabase, commentId)
      if (!comment) {
        return NextResponse.error()
      }
      await supabase.from('txns').insert({
        id: txnId,
        from_id: user.id,
        to_id: comment.commenter,
        amount: reactionPrice,
        token: 'USD',
        type: 'tip',
      })
      await sendTemplateEmail(
        TEMPLATE_IDS.GENERIC_NOTIF,
        {
          subject: `You received a $${reactionPrice} tip for your comment on Manifund`,
          notifText: `${userProfile.full_name} tipped you $${reactionPrice} for a comment you made on Manifund, which you can now pass on to the charity or project of your choice. Thanks for your contribution to the discussion!`,
          buttonUrl: `https://manifund.org/projects/${comment.projects.slug}?tab=comments#${commentId}`,
          buttonText: 'View comment',
        },
        comment.commenter
      )
    }
  }

  const newRxn =
    reactionPrice > 0
      ? {
          comment_id: commentId,
          reactor_id: user.id,
          reaction,
          txn_id: txnId,
        }
      : {
          comment_id: commentId,
          reactor_id: user.id,
          reaction,
        }
  const { data: existingRxn } = await supabase
    .from('comment_rxns')
    .select('comment_id')
    .match(newRxn)
    .maybeSingle()
    .throwOnError()
  if (!!existingRxn) {
    await supabase.from('comment_rxns').delete().match(newRxn).throwOnError()
  } else {
    await supabase.from('comment_rxns').insert(newRxn).throwOnError()
  }

  return NextResponse.json('success')
}
