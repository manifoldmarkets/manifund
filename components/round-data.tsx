import { Project } from '@/db/project'
import { Round } from '@/db/round'
import { formatMoney, showPrecision } from '@/utils/formatting'
import { dateDiff } from '@/utils/math'
import { DataPoint } from './data-point'
import { Col } from './layout/col'

export function RoundData(props: { round: Round; projects: Project[] }) {
  const { round, projects } = props
  const closeDate = new Date(`${round.auction_close_date}T23:59:59-12:00`)
  const now = new Date()
  const daysLeft = dateDiff(now.getTime(), closeDate.getTime())
  return (
    <Col className="w-full">
      <div className="flex justify-between">
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
