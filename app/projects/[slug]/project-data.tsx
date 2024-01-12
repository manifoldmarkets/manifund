import { Row } from '@/components/layout/row'
import { Project } from '@/db/project'
import { formatMoney } from '@/utils/formatting'
import {
  ArrowTrendingUpIcon,
  CalendarIcon,
  ExclamationCircleIcon,
  CircleStackIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { PiTarget } from 'react-icons/pi'
import { differenceInDays, differenceInHours, format } from 'date-fns'
import { Tooltip } from '@/components/tooltip'

type dataPoint = {
  label: string
  value: string
  icon: typeof ArrowTrendingUpIcon
  show: boolean
}

export function ProjectData(props: {
  project: Project
  raised: number
  valuation: number
  minimum: number
}) {
  const { project, raised, valuation, minimum } = props
  // Close it on 23:59:59 in UTC -12 aka "Anywhere on Earth" time
  const closeDate = new Date(`${project.auction_close}T23:59:59-12:00`)
  const now = new Date()
  const daysLeft = differenceInDays(closeDate, now)
  const hoursLeft = daysLeft < 1 ? differenceInHours(closeDate, now) : 0
  0
  const dataPoints = [
    {
      label: 'total funds raised',
      value: formatMoney(raised),
      icon: CircleStackIcon,
      show: true,
    },
    {
      label: 'additional funding required to proceed',
      value: `${formatMoney(Math.max(minimum - raised, 0))}`,
      icon: ExclamationCircleIcon,
      show: project.stage === 'proposal',
    },
    {
      label: 'funding goal',
      value: formatMoney(project.funding_goal),
      icon: PiTarget,
      show: true,
    },
    {
      label: 'valuation',
      value: formatMoney(valuation),
      icon: ArrowTrendingUpIcon,
      show: project.type === 'cert',
    },
    {
      label: `${hoursLeft ? 'hours' : 'days'} left to contribute`,
      value: `${Math.max(hoursLeft ? hoursLeft : daysLeft, 0)} ${
        hoursLeft ? 'hours' : 'days'
      }`,
      icon: ClockIcon,
      show: project.auction_close && project.stage === 'proposal',
    },
    {
      label: 'date created',
      value: format(new Date(project.created_at), 'MM/dd/yyyy'),
      icon: CalendarIcon,
      show: project.stage !== 'proposal',
    },
  ] as dataPoint[]
  return (
    <Row className="justify-end gap-5">
      {dataPoints.map((dataPoint) => {
        if (dataPoint.show) {
          return <SmallDataPoint key={dataPoint.label} dataPoint={dataPoint} />
        }
      })}
    </Row>
  )
}

function SmallDataPoint(props: { dataPoint: dataPoint }) {
  const { dataPoint } = props
  return (
    <Tooltip text={dataPoint.label}>
      <Row className="items-center gap-0.5">
        <dataPoint.icon className="h-5 w-5 text-gray-500" />
        <span className="text-xs text-gray-500">{dataPoint.value} </span>
      </Row>
    </Tooltip>
  )
}
