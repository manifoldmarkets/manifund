import { Col } from '@/components/layout/col'
import { ProjectCard } from '@/components/project-card'
import { listProjects } from '@/db/project'
import { createServerClient } from '@/db/supabase-server'

// export const revalidate = 60

export default async function Home(props: {
  // searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createServerClient()
  const projects = await listProjects(supabase)

  return (
    <Col className="gap-16 px-3 py-5 sm:px-6">
      {projects.map((project) => (
        <ProjectCard project={project} key={project.id} />
      ))}
    </Col>
  )
}
