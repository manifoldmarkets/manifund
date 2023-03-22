import clsx from 'clsx'
import { Col } from './layout/col'

export function DataPoint(props: {
  value: string
  label: string
  theme?: string
}) {
  const { value, label, theme } = props
  return (
    <Col>
      <span
        className={clsx(
          'text-xl font-bold',
          theme ? `text-${theme}-700` : 'text-orange-500'
        )}
      >
        {value}
      </span>
      <span className="text-sm text-gray-500">{label}</span>
    </Col>
  )
}
