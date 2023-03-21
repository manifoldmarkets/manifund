'use client'
import { ProjectsDisplay } from '@/components/projects-display'
import { Tabs } from '@/components/tabs'
import { FullProject } from '@/db/project'
import { Round } from '@/db/round'
import { useSearchParams } from 'next/navigation'

export function RoundTabs(props: { round: Round; projects: FullProject[] }) {
  const { round, projects } = props
  const searchParams = useSearchParams()
  const currentTabName = searchParams.get('tab')
  const tabs = [
    {
      name: 'Projects',
      href: `?tab=projects`,
      count: projects.length,
      current: currentTabName === 'projects' || currentTabName === null,
      display: <ProjectsDisplay projects={projects} />,
    },
    {
      name: 'About',
      href: `?tab=about`,
      count: 0,
      current: currentTabName === 'about',
      display: <div>About</div>,
    },
  ]
  return <Tabs tabs={tabs} preTabSlug={`/rounds/${round.slug}`} />
}
