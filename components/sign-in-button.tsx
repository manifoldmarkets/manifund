import React from 'react'
import { buttonClass } from '@/components/button'
import clsx from 'clsx'
import Link from 'next/link'

export const SignInButton = (props: {
  buttonText: string
  className?: string
}) => {
  const { buttonText, className } = props
  return (
    <Link
      href="/login"
      className={clsx(buttonClass('xl', 'gradient'), className)}
    >
      {buttonText}
    </Link>
  )
}
