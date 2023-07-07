import { DataPoint } from '@/components/data-point'
import { Project } from '@/db/project'
import { formatMoney, showPrecision } from '@/utils/formatting'
import { dateDiff, getProposalValuation } from '@/utils/math'

export function ProposalData(props: { project: Project; raised: number }) {
  const { project, raised } = props
  const raisedString =
    raised > project.funding_goal
      ? `>${formatMoney(project.funding_goal)}`
      : `${formatMoney(raised)}`
  // Close it on 23:59:59 in UTC -12 aka "Anywhere on Earth" time
  const closeDate = new Date(`${project.auction_close}T23:59:59-12:00`)
  const now = new Date()
  const daysLeft = dateDiff(now.getTime(), closeDate.getTime())
  return (
    <>
      <div>
        <div className="flex justify-between">
          <DataPoint
            value={raisedString}
            label={`raised of $${project.funding_goal} goal`}
          />
          <DataPoint
            value={`${formatMoney(project.min_funding)}`}
            label="required to proceed"
          />
          {project.auction_close && (
            <DataPoint
              value={showPrecision(daysLeft, 3)}
              label="days left to contribute"
            />
          )}
          {project.type === 'cert' && (
            <DataPoint
              value={formatMoney(getProposalValuation(project))}
              label="minimum valuation"
            />
          )}
        </div>
      </div>
    </>
  )
}
