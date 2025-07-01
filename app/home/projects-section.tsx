import { Col } from '@/components/layout/col'
import { ProjectsDisplay } from '@/components/projects-display'
import { FullProject } from '@/db/project'
import { SimpleCause } from '@/db/cause'

export function ProjectsSection({
  projects,
  causesList,
}: {
  projects: FullProject[]
  causesList: SimpleCause[]
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <a
          href="/projects"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          View all →
        </a>
      </div>
      <ProjectsDisplay
        projects={projects}
        defaultSort={'hot'}
        causesList={causesList}
      />
    </section>
  )
}
