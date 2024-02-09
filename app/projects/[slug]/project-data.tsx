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
import { statData, SmallStat } from '@/components/stat'

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
  const stats = [
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
  ] as statData[]
  return (
    <Row className="gap-5 px-1 sm:justify-end">
      {stats.map((statData) => {
        if (statData.show) {
          return <SmallStat key={statData.label} statData={statData} />
        }
      })}
    </Row>
  )
}
