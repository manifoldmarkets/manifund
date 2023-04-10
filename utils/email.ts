import { createAdminClient } from '@/pages/api/_db'
import { SupabaseClient } from '@supabase/supabase-js'
import * as postmark from 'postmark'

export async function sendTemplateEmail(
  toId: string,
  templateId: number,
  templateModel: object,
  fromEmail?: string
) {
  const supabase = createAdminClient()
  const toEmail = await getUserEmail(supabase, toId)

  if (!toEmail) {
    console.log('No email found for user', toId)
    return
  }

  let client = new postmark.ServerClient(
    process.env.POSTMARK_SERVER_TOKEN ?? ''
  )

  client
    .sendEmailWithTemplate({
      From: fromEmail ?? 'info@manifund.org',
      To: toEmail,
      TemplateId: templateId,
      TemplateModel: templateModel,
    })
    .then((response) => {
      console.log('Sending message')
      console.log(response.To)
      console.log(response.Message)
    })
}

export async function getUserEmail(
  supabaseAdmin: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('email')
    .eq('id', userId)
  if (error) {
    console.log(error)
  }
  return data ? data[0].email : null
}
