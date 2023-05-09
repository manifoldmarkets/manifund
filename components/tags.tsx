'use client'
import { getRoundTheme } from '@/utils/constants'
import clsx from 'clsx'
import Link from 'next/link'
import {
  EllipsisHorizontalCircleIcon,
  SunIcon,
  XCircleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  HeartIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

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
            'inline-flex max-h-6 rounded-full px-2 text-xs font-semibold leading-5 hover:underline hover:decoration-2',
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
        'inline-flex max-h-6 rounded-full px-2 text-xs font-semibold leading-5 hover:underline hover:decoration-2',
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
export function StageTag(props: { projectStage: string }) {
  const { projectStage } = props
  switch (projectStage) {
    case 'proposal':
      return (
        <Row className="gap-1 rounded-full bg-orange-100 px-2 pt-1  text-center">
          <EllipsisHorizontalCircleIcon className="relative bottom-0.5 m-auto h-6 w-6 text-orange-500" />
          <div className="text-md relative bottom-0.5 text-orange-500">
            proposal
          </div>
        </Row>
      )
    case 'active':
      return (
        <Row className="gap-1 rounded-full bg-emerald-100 px-2 pt-1  text-center">
          <SunIcon className="relative bottom-0.5 m-auto h-6 w-6 text-emerald-500" />
          <div className="text-md relative bottom-0.5 text-emerald-500">
            active
          </div>
        </Row>
      )
    case 'not funded':
      return (
        <Row className="gap-1 rounded-full bg-gray-100 px-2 pt-1  text-center">
          <XCircleIcon className="relative bottom-0.5 m-auto h-6 w-6 text-gray-500" />
          <div className="text-md relative bottom-0.5 text-gray-500">
            not funded
          </div>
        </Row>
      )
    case 'completed':
      return (
        <Row className="gap-1 rounded-full bg-blue-100 px-2 py-1  text-center">
          <CheckCircleIcon className="rm-auto relative bottom-0.5 h-6 w-6 text-blue-500" />
          <div className="text-md relative bottom-0.5 text-blue-500">
            completed
          </div>
        </Row>
      )
    default:
      return null
  }
}

export function InvestorTypeTag(props: {
  accredited: boolean
  longTooltip?: boolean
  showText?: boolean
}) {
  const { accredited, showText, longTooltip } = props
  if (accredited) {
    return (
      <Tooltip
        text={
          longTooltip
            ? 'As an accredited investor, you can invest in impact certificates to grow your Manifund portfolio and withdraw your profits.'
            : 'accredited investor'
        }
      >
        <Row className="max-w-fit gap-1 rounded-full bg-emerald-100 px-2  pt-1 text-center">
          <CurrencyDollarIcon className="relative bottom-0.5 m-auto h-6 w-6 text-emerald-500" />
          <div
            className={clsx(
              'text-md relative bottom-0.5 leading-tight text-emerald-500',
              showText ? 'block' : 'hidden'
            )}
          >
            accredited investor
          </div>
        </Row>
      </Tooltip>
    )
  } else {
    return (
      <Tooltip
        text={
          longTooltip
            ? "As a charity investor, you can invest in impact certificates, grow your Manifund portfolio, and donate your balance to charity. Adding money to your Manifund account is a tax deductible donation. You cannot withdraw money made by investing in other people's projects. Apply to be an accredited investor on the edit profile page if you'd like to be able to withdraw your profits."
            : 'charity investor'
        }
      >
        <Row className="max-w-fit gap-1 rounded-full bg-rose-100 px-2  pt-1 text-center">
          <HeartIcon className="relative bottom-0.5 m-auto h-6 w-6 text-rose-500" />
          <div
            className={clsx(
              'text-md relative bottom-0.5 leading-tight text-rose-500',
              showText ? 'block' : 'hidden'
            )}
          >
            charity investor
          </div>
        </Row>
      </Tooltip>
    )
  }
}

export function RegranterTag() {
  return (
    <Tooltip text="Regranters can recieve donations from other users and give grants to the projects and organizations of their choice.">
      <Row className="max-w-fit gap-1 rounded-full bg-orange-100 px-2  pt-1 text-center">
        <ArrowPathIcon className="relative bottom-0.5 m-auto h-6 w-6 text-orange-500" />
        <div
          className={clsx(
            'text-md relative bottom-0.5 leading-tight text-orange-500'
          )}
        >
          regranter
        </div>
      </Row>
    </Tooltip>
  )
}

export function TxnTypeTag(props: {
  text: string
  color: string
  className?: string
}) {
  const { text, color, className } = props
  return (
    <div
      className={`max-w-fit rounded-sm px-2 py-1 text-xs font-bold bg-${color}-100 text-${color}-500 ${className}`}
    >
      {text}
    </div>
  )
}
