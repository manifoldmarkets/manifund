import { createAdminClient } from './_db'
import { NextApiRequest, NextApiResponse } from 'next'
import { HTMLContent } from '@tiptap/react'
import { getFullCommentById } from '@/db/comment'
import { SupabaseClient } from '@supabase/supabase-js'

type CommentProps = {
  commentId: string
  htmlContent: HTMLContent
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CommentProps>
) {
  const { commentId, htmlContent } = req.body
  const supabaseAdmin = createAdminClient()
  const comment = await getFullCommentById(supabaseAdmin, commentId)
  const projectCreatorEmail = await getUserEmail(
    supabaseAdmin,
    comment.projects.creator
  )
  const mailgunVars = JSON.stringify({
    projectTitle: comment.projects.title,
    projectUrl: `https://manifund.org/projects/${comment.projects.slug}`,
    commenterUsername: comment.profiles.username,
    commenterAvatarUrl: comment.profiles.avatar_url,
    htmlContent,
  })
  const body = new URLSearchParams()
  body.append('from', 'Manifund <no-reply@manifund.org>')
  body.append('to', projectCreatorEmail ?? '')
  body.append('subject', `New comment on ${comment.projects.title}`)
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
  res.status(200).json({
    commentId,
    htmlContent,
  })
  return res
}

async function getUserEmail(supabaseAdmin: SupabaseClient, userId: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('email')
    .eq('id', userId)
  if (error) {
    console.log(error)
  }
  return data ? data[0].email : null
}
