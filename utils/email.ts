import { createAdminClient } from '@/pages/api/_db'
import { SupabaseClient } from '@supabase/supabase-js'
import { ObjectChain } from 'lodash'
import * as postmark from 'postmark'

export async function sendTemplateEmail(
  toId: string,
  templateId: number,
  templateModel: object,
  fromEmail?: string
) {
  const supabase = createAdminClient()
  const toEmail = await getUserEmail(supabase, toId)
  // const body = new URLSearchParams()
  // body.append('From', fromEmail ?? 'Manifund <info@manifund.org>')
  // body.append('To', toEmail ?? '')
  // body.append('TemplateId', templateId)
  // body.append('TemplateModel', templateModel)
  // console.log(body)

  // const resp = await fetch('https://api.postmarkapp.com/email/withTemplate/', {
  //   method: 'POST',
  //   headers: {
  //     'X-Postmark-Server-Token': process.env.POSTMARK_SERVER_TOKEN ?? '',
  //     Accept: 'application/json',
  //   },
  //   body: JSON.stringify({
  //     From: fromEmail ?? 'Manifund <info@manifund.org',
  //     To: toEmail ?? '',
  //     TemplateId: templateId,
  //     TemplateModel: templateModel,
  //   }),
  // })

  let client = new postmark.ServerClient(
    process.env.POSTMARK_SERVER_TOKEN ?? ''
  )

  client
    .sendEmailWithTemplate({
      From: 'info@manifund.org',
      To: 'rachel@manifund.org',
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
