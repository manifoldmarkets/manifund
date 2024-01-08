import { differenceInMonths } from 'date-fns'
import { NextResponse } from 'next/server'
import { createAdminClient } from './_db'
import { sendTemplateEmail, TEMPLATE_IDS } from '@/utils/email'
import { isProd } from '@/db/env'
import { orderBy } from 'lodash'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

export default async function handler() {
  if (!isProd()) {
    return NextResponse.json('not prod')
  }
  const supabase = createAdminClient()
  const { data: activeProjects, error } = await supabase
    .from('projects')
    .select(
      'id, creator, title, type, created_at, slug, comments(created_at, special_type)'
    )
    .eq('stage', 'proposal')
  if (error) {
    console.error(error)
    return NextResponse.json('error')
  }
  const now = new Date()
  const projectsNeedingUpdates = activeProjects?.filter((project) => {
    const createdDate = new Date(`${project.created_at}T23:59:59-12:00`)
    const updates = project.comments.filter(
      (c) => c.special_type === 'progress update'
    )
    const sortedUpdates = orderBy(updates, 'created_at', 'desc')
    const latestUpdate = sortedUpdates.length ? sortedUpdates[0] : null
    const latestUpdateDate = latestUpdate
      ? new Date(`${latestUpdate.created_at}T23:59:59-12:00`)
      : null
    const monthsSinceLatestUpdate = latestUpdateDate
      ? differenceInMonths(now, latestUpdateDate)
      : null
    return (
      differenceInMonths(now, createdDate) >= 6 &&
      (monthsSinceLatestUpdate === null || monthsSinceLatestUpdate >= 6)
    )
  })
  for (const project of projectsNeedingUpdates ?? []) {
    await sendTemplateEmail(TEMPLATE_IDS.GENERIC_NOTIF, {
      notifText: `It's been at least 6 months since you last posted an update on your project "${
        project.title
      }". Please post an update to let Manifund and your ${
        project.type === 'cert' ? 'investors' : 'donors'
      } know how things are going. If you're done working on this or want to end your grant period, you can select to close your project and post a final report instead.`,
      buttonUrl: `manifund.org/projects/${project.slug}#creator-actions`,
      buttonText: 'Post an update',
      subject: `Your Manifund project is due for an update`,
    })
  }
  return NextResponse.json('requested updates')
}
