'use client'
import { RichContent } from '@/components/editor'
import { ProjectsDisplay } from '@/components/projects-display'
import { RegranterCard } from '@/components/regranter-card'
import { Tabs } from '@/components/tabs'
import { Profile } from '@/db/profile'
import { FullProject } from '@/db/project'
import { Round } from '@/db/round'
import { useSearchParams } from 'next/navigation'
import { EditRound } from './edit-round'

export function RoundTabs(props: {
  round: Round
  projects: FullProject[]
  regranters?: Profile[]
}) {
  const { round, projects, regranters } = props
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
  ]
  if (round.title === 'Regrants' && regranters) {
    tabs.push({
      name: 'Regranters',
      href: `?tab=regrants`,
      count: regranters.length,
      current: currentTabName === 'regrants',
      display: (
        <div className=" mt-2 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {regranters.map((regranter) => {
            return <RegranterCard key={regranter.id} regranter={regranter} />
          })}
        </div>
      ),
    })
  }
  tabs.push({
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
  })
  return <Tabs tabs={tabs} preTabSlug={`/rounds/${round.slug}`} />
}
