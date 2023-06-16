import { RadioGroup } from '@headlessui/react'
import clsx from 'clsx'

export function HorizontalRadioGroup(props: {
  value: string
  onChange: (value: string) => void
  options: { [key: string]: string }
}) {
  const { value, onChange, options } = props
  return (
    <RadioGroup value={value} onChange={onChange} className="mt-2">
      <RadioGroup.Label className="sr-only">
        {' '}
        Choose your project type{' '}
      </RadioGroup.Label>
      <div className="flex max-w-fit rounded-md border border-gray-300 bg-white p-2">
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
      </div>
    </RadioGroup>
  )
}
