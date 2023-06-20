import { Bid } from '@/db/bid'
import { Project } from '@/db/project'
import { useSupabase } from '@/db/supabase-provider'
import { formatDate, formatMoney } from '@/utils/formatting'
import { deleteBid } from '@/db/bid'
import { Menu } from '@headlessui/react'
import {
  CalendarIcon,
  EllipsisVerticalIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RoundTag } from './tags'
import { Tag } from './tags'
import { Col } from './layout/col'

export function BidText(props: {
  bid: Bid
  stage: string
  projectType: Project['type']
  showValuation: boolean
}) {
  const { bid, stage, projectType, showValuation } = props
  switch (stage) {
    case 'proposal':
      if (projectType === 'grant') {
        return (
          <div className="flex items-center">
            <p className="text-sm text-gray-500">
              Offered&nbsp;
              <span className="text-black">{formatMoney(bid.amount)}</span>
            </p>
          </div>
        )
      }
      return (
        <div className="flex items-center">
          <p className="text-sm text-gray-500">
            Bid&nbsp;
            <span className="text-black">{formatMoney(bid.amount)}</span>
            {showValuation && (
              <span>
                &nbsp;@&nbsp;
                <span className="text-black">{formatMoney(bid.valuation)}</span>
                &nbsp;valuation
              </span>
            )}
          </p>
        </div>
      )
    case 'active':
      return (
        <div className="flex items-center text-sm text-gray-500">
          Offer to&nbsp;
          <Tag
            text={bid.type === 'buy' ? 'BUY' : 'SELL'}
            color={bid.type === 'buy' ? 'emerald' : 'rose'}
          />
          <span className="text-black">&nbsp;{formatMoney(bid.amount)}</span>
          <span>
            &nbsp;@&nbsp;
            <span className="text-black">{formatMoney(bid.valuation)}</span>
            &nbsp;valuation
          </span>
        </div>
      )
    default:
      return <></>
  }
}

export function TableRow(props: {
  title: string
  tag: JSX.Element
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
