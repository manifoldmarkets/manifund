import { DataPoint } from '@/components/data-point'
import { ProgressBar } from '@/components/progress-bar'
import { Bid } from '@/db/bid'
import { Project, TOTAL_SHARES } from '@/db/project'
import { formatMoney, showPrecision } from '@/utils/formatting'
import { dateDiff, getProposalValuation } from '@/utils/math'

export function ProposalData(props: { project: Project; bids: Bid[] }) {
  const { project, bids } = props
  const isImpactCert = project.founder_portion !== TOTAL_SHARES
  const raised = bids.reduce((acc, bid) => acc + bid.amount, 0)
  const raisedString =
    raised > project.min_funding
      ? `>${formatMoney(project.min_funding)}`
      : `${formatMoney(raised)}`
  const percentRaised = Math.min((raised / project.min_funding) * 100, 100)
  // Close it on 23:59:59 in UTC -12 aka "Anywhere on Earth" time
  const closeDate = new Date(`${project.auction_close}T23:59:59-12:00`)
  const now = new Date()
  const daysLeft = dateDiff(now.getTime(), closeDate.getTime())
  return (
    <div>
      <div className="mb-4 flex justify-between">
        <DataPoint
          value={raisedString}
          label={`raised of $${project.funding_goal} goal`}
        />
        <DataPoint
          value={`$${project.min_funding}`}
          label="required to proceed"
        />
        <DataPoint
          value={showPrecision(daysLeft, 3)}
          label="days left to contribute"
        />
        {isImpactCert && (
          <DataPoint
            value={formatMoney(getProposalValuation(project))}
            label="minimum valuation"
          />
        )}
      </div>
      <ProgressBar percent={percentRaised} />
    </div>
  )
}
