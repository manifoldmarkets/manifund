import { DataPoint } from '@/components/data-point'
import { Row } from '@/components/layout/row'
import { Project } from '@/db/project'
import { formatMoney } from '@/utils/formatting'
import { differenceInDays, differenceInHours, format } from 'date-fns'

export function ProjectData(props: {
  project: Project
  raised: number
  valuation: number
}) {
  const { project, raised, valuation } = props
  const raisedString =
    raised > project.funding_goal &&
    project.type === 'cert' &&
    project.stage === 'proposal'
      ? `>${formatMoney(project.funding_goal)}`
      : `${formatMoney(raised)}`
  // Close it on 23:59:59 in UTC -12 aka "Anywhere on Earth" time
  const closeDate = new Date(`${project.auction_close}T23:59:59-12:00`)
  const now = new Date()
  const daysLeft = differenceInDays(closeDate, now)
  const hoursLeft = daysLeft < 1 ? differenceInHours(closeDate, now) : 0
  return (
    <Row className="justify-between">
      <DataPoint
        value={raisedString}
        label={`raised${
          !!project.funding_goal ? ` of $${project.funding_goal} goal` : ''
        }`}
      />
      {project.stage === 'proposal' && (
        <DataPoint
          value={`${formatMoney(project.min_funding)}`}
          label="minimum funding"
        />
      )}
      {project.auction_close && project.stage === 'proposal' && (
        <DataPoint
          value={(hoursLeft ? hoursLeft : daysLeft).toString()}
          label={`${hoursLeft ? 'hours' : 'days'} left to contribute`}
        />
      )}
      {project.type === 'cert' && (
        <DataPoint value={formatMoney(valuation)} label="valuation" />
      )}
      {project.stage !== 'proposal' && (
        <DataPoint
          value={format(new Date(project.created_at), 'MM/dd/yyyy')}
          label={`date created`}
        />
      )}
    </Row>
  )
}
