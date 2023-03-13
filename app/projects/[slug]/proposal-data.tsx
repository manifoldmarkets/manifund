import { ProgressBar } from '@/components/progress-bar'
import { Bid } from '@/db/bid'
import { Project } from '@/db/project'
import { formatMoney, showPrecision } from '@/utils/formatting'
import { getProposalValuation } from '@/utils/math'

export function ProposalData(props: { project: Project; bids: Bid[] }) {
  const { project, bids } = props
  const raised = bids.reduce((acc, bid) => acc + bid.amount, 0)
  const raisedString =
    raised > project.min_funding
      ? `>${formatMoney(project.min_funding)}`
      : `${formatMoney(raised)}`
  const percentRaised = Math.min((raised / project.min_funding) * 100, 100)
  // Close it on 23:59:59 in UTC -12 aka "Anywhere on Earth" time
  const closeDate = new Date(`${project.auction_close}T23:59:59-12:00`)
  const now = new Date()
  const daysLeft = datediff(now.getTime(), closeDate.getTime())
  return (
    <div>
      <div className="mb-4 flex justify-between">
        <div className="flex flex-col">
          <span className="text-xl font-bold text-orange-500">
            {raisedString}
          </span>
          <span className="text-sm text-gray-500">
            raised of ${project.min_funding} goal
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold text-orange-500">
            {showPrecision(daysLeft, 3)}
          </span>
          <span className="text-sm text-gray-500">days left to bid</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold text-orange-500">
            {formatMoney(getProposalValuation(project))}
          </span>
          <span className="text-sm text-gray-500">minimum valuation</span>
        </div>
      </div>
      <ProgressBar percent={percentRaised} />
    </div>
  )
}

function datediff(first: number, second: number) {
  return Math.round(second - first) / (1000 * 60 * 60 * 24)
}
