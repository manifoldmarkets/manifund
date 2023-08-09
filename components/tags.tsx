'use client'
import { getRoundTheme } from '@/utils/constants'
import clsx from 'clsx'
import Link from 'next/link'
import {
  EllipsisHorizontalCircleIcon,
  XCircleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  WrenchIcon,
} from '@heroicons/react/24/outline'
import { FireIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'

const COLORS = [
  'bg-indigo-200',
  'bg-gray-200',
  'bg-sky-200',
  'bg-rose-200',
  'bg-indigo-400',
  'bg-gray-400',
  'bg-sky-400',
  'bg-rose-400',
  'text-indigo-700',
  'text-gray-700',
  'text-sky-700',
  'text-rose-700',
]

export function RoundTag(props: { roundTitle: string; roundSlug?: string }) {
  const { roundTitle, roundSlug } = props
  const roundTheme = getRoundTheme(roundTitle)
  if (roundSlug) {
    return (
      <Link href={`/rounds/${roundSlug}`}>
        <p
          className={clsx(
            'inline-flex max-h-5 truncate whitespace-nowrap rounded-full px-2 text-xs font-semibold leading-5 hover:underline hover:decoration-2',
            `text-${roundTheme}-700`,
            `bg-${roundTheme}-200`
          )}
        >
          {roundTitle}
        </p>
      </Link>
    )
  }
  return (
    <p
      className={clsx(
        'inline-flex max-h-5 truncate whitespace-nowrap rounded-full px-2 text-xs font-semibold leading-5',
        `text-${roundTheme}-700`,
        `bg-${roundTheme}-200`
      )}
    >
      {roundTitle}
    </p>
  )
}

import { Row } from './layout/row'
import { Tooltip } from './tooltip'
import { Col } from './layout/col'
export function StageTag(props: { projectStage: string }) {
  const { projectStage } = props
  switch (projectStage) {
    case 'proposal':
      return (
        <Tooltip text="proposal">
          <EllipsisHorizontalCircleIcon className="m-auto h-6 w-6 text-gray-500" />
        </Tooltip>
      )
    case 'active':
      return (
        <Tooltip text="active">
          <FireIcon className="m-auto h-6 w-6 text-orange-500" />
        </Tooltip>
      )
    case 'not funded':
      return (
        <Tooltip text="not funded">
          <XCircleIcon className="m-auto h-6 w-6 text-gray-500" />
        </Tooltip>
      )
    case 'completed':
      return (
        <Tooltip text="completed">
          <CheckCircleIcon className="m-auto h-6 w-6 text-gray-500" />
        </Tooltip>
      )
    default:
      return null
  }
}

export function AccreditedTag() {
  return (
    <Tooltip
      text={
        'For accredited investors, deposits, investments, and profits impact cash balance rather than charity balance. This means their profits are withdrawable.'
      }
    >
      <Row className="max-w-fit gap-0.5 rounded-full bg-emerald-100 px-2 pt-1 text-center">
        <CurrencyDollarIcon className="relative bottom-0.5 m-auto h-4 w-4 stroke-2 text-emerald-500" />
        <div className="relative bottom-0.5 text-sm leading-tight text-emerald-500">
          accredited investor
        </div>
      </Row>
    </Tooltip>
  )
}

export function RegranterTag() {
  return (
    <Tooltip text="Regranters can recieve donations from other users and give grants to the projects and organizations of their choice.">
      <Row className="max-w-fit gap-0.5 rounded-full bg-orange-100 px-2  pt-1 text-center">
        <ArrowPathIcon className="relative bottom-0.5 m-auto h-4 w-4 stroke-2 text-orange-500" />
        <div className="relative bottom-0.5 text-sm leading-tight text-orange-500">
          regrantor
        </div>
      </Row>
    </Tooltip>
  )
}

export function Tag(props: {
  text: string
  color: string
  className?: string
}) {
  const { text, color, className } = props
  return (
    <div
      className={`max-w-fit rounded-sm px-2 py-1 text-sm font-bold bg-${color}-100 text-${color}-500 ${className}`}
    >
      {text}
    </div>
  )
}

export function SponsoredTag(props: { text: string; className?: string }) {
  const { text, className } = props
  return (
    <div className={clsx('rounded bg-orange-100 p-1', className)}>
      <Tooltip text={`Sponsored by Manifund for ${text}`}>
        <Row className="gap-0.5">
          <Col className="justify-center text-sm font-medium text-orange-500">
            <Image
              className="h-4 w-4"
              src="/SolidOrangeManifox.png"
              alt="Manifox"
              width={1000}
              height={1000}
            />
          </Col>
          <Col className="justify-center text-sm font-medium text-orange-500">
            {text}
          </Col>
        </Row>
      </Tooltip>
    </div>
  )
}

export function RequiredStar() {
  return <span className="relative bottom-1 mx-1 text-rose-500">*</span>
}

export function MiniProfileTag(props: { role: string }) {
  const { role } = props
  switch (role) {
    case 'regrantor':
      return (
        <Tooltip text="Regrantor">
          <div className="rounded-full bg-orange-100 p-1 shadow">
            <ArrowPathIcon className="m-auto h-4 w-4 text-orange-500" />
          </div>
        </Tooltip>
      )
    case 'accredited':
      return (
        <Tooltip text="Accredited Investor">
          <div className="rounded-full bg-emerald-100 p-1 shadow">
            <CurrencyDollarIcon className="m-auto h-4 w-4 text-emerald-500" />
          </div>
        </Tooltip>
      )
    case 'creator':
      return (
        <Tooltip text="Creator">
          <div className="rounded-full bg-blue-100 p-1 shadow">
            <WrenchIcon className="m-auto h-4 w-4 text-blue-500" />
          </div>
        </Tooltip>
      )
    default:
      return null
  }
}
