import { createAdminClient } from '@/db/edge'
import { getIncompleteTransfers } from '@/db/project-transfer'
import { SupabaseClient } from '@supabase/supabase-js'
import { sendTemplateEmail, TEMPLATE_IDS } from '@/utils/email'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

export default async function handler() {
  const supabase = createAdminClient()
  const transfers = await getIncompleteTransfers(supabase)
  const acxCertTransfers = transfers.filter(
    (transfer) => transfer.projects.round === 'ACX Grants 2024' && transfer.projects.type === 'cert'
  )
  console.log(
    'ACX cert transfers:',
    acxCertTransfers.map((t) => t.projects.title)
  )
  for (const transfer of acxCertTransfers) {
    console.log('ON PROJECT: ', transfer.projects.title)
    const userId = await getUserIdFromEmail(supabase, transfer.recipient_email)
    console.log('user id: ', userId)
    const recipientExists = !!userId
    console.log('recipient exists: ', recipientExists)
    if (recipientExists) {
      console.log('recipient exists, transferring project')
      let args = {
        project_id: transfer.projects.id,
        to_id: userId,
        transfer_id: transfer.id,
      }
      await supabase.rpc('_transfer_project', args).throwOnError()
    }
    const emailHtmlContent = getEmailHtmlContent(recipientExists, transfer.recipient_name)
    console.log('about to send email!')
    console.log(emailHtmlContent)
    await sendTemplateEmail(
      TEMPLATE_IDS.GENERIC_NOTIF_HTML,
      {
        subject: recipientExists
          ? 'Your ACX impact certificate has been added to your Manifund account'
          : 'Your ACX impact certificate is on Manifund. Sign in to accept!',
        htmlContent: emailHtmlContent,
        buttonUrl: recipientExists
          ? `https://manifund.org/projects/${transfer.projects.slug}`
          : `https://manifund.org/login?email=${transfer.recipient_email}`,
        buttonText: recipientExists ? 'View your project' : 'Create your account',
      },
      undefined,
      transfer.recipient_email
    )
    console.log('------------done with transfer----------')
  }
}

async function getUserIdFromEmail(supabaseAdmin: SupabaseClient, email: string) {
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
  return `<div>
      <p>Hi ${recipientName},</p>
      <p>
      ${
        recipientExists
          ? 'An impact certificate for your ACX application has been added to your Manifund account!'
          : 'An impact certificate for your ACX application has been added to Manifund! Create an account with this email address to accept and get access to the project.'
      } It'll start out in draft mode, which means only you can see it. Once you publish, all information in the description and on your profile will be publicly accessible, so make sure to make any important changes before publishing.
      </p>
      ${
        recipientExists
          ? ''
          : '<p>If you already have a Manifund account but under a different email address and would like this project transferred to that account, let us know by replying to this email.</p>'
      }
      <p>
      In a few days, Scott will post about this on ACX and investors will start placing offers on projects. You can read more about how initial funding will work <a href="https://manifoldmarkets.notion.site/ACXG-Impact-Market-Timeline-aa71000b9932440ba82a4697a7bcc233?pvs=4">here</a>.
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
}
