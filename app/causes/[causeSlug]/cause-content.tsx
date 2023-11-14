'use client'
import { RichContent } from '@/components/editor'
import { EmptyContent } from '@/components/empty-content'
import { ProjectsDisplay } from '@/components/projects-display'
import { Tabs } from '@/components/tabs'
import { FullProject } from '@/db/project'
import { Cause, MiniCause } from '@/db/cause'
import { WrenchIcon } from '@heroicons/react/20/solid'
import { useSearchParams } from 'next/navigation'
import { EditCause } from './edit-cause'

export function CauseContent(props: {
  cause: Cause
  causesList: MiniCause[]
  projects: FullProject[]
}) {
  const { cause, causesList, projects } = props
  const searchParams = useSearchParams() ?? new URLSearchParams()
  const currentTabId = searchParams.get('tab')
  const visibleProjects = projects.filter(
    (project) => project.stage !== 'hidden'
  )
  if (cause.description) {
    const tabs = [
      {
        name: 'Projects',
        id: 'projects',
        count: visibleProjects.length,
        display: (
          <>
            {visibleProjects.length === 0 ? (
              <EmptyContent
                link={'/create'}
                icon={<WrenchIcon className="h-10 w-10 text-gray-400" />}
                title={'No projects yet.'}
                subtitle={'Create one!'}
              />
            ) : (
              <ProjectsDisplay
                projects={projects}
                causesList={causesList}
                noFilter
              />
            )}
          </>
        ),
      },
      {
        name: 'About',
        id: 'about',
        count: 0,
        display: (
          <>
            <RichContent content={cause.description} />
            <EditCause cause={cause} />
          </>
        ),
      },
    ]
    return <Tabs tabs={tabs} currentTabId={currentTabId} />
  } else {
    return <ProjectsDisplay projects={projects} causesList={[]} noFilter />
  }
}
