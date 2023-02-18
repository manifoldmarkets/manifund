import { Database } from '@/db/database.types'
import { createClient, getUser } from '@/db/supabase-server'
import getProfileById, { getProfileByUsername } from '@/db/profile'
import { SupabaseClient } from '@supabase/supabase-js'
import { PlaceBid } from './place-bid'

export default async function ProjectPage(props: { params: { slug: string } }) {
  const { slug } = props.params

  const supabase = createClient()
  const project = await getProject(supabase, slug)
  const creator = await getProfileById(supabase, project.creator)
  const user = await getUser(supabase)

  const isOwnProject = user?.id === creator?.id

  return (
    <div>
      {project.title} was made by {creator.username}
      {user && (
        <PlaceBid
          project_id={project.id}
          min_funding={project.min_funding}
          founder_portion={project.founder_portion}
          user={user?.id}
        />
      )}
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
