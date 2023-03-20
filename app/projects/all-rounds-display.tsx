import { Col } from '@/components/layout/col'
import { Project } from '@/db/project'
import { Round } from '@/db/round'
import { formatMoney, showPrecision } from '@/utils/formatting'
import { dateDiff } from '@/utils/math'
import Link from 'next/link'

export function AllRoundsDisplay(props: {
  rounds: Round[]
  projects: Project[]
}) {
  const { rounds, projects } = props
  return (
    <Col className="mb-5 gap-3">
      {rounds.map((round) => (
        <Round
          key={round.title}
          round={round}
          projects={projects.filter((project) => project.round === round.title)}
        />
      ))}
    </Col>
  )
}

function Round(props: { round: Round; projects: Project[] }) {
  const { round, projects } = props
  return (
    <Col className="rounded-md border border-gray-200 bg-white p-4 shadow hover:bg-gray-100">
      <h1 className="text-2xl">{round.title}</h1>
      <RoundFooter round={round} projects={projects} />
    </Col>
  )
}

function RoundFooter(props: { round: Round; projects: Project[] }) {
  const { round, projects } = props
  const closeDate = new Date(`${round.auction_close_date}T23:59:59-12:00`)
  const now = new Date()
  const daysLeft = dateDiff(now.getTime(), closeDate.getTime())
  return (
    <Col className="mt-4">
      <div className="mb-4 flex justify-between">
        {round.title === 'Independent' || daysLeft > 0 ? (
          <DataPoint
            value={projects
              .filter((project) => project.stage === 'proposal')
              .length.toString()}
            label="proposals"
          />
        ) : null}
        {round.title === 'Independent' || daysLeft < 0 ? (
          <DataPoint
            value={projects
              .filter((project) => project.stage === 'active')
              .length.toString()}
            label="active projects"
          />
        ) : null}
        {round.retro_pool && (
          <DataPoint
            value={formatMoney(round.retro_pool)}
            label="pledged retro funding"
          />
        )}
        {daysLeft > 0 && (
          <DataPoint
            value={showPrecision(daysLeft, 3)}
            label="days left to bid"
          />
        )}
      </div>
    </Col>
  )
}

function DataPoint(props: { value: string; label: string }) {
  const { value, label } = props
  return (
    <Col>
      <span className="text-xl font-bold text-orange-500">{value}</span>
      <span className="text-sm text-gray-500">{label}</span>
    </Col>
  )
}
