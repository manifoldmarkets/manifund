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
        const htmlContent = `<div><span>Dear ${transfer.recipient_name},</span><br /><br /><span>Congratulations on receiving an ACX Grant! Your ACX project has now been added to your Manifund account. Please sign the grant agreement (link at the top of your project page) and then withdraw your funds using <a href='https://airtable.com/appOfJtzt8yUTBFcD/shrI3XFPivduhbnG'>this form </a>(also available from your profile page).</span><br /><br /><span>If you have any questions, you can reply to this email or join us on Discord!</span><br /><span>Best,</span><br /><br /><span>Rachel from Manifund</span></div>`
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
