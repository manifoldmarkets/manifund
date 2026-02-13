import { getRegranters, Profile } from '@/db/profile'
import { Project } from '@/db/project'
import { Round } from '@/db/round'
import { createServerSupabaseClient } from '@/db/supabase-server'
import { getRoundTheme } from '@/utils/constants'
import { formatMoney, showPrecision } from '@/utils/formatting'
import { differenceInDays } from 'date-fns'
import { Stat } from './stat'
import { Col } from './layout/col'
import { Row } from './layout/row'

export async function RoundData(props: { round: Round; projects: Project[] }) {
  const { round, projects } = props
  const auctionCloseDate = new Date(`${round.auction_close_date}T23:59:59-12:00`)
  const proposalDueDate = new Date(`${round.proposal_due_date}T23:59:59-12:00`)
  const evalDate = new Date(`${round.eval_date}T23:59:59-12:00`)
  const now = new Date()
  const daysTilAuctionClose = differenceInDays(now.getTime(), auctionCloseDate.getTime())
  const daysTilProposalsDue = differenceInDays(now.getTime(), proposalDueDate.getTime())
  const daysTilEvals = differenceInDays(now.getTime(), evalDate.getTime())
  const supabase = await createServerSupabaseClient()
  const regranters = round.title === 'Regrants' ? await getRegranters(supabase) : []
  return (
    <Col className="w-full">
      <Row className="flex justify-between gap-3">
        {round.title === 'Regrants' && (
          <Stat
            value={regranters.length.toString()}
            label="regrantors"
            theme={getRoundTheme(round.title)}
          />
        )}
        {(round.title === 'Regrants' || daysTilEvals < 0) && (
          <Stat
            value={projects.length.toString()}
            label={projects.length === 1 ? 'project' : 'projects'}
            theme={getRoundTheme(round.title)}
          />
        )}
        {round.title === 'Independent' || daysTilAuctionClose > 0 ? (
          <Stat
            value={projects.filter((project) => project.stage === 'proposal').length.toString()}
            label="proposals"
            theme={getRoundTheme(round.title)}
          />
        ) : null}
        {round.title === 'Independent' && (
          <Stat
            value={projects.filter((project) => project.stage === 'not funded').length.toString()}
            label="unfunded projects"
            theme={getRoundTheme(round.title)}
          />
        )}
        {round.title === 'Independent' || daysTilAuctionClose < 0 ? (
          <Stat
            value={projects.filter((project) => project.stage === 'active').length.toString()}
            label="active projects"
            theme={getRoundTheme(round.title)}
          />
        ) : null}
        {round.retro_pool && (
          <Stat
            value={formatMoney(round.retro_pool)}
            label="available funding"
            theme={getRoundTheme(round.title)}
          />
        )}
        {daysTilAuctionClose > 0 && round.auction_close_date !== null ? (
          <Stat
            value={showPrecision(daysTilAuctionClose, 3)}
            label="days to bid"
            theme={getRoundTheme(round.title)}
          />
        ) : null}
        {daysTilProposalsDue > 0 && round.proposal_due_date !== null ? (
          <Stat
            value={showPrecision(daysTilProposalsDue, 3)}
            label="days to submit projects"
            theme={getRoundTheme(round.title)}
          />
        ) : null}
        {(daysTilAuctionClose < 0 || round.auction_close_date === null) && daysTilEvals > 0 ? (
          <Stat
            value={showPrecision(daysTilEvals, 3)}
            label="days until project evals"
            theme={getRoundTheme(round.title)}
          />
        ) : null}
      </Row>
    </Col>
  )
}
