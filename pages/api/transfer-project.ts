import { createAdminClient } from './_db'
import { NextApiRequest, NextApiResponse } from 'next'
import { SupabaseClient, User } from '@supabase/supabase-js'
import { Database } from '@/db/database.types'
import { Project } from '@/db/project'
import uuid from 'react-uuid'

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
    if (!transfer.transferred) {
      let args = {
        project_id: transfer.projects.id,
        to_id: user.id,
        from_id: transfer.projects.creator,
        transfer_id: transfer.id,
        amount: transfer.grant_amount ?? 0,
      }
      await supabaseAdmin.rpc('_transfer_project', args).throwOnError()
    }
  })
  res.status(200).json({
    message: `Transferred ${projectTransfers.length} projects to ${user.id}`,
  })
  return res
}

async function getTransfersByEmail(supabase: SupabaseClient, toEmail: string) {
  const { data, error } = await supabase
    .from('project_transfers')
    .select('*, projects(*)')
    .eq('to_email', toEmail)
  if (error) {
    throw error
  }
  return data as ProjectTransferAndProject[]
}
