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

function getEmailHtmlContent(recipientExists: boolean, recipientName: string) {
  if (recipientExists) {
    return `<div>
      <p>Hi ${recipientName},</p>
      <p>
      An impact certificate for your ACX application has been added to your Manifund account. It’s currently in draft mode, which means only you can see it. Feel free to make whatever edits to the description and investment structure that you like before publishing.
      </p>
      <p>
      Next week Scott will post about this on ACX and investors will start placing offers on projects. You can read more about how initial funding will work <a href="https://www.notion.so/manifoldmarkets/ACX-Impact-Market-Process-and-Mechanisms-aa71000b9932440ba82a4697a7bcc233?pvs=4">here</a>.
      </p>
      <p>
      If you would not like to participate in the impact certificate portion of the round, no need to take any action. If you’re still unsure, you can read about impact certificates <a href="https://www.brasstacks.blog/explain-im/">here</a> or <a href="https://www.astralcodexten.com/p/impact-markets-the-annoying-details">here</a>.
      </p>
      <p>
        You can also ask us questions by replying to this email or joining us on <a href="https://discord.gg/ZGsDMWSA5Q">Discord</a>!
      </p>
      <p>Best,</p>
      <p>Rachel from Manifund</p>
    </div>`
  } else {
    return `<div>
    <p>Hi ${recipientName},</p>
    <p>
    An impact certificate for your ACX application has been added to Manifund. Create an account with this email to accept and get access to the project. It'll start out in draft mode, which means only you can see it. Once you publish, all information in the description and on your profile will be publicly accessible, so make sure to make any important changes before publishing.</p>
    <p>
    Next week Scott will post about this on ACX and investors will start placing offers on projects. You can read more about how initial funding will work <a href="https://www.notion.so/manifoldmarkets/ACX-Impact-Market-Process-and-Mechanisms-aa71000b9932440ba82a4697a7bcc233?pvs=4">here</a>.
    </p>
    <p>
    If you would not like to participate in the impact certificate portion of the round, no need to take any action. If you’re still unsure, you can read about impact markets <a href="https://www.brasstacks.blog/explain-im/">here</a> or <a href="https://www.astralcodexten.com/p/impact-markets-the-annoying-details">here</a>.
    </p>
    <p>
      You can also ask us questions by replying to this email or joining us on <a href="https://discord.gg/ZGsDMWSA5Q">Discord</a>!
    </p>
    <p>Best,</p>
    <p>Rachel from Manifund</p>
  </div>`
  }
}
