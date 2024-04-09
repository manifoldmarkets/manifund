import { createServerClient } from '@/db/supabase-server'
import { listProjects } from '@/db/project'
import { getUser } from '@/db/profile'
import { ProjectRow } from './project-row'

// Note: These options make /projects static, but not when accessed from Home
export const runtime = 'nodejs'
export const dynamic = 'force-static'

export default async function Projects(props: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createServerClient()
  const projects = await listProjects(supabase)

  return (
    <div className="p-5">
      {projects.map((project) => (
        <>
          {/* @ts-expect-error Server Component */}
          <ProjectRow key={project.id} project={project} />
        </>
      ))}
    </div>
  )
}

async function get2023Deposits(supabase: any) {
  const { data: txns } = await supabase
    .from('txns')
    .select('*, projects(id, title), profiles!txns_to_id_fkey(id, full_name)')
    .gte('created_at', '2023-01-01')
    .lte('created_at', '2023-12-31')
    .eq('type', 'deposit')
  return txns
}
