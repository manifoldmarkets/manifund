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
          'text-lg font-bold sm:text-xl',
          theme
            ? theme === 'white'
              ? 'text-white'
              : `text-${theme}-700`
            : 'text-orange-500'
        )}
      >
        {value}
      </span>
      <span
        className={clsx(
          'text-xs sm:text-sm',
          theme === 'white' ? 'text-gray-200' : 'text-gray-500'
        )}
      >
        {label}
      </span>
    </Col>
  )
}
