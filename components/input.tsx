/* eslint-disable react/display-name */
import clsx from 'clsx'
import { forwardRef, Ref } from 'react'
import { Row } from './layout/row'

/** Text input. Wraps html `<input>` */
export const Input = forwardRef(
  (
    props: { error?: boolean } & JSX.IntrinsicElements['input'],
    ref: Ref<HTMLInputElement>
  ) => {
    const { error, className, ...rest } = props

    return (
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
