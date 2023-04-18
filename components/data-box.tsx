import { formatLargeNumber } from '@/utils/formatting'
import clsx from 'clsx'
import { Col } from './layout/col'

export function DataBox(props: {
  value: string | number
  label: string
  color?: 'gray' | 'orange'
}) {
  const { value, label, color } = props
  const valueString =
    typeof value == 'string' ? value : formatLargeNumber(value)
  return (
    <Col
      className={clsx(
        'mx-1 rounded px-3 pt-1 pb-0 text-center',
        color === 'orange'
          ? 'bg-orange-100 text-orange-500'
          : 'bg-gray-100 text-gray-500'
      )}
    >
      <div className="text-sm">{label}</div>
      <div className="relative bottom-1 m-auto text-lg font-bold">
        {valueString}
      </div>
    </Col>
  )
}
