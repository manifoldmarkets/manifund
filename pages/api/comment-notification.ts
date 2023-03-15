import { createAdminClient } from './_db'
import { NextApiRequest, NextApiResponse } from 'next'
import { HTMLContent } from '@tiptap/react'
import { getFullCommentById } from '@/db/comment'
import { sendTemplateEmail } from '@/utils/email'

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
  console.log('supabase on edge', supabaseAdmin)
  const mailgunVars = JSON.stringify({
    projectTitle: comment.projects.title,
    projectUrl: `https://manifund.org/projects/${comment.projects.slug}`,
    commenterUsername: comment.profiles.username,
    commenterAvatarUrl: comment.profiles.avatar_url,
    htmlContent,
  })
  sendTemplateEmail(
    comment.projects.creator,
    `New comment on ${comment.projects.title}`,
    'comment_on_project',
    undefined,
    mailgunVars
  )

  res.status(200).json({
    commentId,
    htmlContent,
  })
  return res
}
