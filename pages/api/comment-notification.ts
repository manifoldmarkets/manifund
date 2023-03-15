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
  if (comment.commenter !== comment.projects.creator) {
    const projectCreatorMailgunVars = JSON.stringify({
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
      projectCreatorMailgunVars
    )
  }
  if (comment.replying_to) {
    const parentComment = await getFullCommentById(
      supabaseAdmin,
      comment.replying_to
    )
    if (parentComment.commenter !== comment.projects.creator) {
      const parentCommenterMailgunVars = JSON.stringify({
        projectTitle: comment.projects.title,
        projectUrl: `https://manifund.org/projects/${comment.projects.slug}`,
        commenterUsername: comment.profiles.username,
        commenterAvatarUrl: comment.profiles.avatar_url,
        htmlContent,
      })
      sendTemplateEmail(
        parentComment.commenter,
        `New reply to your comment on ${comment.projects.title}`,
        'comment_on_project',
        parentCommenterMailgunVars
      )
    }
  }
  res.status(200).json({
    commentId,
    htmlContent,
  })
  return res
}
