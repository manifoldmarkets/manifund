import { createAdminClient } from './_db'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

export default async function handler() {
  const supabase = createAdminClient()
  await supabase
    .from('projects')
    .update({ stage: 'complete' })
    .eq('round', 'ChinaTalk Essay Contest')
}
