import { getProjectById } from '@/db/project'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createEdgeClient } from './_db'
import { getProfileById } from '@/db/profile'
import { getTxnAndProjectsByUser } from '@/db/txn'
import { getPendingBidsByUser } from '@/db/bid'
import { calculateCharityBalance } from '@/utils/math'
import { sendTemplateEmail, TEMPLATE_IDS } from '@/utils/email'
import { getURL } from '@/utils/constants'
import { isAdmin } from '@/db/profile'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  // From https://github.com/lodash/lodash/issues/5525
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

// May add optional project field for regrantors later
type MoneyTransferProps = {
  fromId: string
  toId: string
  amount: number
  projectId?: string
}

export default async function handler(req: NextRequest) {
  const { fromId, toId, amount, projectId } =
    (await req.json()) as MoneyTransferProps
  const supabase = createEdgeClient(req)
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  if (user?.id !== fromId && !isAdmin(user)) {
    return NextResponse.error()
  }
  const profile = await getProfileById(supabase, fromId)
  if (!profile) {
    return NextResponse.error()
  }
  const donor = await getProfileById(supabase, fromId)
  if (!donor) {
    return NextResponse.error()
  }
  const txns = await getTxnAndProjectsByUser(supabase, fromId)
  const bids = await getPendingBidsByUser(supabase, fromId)
  const userSpendableFunds = calculateCharityBalance(
    txns,
    bids,
    fromId,
    profile?.accreditation_status
  )
  if (userSpendableFunds < amount) {
    console.error('not enough funds')
    return NextResponse.error()
  }
  const supabaseAdmin = createAdminClient()
  const { error } = await supabaseAdmin.from('txns').insert({
    from_id: fromId,
    to_id: toId,
    amount: amount,
    token: 'USD',
    project: projectId ?? null,
    type: projectId ? 'project donation' : 'profile donation',
  })
  console.error(error)
  if (projectId) {
    const project = await getProjectById(supabaseAdmin, projectId)
    const postmarkVars = {
      amount: amount,
      donorName: donor.full_name,
      projectTitle: project.title,
      projectUrl: `https://manifund.org/projects/${project.slug}`,
    }
    await sendTemplateEmail(TEMPLATE_IDS.PROJECT_DONATION, postmarkVars, toId)
  } else {
    const regranterProfile = await getProfileById(supabaseAdmin, toId)
    if (!regranterProfile) {
      return NextResponse.error()
    } else if (regranterProfile.type === 'individual') {
      const postmarkVars = {
        amount: amount,
        donorName: donor.full_name,
        profileUrl: `${getURL()}/${regranterProfile.username}`,
      }
      await sendTemplateEmail(
        TEMPLATE_IDS.REGRANTER_DONATION,
        postmarkVars,
        toId
      )
    }
  }

  if (error) {
    return NextResponse.error()
  } else {
    return NextResponse.json('success')
  }
}
