'use client'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { Tooltip } from '@/components/tooltip'
import {
  ArrowDownTrayIcon,
  ArrowLeftCircleIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon } from '@heroicons/react/24/solid'
import React from 'react'
import { Stat } from '@/components/stat'
import { Card } from '@/components/layout/card'
import { DepositButton } from '@/components/deposit-buttons'
import Link from 'next/link'
import { Button, buttonClass } from '@/components/button'
import { Modal } from '@/components/modal'
import { Dialog } from '@headlessui/react'
import { AmountInput } from '@/components/input'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatMoneyPrecise } from '@/utils/formatting'
import clsx from 'clsx'

export function BalanceDisplay(props: {
  balance: number
  cashBalance: number
  charityBalance: number
  accredited: boolean
  isOwnProfile?: boolean
  userId?: string
}) {
  const { balance, cashBalance, charityBalance, accredited, isOwnProfile, userId } = props
  const stats = [
    { name: 'charity balance', value: charityBalance },
    { name: 'cash balance', value: cashBalance },
  ]
  const actionClass = clsx(buttonClass('2xs', 'light-orange'), 'gap-1 whitespace-nowrap')
  return (
    <Col className="h-fit">
      <Row className="h-fit items-start justify-between gap-1 sm:gap-4 lg:gap-8">
        <div className="w-full min-w-fit rounded border-none bg-orange-500 px-2 py-1">
          <Stat
            label="total balance"
            value={balance.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
            })}
            theme="white"
          />
        </div>
        {stats.map((stat) => (
          <Card key={stat.name} className="w-full min-w-fit border-none px-2 py-1">
            <Stat
              label={stat.name}
              value={stat.value.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
              })}
            />
          </Card>
        ))}
      </Row>
      <p className="mt-2 w-full rounded bg-gray-100 p-1 text-center text-sm tracking-wider text-gray-400">
        {formatMoneyPrecise(balance - cashBalance - charityBalance)} in pending offers
      </p>
      {isOwnProfile && userId && (
        <Row className="mt-3 flex-wrap justify-center gap-2">
          <DepositButton userId={userId}>
            <span className={actionClass}>
              <PlusCircleIcon className="h-4 w-4 stroke-2" />
              Add funds to charity
            </span>
          </DepositButton>
          <Link href="/withdraw" className={actionClass}>
            <ArrowDownTrayIcon className="h-4 w-4 stroke-2" />
            Withdraw cash
          </Link>
          {accredited && (
            <a
              href="https://airtable.com/shrIB5yGc56DoQBhJ"
              target="_blank"
              className={actionClass}
            >
              <BanknotesIcon className="h-4 w-4 stroke-2" />
              Add funds to cash
            </a>
          )}
          {cashBalance > 0 && (
            <CashToCharityButton cashBalance={cashBalance} className={actionClass} />
          )}
        </Row>
      )}
    </Col>
  )
}

function CashToCharityButton(props: { cashBalance: number; className?: string }) {
  const { cashBalance, className } = props
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [amount, setAmount] = useState<number>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  let errorMessage = null
  if (!amount) {
    errorMessage = 'Please enter an amount.'
  } else if (amount > cashBalance) {
    errorMessage = `Your cash balance is only $${cashBalance}.`
  } else {
    errorMessage = null
  }
  // Leave `confirming` alone on close so the panel doesn't flip back to step one mid-fade
  const close = () => setOpen(false)
  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => {
          setConfirming(false)
          setOpen(true)
        }}
      >
        <ArrowLeftCircleIcon className="h-4 w-4 stroke-2" />
        Move cash to charity
      </button>
      <Modal open={open} setOpen={close}>
        {confirming ? (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" aria-hidden="true" />
            </div>
            <div className="my-3 text-center sm:mt-5">
              <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                Are you sure?
              </Dialog.Title>
              <p className="my-2 text-sm text-gray-500">
                Once money is donated, you can no longer withdraw it. To withdraw instead, click{' '}
                <Link href="/withdraw" className="text-orange-600 underline">
                  here
                </Link>
                .
              </p>
            </div>
            <div className="sm:flex-2 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                color={'gray'}
                className="inline-flex w-full justify-center sm:col-start-1"
                onClick={() => setConfirming(false)}
              >
                Go back
              </Button>
              <Button
                type="button"
                className="sm:flex-2 inline-flex w-full justify-center"
                loading={isSubmitting}
                onClick={async () => {
                  setIsSubmitting(true)
                  await fetch('/api/move-cash-to-charity', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      amount: amount,
                    }),
                  })
                  setIsSubmitting(false)
                  close()
                  router.refresh()
                }}
              >
                Move {formatMoneyPrecise(amount ?? 0)} to charity
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <HeartIcon className="h-6 w-6 text-orange-600" aria-hidden="true" />
            </div>
            <div className="my-3 text-center sm:mt-5">
              <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                Transfer cash balance to charity balance
              </Dialog.Title>
              <p className="my-2 text-sm text-gray-500">
                Do this to donate your funds to other projects rather than withdrawing them.
              </p>
              <label htmlFor="amount">Amount (USD): </label>
              <AmountInput
                step="0.01"
                id="amount"
                autoComplete="off"
                amount={amount}
                onChangeAmount={setAmount}
              />
            </div>
            <div className="sm:flex-2 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                color={'gray'}
                className="inline-flex w-full justify-center sm:col-start-1"
                onClick={close}
              >
                Cancel
              </Button>
              <Tooltip text={errorMessage} placement="top">
                <Button
                  type="button"
                  disabled={errorMessage !== null}
                  className="sm:flex-2 inline-flex w-full justify-center"
                  onClick={() => setConfirming(true)}
                >
                  Transfer money
                </Button>
              </Tooltip>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              This constitutes a donation to Manifold for Charity, a registered 501(c)(3) nonprofit.
              Money in your charity balance has zero monetary value and is not redeemable for cash,
              but can be donated to charity.
            </p>
          </>
        )}
      </Modal>
    </>
  )
}
