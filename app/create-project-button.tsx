import React from 'react'
import { buttonClass } from '@/components/button'
import clsx from 'clsx'
import Link from 'next/link'

export const CreateProjectButton = () => {
  return (
    <Link
      href="/create"
      className={clsx(
        buttonClass('xl', 'gradient'),
        'mt-4 w-full bg-gradient-to-r'
      )}
    >
      Create a Project
    </Link>
  )
}
