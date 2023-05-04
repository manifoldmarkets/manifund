import clsx from 'clsx'
import { ReactNode } from 'react'

export function Card(props: { children: ReactNode; className?: string }) {
  const { children, className } = props
  return (
    <div
      className={clsx(
        'overflow-hidden rounded-md bg-white p-4 shadow',
        className
      )}
    >
      {children}
    </div>
  )
}
