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
    const recipientExists = await doesUserWithEmailExist(
      supabase,
      transfer.recipient_email
    )
    if (transfer.projects.type === 'grant') {
      if (recipientExists) {
        // email A
      } else {
        // email B
      }
      // update project stage to proposal
    } else if (transfer.projects.type === 'dummy') {
      if (recipientExists) {
        // email C
      } else {
        // email D
      }
      // update project stage to active
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
