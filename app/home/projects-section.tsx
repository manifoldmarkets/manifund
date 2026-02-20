import { ProjectsDisplay } from '@/components/projects-display'
import { FullProject } from '@/db/project'
import { SimpleCause } from '@/db/cause'
import { HomeHeader } from '@/components/home-header'

export function ProjectsSection({
  projects,
  causesList,
}: {
  projects: FullProject[]
  causesList: SimpleCause[]
}) {
  return (
    <section className="space-y-4">
      <HomeHeader title="Projects" viewAllLink="/projects" />
      <ProjectsDisplay
        projects={projects}
        defaultSort={'hot'}
        causesList={causesList}
      />
    </section>
  )
}
