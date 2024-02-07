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
        const htmlContent = `<div>
        <p>Dear ${transfer.recipient_name},</p>
        <p>
          Congratulations on receiving an ACX Grant! Please sign the grant agreement
          (link at the top of your project page) and then withdraw your funds using<a
            href="https://airtable.com/appOfJtzt8yUTBFcD/shrI3XFPivduhbnG"
          >
            this form </a
          >(also available from your profile page).
        </p>
        <p>
          Note that your project has it’s own public page which other users can
          comment on or use to donate to your work. If you had any privacy conditions
          on your application to ACX Grants, we’ve honored those in creating this
          page, though feel free to edit your project entry however you like.
        </p>
        <p>
          If you have any questions, you can reply to this email or join us on
          <a href="https://discord.gg/ZGsDMWSA5Q">Discord</a>!
        </p>
        <p>Best,</p>
        <p>Rachel from Manifund</p>
      </div>`
      } else {
        // email B
        const htmlContent = `<div>
        <p>Dear ${transfer.recipient_name},</p>
        <p>
          Congratulations on receiving an ACX Grant! We’ve created an entry for your
          project on Manifund, which you’ll need to sign in to accept. After creating
          an account, go to your project page to sign your grant agreement. Lastly,
          give us your payment details using<a
            href="https://airtable.com/appOfJtzt8yUTBFcD/shrI3XFPivduhbnG"
          >
            this form </a
          >(also available from your profile page).
        </p>
        <p>
          Note that your project has it’s own public page which other users can
          comment on or use to donate to your work. If you had any privacy conditions
          on your application to ACX Grants, we’ve honored those in creating this
          page, though feel free to edit your project entry however you like.
        </p>
        <p>
          If you have any questions, you can reply to this email or join us on
          <a href="https://discord.gg/ZGsDMWSA5Q">Discord</a>!
        </p>
        <p>Best,</p>
        <p>Rachel from Manifund</p>
      </div>`
      }
      // update project stage to proposal
    } else if (transfer.projects.type === 'dummy') {
      if (recipientExists) {
        // email C
        const htmlContent = `<div>
        <p>Dear ${transfer.recipient_name},</p>
        <p>
          Congratulations on receiving an ACX Grant! Even though Manifund is not
          handling the payments for your project, we’ve created an entry for this
          project on Manifund under your account.
        </p>
        <p>
          Note that your project has it’s own public page which other users can
          comment on or use to donate to your work. If you had any privacy conditions
          on your application to ACX Grants, we’ve honored those in creating this
          page, though feel free to edit your project entry however you like.
        </p>
        <p>
          If you have any questions, you can reply to this email or join us on
          <a href="https://discord.gg/ZGsDMWSA5Q">Discord</a>!
        </p>
        <p>Best,</p>
        <p>Rachel from Manifund</p>
      </div>`
      } else {
        // email D
        const htmlContent = `<div>
        <p>Dear ${transfer.recipient_name},</p>
        <p>
          Congratulations on receiving an ACX Grant! Even though Manifund is not
          handling the payments for your project, we’ve created a page on our site for
          your project where other users can read about your work or comment. If you’d
          like to get notified about comments or participate in the discussion, you
          can create an account on Manifund using this email address, and the project
          will be automatically transferred to your account.
        </p>
        <p>
          Note that your project has it’s own public page which other users can
          comment on or use to donate to your work. If you had any privacy conditions
          on your application to ACX Grants, we’ve honored those in creating this
          page, though feel free to edit your project entry however you like.
        </p>
        <p>
          If you have any questions, you can reply to this email or join us on
          <a href="https://discord.gg/ZGsDMWSA5Q">Discord</a>!
        </p>
        <p>Best,</p>
        <p>Rachel from Manifund</p>
      </div>`
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
