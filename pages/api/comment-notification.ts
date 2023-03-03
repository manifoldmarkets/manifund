import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from './_db'
import mailgun from 'mailgun-js'
import { NextApiRequest, NextApiResponse } from 'next'
import { JSONContent } from '@tiptap/react'

type CommentProps = {
  projectTitle: string
  commenterUsername: string
  projectCreatorId: string
  content: JSONContent
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CommentProps>
) {
  const { projectTitle, commenterUsername, projectCreatorId, content } =
    req.body
  console.log('Content as seen by handler', content)
  const projectCreatorEmail = await getUserEmail(projectCreatorId)
  const DOMAIN = 'sandboxeb69e3d5dd454159a4cc98cef7d1edfb.mailgun.org'
  const mg = mailgun({
    apiKey: process.env.PRIVATE_MAILGUN_API_KEY ?? '',
    domain: DOMAIN,
  })
  const data: mailgun.messages.SendData = {
    from: 'Mailgun Sandbox <me@sandboxeb69e3d5dd454159a4cc98cef7d1edfb.mailgun.org>',
    to: projectCreatorEmail ?? '',
    subject: 'New comment on your project!',
    text: `You have a new comment on your project: ${projectTitle}!\n\n${commenterUsername} said: ${content[0].text}.`,
  }
  mg.messages().send(data, function (body: any) {
    console.log(body)
  })
  res
    .status(200)
    .json({ projectTitle, commenterUsername, projectCreatorId, content })
}

async function getUserEmail(userId: string) {
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
