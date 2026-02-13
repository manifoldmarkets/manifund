'use client'
import { Row } from '@/components/layout/row'
import { SmallStat, statData } from '@/components/stat'
import { FullProject } from '@/db/project'
import { formatMoney } from '@/utils/formatting'
import { getAmountRaised } from '@/utils/math'
import {
  EllipsisHorizontalCircleIcon,
  CircleStackIcon,
  FireIcon,
} from '@heroicons/react/24/outline'

export function CauseData(props: { projects: FullProject[] }) {
  const { projects } = props
  const numActiveProjects = projects.filter((project) => project.stage === 'active').length
  const numProposalProjects = projects.filter((project) => project.stage === 'proposal').length
  const totalRaised = projects.reduce((acc, project) => {
    return acc + getAmountRaised(project, project.bids, project.txns)
  }, 0)
  const stats = [
    {
      label: 'total projects in the proposal stage',
      value: `${numProposalProjects.toString()} proposals`,
      icon: EllipsisHorizontalCircleIcon,
    },
    {
      label: 'total projects in the active stage',
      value: `${numActiveProjects.toString()} active projects`,
      icon: FireIcon,
    },
    {
      label: 'money contributed to projects',
      value: formatMoney(totalRaised),
      icon: CircleStackIcon,
    },
  ] as statData[]
  return (
    <Row className="mb-2 gap-5">
      {stats.map((statData) => (
        <SmallStat key={statData.label} statData={statData} />
      ))}
    </Row>
  )
}
