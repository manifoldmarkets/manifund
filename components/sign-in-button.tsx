import React from 'react'
import { buttonClass } from '@/components/button'
import clsx from 'clsx'
import Link from 'next/link'

export const SignInButton = () => {
  return (
    <Link
      href="/login"
      className={clsx(
        buttonClass('xl', 'gradient'),
        'mx-auto mt-4 max-w-md bg-gradient-to-r'
      )}
    >
      Sign in to contribute
    </Link>
  )
}
