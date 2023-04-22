'use client'
import { RichContent } from '@/components/editor'
import { ProjectsDisplay } from '@/components/projects-display'
import { Tabs } from '@/components/tabs'
import { FullProject } from '@/db/project'
import { Round } from '@/db/round'
import { useSearchParams } from 'next/navigation'
import { EditRound } from './edit-round'

export function RoundTabs(props: { round: Round; projects: FullProject[] }) {
  const { round, projects } = props
  const searchParams = useSearchParams() ?? new URLSearchParams()
  const currentTabName = searchParams.get('tab')
  const tabs = [
    {
      name: 'Projects',
      href: `?tab=projects`,
      count: projects.length,
      current: currentTabName === 'projects' || currentTabName === null,
      display: (
        <ProjectsDisplay projects={projects} defaultSort={'valuation'} />
      ),
    },
    {
      name: 'About',
      href: `?tab=about`,
      count: 0,
      current: currentTabName === 'about',
      display: (
        <div>
          {round.description && <RichContent content={round.description} />}
          <EditRound round={round} />
        </div>
      ),
    },
  ]
  if (round.title === 'Regrants') {
    tabs.push({
      name: 'Regranters',
      href: `?tab=regrants`,
      count: 0,
      current: currentTabName === 'regrants',
      display: (
        <div>
          <p>Regrants are grants made to other grantmakers.</p>
        </div>
      ),
    })
  }
  return <Tabs tabs={tabs} preTabSlug={`/rounds/${round.slug}`} />
}
