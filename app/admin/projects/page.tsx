import { createAdminClient } from '@/db/edge'
import { listProjects } from '@/db/project'
import { ProjectTable, ProjectRow } from './project-table'

export const revalidate = 300

export default async function ProjectsPage() {
  const supabaseAdmin = createAdminClient()
  const projects = await listProjects(supabaseAdmin)

  const rows: ProjectRow[] = projects.map((project) => ({
    id: project.id,
    slug: project.slug,
    title: project.title,
    username: project.profiles?.username ?? null,
    minFunding: project.min_funding,
    stage: project.stage,
  }))

  return <ProjectTable projects={rows} />
}
