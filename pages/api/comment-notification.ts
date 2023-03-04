import { createAdminClient } from './_db'
import mailgun from 'mailgun-js'
import { NextApiRequest, NextApiResponse } from 'next'
import { HTMLContent } from '@tiptap/react'

const initMailgun = () => {
  const apiKey = process.env.MAILGUN_KEY as string
  return mailgun({
    apiKey,
    domain: 'manifund.org',
  })
}

type CommentProps = {
  projectTitle: string
  projectUrl: string
  commenterUsername: string
  commenterAvatarUrl: string
  projectCreatorId: string
  htmlContent: HTMLContent
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CommentProps>
) {
  const {
    projectTitle,
    projectUrl,
    commenterUsername,
    commenterAvatarUrl,
    projectCreatorId,
    htmlContent,
  } = req.body
  const projectCreatorEmail = await getUserEmail(projectCreatorId)
  const data: mailgun.messages.SendTemplateData = {
    from: 'Manifund <info@manifund.org>',
    to: projectCreatorEmail ?? '',
    subject: `New comment on ${projectTitle}!`,
    template: 'comment_on_project',
    'h:X-Mailgun-Variables': JSON.stringify({
      projectTitle,
      projectUrl,
      commenterUsername: commenterUsername,
      commenterAvatarUrl: commenterAvatarUrl,
      htmlContent,
    }),
    'o:tag': 'comment_on_project',
    'o:tracking': true,
  }
  const mg = initMailgun().messages()
  mg.send(data, function (error, body) {
    console.log(body)
  })
  res.status(200).json({
    projectTitle,
    projectUrl,
    commenterUsername,
    commenterAvatarUrl,
    projectCreatorId,
    htmlContent,
  })
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
