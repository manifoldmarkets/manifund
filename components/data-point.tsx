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
          'text-lg font-semibold sm:text-xl',
          theme === 'white' ? 'text-white' : 'text-orange-600'
        )}
      >
        {value}
      </span>
      <span
        className={clsx(
          'text-xssm:text-sm relative bottom-0.5',
          theme === 'white' ? 'text-gray-300' : 'text-gray-600'
        )}
      >
        {label}
      </span>
    </Col>
  )
}
