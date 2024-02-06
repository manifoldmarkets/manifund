import clsx from 'clsx'
import { Tooltip } from './tooltip'
import { Col } from './layout/col'
import { Row } from './layout/row'
import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline'

export function Stat(props: {
  value: string
  label: string
  theme?: string
  className?: string
}) {
  const { value, label, theme, className } = props
  return (
    <Col>
      <span
        className={clsx(
          'text-lg font-semibold sm:text-xl',
          theme === 'white' ? 'text-white' : 'text-orange-600',
          className
        )}
      >
        {value}
      </span>
      <span
        className={clsx(
          'relative bottom-0.5 text-xs sm:text-sm',
          theme === 'white' ? 'text-gray-300' : 'text-gray-600'
        )}
      >
        {label}
      </span>
    </Col>
  )
}

export type statData = {
  label: string
  value: string
  icon: typeof ArrowTrendingUpIcon
  show: boolean
}

export function SmallStat(props: { statData: statData }) {
  const { statData } = props
  return (
    <Tooltip text={statData.label}>
      <Row className="items-center gap-0.5">
        <statData.icon className="h-5 w-5 text-gray-500" />
        <span className="text-xs text-gray-500">{statData.value} </span>
      </Row>
    </Tooltip>
  )
}
