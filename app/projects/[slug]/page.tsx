import { Database } from '@/utils/database.types'
import { createClient, getUser } from '@/utils/supabase-server'
import { SupabaseClient } from '@supabase/supabase-js'

export default async function ProjectPage(props: { params: { slug: string } }) {
  const { slug } = props.params
  const project = await getProject(slug)
  return (
    <div>
      {project.title} was made by {project.creator}
    </div>
  )
}

async function getProject(slug: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
  if (error) {
    throw error
  }
  return data[0] as Database['public']['Tables']['projects']['Row']
}
