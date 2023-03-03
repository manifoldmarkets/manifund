import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from './_db'
import mailgun from 'mailgun-js'
import { NextApiRequest, NextApiResponse } from 'next'
import { JSONContent } from '@tiptap/react'

const initMailgun = () => {
  const apiKey = process.env.MAILGUN_KEY as string
  return mailgun({
    apiKey,
    domain: 'sandboxeb69e3d5dd454159a4cc98cef7d1edfb.mailgun.org',
  })
}

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
  const data: mailgun.messages.SendTemplateData = {
    from: 'Mailgun Sandbox <me@sandboxeb69e3d5dd454159a4cc98cef7d1edfb.mailgun.org>',
    to: 'rachel.weinberg12@gmail.com',
    subject: 'Testing Template',
    template: 'comment_on_project',
    'h:X-Mailgun-Variables': JSON.stringify({
      projectTitle,
      commenter: commenterUsername,
      content: JSON.stringify(content),
    }),
  }
  const mg = initMailgun().messages()
  const result = await mg.send(data)
  mg.send(data, function (error, body) {
    console.log(body)
  })
  if (result != null) {
    console.log('Sent template email')
  }
  res
    .status(200)
    .json({ projectTitle, commenterUsername, projectCreatorId, content })
  return res
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
