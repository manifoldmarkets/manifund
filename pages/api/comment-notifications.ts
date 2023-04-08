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
import { getProfileByUsername } from '@/db/profile'
import { Comment } from '@/db/comment'
import { JSONContent } from '@tiptap/core'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(
    'comment-notifications webhook has been called',
    JSON.stringify(req.body.record)
  )
  const comment = req.body.record as Comment
  const supabaseAdmin = createAdminClient()
  const fullComment = await getFullCommentById(supabaseAdmin, comment.id)
  const htmlContent = generateHTML(comment.content as JSONContent, [
    StarterKit,
    DisplayLink,
    DisplayMention,
  ])
  const mentionedUsernames = parseMentions(comment.content as JSONContent)
  const mentionedUserIds = await Promise.all(
    mentionedUsernames.map(async (username) => {
      const user = await getProfileByUsername(supabaseAdmin, username)
      return user.id
    })
  )
  const NEW_COMMENT_TEMPLATE_ID = 31316102
  const postmarkVars = {
    projectTitle: fullComment.projects.title,
    projectUrl: `https://manifund.org/projects/${fullComment.projects.slug}`,
    commenterUsername: fullComment.profiles.username,
    commenterAvatarUrl: fullComment.profiles.avatar_url,
    htmlContent: JSON.stringify(htmlContent),
  }
  const sendCreatorEmail = async () => {
    await sendTemplateEmail(
      fullComment.projects.creator,
      NEW_COMMENT_TEMPLATE_ID,
      postmarkVars
    )
  }
  if (fullComment.profiles.id !== fullComment.projects.creator) {
    await sendCreatorEmail()
  }

  const sendInvestorEmail = async () => {
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
          shareholder.profile.id,
          CREATOR_UPDATE_TEMPLATE_ID,
          postmarkVars
        )
      }
    })
  }
  if (
    fullComment.profiles.id === fullComment.projects.creator &&
    !comment.replying_to
  ) {
    await sendInvestorEmail()
  }

  const sendMentionEmails = async () => {
    mentionedUserIds.forEach(async (userId) => {
      if (
        userId !== fullComment.profiles.id &&
        userId !== fullComment.projects.creator
      ) {
        const COMMENT_WITH_MENTION_TEMPLATE_ID = 31350706
        await sendTemplateEmail(
          userId,
          COMMENT_WITH_MENTION_TEMPLATE_ID,
          postmarkVars
        )
      }
    })
  }
  await sendMentionEmails()

  const sendReplyEmail = async (parentComment: Comment) => {
    await sendTemplateEmail(
      parentComment.commenter,
      NEW_COMMENT_TEMPLATE_ID,
      postmarkVars
    )
  }
  if (comment.replying_to) {
    const parentComment = await getFullCommentById(
      supabaseAdmin,
      comment.replying_to
    )
    if (
      parentComment.commenter !== fullComment.projects.creator &&
      !mentionedUsernames.includes(parentComment.profiles.username)
    ) {
      await sendReplyEmail(parentComment)
    }
  }
  res.status(200).json({
    comment,
  })
  return res
}
