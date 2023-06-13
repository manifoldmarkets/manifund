import { getProjectById } from '@/db/project'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createEdgeClient } from './_db'
import { getProfileById } from '@/db/profile'
import { getTxnsByUser } from '@/db/txn'
import { getBidsByUser } from '@/db/bid'
import { getProjectsPendingTransferByUser } from '@/db/project'
import { calculateUserSpendableFunds } from '@/utils/math'
import { sendTemplateEmail } from '@/utils/email'
import { getURL } from '@/utils/constants'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
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
  if (user?.id !== fromId) {
    return NextResponse.error()
  }
  const profile = await getProfileById(supabase, user?.id)
  const txns = await getTxnsByUser(supabase, user?.id ?? '')
  const bids = await getBidsByUser(supabase, user?.id ?? '')
  const projectsPendingTransfer = await getProjectsPendingTransferByUser(
    supabase,
    user?.id ?? ''
  )
  const userSpendableFunds = calculateUserSpendableFunds(
    txns,
    user.id,
    bids,
    projectsPendingTransfer,
    profile?.accreditation_status as boolean
  )
  if (userSpendableFunds < amount) {
    return NextResponse.error()
  }
  const supabaseAdmin = createAdminClient()
  const { error } = await supabaseAdmin.from('txns').insert({
    from_id: fromId,
    to_id: toId,
    amount: amount,
    token: 'USD',
    project: projectId ?? null,
  })

  const donor = await getProfileById(supabaseAdmin, fromId)
  if (!donor) {
    return NextResponse.error()
  }
  if (projectId) {
    const project = await getProjectById(supabaseAdmin, projectId)
    const postmarkVars = {
      amount: amount,
      donorName: donor.full_name,
      projectTitle: project.title,
      projectUrl: `https://manifund.org/projects/${project.slug}`,
    }
    const PROJECT_DONATION_TEMPLATE_ID = 31534853
    await sendTemplateEmail(PROJECT_DONATION_TEMPLATE_ID, postmarkVars, toId)
  } else {
    const regranterProfile = await getProfileById(supabaseAdmin, toId)
    if (!regranterProfile) {
      return NextResponse.error()
    }
    const postmarkVars = {
      amount: amount,
      donorName: donor.full_name,
      profileUrl: `${getURL()}/${regranterProfile.username}`,
    }
    const REGRANTER_DONATION_TEMPLATE_ID = 31571248
    await sendTemplateEmail(REGRANTER_DONATION_TEMPLATE_ID, postmarkVars, toId)
  }

  if (error) {
    return NextResponse.error()
  } else {
    return NextResponse.json('success')
  }
}
