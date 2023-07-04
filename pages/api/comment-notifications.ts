import { createAdminClient } from './_db'
import { NextApiRequest, NextApiResponse } from 'next'
import { generateHTML } from '@tiptap/html'
import { getFullCommentById } from '@/db/comment'
import { sendTemplateEmail } from '@/utils/email'
import { calculateShareholders } from '@/app/projects/[slug]/project-tabs'
import { calculateFullTrades } from '@/utils/math'
import { getTxnsByProject } from '@/db/txn'
import StarterKit from '@tiptap/starter-kit'
import { DisplayMention } from '@/components/user-mention/mention-extension'
import { DisplayLink } from '@/components/editor'
import { parseMentions } from '@/utils/parse'
import { Comment } from '@/db/comment'
import { JSONContent } from '@tiptap/core'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const comment = req.body.record as Comment
  const supabaseAdmin = createAdminClient()
  const fullComment = await getFullCommentById(supabaseAdmin, comment.id)
  const htmlContent = generateHTML(comment.content as JSONContent, [
    StarterKit,
    DisplayLink,
    DisplayMention,
  ])
  const mentionedUserIds = parseMentions(comment.content as JSONContent)

  const NEW_COMMENT_TEMPLATE_ID = 31316102
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
      NEW_COMMENT_TEMPLATE_ID,
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
    const trades = calculateFullTrades(txnsAndProfiles)
    const shareholders = calculateShareholders(trades, fullComment.profiles)
    const CREATOR_UPDATE_TEMPLATE_ID = 31328698
    shareholders.forEach(async (shareholder) => {
      if (shareholder.profile.id !== fullComment.projects.creator) {
        await sendTemplateEmail(
          CREATOR_UPDATE_TEMPLATE_ID,
          postmarkVars,
          shareholder.profile.id
        )
      }
    })
  }

  // Send mentioned user emails
  const COMMENT_WITH_MENTION_TEMPLATE_ID = 31350706
  await Promise.all(
    mentionedUserIds
      .filter(
        (userId) =>
          userId !== fullComment.profiles.id &&
          userId !== fullComment.projects.creator
      )
      .map((userId) =>
        sendTemplateEmail(
          COMMENT_WITH_MENTION_TEMPLATE_ID,
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
        NEW_COMMENT_TEMPLATE_ID,
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
