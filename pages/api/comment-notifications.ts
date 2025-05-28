import { NextApiRequest, NextApiResponse } from 'next'
import { generateHTML } from '@tiptap/html'
import { getCommentById } from '@/db/comment'
import { sendTemplateEmail, TEMPLATE_IDS } from '@/utils/email'
import { parseMentions } from '@/utils/parse'
import { Comment } from '@/db/comment'
import { JSONContent } from '@tiptap/core'
import { TIPTAP_EXTENSIONS } from '@/components/editor'
import { getProjectFollowerIds } from '@/db/follows'
import { createAuthorizedAdminClient } from '@/db/supabase-server-admin'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const comment = req.body.record as Comment
  const supabase = await createAuthorizedAdminClient()
  const fullComment = await getCommentById(supabase, comment.id)
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
    htmlContent: htmlContent,
  }

  // Send creator email
  if (comment.commenter !== fullComment.projects.creator) {
    await sendTemplateEmail(
      TEMPLATE_IDS.NEW_COMMENT,
      postmarkVars,
      fullComment.projects.creator
    )
  }

  const notCreatorOrCommenter = (userId: string) =>
    userId !== fullComment.projects.creator && userId !== comment.commenter

  // Send follower emails
  if (!comment.replying_to) {
    await Promise.all(
      projectFollowerIds
        .filter(notCreatorOrCommenter)
        .map(async (followerId) => {
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
    )
  }

  // Send mentioned user emails
  await Promise.all(
    mentionedUserIds
      .filter(notCreatorOrCommenter)
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
    const parentComment = await getCommentById(supabase, comment.replying_to)
    if (
      notCreatorOrCommenter(parentComment.commenter) &&
      !mentionedUserIds.includes(parentComment.commenter) &&
      !projectFollowerIds.includes(parentComment.commenter)
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
