import { Col } from '@/components/layout/col'
import { ProjectCard } from '@/components/project-card'
import { listProjects } from '@/db/project'
import { createServerClientCached } from '@/db/supabase-server-cacheable'

export default async function SpeedHome() {
  const supabase = createServerClientCached()
  const projects = await listProjects(supabase)

  return (
    <Col className="gap-16 px-3 py-5 sm:px-6">
      {projects.map((project) => (
        <ProjectCard project={project} key={project.id} />
      ))}
    </Col>
  )
}
