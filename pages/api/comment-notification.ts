import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from './_db'

type CommentProps = {
  projectTitle: string
  commenterUsername: string
  projectCreatorId: string
}
export default async function handler(req: NextRequest) {
  const { projectTitle, commenterUsername, projectCreatorId } =
    (await req.json()) as CommentProps
  const projectCreatorEmail = await getUserEmail(projectCreatorId)
  const mailgun = require('mailgun-js')
  const DOMAIN = 'sandboxeb69e3d5dd454159a4cc98cef7d1edfb.mailgun.org'
  const mg = mailgun({
    apiKey: process.env.PRIVATE_MAILGUN_API_KEY,
    domain: DOMAIN,
  })
  const data = {
    from: 'Mailgun Sandbox <me@sandboxeb69e3d5dd454159a4cc98cef7d1edfb.mailgun.org>',
    to: projectCreatorEmail,
    subject: 'New comment on your project!',
    text: `You have a new comment on your project: ${projectTitle} from ${commenterUsername}.`,
  }
  mg.messages().send(data, function (body: any) {
    console.log(body)
  })
  return NextResponse.json({ message: 'success' })
}

export async function getUserEmail(userId: string) {
  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('email')
    .eq('id', userId)
  if (error) {
    console.log(error)
  }
  return data ? data[0].email : null
}
