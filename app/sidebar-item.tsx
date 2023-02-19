'use client'

import React from 'react'
import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  UserCircleIcon,
  WrenchIcon,
  InformationCircleIcon,
  HomeIcon,
} from '@heroicons/react/24/solid'

export type Item = {
  name: string
  href: string
}

export function SidebarItem(props: { item: Item }) {
  const { item } = props
  const isCurrentPage = item.href === usePathname() && item.href != null
  const icon = findIcon(item.name, isCurrentPage)

  const sidebarItem = (
    <div
      className={clsx(
        isCurrentPage
          ? 'bg-gray-200 text-gray-900'
          : 'text-gray-600 hover:bg-gray-100',
        'group flex items-center rounded-md px-3 py-2 text-sm font-medium'
      )}
      aria-current={item.href == usePathname() ? 'page' : undefined}
    >
      {icon}
      <span className="truncate">{item.name}</span>
    </div>
  )

  return (
    <Link href={item.href} key={item.name}>
      {sidebarItem}
    </Link>
  )
}

function findIcon(name: string, isCurrentPage: boolean) {
  const styling = clsx(
    isCurrentPage ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
    '-ml-1 mr-3 h-6 w-6 flex-shrink-0' + 'h-6 w-6'
  )
  switch (name) {
    case 'Home':
      return <HomeIcon className={styling} />
    case 'Profile':
      return <UserCircleIcon className={styling} />
    case 'Projects':
      return <WrenchIcon className={styling} />
    case 'About':
      return <InformationCircleIcon className={styling} />
    default:
      return <UserCircleIcon className={styling} />
  }
}
