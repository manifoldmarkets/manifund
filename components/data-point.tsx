import clsx from 'clsx'
import { Col } from './layout/col'

export function DataPoint(props: {
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
