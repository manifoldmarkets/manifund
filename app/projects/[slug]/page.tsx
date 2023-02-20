import { Database } from '@/db/database.types'
import { createClient, getUser } from '@/db/supabase-server'
import getProfileById, { isAdmin } from '@/db/profile'
import { SupabaseClient } from '@supabase/supabase-js'
import { PlaceBid } from './place-bid'
import { RichContent } from '@/components/editor'
import { CloseBidding } from './close-bidding'
import { EditDescription } from './edit-description'
import { BidsTable } from '../bids-table'

export default async function ProjectPage(props: { params: { slug: string } }) {
  const { slug } = props.params

  const supabase = createClient()
  const project = await getProject(supabase, slug)
  const creator = await getProfileById(supabase, project.creator)
  const user = await getUser(supabase)

  const isOwnProject = user?.id === creator?.id

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold">{project.title}</h2>
        <p className="text-gray-500">by {creator.username}</p>
      </div>
      {project.description && <RichContent content={project.description} />}
      {isOwnProject && <EditDescription project={project} />}
      {user && (
        <PlaceBid
          projectId={project.id}
          minFunding={project.min_funding}
          founderPortion={project.founder_portion}
          userId={user?.id}
        />
      )}
      {isAdmin(user) && <CloseBidding project={project} />}
      {/* @ts-expect-error Server Component */}
      <BidsTable projectId={project.id} />
    </div>
  )
}

async function getProject(supabase: SupabaseClient, slug: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
  if (error) {
    throw error
  }
  return data[0] as Database['public']['Tables']['projects']['Row']
}
;``
