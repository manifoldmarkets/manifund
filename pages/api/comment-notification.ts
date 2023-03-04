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
  console.log('just got into the handler')
  const {
    projectTitle,
    projectUrl,
    commenterUsername,
    commenterAvatarUrl,
    projectCreatorId,
    htmlContent,
  } = req.body
  console.log('set variables in the handler')
  const projectCreatorEmail = await getUserEmail(projectCreatorId)
  console.log('got the project creator email')
  const data: mailgun.messages.SendTemplateData = {
    from: 'Manifund <no-reply@manifund.org>',
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
  console.log('set the data variable to: ', data)
  const mg = initMailgun().messages()
  console.log('initialized mailgun', mg)
  mg.send(data, function (error, body) {
    console.log(body)
  })
  console.log('sent the email (should be a console log above this one)')
  res.status(200).json({
    projectTitle,
    projectUrl,
    commenterUsername,
    commenterAvatarUrl,
    projectCreatorId,
    htmlContent,
  })
  console.log('set res to: ', res)
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
