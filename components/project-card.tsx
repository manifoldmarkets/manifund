'use client'
import { Bid } from '@/db/bid'
import { Profile } from '@/db/profile'
import {
  formatDate,
  formatLargeNumber,
  getValuation,
  Project,
} from '@/db/project'
import Link from 'next/link'
import { Avatar } from './avatar'
import { RoundTag } from './round-tag'
import {
  EllipsisHorizontalCircleIcon,
  CalendarIcon,
  SunIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/solid'
import { Txn } from '@/db/txn'

export function ProjectCard(props: {
  project: Project
  creator: Profile
  bids: Bid[]
  txns: Txn[]
}) {
  const { creator, project, bids, txns } = props
  const valuation =
    project.stage == 'proposal'
      ? project.min_funding
      : calculateValuation(txns, project.founder_portion)
  return (
    <Link
      className="flex flex-col justify-between rounded-md border border-orange-200 bg-white px-4 pb-1 shadow hover:cursor-pointer hover:bg-orange-200"
      href={`projects/${project.slug}`}
    >
      <div>
        <div className="flex justify-between">
          <div className="mt-1">
            <RoundTag round={project.round} />
            <div className="mt-1 flex items-center">
              <Avatar
                className="mr-2"
                username={creator?.username}
                id={creator?.id}
                noLink
                size={'xs'}
              />
              <p>{creator?.username}</p>
            </div>
          </div>
          <div className="relative top-1">
            <ValuationBox valuation={valuation} color="emerald" />
          </div>
        </div>
        <h1 className="mt-2 text-xl font-bold">{project.title}</h1>
        <p className="mb-2 font-light text-gray-500">{project.blurb}</p>
      </div>
      <ProjectCardFooter project={project} bids={bids} />
    </Link>
  )
}

function ProjectCardFooter(props: { project: Project; bids: Bid[] }) {
  const { project, bids } = props
  switch (project.stage) {
    case 'proposal':
      return (
        <div className="bottom">
          <span className="mb-1 flex gap-1 text-gray-600">
            <CalendarIcon className="h-6 w-6 text-orange-500" />
            Auction closes
            <span className="text-black">
              {formatDate(project.auction_close)}
            </span>
          </span>
          <span className="mb-1 flex gap-1 text-gray-600">
            <EllipsisHorizontalCircleIcon className="h-6 w-6 text-orange-500" />
            Raising{' '}
            <span className="text-black">
              ${formatLargeNumber(project.min_funding)}
            </span>{' '}
            @ <span className="text-black">${getValuation(project)}</span>
          </span>
          <FundingProgressBar min_funding={project.min_funding} bids={bids} />
        </div>
      )
    default:
      return <div></div>
  }
}

function FundingProgressBar(props: { min_funding: number; bids: Bid[] }) {
  const { min_funding, bids } = props
  const total = bids.reduce((acc, bid) => acc + bid.amount, 0)
  const percent = total / min_funding > 1 ? 1 : total / min_funding
  return (
    <div className="h-2 w-full rounded-full bg-gray-200">
      <div
        style={{
          background: '#f97316',
          width: `${percent * 100}%`,
          height: '0.5rem',
          borderRadius: '0.5rem',
        }}
      ></div>
    </div>
  )
}

//bad because depends on USD and shares txns being right next to each other?
function calculateValuation(txns: Txn[], founder_portion: number) {
  let i = txns.length - 1
  let price_usd = 0
  let num_shares = 0
  while (i > 0) {
    if (txns[i].project) {
      if (txns[i].token == 'USD') {
        console.log('Txn #', i, " is in USD, so it's the price.")

        console.log(txns[i - 1].project == txns[i].project)
        console.log(txns[i - 1].token == 'USD')
        console.log(txns[i - 1].from_id == txns[i].to_id)
        console.log(txns[i - 1].to_id == txns[i].from_id)

        price_usd = txns[i].amount
        if (
          txns[i - 1].project == txns[i].project &&
          txns[i - 1].token != 'USD' &&
          txns[i - 1].from_id == txns[i].to_id &&
          txns[i - 1].to_id == txns[i].from_id
        ) {
          console.log(i, txns[i], txns[i - 1], num_shares, txns[i - 1].amount)
          num_shares = txns[i - 1].amount
          return (price_usd / num_shares) * (10000000 - founder_portion)
        }
      } else {
        console.log('Txn #', i, " is not in USD, so it's the shares.")

        console.log(txns[i - 1].project == txns[i].project)
        console.log(txns[i - 1].token == 'USD')
        console.log(txns[i - 1].from_id == txns[i].to_id)
        console.log(txns[i - 1].to_id == txns[i].from_id)

        num_shares = txns[i].amount
        if (
          txns[i - 1].project == txns[i].project &&
          txns[i - 1].token == 'USD' &&
          txns[i - 1].from_id == txns[i].to_id &&
          txns[i - 1].to_id == txns[i].from_id
        ) {
          console.log(i, txns[i], txns[i - 1], num_shares, txns[i - 1].amount)
          price_usd = txns[i - 1].amount
          return (price_usd / num_shares) * (10000000 - founder_portion)
        }
      }
    }
    i--
  }
  return -1
}

function ValuationBox(props: { valuation: number; color: string }) {
  const { valuation, color } = props
  return (
    <div
      className={`flex flex-col rounded px-1 pt-1 pb-0 text-center bg-${color}-100`}
    >
      <div className={`text-md text-${color}-500`}>Valuation</div>
      <div
        className={`text-lg font-bold text-${color}-500 relative bottom-1 m-auto`}
      >
        ${formatLargeNumber(valuation)}
      </div>
    </div>
  )
}
