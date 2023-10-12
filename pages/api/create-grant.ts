import { getProfileByUsername } from '@/db/profile'
import { Project, TOTAL_SHARES } from '@/db/project'
import { getURL } from '@/utils/constants'
import { projectSlugify } from '@/utils/formatting'
import { NextRequest, NextResponse } from 'next/server'
import uuid from 'react-uuid'
import { createEdgeClient } from './_db'
import { getProfileById } from '@/db/profile'
import { sendTemplateEmail } from '@/utils/email'
import { JSONContent } from '@tiptap/react'
import { calculateCharityBalance } from '@/utils/math'
import { getTxnsByUser } from '@/db/txn'
import { getBidsByUser } from '@/db/bid'
import { updateProjectCauses } from '@/db/cause'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  // From https://github.com/lodash/lodash/issues/5525
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

type GrantProps = {
  title: string
  subtitle: string
  description: JSONContent
  donorNotes: JSONContent
  donorContribution: number
  fundingGoal: number
  minFunding: number
  recipientEmail?: string
  recipientName?: string
  recipientUsername?: string
  causeSlugs: string[]
}

export default async function handler(req: NextRequest) {
  const {
    title,
    subtitle,
    description,
    donorNotes,
    donorContribution,
    fundingGoal,
    minFunding,
    recipientEmail,
    recipientName,
    recipientUsername,
    causeSlugs,
  } = (await req.json()) as GrantProps
  const supabase = createEdgeClient(req)
  const resp = await supabase.auth.getUser()
  const regranter = resp.data.user
  if (!regranter) {
    console.log('no regranter')
    return NextResponse.error()
  }
  const regranterProfile = await getProfileById(supabase, regranter.id)
  if (
    (recipientEmail && recipientUsername) ||
    ((!recipientEmail || !recipientName) && !recipientUsername) ||
    !regranterProfile
  ) {
    console.log('invalid inputs')
    return NextResponse.error()
  }
  const regranterTxns = await getTxnsByUser(supabase, regranter.id)
  const regranterBids = await getBidsByUser(supabase, regranter.id)
  const regranterCharityBalance = calculateCharityBalance(
    regranterTxns,
    regranterBids,
    regranterProfile.id,
    regranterProfile.accreditation_status
  )
  if (regranterCharityBalance < donorContribution) {
    console.log('insufficient funds')
    return NextResponse.error()
  }
  const slug = await projectSlugify(title, supabase)
  const recipientProfile = recipientUsername
    ? await getProfileByUsername(supabase, recipientUsername)
    : null
  if (!recipientProfile && recipientUsername) {
    return NextResponse.error()
  }
  const project = {
    id: uuid(),
    creator: recipientProfile ? recipientProfile.id : regranter.id,
    title,
    blurb: subtitle,
    description,
    min_funding: minFunding,
    funding_goal: fundingGoal,
    founder_portion: TOTAL_SHARES,
    type: 'grant' as Project['type'],
    stage: 'proposal' as Project['stage'],
    round: 'Regrants',
    slug,
    location_description: '',
    approved: null,
    signed_agreement: false,
  }
  if (recipientEmail && recipientName) {
    const donorComment = {
      id: uuid(),
      project: project.id,
      commenter: regranter.id,
      content: donorNotes,
    }
    const projectTransfer = {
      recipient_email: recipientEmail.trim(),
      recipient_name: recipientName,
      project_id: project.id,
    }
    await supabase
      .rpc('create_transfer_grant', {
        project: project,
        donor_comment: donorComment,
        project_transfer: projectTransfer,
        grant_amount: donorContribution,
      })
      .throwOnError()
    const postmarkVars = {
      amount: donorContribution,
      regranterName: regranterProfile.full_name,
      projectTitle: title,
      loginUrl: `${getURL()}login?email=${recipientEmail}`,
    }
    const NEW_USER_GRANT_TEMPLATE_ID = 31479155
    await sendTemplateEmail(
      NEW_USER_GRANT_TEMPLATE_ID,
      postmarkVars,
      undefined,
      recipientEmail
    )
  } else if (recipientProfile) {
    const donorComment = {
      id: uuid(),
      project: project.id,
      commenter: regranter.id,
      content: donorNotes,
      txn_id: uuid(),
    }
    const donation = {
      project: project.id,
      amount: donorContribution,
      bidder: regranter.id,
    }
    await supabase
      .rpc('give_grant', {
        project: project,
        donor_comment: donorComment,
        donation: donation,
      })
      .throwOnError()
    const postmarkVars = {
      amount: donorContribution,
      regranterName: regranterProfile.full_name,
      projectTitle: title,
      projectUrl: `${getURL()}projects/${slug}`,
    }
    const EXISTING_USER_GRANT_TEMPLATE_ID = 31480376
    await sendTemplateEmail(
      EXISTING_USER_GRANT_TEMPLATE_ID,
      postmarkVars,
      recipientProfile.id
    )
  } else {
    console.log('invalid inputs 2')
    return NextResponse.error()
  }
  await updateProjectCauses(supabase, causeSlugs, project.id)
  return NextResponse.json(project)
}
