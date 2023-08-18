import clsx from 'clsx'
import { Col } from './layout/col'

export function DataPoint(props: { value: string; label: string }) {
  const { value, label } = props
  return (
    <Col>
      <span className={clsx('text-lg font-semibold text-gray-900 sm:text-xl')}>
        {value}
      </span>
      <span
        className={clsx('relative bottom-0.5 text-xs text-gray-600 sm:text-sm')}
      >
        {label}
      </span>
    </Col>
  )
}
