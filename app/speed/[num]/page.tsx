import { Col } from '@/components/layout/col'
import { ProjectCard } from '@/components/project-card'
import { listProjects } from '@/db/project'
import { createServerClientCached } from '@/db/supabase-server-cacheable'
import { timeit } from '@/utils/perf'

export function generateStaticParams() {
  // Statically render for 10, 30, 60, 100, 200, and 500
  return ['10', '30', '60', '100', '200', '500'].map((num) => ({
    params: { num },
  }))
}

export default async function SpeedHome(props: { params: { num: string } }) {
  const { params } = props
  const limit = parseInt(params.num)
  const supabase = createServerClientCached()
  const projects = await timeit(listProjects)(supabase, limit)

  return (
    <Col className="gap-16 px-3 py-5 sm:px-6">
      {projects.map((project) => (
        <ProjectCard project={project} key={project.id} />
      ))}
    </Col>
  )
}
