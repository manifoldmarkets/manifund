import { createAdminClient } from './_db'
import { NextApiRequest, NextApiResponse } from 'next'
import { HTMLContent } from '@tiptap/react'

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
  console.log('got the project creator email', projectCreatorEmail)

  const mailgunVars = JSON.stringify({
    projectTitle,
    projectUrl,
    commenterUsername: commenterUsername,
    commenterAvatarUrl: commenterAvatarUrl,
    htmlContent,
  })
  const body = new FormData()
  body.append('from', 'Manifund <no-reply@manifund.org>')
  body.append('to', projectCreatorEmail ?? '')
  body.append('subject', `New comment on ${projectTitle}`)
  body.append('template', 'comment_on_project')
  body.append('h:X-Mailgun-Variables', mailgunVars)

  const resp = await fetch('https://api.mailgun.net/v3/manifund.org/messages', {
    method: 'POST',
    body,
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from('api:' + process.env.MAILGUN_KEY).toString('base64'),
    },
  })

  const respJson = await resp.json()
  console.log('response', respJson)

  console.log('sent the email (should be a console log above this one)')
  res.status(200).json({
    projectTitle,
    projectUrl,
    commenterUsername,
    commenterAvatarUrl,
    projectCreatorId,
    htmlContent,
  })
  // console.log('set res to: ', res)
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
