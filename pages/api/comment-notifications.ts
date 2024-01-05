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

  // Send investor email
  if (
    fullComment.profiles.id === fullComment.projects.creator &&
    !comment.replying_to
  ) {
    const txnsAndProfiles = await getTxnsByProject(
      supabaseAdmin,
      fullComment.projects.id
    )
    const shareholders = getShareholders(txnsAndProfiles)
    shareholders.forEach(async (shareholder) => {
      if (shareholder.profile.id !== fullComment.projects.creator) {
        await sendTemplateEmail(
          TEMPLATE_IDS.CREATOR_UPDATE,
          postmarkVars,
          shareholder.profile.id
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
