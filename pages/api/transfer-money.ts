import { getProjectById } from '@/db/project'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createEdgeClient } from './_db'
import { getProfileById } from '@/db/profile'
import { sendTemplateEmail } from '@/utils/email'

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
  console.log('in handler')
  const { fromId, toId, amount, projectId } =
    (await req.json()) as MoneyTransferProps
  const supabase = createEdgeClient(req)
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  // Only initiate transfers from the account currently logged in
  if (user?.id !== fromId) {
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
  if (projectId) {
    console.log('about to send email')
    const project = await getProjectById(supabaseAdmin, projectId)
    const postmarkVars = {
      amount: amount,
      donorName: donor.full_name,
      projectTitle: project.title,
      projectUrl: `https://manifund.org/projects/${project.slug}`,
    }
    const PROJECT_DONATION_TEMPLATE_ID = 31534853
    await sendTemplateEmail(PROJECT_DONATION_TEMPLATE_ID, postmarkVars, toId)
  }

  if (error) {
    return NextResponse.error()
  } else {
    return NextResponse.json('success')
  }
}
