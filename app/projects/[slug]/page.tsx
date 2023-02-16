import { Database } from '@/db/database.types'
import { createClient } from '@/db/supabase-server'
import getProfileById from '@/db/profile'
import { SupabaseClient } from '@supabase/supabase-js'

export default async function ProjectPage(props: { params: { slug: string } }) {
  const { slug } = props.params
  const supabase = createClient()
  const project = await getProject(supabase, slug)
  const creator = await getProfileById(supabase, project.creator)
  return (
    <div>
      {project.title} was made by {creator.username}
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
