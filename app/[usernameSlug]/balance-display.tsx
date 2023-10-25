'use client'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { Tooltip } from '@/components/tooltip'
import {
  ArrowLeftIcon,
  MinusSmallIcon,
  PlusSmallIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon } from '@heroicons/react/24/solid'
import React from 'react'
import { DataPoint } from '@/components/data-point'
import { Card } from '@/components/layout/card'
import {
  AirtableDepositButton,
  StripeDepositButton,
} from '@/components/deposit-buttons'
import Link from 'next/link'
import { Button, IconButton } from '@/components/button'
import { Modal } from '@/components/modal'
import { Dialog } from '@headlessui/react'
import { Input } from '@/components/input'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function BalanceDisplay(props: {
  balance: number
  withdrawBalance: number
  charityBalance: number
  accredited: boolean
  isOwnProfile?: boolean
  userId?: string
}) {
  const {
    balance,
    withdrawBalance,
    charityBalance,
    accredited,
    isOwnProfile,
    userId,
  } = props
  const stats = [
    { name: 'charity balance', value: charityBalance },
    { name: 'cash balance', value: withdrawBalance },
  ]
  return (
    <Col className="h-fit">
      <Row className="h-fit justify-between gap-1 sm:gap-4 lg:gap-8">
        <div className="w-full min-w-fit rounded border-none bg-orange-500 px-2 py-1">
          <DataPoint
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
          <Card
            key={stat.name}
            className="relative w-full min-w-fit border-none px-2 py-1"
          >
            <DataPoint
              label={stat.name}
              value={stat.value.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
              })}
            />
            {stat.name === 'cash balance' && stat.value > 0 && isOwnProfile && (
              <div className="absolute -right-1 bottom-0">
                <CashToCharityButton cashBalance={stat.value} />
              </div>
            )}
            {isOwnProfile && userId && (
              <>
                {stat.name === 'charity balance' ? (
                  <>
                    {!accredited && (
                      <Row className="absolute right-2 top-2">
                        <StripeDepositButton userId={userId}>
                          <div className="rounded bg-orange-500 p-0.5 shadow">
                            <Tooltip text="Add funds" placement="left">
                              <PlusSmallIcon className="h-4 w-4 stroke-2 text-white" />
                            </Tooltip>
                          </div>
                        </StripeDepositButton>
                      </Row>
                    )}
                  </>
                ) : (
                  <Row className="absolute right-2 top-2 justify-between gap-1">
                    {accredited && <AirtableDepositButton />}
                    <Link
                      href="/withdraw"
                      className="rounded bg-orange-500 p-0.5 shadow"
                    >
                      <Tooltip text="Withdraw funds" placement="left">
                        <MinusSmallIcon className="h-4 w-4 stroke-2 text-white" />
                      </Tooltip>
                    </Link>
                  </Row>
                )}
              </>
            )}
          </Card>
        ))}
      </Row>
      <p className="mt-2 w-full rounded bg-gray-100 p-1 text-center text-sm tracking-wider text-gray-400">
        ${balance - withdrawBalance - charityBalance} in pending offers
      </p>
    </Col>
  )
}

function CashToCharityButton(props: { cashBalance: number }) {
  const { cashBalance } = props
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState<number | null>(null)
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
  return (
    <>
      <IconButton
        className="rounded bg-white p-0 shadow-none"
        onClick={() => setOpen(true)}
      >
        <ArrowLeftIcon className="h-4 w-4 stroke-2 text-orange-500" />
      </IconButton>

      <Modal open={open} setOpen={setOpen}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
          <HeartIcon className="h-6 w-6 text-orange-600" aria-hidden="true" />
        </div>
        <div className="my-3 text-center sm:mt-5">
          <Dialog.Title
            as="h3"
            className="text-base font-semibold leading-6 text-gray-900"
          >
            Transfer cash balance to charity balance
          </Dialog.Title>
          <p className="my-2 text-sm text-gray-500">
            Money in your charity balance can be donated but not withdrawn,
            whereas money in your cash balance can be withdrawn but not donated.
          </p>
          <label htmlFor="amount">Amount (USD): </label>
          <Input
            type="number"
            step="0.01"
            id="amount"
            autoComplete="off"
            value={amount ?? ''}
            onChange={(event) => setAmount(Number(event.target.value))}
          />
        </div>
        <div className="sm:flex-2 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            color={'gray'}
            className="inline-flex w-full justify-center sm:col-start-1"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={errorMessage !== null}
            className="sm:flex-2 inline-flex w-full justify-center"
            loading={isSubmitting}
            onClick={async () => {
              setIsSubmitting(true)
              const response = await fetch('/api/move-cash-to-charity', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  amount: amount,
                }),
              })
              const json = await response.json()
              setOpen(false)
              setIsSubmitting(false)
              router.push(json.url)
            }}
          >
            Transfer money
          </Button>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          This constitutes a donation to Manifold for Charity, a registered
          501(c)(3) nonprofit. Money in your charity balance has zero monetary
          value and is not redeemable for cash, but can be donated to charity.
        </p>
      </Modal>
    </>
  )
}
