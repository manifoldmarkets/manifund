import { createAdminClient } from '@/pages/api/_db'
import { SupabaseClient } from '@supabase/supabase-js'

export async function sendTemplateEmail(
  toId: string,
  subject: string,
  template: string,
  mailgunVars?: string,
  fromEmail?: string
) {
  const supabase = createAdminClient()
  const toEmail = await getUserEmail(supabase, toId)
  const body = new URLSearchParams()
  body.append('from', fromEmail ?? 'Manifund <no-reply@manifund.org>')
  body.append('to', toEmail ?? '')
  body.append('subject', subject)
  body.append('template', template)
  body.append('h:X-Mailgun-Variables', mailgunVars ?? '')
  body.append('o:tag', template)

  const resp = await fetch('https://api.mailgun.net/v3/manifund.org/messages', {
    method: 'POST',
    body,
    headers: {
      Authorization: 'Basic ' + btoa('api:' + process.env.MAILGUN_KEY),
    },
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
