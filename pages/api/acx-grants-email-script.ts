import { createAdminClient } from './_db'
import { getIncompleteTransfers } from '@/db/project-transfer'
import { SupabaseClient } from '@supabase/supabase-js'
import { sendTemplateEmail, TEMPLATE_IDS } from '@/utils/email'
import { updateProjectStage } from '@/db/project'

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
    console.log('TRANSFERING PROJECT: ', transfer.projects.title)
    const userId = await getUserIdFromEmail(supabase, transfer.recipient_email)
    console.log('user id: ', userId)
    const recipientExists = !!userId
    console.log('recipient exists: ', recipientExists)
    const isGrant = transfer.projects.type === 'grant'
    const emailHtmlContent = getEmailHtmlContent(
      isGrant,
      recipientExists,
      transfer.recipient_name
    )
    console.log('about to send email!')
    console.log(emailHtmlContent)
    await sendTemplateEmail(
      TEMPLATE_IDS.GENERIC_NOTIF_HTML,
      {
        subject: isGrant
          ? 'Next steps for receiving your ACX Grant'
          : 'Your ACX Grant project is now on Manifund',
        htmlContent: emailHtmlContent,
        buttonUrl: recipientExists
          ? `https://manifund.org/projects/${transfer.projects.slug}`
          : `https://manifund.org/login?email=${transfer.recipient_email}`,
        buttonText: recipientExists ? 'View your project' : 'Create an account',
      },
      undefined,
      transfer.recipient_email
    )
    if (recipientExists) {
      console.log('recipient exists, transferring project')
      let args = {
        project_id: transfer.projects.id,
        to_id: userId,
        transfer_id: transfer.id,
      }
      await supabase.rpc('_transfer_project', args).throwOnError()
    }
    console.log('updating project stage to ', isGrant ? 'proposal' : 'active')
    await updateProjectStage(
      supabase,
      transfer.project_id,
      isGrant ? 'proposal' : 'active'
    )
    console.log('------------done with transfer----------')
  }
}

async function getUserIdFromEmail(
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
    throw error
  }
  return data?.id
}

function getEmailHtmlContent(
  isGrant: boolean,
  recipientExists: boolean,
  recipientName: string
) {
  if (isGrant) {
    if (recipientExists) {
      return `<div>
      <p>Dear ${recipientName},</p>
      <p>
        Congratulations on receiving an ACX Grant! Please sign the grant agreement
        (link at the top of your project page) and then withdraw your funds using <a
          href="https://airtable.com/appOfJtzt8yUTBFcD/shrI3XFPivduhbnG">this form</a> (also available from your profile page).
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
      return `<div>
      <p>Dear ${recipientName},</p>
      <p>
        Congratulations on receiving an ACX Grant! We’ve created an entry for your
        project on Manifund, which you’ll need to sign up to accept. After creating
        an account, go to your project page to sign your grant agreement. Lastly,
        give us your payment details using <a
        href="https://airtable.com/appOfJtzt8yUTBFcD/shrI3XFPivduhbnG">this form</a> (also available from your profile page).
    </p>
      <p>
      If you already have an account on Manifund under a different email address, let us know and we can transfer the project to the correct account.
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
  } else {
    if (recipientExists) {
      return `<div>
        <p>Dear ${recipientName},</p>
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
      return `<div>
        <p>Dear ${recipientName},</p>
        <p>
          Congratulations on receiving an ACX Grant! Even though Manifund is not
          handling the payments for your project, we’ve created a page on our site for
          your project where other users can read about your work or comment. If you’d
          like to get notified about comments or participate in the discussion, you
          can create an account on Manifund using this email address, and the project
          will be automatically transferred to your account. If you already have an account on Manifund under a different email address, let us know and we can transfer the project to the correct account.
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
  }
}
