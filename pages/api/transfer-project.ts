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
import { SupabaseClient, User } from '@supabase/supabase-js'
import { getProfileById } from '@/db/profile'
import { Database } from '@/db/database.types'
import { Project } from '@/db/project'

type ProjectTransferAndProject =
  Database['public']['Tables']['project_transfers']['Row'] & {
    projects: Project
  }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = req.body.record as User
  const supabaseAdmin = createAdminClient()
  const projectTransfers = await getTransfersByEmail(
    supabaseAdmin,
    user.email ?? ''
  )
  projectTransfers.forEach(async (transfer) => {
    await transferProject(supabaseAdmin, transfer, user.id)
  })
  res.status(200).json({
    message: `Transferred ${projectTransfers.length} projects to ${user.id}`,
  })
  return res
}

async function getTransfersByEmail(supabase: SupabaseClient, toEmail: string) {
  const { data, error } = await supabase
    .from('bids')
    .select('*, projects(*)')
    .eq('to_email', toEmail)
  if (error) {
    throw error
  }
  return data as ProjectTransferAndProject[]
}

async function transferProject(
  supabaseAdmin: SupabaseClient,
  transfer: ProjectTransferAndProject,
  toId: string
) {
  const { error: updateProjectError } = await supabaseAdmin
    .from('projects')
    .update({ creator: toId })
    .eq('id', transfer.project_id)
  if (updateProjectError) {
    throw updateProjectError
  }
  const { error: updateTransferError } = await supabaseAdmin
    .from('project-transfers')
    .update({ transferred: true })
    .eq('id', transfer.id)
  if (updateTransferError) {
    throw updateTransferError
  }
  const { error: insertTxnError } = await supabaseAdmin.from('txns').insert({
    from_id: transfer.projects.creator,
    to_id: toId,
    project: transfer.project_id,
    amount: transfer.grant_amount,
    token: 'USD',
  })
  if (insertTxnError) {
    throw insertTxnError
  }
}
