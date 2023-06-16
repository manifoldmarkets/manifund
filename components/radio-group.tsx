import { RadioGroup } from '@headlessui/react'
import clsx from 'clsx'
import { Row } from './layout/row'

export function HorizontalRadioGroup(props: {
  value: string
  onChange: (value: string) => void
  options: { [key: string]: string }
  wide?: boolean
}) {
  const { value, onChange, options, wide } = props
  return (
    <RadioGroup
      value={value}
      onChange={onChange}
      className={clsx('rounded-md shadow-sm', wide ? 'w-full' : 'max-w-fit')}
    >
      <RadioGroup.Label className="sr-only">
        {' '}
        Choose your project type{' '}
      </RadioGroup.Label>
      <Row
        className={clsx(
          'rounded-md border border-gray-300 bg-white p-2',
          wide ? 'w-full justify-between' : ''
        )}
      >
        {Object.entries(options).map(([type, label]) => (
          <RadioGroup.Option
            key={type}
            value={type}
            className={({ checked }) =>
              clsx(
                'cursor-pointer focus:outline-none',
                checked
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-white text-gray-900',
                'flex items-center justify-center rounded-md py-3 px-3 text-sm font-semibold'
              )
            }
          >
            <RadioGroup.Label as="span">{label}</RadioGroup.Label>
          </RadioGroup.Option>
        ))}
      </Row>
    </RadioGroup>
  )
}
