'use client'
import { Profile } from '@/db/profile'
import { useSearchParams } from 'next/navigation'
import { BidAndProject } from '@/db/bid'
import { Tabs } from '@/components/tabs'
import { FullProject } from '@/db/project'
import { Investment } from './page'
import { ProposalBids } from './user-proposal-bids'
import { ActiveBids } from './user-active-bids'
import { Investments } from './user-investments'
import { Projects } from './user-projects'
import { RichContent } from '@/components/editor'

export function ProfileTabs(props: {
  profile: Profile
  isOwnProfile?: boolean
  projects: FullProject[]
  bids: BidAndProject[]
  investments: Investment[]
}) {
  const { profile, isOwnProfile, projects, bids, investments } = props
  const proposalBids = bids.filter(
    (bid) => bid.projects.stage === 'proposal' && bid.status === 'pending'
  )
  const activeBids = bids.filter(
    (bid) => bid.projects.stage === 'active' && bid.status === 'pending'
  )
  const notOwnProjectInvestments = investments.filter((investment) => {
    return investment.project && investment.project.creator !== profile.id
  })
  const searchParams = useSearchParams() ?? new URLSearchParams()
  const currentTabName = searchParams.get('tab')
  const tabs = []

  const portfolioCount =
    proposalBids.length + activeBids.length + notOwnProjectInvestments.length
  if (portfolioCount > 0) {
    tabs.push({
      name: 'Portfolio',
      href: '?tab=portfolio',
      count: portfolioCount,
      current: currentTabName === 'portfolio' || currentTabName === null,
      display: (
        <div className="flex flex-col gap-10">
          {proposalBids.length > 0 && (
            <ProposalBids bids={proposalBids} isOwnProfile={isOwnProfile} />
          )}
          {activeBids.length > 0 && (
            <ActiveBids bids={activeBids} isOwnProfile={isOwnProfile} />
          )}
          {notOwnProjectInvestments.length > 0 && (
            <Investments investments={notOwnProjectInvestments} />
          )}
        </div>
      ),
    })
  }
  if (isOwnProfile || projects.length > 0) {
    tabs.push({
      name: 'Projects',
      href: '?tab=projects',
      count: projects.length,
      current:
        currentTabName === 'projects' ||
        (currentTabName === null && tabs.length === 0),
      display: <Projects projects={projects} />,
    })
  }
  if (profile.long_description) {
    tabs.push({
      name: 'About me',
      href: '?tab=about',
      count: 0,
      current:
        currentTabName === 'about' ||
        (currentTabName === null && tabs.length === 0),
      display: <RichContent content={profile.long_description} />,
    })
  }
  if (tabs.length > 0) {
    return <Tabs tabs={tabs} preTabSlug={`/${profile.username}`} />
  } else {
    return null
  }
}
