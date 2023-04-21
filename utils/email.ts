import { createAdminClient } from '@/pages/api/_db'
import { SupabaseClient } from '@supabase/supabase-js'

export async function sendTemplateEmail(
  templateId: number,
  templateModel: object,
  toId?: string,
  toEmail?: string,
  fromEmail?: string
) {
  const supabase = createAdminClient()
  if (!toEmail && !toId) {
    console.log('No email or user id provided')
    return
  }
  const sendToEmail = toEmail ?? (await getUserEmail(supabase, toId ?? ''))

  if (!sendToEmail) {
    console.log('No email found for user', toId)
    return
  }

  // Using fetch instead of postmark's client because it doesn't work on the edge:
  const response = await fetch(
    'https://api.postmarkapp.com/email/withTemplate',
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'X-Postmark-Server-Token': process.env.POSTMARK_SERVER_TOKEN ?? '',
      },
      body: JSON.stringify({
        From: fromEmail ?? 'info@manifund.org',
        To: sendToEmail,
        TemplateId: templateId,
        TemplateModel: templateModel,
      }),
    }
  )
  const json = await response.json()
  console.log('Sent message', json)
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
