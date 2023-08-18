'use client'
import clsx from 'clsx'
import { Menu } from '@headlessui/react'
import { EllipsisVerticalIcon, TrashIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

/** `<table>` with styles. Expects table html (`<thead>`, `<td>` etc) */
export const Table = (props: {
  className?: string
  children: React.ReactNode
}) => {
  const { className, children } = props

  return (
    <table
      className={clsx(
        'w-full whitespace-nowrap text-left text-sm text-gray-500 [&>thead]:font-bold [&_td]:p-2 [&_th]:p-2',
        className
      )}
    >
      {children}
    </table>
  )
}

export function ThickTableRow(props: {
  title: string | JSX.Element
  tag?: JSX.Element
  subtitle?: JSX.Element
  href: string
  deleteFunction?: () => void
}) {
  const { title, tag, subtitle, href, deleteFunction } = props
  return (
    <tr className="hover:bg-gray-50">
      <td className="py-4 pl-5 align-middle font-medium text-gray-900">
        <Link className="hover:underline" href={href}>
          {title}
        </Link>
        {subtitle && (
          <p className="mt-1 truncate text-xs font-normal text-gray-500">
            {subtitle}
          </p>
        )}
      </td>
      <td className="flex h-full justify-end py-4 px-3 align-middle">
        {tag}
        {deleteFunction && (
          <Menu as="div" className="relative z-10 inline-block">
            <Menu.Button>
              <EllipsisVerticalIcon className="relative left-2 bottom-1 h-6 w-6 text-gray-400 hover:cursor-pointer" />
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
      </td>
    </tr>
  )
}
