import { createAdminClient } from './_db'
import { NextApiRequest, NextApiResponse } from 'next'
import { generateHTML } from '@tiptap/html'
import { getFullCommentById } from '@/db/comment'
import { sendTemplateEmail, TEMPLATE_IDS } from '@/utils/email'
import { getShareholders } from '@/app/projects/[slug]/project-tabs'
import { getTxnsByProject } from '@/db/txn'
import { parseMentions } from '@/utils/parse'
import { Comment } from '@/db/comment'
import { JSONContent } from '@tiptap/core'
import { uniq } from 'lodash'
import { TIPTAP_EXTENSIONS } from '@/components/editor'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const comment = req.body.record as Comment
  const supabaseAdmin = createAdminClient()
  const fullComment = await getFullCommentById(supabaseAdmin, comment.id)
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
  if (fullComment.profiles.id !== fullComment.projects.creator) {
    await sendTemplateEmail(
      TEMPLATE_IDS.NEW_COMMENT,
      postmarkVars,
      fullComment.projects.creator
    )
  }

  // Send investor / donor emails
  if (!comment.replying_to) {
    const txnsAndProfiles = await getTxnsByProject(
      supabaseAdmin,
      fullComment.projects.id
    )
    const supporters =
      fullComment.projects.type === 'cert'
        ? getShareholders(txnsAndProfiles).map((s) => s.profile)
        : txnsAndProfiles
            .filter((txn) => txn.type === 'project donation')
            .map((t) => t.profiles)
    const supporterIds = supporters
      .filter(
        (supporter) =>
          supporter && supporter?.id !== fullComment.projects.creator
      )
      .map((supporter) => supporter?.id)
    const uniqueSupporterIds = uniq(supporterIds)
    uniqueSupporterIds.forEach(async (supporterId) => {
      if (comment.special_type === 'progress update') {
        await sendTemplateEmail(
          TEMPLATE_IDS.GENERIC_NOTIF,
          {
            notifText: `The creator of "${fullComment.projects.title}" has posted a progress update on their project. Check it out!`,
            buttonUrl: `https://manifund.org/projects/${fullComment.projects.slug}?tab=comments#${comment.id}`,
            buttonText: 'View project',
            subject: `Manifund: Update posted for "${fullComment.projects.title}"`,
          },
          supporterId
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
          supporterId
        )
      } else {
        await sendTemplateEmail(
          TEMPLATE_IDS.NEW_COMMENT,
          postmarkVars,
          supporterId
        )
      }
    })
  }

  // TODO: Add donors to shareholders and send special emial for final report

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
      supabaseAdmin,
      comment.replying_to
    )
    if (
      parentComment.commenter !== fullComment.projects.creator &&
      !mentionedUserIds.includes(parentComment.profiles.id) &&
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
  return res
}
