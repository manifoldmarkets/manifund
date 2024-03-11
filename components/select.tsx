import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { Fragment } from 'react'

export type Option = {
  name: string
  id: string
}

export const Select = (
  props: JSX.IntrinsicElements['select'] & {
    options: Option[]
    selected: Option
    onSelect: (option: Option) => void
    label?: string
  }
) => {
  const { options, selected, onSelect, label, children, ...rest } = props
  return (
    <Listbox value={selected} onChange={onSelect}>
      {({ open }) => (
        <div className="relative mt-2">
          <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-600 sm:text-sm sm:leading-6">
            <span className="text-gray-500">{label} </span>
            <span>{selected.name}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            show={open}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {options.map((option) => {
                // Patch: HeadlessUI has a 'selected' param which is supposed to test for this but sometimes breaks
                const isSelected = option.id === selected.id
                return (
                  <Listbox.Option
                    key={option.id}
                    className={({ active }) =>
                      clsx(
                        active || isSelected
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-900',
                        'relative cursor-default select-none py-2 pl-3 pr-9'
                      )
                    }
                    value={option}
                  >
                    {({ active }) => (
                      <>
                        <span
                          className={clsx(
                            isSelected ? 'font-semibold' : 'font-normal',
                            'block truncate'
                          )}
                        >
                          {option.name}
                        </span>

                        {isSelected ? (
                          <span
                            className={clsx(
                              active || isSelected
                                ? 'text-white'
                                : 'text-orange-600',
                              'absolute inset-y-0 right-0 flex items-center pr-4'
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                )
              })}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  )
}
