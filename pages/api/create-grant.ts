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
  const user = resp.data.user
  if (!user) return NextResponse.error()
  const regranterProfile = await getProfileById(supabase, user.id)
  if (
    (toEmail && toUsername) ||
    (!toEmail && !toUsername) ||
    !regranterProfile
  ) {
    return NextResponse.error()
  }

  const slug = await projectSlugify(title, supabase)
  const id = uuid()
  const toProfile = toUsername
    ? await getProfileByUsername(supabase, toUsername)
    : null

  if (!toProfile && toUsername) {
    return NextResponse.error()
  }
  const project = {
    id,
    creator: toProfile ? toProfile.id : user.id,
    title,
    blurb: subtitle,
    description,
    min_funding: amount,
    funding_goal: amount,
    founder_portion: TOTAL_SHARES,
    type: 'grant' as Project['type'],
    stage: 'active',
    round: 'Regrants',
    slug,
  }
  await supabase.from('projects').insert([project]).throwOnError()
  if (toEmail) {
    const project_transfer = {
      to_email: toEmail,
      project_id: id,
      grant_amount: amount,
      donor_notes: donorNotes,
    }
    await supabase
      .from('project_transfers')
      .insert([project_transfer])
      .throwOnError()
  } else if (toProfile) {
    const donation = {
      project: id,
      amount: amount,
      from_id: user.id,
      to_id: toProfile.id,
      token: 'USD',
      notes: donorNotes,
    }
    await supabase.from('txns').insert([donation]).throwOnError()
  } else {
    return NextResponse.error()
  }
  if (toUsername && toProfile) {
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
  }
  return NextResponse.json(project)
}
