'use client'
import { RichContent } from '@/components/editor'
import { EmptyContent } from '@/components/empty-content'
import { ProjectsDisplay } from '@/components/projects-display'
import { ProfileCard } from '@/components/profile-card'
import { Tabs } from '@/components/tabs'
import { Profile } from '@/db/profile'
import { FullProject } from '@/db/project'
import { Round } from '@/db/round'
import { SimpleCause } from '@/db/cause'
import { getSponsoredAmount2023 } from '@/utils/constants'
import { UserPlusIcon, WrenchIcon } from '@heroicons/react/20/solid'
import { sortBy } from 'es-toolkit/compat'
import { useSearchParams } from 'next/navigation'
import { EditRound } from './edit-round'

export function RoundTabs(props: {
  round: Round
  projects: FullProject[]
  causesList: SimpleCause[]
  regranters?: Profile[]
}) {
  const { round, projects, causesList, regranters } = props
  const searchParams = useSearchParams() ?? new URLSearchParams()
  const currentTabId = searchParams.get('tab')
  const visibleProjects = projects.filter(
    (project) => project.stage !== 'hidden'
  )
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
            <ProjectsDisplay projects={projects} causesList={causesList} />
          )}
        </>
      ),
    },
  ]
  if (round.title === 'Regrants' && regranters) {
    const sortedRegranters = sortBy(regranters, [
      function (regranter: Profile) {
        return -getSponsoredAmount2023(regranter.id)
      },
    ])
    tabs.push({
      name: 'Regrantors',
      id: 'regrants',
      count: sortedRegranters.length,
      display: (
        <>
          {sortedRegranters.length === 0 ? (
            <EmptyContent
              icon={<UserPlusIcon className="h-10 w-10 text-gray-400" />}
              title={'No regrantors yet.'}
              subtitle={'Pending kickoff in early June.'}
            />
          ) : (
            <div className="mt-2 grid grid-cols-2 gap-4 lg:grid-cols-3">
              {sortedRegranters.map((regranter) => {
                return (
                  <ProfileCard
                    key={regranter.id}
                    sponsoredAmount={getSponsoredAmount2023(regranter.id)}
                    profile={regranter}
                  />
                )
              })}
            </div>
          )}
        </>
      ),
    })
  }
  tabs.push({
    name: 'About',
    id: 'about',
    count: 0,
    display: (
      <div>
        {round.description && <RichContent content={round.description} />}
        <EditRound round={round} />
      </div>
    ),
  })
  return <Tabs tabs={tabs} currentTabId={currentTabId} />
}
