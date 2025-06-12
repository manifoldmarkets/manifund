import { createAdminClient } from './_db'
import { getIncompleteTransfers } from '@/db/project-transfer'
import { SupabaseClient } from '@supabase/supabase-js'
import { sendTemplateEmail, TEMPLATE_IDS } from '@/utils/email'
import { updateProjectStage } from '@/db/project'
import { NextResponse } from 'next/server'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

export default async function handler() {
  const supabase = createAdminClient()
  const { data: mcfProjects } = await supabase
    .from('projects')
    .select('creator, title, slug, stage')
    .eq('round', 'Manifold Community Fund')
    .in('stage', ['proposal', 'active'])
    .throwOnError()
  if (!mcfProjects) {
    console.error('failed')
    return NextResponse.error()
  }
  console.log(mcfProjects)
  for (const project of mcfProjects) {
    await sendTemplateEmail(
      TEMPLATE_IDS.GENERIC_NOTIF,
      {
        notifText: 'Post your final updates for the Manifold Community Fund',
        content:
          "If you haven't already, please post a final update letting investors and evaluators know about your progress on your Manifold Community Fund projects. Evaluations will begin over the weekend.",
        buttonUrl: `manifund.org/projects/${project.slug}`,
        buttonText: 'Post final update',
      },
      project.creator
    )
  }
}
