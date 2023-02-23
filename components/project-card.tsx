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
} from '@heroicons/react/24/solid'
import { Txn } from '@/db/txn'
import { ValuationBox } from './valuation-box'
import { ProjectHeader } from './project-header'

export function ProjectCard(props: {
  project: Project
  creator: Profile
  bids: Bid[]
  txns: Txn[]
}) {
  const { creator, project, bids, txns } = props
  const valuation =
    project.stage == 'proposal'
      ? getValuation(project)
      : formatLargeNumber(calculateValuation(txns, project.founder_portion))
  return (
    <Link
      className="flex flex-col justify-between rounded-md border border-gray-200 bg-white px-4 pb-1 shadow hover:cursor-pointer hover:bg-gray-100"
      href={`projects/${project.slug}`}
    >
      <div>
        <ProjectHeader
          round={project.round}
          creator={creator}
          valuation={valuation}
        />
        <h1 className="mt-2 text-xl font-bold">{project.title}</h1>
        <p className="mb-2 font-light text-gray-500">{project.blurb}</p>
      </div>
      <ProjectCardFooter project={project} bids={bids} />
    </Link>
  )
}

function ProjectCardFooter(props: { project: Project; bids: Bid[] }) {
  const { project, bids } = props
  const raised = bids.reduce((acc, bid) => acc + bid.amount, 0)
  const percentRaised =
    raised / project.min_funding > 1 ? 1 : raised / project.min_funding
  switch (project.stage) {
    case 'proposal':
      return (
        <div className="bottom">
          <div className="flex flex-col justify-between md:flex-row lg:flex-col">
            <span className="mb-1 flex gap-1 text-gray-600">
              <CalendarIcon className="h-6 w-6 text-orange-500" />
              Auction closes
              <span className="text-black">
                {formatDate(project.auction_close)}
              </span>
            </span>
            <span className="mb-1 flex gap-1 text-gray-600">
              <EllipsisHorizontalCircleIcon className="h-6 w-6 text-orange-500" />
              <span className="text-black">{percentRaised * 100}%</span>raised
            </span>
          </div>
          <FundingProgressBar percent={percentRaised} />
        </div>
      )
    default:
      return <div></div>
  }
}

function FundingProgressBar(props: { percent: number }) {
  const { percent } = props
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
        price_usd = txns[i].amount
        if (
          txns[i - 1].project == txns[i].project &&
          txns[i - 1].token != 'USD' &&
          txns[i - 1].from_id == txns[i].to_id &&
          txns[i - 1].to_id == txns[i].from_id
        ) {
          num_shares = txns[i - 1].amount
          return (price_usd / num_shares) * (10000000 - founder_portion)
        }
      } else {
        num_shares = txns[i].amount
        if (
          txns[i - 1].project == txns[i].project &&
          txns[i - 1].token == 'USD' &&
          txns[i - 1].from_id == txns[i].to_id &&
          txns[i - 1].to_id == txns[i].from_id
        ) {
          price_usd = txns[i - 1].amount
          return (price_usd / num_shares) * (10000000 - founder_portion)
        }
      }
    }
    i--
  }
  return -1
}
