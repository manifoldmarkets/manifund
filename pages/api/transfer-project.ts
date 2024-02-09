import { createAdminClient } from './_db'
import { NextApiRequest, NextApiResponse } from 'next'
import { User } from '@supabase/supabase-js'
import { getTransfersByEmail } from '@/db/project-transfer'

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
        transfer_id: transfer.id,
      }
      await supabaseAdmin.rpc('_transfer_project', args).throwOnError()
    }
  })
  res.status(200).json({
    message: `Transferred ${projectTransfers.length} projects to ${user.id}`,
  })
  return res
}
