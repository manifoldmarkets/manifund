import { Tag } from '@/components/tags'
import { Tooltip } from '@/components/tooltip'
import { BidAndProject } from '@/db/bid'
import { FullTxn } from '@/db/txn'
import {
  HeartIcon,
  UserIcon,
  WrenchIcon,
  UserGroupIcon,
} from '@heroicons/react/24/solid'
import { formatDistanceToNow } from 'date-fns'
import { orderBy } from 'lodash'
import Link from 'next/link'

export function OutgoingDonationsHistory(props: {
  donations: FullTxn[]
  pendingDonateBids: BidAndProject[]
}) {
  const { donations, pendingDonateBids } = props
  const sortedDonations = orderBy(donations, 'created_at', 'desc')
  const sortedBids = orderBy(pendingDonateBids, 'created_at', 'desc')
  const donationsDisplay = sortedDonations.map((donation) => {
    const type = donation.project
      ? 'project'
      : donation.profiles?.type === 'individual'
      ? 'regranter'
      : donation.profiles?.type === 'fund'
      ? 'fund'
      : 'charity'
    const name =
      (type === 'project'
        ? donation.projects?.title
        : donation.profiles?.full_name) ?? ''
    const url =
      type === 'project'
        ? `/projects/${donation.projects?.slug}`
        : donation.profiles?.type === 'individual'
        ? `/${donation.profiles?.username}`
        : `/charity/${donation.profiles?.username}`
    return (
      <DonationRow
        key={donation.id}
        type={type}
        name={name}
        url={url}
        amount={donation.amount}
        date={formatDistanceToNow(new Date(donation.created_at), {
          addSuffix: true,
        })}
      />
    )
  })
  const pendingGrantDisplay = sortedBids.map((bid) => {
    return (
      <DonationRow
        key={bid.id}
        type="project"
        name={bid.projects.title}
        url={`/projects/${bid.projects.slug}?tab=bids`}
        amount={bid.amount}
      />
    )
  })
  return (
    <div>
      <h1 className="mb-2 text-xl font-medium sm:text-2xl">
        Outgoing donations
      </h1>
      <div className="overflow-hidden rounded-md bg-white shadow">
        <table role="list" className="w-full divide-y divide-gray-200">
          {pendingGrantDisplay}
          {donationsDisplay}
        </table>
      </div>
    </div>
  )
}

function DonationRow(props: {
  type: 'project' | 'regranter' | 'fund' | 'charity'
  name: string
  url: string
  amount: number
  date?: string
}) {
  const { type, name, url, amount, date } = props
  return (
    <Link href={url} className="table-row w-full">
      <td className="p-3">
        {type === 'project' && (
          <Tooltip text="project">
            <WrenchIcon className="relative top-1 h-5 w-5 flex-shrink-0 text-blue-500" />
          </Tooltip>
        )}
        {type === 'regranter' && (
          <Tooltip text="regranter">
            <UserIcon className="relative top-1 h-5 w-5 flex-shrink-0 text-orange-500" />
          </Tooltip>
        )}
        {type === 'fund' && (
          <Tooltip text="charity">
            <UserGroupIcon className="relative top-1 h-5 w-5 flex-shrink-0 text-emerald-500" />
          </Tooltip>
        )}
        {type === 'charity' && (
          <Tooltip text="charity">
            <HeartIcon className="relative top-1 h-5 w-5 flex-shrink-0 text-rose-500" />
          </Tooltip>
        )}
      </td>
      <td className="py-3">{name}</td>
      <td className="py-3 px-3 text-right sm:px-0">${amount}</td>
      <td className="hidden justify-end p-3 text-right text-sm text-gray-500 sm:flex">
        {date ? date : <Tag text="PENDING" color="gray" />}
      </td>
    </Link>
  )
}
