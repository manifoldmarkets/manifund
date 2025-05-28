import { createAuthorizedAdminClient } from '@/db/supabase-server-admin'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

export default async function handler() {
  const supabase = await createAuthorizedAdminClient()
  await supabase
    .from('projects')
    .update({ stage: 'complete' })
    .eq('round', 'ChinaTalk Essay Contest')
}
