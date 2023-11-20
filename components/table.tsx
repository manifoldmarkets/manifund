'use client'
import clsx from 'clsx'
import { Menu } from '@headlessui/react'
import { EllipsisVerticalIcon, TrashIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export const Table = (props: {
  className?: string
  children: React.ReactNode
}) => {
  const { className, children } = props

  return (
    <div
      className={clsx(
        'grid w-full grid-cols-1 divide-y divide-gray-200 whitespace-nowrap rounded-md bg-white text-sm text-gray-500 shadow',
        className
      )}
    >
      {children}
    </div>
  )
}

export function TableRow(props: {
  title: string | JSX.Element
  tag?: JSX.Element
  subtitle?: JSX.Element
  href: string
  deleteFunction?: () => void
}) {
  const { title, tag, subtitle, href, deleteFunction } = props
  return (
    <div className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
      <div className="flex w-full flex-col justify-center font-medium text-gray-900 sm:flex-row sm:items-center sm:justify-between">
        <Link className="truncate text-base hover:underline" href={href}>
          {title}
        </Link>
        {subtitle && (
          <span className="mt-5 flex-none truncate text-xs font-normal text-gray-500">
            {subtitle}
          </span>
        )}
      </div>
      <div className="flex h-full items-center justify-end">
        {tag}
        {deleteFunction && (
          <Menu as="div" className="relative z-10 inline-block">
            <Menu.Button>
              <EllipsisVerticalIcon className="relative bottom-1 left-2 h-6 w-6 text-gray-400 hover:cursor-pointer" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 top-4 z-10 mt-2 w-24 origin-top-right rounded bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active && 'bg-rose-100'
                    } flex h-full w-full justify-between  p-2 text-rose-600`}
                    onClick={deleteFunction}
                  >
                    <TrashIcon className="h-6 w-6" />
                    Delete
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
        )}
      </div>
    </div>
  )
}
