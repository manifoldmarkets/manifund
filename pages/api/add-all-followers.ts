import { listProjects } from '@/db/project'
// import { uniq } from 'es-toolkit'
import { uniq } from 'es-toolkit'
import { createAdminClient } from '@/db/edge'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

export default async function handler() {
  const supabase = createAdminClient()
  const projects = await listProjects(supabase)
  for (const project of projects) {
    const followerIds = []
    for (const comment of project.comments) {
      followerIds.push(comment.commenter)
    }
    for (const bid of project.bids) {
      followerIds.push(bid.bidder)
    }
    for (const txn of project.txns) {
      if (!!txn.from_id) {
        followerIds.push(txn.from_id)
      }
    }
    const uniqueFollowerIds = uniq(followerIds)
    const addFollowerPromises = uniqueFollowerIds.map((followerId) =>
      supabase.rpc('follow_project', {
        project_id: project.id,
        follower_id: followerId,
      })
    )
    await Promise.all(addFollowerPromises)
    console.log('added followers for project', project.title)
  }
}
