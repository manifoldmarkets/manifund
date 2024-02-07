import { createAdminClient } from './_db'
import { getIncompleteTransfers } from '@/db/project-transfer'
import { SupabaseClient } from '@supabase/supabase-js'

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
  for (const transfer of transfersWithProjects) {
    if (transfer.projects.type === 'grant') {
    } else if (transfer.projects.type === 'dummy') {
    }
  }
}

async function doesUserWithEmailExist(
  supabaseAdmin: SupabaseClient,
  email: string
) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle()
  if (error) {
    console.log(error)
  }
  return !!data
}
