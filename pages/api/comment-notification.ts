import { createAdminClient } from './_db'
import { NextApiRequest, NextApiResponse } from 'next'
import { HTMLContent } from '@tiptap/react'
import { getFullCommentById } from '@/db/comment'
import { sendTemplateEmail } from '@/utils/email'
import { getReplies } from '@/db/comment'

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
  const NEW_COMMENT_TEMPLATE_ID = 31316102
  if (comment.commenter !== comment.projects.creator) {
    const projectCreatorMailgunVars = {
      projectTitle: comment.projects.title,
      projectUrl: `https://manifund.org/projects/${comment.projects.slug}`,
      commenterUsername: comment.profiles.username,
      commenterAvatarUrl: comment.profiles.avatar_url,
      htmlContent: JSON.stringify(htmlContent),
    }
    await sendTemplateEmail(
      comment.projects.creator,
      NEW_COMMENT_TEMPLATE_ID,
      projectCreatorMailgunVars
    )
  }
  if (comment.replying_to) {
    const parentComment = await getFullCommentById(
      supabaseAdmin,
      comment.replying_to
    )
    if (parentComment.commenter !== comment.projects.creator) {
      const parentCommenterPostmarkVars = {
        projectTitle: comment.projects.title,
        projectUrl: `https://manifund.org/projects/${comment.projects.slug}`,
        commenterUsername: comment.profiles.username,
        commenterAvatarUrl: comment.profiles.avatar_url,
        htmlContent: JSON.stringify(htmlContent),
      }
      await sendTemplateEmail(
        parentComment.commenter,
        NEW_COMMENT_TEMPLATE_ID,
        parentCommenterPostmarkVars
      )
    }
    const threadComments = await getReplies(supabaseAdmin, comment.replying_to)
    const threadCommenterIds = new Set(threadComments.map((reply) => reply.id))
    threadCommenterIds.forEach(async (commenterId) => {
      if (
        commenterId !== comment.projects.creator &&
        commenterId !== parentComment.commenter
      ) {
        const threadCommenterPostmarkVars = {
          projectTitle: comment.projects.title,
          projectUrl: `https://manifund.org/projects/${comment.projects.slug}`,
          commenterUsername: comment.profiles.username,
          commenterAvatarUrl: comment.profiles.avatar_url,
          htmlContent: JSON.stringify(htmlContent),
        }
        await sendTemplateEmail(
          commenterId,
          NEW_COMMENT_TEMPLATE_ID,
          threadCommenterPostmarkVars
        )
      }
    })
  }
  res.status(200).json({
    commentId,
    htmlContent,
  })
  return res
}
