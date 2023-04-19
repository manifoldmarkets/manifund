import { getProfileByUsername } from '@/db/profile'
import { Project, TOTAL_SHARES } from '@/db/project'
import { getURL } from '@/utils/constants'
import { SupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'
import uuid from 'react-uuid'
import { createEdgeClient } from './_db'
import { getProfileById } from '@/db/profile'
import { sendTemplateEmail } from '@/utils/email'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

type GrantProps = {
  title: string
  subtitle: string
  description: any
  amount: number
  toEmail?: string
  toUsername?: string
}

export default async function handler(req: NextRequest) {
  const { title, subtitle, description, amount, toEmail, toUsername } =
    (await req.json()) as GrantProps
  const supabase = createEdgeClient(req)
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  if (!user) return NextResponse.error()
  const regranterProfile = await getProfileById(supabase, user.id)
  if ((toEmail && toUsername) || (!toEmail && !toUsername)) {
    return NextResponse.error()
  }

  let slug = title
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
  const { data } = await supabase
    .from('projects')
    .select('slug')
    .eq('slug', slug)
  if (data && data.length > 0) {
    slug = slug + '-' + Math.random().toString(36).substring(2, 15)
  }
  const id = uuid()
  const toProfile = toUsername
    ? await getProfileByUsername(supabase, toUsername)
    : null
  const project = {
    id,
    creator: toUsername ? toProfile.id : user.id,
    title,
    blurb: subtitle,
    description,
    min_funding: amount,
    funding_goal: amount,
    founder_portion: TOTAL_SHARES,
    type: 'grant' as Project['type'],
    stage: 'active',
    round: 'Independent', // Create new grants round?
    slug,
  }
  const { error } = await supabase.from('projects').insert([project])
  if (error) {
    throw error
  }
  if (toEmail) {
    const project_transfer = {
      to_email: toEmail,
      project_id: id,
      grant_amount: amount,
    }
    const { error: error2 } = await supabase
      .from('project_transfers')
      .insert([project_transfer])
    if (error2) {
      throw error2
    }
  } else {
    const { error: error3 } = await supabase.from('txns').insert({
      project: id,
      amount: amount,
      from_id: user.id,
      to_id: toProfile.id,
      token: 'USD',
    })
    if (error3) {
      throw error3
    }
  }
  if (toUsername) {
    const postmarkVars = {
      amount: amount,
      regranterName: regranterProfile?.full_name ?? 'an anonymous regranter',
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
      regranterName: regranterProfile?.full_name ?? 'an anonymous regranter',
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
