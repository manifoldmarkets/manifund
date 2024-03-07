import { NextApiRequest, NextApiResponse } from 'next'
import { generateHTML } from '@tiptap/html'
import { getFullCommentById } from '@/db/comment'
import { sendTemplateEmail, TEMPLATE_IDS } from '@/utils/email'
import { parseMentions } from '@/utils/parse'
import { Comment } from '@/db/comment'
import { JSONContent } from '@tiptap/core'
import { TIPTAP_EXTENSIONS } from '@/components/editor'
import { getProjectFollowerIds } from '@/db/follows'
import { createAdminClient } from './_db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const comment = req.body.record as Comment
  const supabase = createAdminClient()
  const fullComment = await getFullCommentById(supabase, comment.id)
  const projectFollowerIds = await getProjectFollowerIds(
    supabase,
    comment.project
  )

  const htmlContent = generateHTML(
    comment.content as JSONContent,
    TIPTAP_EXTENSIONS
  )
  const mentionedUserIds = parseMentions(comment.content as JSONContent)
  const postmarkVars = {
    projectTitle: fullComment.projects.title,
    projectUrl: `https://manifund.org/projects/${fullComment.projects.slug}`,
    commenterUsername: fullComment.profiles.username,
    commenterAvatarUrl: fullComment.profiles.avatar_url,
    htmlContent: JSON.stringify(htmlContent),
  }

  // Send creator email
  if (comment.commenter !== fullComment.projects.creator) {
    await sendTemplateEmail(
      TEMPLATE_IDS.NEW_COMMENT,
      postmarkVars,
      fullComment.projects.creator
    )
  }

  // Send follower emails
  if (!comment.replying_to) {
    projectFollowerIds.forEach(async (followerId) => {
      if (followerId === fullComment.projects.creator) {
        return
      }
      if (comment.special_type === 'progress update') {
        await sendTemplateEmail(
          TEMPLATE_IDS.GENERIC_NOTIF,
          {
            notifText: `The creator of "${fullComment.projects.title}" has posted a progress update on their project. Check it out!`,
            buttonUrl: `https://manifund.org/projects/${fullComment.projects.slug}?tab=comments#${comment.id}`,
            buttonText: 'View project',
            subject: `Manifund: Update posted for "${fullComment.projects.title}"`,
          },
          followerId
        )
      } else if (comment.special_type === 'final report') {
        await sendTemplateEmail(
          TEMPLATE_IDS.GENERIC_NOTIF,
          {
            notifText: `The creator of "${fullComment.projects.title}" has completed their project and posted a final report. Check it out!`,
            buttonUrl: `https://manifund.org/projects/${fullComment.projects.slug}?tab=comments#${comment.id}`,
            buttonText: 'View project',
            subject: `Manifund: Final report posted for "${fullComment.projects.title}"`,
          },
          followerId
        )
      } else {
        await sendTemplateEmail(
          TEMPLATE_IDS.NEW_COMMENT,
          postmarkVars,
          followerId
        )
      }
    })
  }

  // Send mentioned user emails
  await Promise.all(
    mentionedUserIds
      .filter(
        (userId) =>
          userId !== fullComment.profiles.id &&
          userId !== fullComment.projects.creator
      )
      .map((userId) =>
        sendTemplateEmail(
          TEMPLATE_IDS.COMMENT_WITH_MENTION,
          postmarkVars,
          userId
        )
      )
  )

  // Send parent commenter email
  if (comment.replying_to) {
    const parentComment = await getFullCommentById(
      supabase,
      comment.replying_to
    )
    if (
      parentComment.commenter !== fullComment.projects.creator &&
      !mentionedUserIds.includes(parentComment.commenter) &&
      !projectFollowerIds.includes(parentComment.commenter) &&
      parentComment.commenter !== comment.commenter
    ) {
      await sendTemplateEmail(
        TEMPLATE_IDS.NEW_COMMENT,
        postmarkVars,
        parentComment.commenter
      )
    }
  }
  res.status(200).json({
    comment,
  })
}
