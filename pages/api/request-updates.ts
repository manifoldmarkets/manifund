import { differenceInDays, differenceInMonths, isBefore } from 'date-fns'
import { NextResponse } from 'next/server'
import { createAdminClient } from './_db'
import { getAmountRaised } from '@/utils/math'
import { Project } from '@/db/project'
import { Bid } from '@/db/bid'
import { SupabaseClient } from '@supabase/supabase-js'
import { sendTemplateEmail, TEMPLATE_IDS } from '@/utils/email'
import { isProd } from '@/db/env'
import { Cause, getPrizeCause } from '@/db/cause'
import { checkReactivateEligible } from '@/utils/activate-project'
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
      'id, creator, title, type, created_at, comments(created_at, special_type)'
    )
    .eq('stage', 'proposal')
  if (error) {
    console.error(error)
    return NextResponse.json('error')
  }
  const now = new Date()
  const projectsNeedingUpdates = activeProjects?.filter((project) => {
    const createdDate = new Date(`${project.created_at}T23:59:59-12:00`)
    const updateComments = project.comments.filter(
      (c) => c.special_type === 'progress update'
    )
    const sortedUpdates = orderBy(project.comments, 'created_at', 'desc')
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
    // send request for update
  }
  return NextResponse.json('requested updates')
}
