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

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

type GrantProps = {
  title: string
  subtitle: string
  description: JSONContent
  donorNotes: JSONContent
  amount: number
  toEmail?: string
  toUsername?: string
}

export default async function handler(req: NextRequest) {
  const {
    title,
    subtitle,
    description,
    donorNotes,
    amount,
    toEmail,
    toUsername,
  } = (await req.json()) as GrantProps
  const supabase = createEdgeClient(req)
  const resp = await supabase.auth.getUser()
  const regranter = resp.data.user
  if (!regranter) return NextResponse.error()
  const regranterProfile = await getProfileById(supabase, regranter.id)
  if (
    (toEmail && toUsername) ||
    (!toEmail && !toUsername) ||
    !regranterProfile
  ) {
    return NextResponse.error()
  }
  const slug = await projectSlugify(title, supabase)
  const toProfile = toUsername
    ? await getProfileByUsername(supabase, toUsername)
    : null
  if (!toProfile && toUsername) {
    return NextResponse.error()
  }
  const project = {
    id: uuid(),
    creator: toProfile ? toProfile.id : regranter.id,
    title,
    blurb: subtitle,
    description,
    min_funding: amount,
    funding_goal: amount,
    founder_portion: TOTAL_SHARES,
    type: 'grant' as Project['type'],
    stage: 'pending approval',
    round: 'Regrants',
    slug,
  }
  if (toEmail) {
    const donorComment = {
      id: uuid(),
      project: project.id,
      commenter: regranter.id,
      content: donorNotes,
    }
    const projectTransfer = {
      to_email: toEmail,
      project_id: project.id,
      grant_amount: amount,
      donor_comment_id: donorComment.id,
    }
    await supabase.rpc('create_transfer_grant', {
      project: project,
      donor_comment: donorComment,
      project_transfer: projectTransfer,
    })
    const postmarkVars = {
      amount: amount,
      regranterName: regranterProfile.full_name,
      projectTitle: title,
      loginUrl: `${getURL()}login?email=${toEmail}`,
    }
    const NEW_USER_GRANT_TEMPLATE_ID = 31479155
    await sendTemplateEmail(
      NEW_USER_GRANT_TEMPLATE_ID,
      postmarkVars,
      undefined,
      toEmail
    )
  } else if (toProfile) {
    const donorComment = {
      id: uuid(),
      project: project.id,
      commenter: regranter.id,
      content: donorNotes,
      txn_id: uuid(),
    }
    const donation = {
      id: donorComment.txn_id,
      project: project.id,
      amount: amount,
      from_id: regranter.id,
      to_id: toProfile.id,
      token: 'USD',
    }
    await supabase
      .rpc('give_grant', {
        project: project,
        donor_comment: donorComment,
        donation: donation,
      })
      .throwOnError()
    const postmarkVars = {
      amount: amount,
      regranterName: regranterProfile.full_name,
      projectTitle: title,
      projectUrl: `${getURL()}projects/${slug}`,
    }
    const EXISTING_USER_GRANT_TEMPLATE_ID = 31480376
    await sendTemplateEmail(
      EXISTING_USER_GRANT_TEMPLATE_ID,
      postmarkVars,
      toProfile.id
    )
  } else {
    return NextResponse.error()
  }
  return NextResponse.json(project)
}
