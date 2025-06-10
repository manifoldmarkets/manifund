import clsx from 'clsx'
import React from 'react'

export const Row = React.forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div']
>(function Row({ children, className, ...rest }, ref) {
  return (
    <div className={clsx(className, 'flex flex-row')} ref={ref} {...rest}>
      {children}
    </div>
  )
})
