import { Project } from '@/db/project'
import { Round } from '@/db/round'
import { getRoundTheme } from '@/utils/constants'
import { formatMoney, showPrecision } from '@/utils/formatting'
import { dateDiff } from '@/utils/math'
import { DataPoint } from './data-point'
import { Col } from './layout/col'

export function RoundData(props: { round: Round; projects: Project[] }) {
  const { round, projects } = props
  const auctionCloseDate = new Date(
    `${round.auction_close_date}T23:59:59-12:00`
  )
  const proposalDueDate = new Date(`${round.proposal_due_date}T23:59:59-12:00`)
  const evalDate = new Date(`${round.eval_date}T23:59:59-12:00`)
  const now = new Date()
  const daysTilAuctionClose = dateDiff(
    now.getTime(),
    auctionCloseDate.getTime()
  )
  const daysTilProposalsDue = dateDiff(now.getTime(), proposalDueDate.getTime())
  const daysTilEvals = dateDiff(now.getTime(), evalDate.getTime())
  return (
    <Col className="w-full">
      <div className="flex justify-between">
        {round.title === 'Independent' || daysTilAuctionClose > 0 ? (
          <DataPoint
            value={projects
              .filter((project) => project.stage === 'proposal')
              .length.toString()}
            label="proposals"
            theme={getRoundTheme(round.title)}
          />
        ) : null}
        {round.title === 'Independent' && (
          <DataPoint
            value={projects
              .filter((project) => project.stage === 'not funded')
              .length.toString()}
            label="unfunded projects"
            theme={getRoundTheme(round.title)}
          />
        )}
        {round.title === 'Independent' || daysTilAuctionClose < 0 ? (
          <DataPoint
            value={projects
              .filter((project) => project.stage === 'active')
              .length.toString()}
            label="active projects"
            theme={getRoundTheme(round.title)}
          />
        ) : null}
        {round.retro_pool && (
          <DataPoint
            value={formatMoney(round.retro_pool)}
            label="available retro funding"
            theme={getRoundTheme(round.title)}
          />
        )}
        {daysTilAuctionClose > 0 && round.auction_close_date !== null ? (
          <DataPoint
            value={showPrecision(daysTilAuctionClose, 3)}
            label="days left to bid"
            theme={getRoundTheme(round.title)}
          />
        ) : null}
        {daysTilProposalsDue > 0 && round.proposal_due_date !== null ? (
          <DataPoint
            value={showPrecision(daysTilProposalsDue, 3)}
            label="days left to submit proposals"
            theme={getRoundTheme(round.title)}
          />
        ) : null}
        {daysTilAuctionClose < 0 && daysTilEvals > 0 ? (
          <DataPoint
            value={showPrecision(daysTilEvals, 3)}
            label="days until close"
            theme={getRoundTheme(round.title)}
          />
        ) : null}
      </div>
    </Col>
  )
}
