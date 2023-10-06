/* eslint-disable react/display-name */
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { forwardRef, Ref, useState } from 'react'
import { Row } from './layout/row'

/** Text input. Wraps html `<input>` */
export const Input = forwardRef(
  (
    props: {
      error?: boolean
      errorMessage?: string
    } & JSX.IntrinsicElements['input'],
    ref: Ref<HTMLInputElement>
  ) => {
    const { error, errorMessage, className, ...rest } = props
    return (
      <>
        <input
          ref={ref}
          className={clsx(
            'h-12 rounded-md border bg-white px-4 shadow-sm transition-colors invalid:border-rose-500 invalid:text-rose-900 invalid:placeholder-rose-300 focus:outline-none disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500',
            error
              ? 'border-rose-300 text-rose-900 placeholder-rose-300 focus:border-rose-500 focus:ring-rose-500' // matches invalid: styles
              : 'border-gray-300 placeholder-gray-400  focus:ring-2 focus:ring-orange-500 ',
            className
          )}
          {...rest}
        />
        {error && errorMessage && (
          <span className="text-xs text-rose-500">{errorMessage}</span>
        )}
      </>
    )
  }
)

export const Checkbox = forwardRef(
  (props: JSX.IntrinsicElements['input'], ref: Ref<HTMLInputElement>) => {
    const { className, ...rest } = props
    return (
      <Row className="h-6 items-center">
        <input
          ref={ref}
          type="checkbox"
          className={clsx(
            'h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-600',
            className
          )}
          {...rest}
        />
      </Row>
    )
  }
)

export function SearchBar(props: {
  search: string
  setSearch: (search: string) => void
  className?: string
}) {
  const { search, setSearch, className } = props
  return (
    <div className={clsx('relative text-gray-600', className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
        <MagnifyingGlassIcon
          className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5"
          aria-hidden="true"
        />
      </div>
      <input
        placeholder="Search"
        className="block w-full rounded-md border-0 py-1.5 pl-7 text-sm text-gray-900 text-inherit shadow ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:pl-9 sm:text-base sm:leading-6"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value)
        }}
      />
    </div>
  )
}
