import { createAdminClient } from './_db'
import { getIncompleteTransfers } from '@/db/project-transfer'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

export default async function handler() {
  const supabase = createAdminClient()
  const transfersWithProjects = await getIncompleteTransfers(supabase)
}
