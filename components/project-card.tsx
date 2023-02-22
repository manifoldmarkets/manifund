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
} from '@heroicons/react/24/outline'

export function ProjectCard(props: {
  project: Project
  creator: Profile
  bids: Bid[]
}) {
  const { creator, project, bids } = props
  return (
    <Link
      className="rounded-md border border-orange-200 bg-white px-4 pb-1 shadow hover:cursor-pointer hover:bg-orange-200"
      href={`projects/${project.slug}`}
    >
      <div className="flex justify-between">
        <div className="mt-2 flex items-center">
          <Avatar
            className="mr-2"
            username={creator?.username}
            id={creator?.id}
            noLink
            size={'xs'}
          />
          <p>{creator?.username}</p>
        </div>
        <div className="relative top-2">
          <RoundTag round={project.round} />
        </div>
      </div>
      <h1 className="mt-2 text-xl font-bold">{project.title}</h1>
      <p className="mb-2 font-light text-gray-500">{project.blurb}</p>
      <ProjectCardFooter project={project} bids={bids} />
    </Link>
  )
}

function ProjectCardFooter(props: { project: Project; bids: Bid[] }) {
  const { project, bids } = props
  switch (project.stage) {
    case 'proposal':
      return (
        <div>
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
  const percent = total / min_funding
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
