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
import { Profile } from '@/db/profile'
import { TxnAndProfiles } from '@/db/txn'
import { DonateSection } from './donate-section'
import { DonationsHistory } from '@/components/donations-history'
import { DividerWithHeader } from '@/components/divider-with-header'

export function CauseTabs(props: {
  cause: Cause
  causesList: MiniCause[]
  projects: FullProject[]
  fund?: Profile
  fundTxns?: TxnAndProfiles[]
  userId?: string
  charityBalance: number
}) {
  const {
    cause,
    causesList,
    projects,
    fund,
    fundTxns,
    userId,
    charityBalance,
  } = props
  const searchParams = useSearchParams() ?? new URLSearchParams()
  const currentTabId = searchParams.get('tab')
  const visibleProjects = projects.filter(
    // TODO: add filter back
    (project) => true
    // project.stage !== 'hidden'
  )
  const grants = visibleProjects.filter(
    (project) => project.type === 'grant' || project.type === 'dummy'
  )
  const certs = visibleProjects.filter((project) => project.type === 'cert')
  const tabs = [
    {
      name: 'Grants',
      id: 'grants',
      count: grants.length,
      display: (
        <>
          {grants.length === 0 ? (
            <EmptyContent
              icon={<WrenchIcon className="h-10 w-10 text-gray-400" />}
              title={'Coming soon!'}
              subtitle={'No projects here yet.'}
            />
          ) : (
            <ProjectsDisplay
              projects={grants}
              causesList={causesList}
              noFilter
            />
          )}
        </>
      ),
    },
    {
      name: 'Impact certificates',
      id: 'certs',
      count: certs.length,
      display: (
        <>
          {certs.length === 0 ? (
            <EmptyContent
              icon={<WrenchIcon className="h-10 w-10 text-gray-400" />}
              title={'Coming soon!'}
              subtitle={'No projects here yet.'}
            />
          ) : (
            <ProjectsDisplay
              projects={certs}
              causesList={causesList}
              noFilter
            />
          )}
        </>
      ),
    },
  ]
  if (cause.description) {
    tabs.push({
      name: 'About',
      id: 'about',
      count: 0,
      display: (
        <>
          <RichContent content={cause.description} />
          <EditCause cause={cause} />
        </>
      ),
    })
  }
  if (fund && fundTxns) {
    tabs.push({
      name: 'Donate',
      id: 'donate',
      count: 0,
      display: (
        <>
          <span className="text-gray-600">{fund.bio}</span>
          <DonateSection
            fund={fund}
            charityBalance={charityBalance}
            userId={userId}
          />
          <DividerWithHeader header="Donations history" />
          <DonationsHistory donations={fundTxns} />
        </>
      ),
    })
  }
  return <Tabs tabs={tabs} currentTabId={currentTabId} />
}
