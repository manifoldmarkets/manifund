'use client'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { Tooltip } from '@/components/tooltip'
import {
  PlusSmallIcon,
  MinusSmallIcon,
  CircleStackIcon,
} from '@heroicons/react/24/solid'
import React, { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { NEXT_PUBLIC_STRIPE_KEY } from '@/db/env'
import { useSupabase } from '@/db/supabase-provider'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/modal'
import { Button } from '@/components/button'
import { Dialog, RadioGroup } from '@headlessui/react'
import clsx from 'clsx'
import { DataPoint } from '@/components/data-point'
import { Card } from '@/components/card'

export function BalanceDisplay(props: {
  balance: number
  withdrawBalance: number
  spendableBalance: number
  accredited: boolean
}) {
  const { balance, withdrawBalance, spendableBalance, accredited } = props
  const stats = [
    { name: 'Spendable', value: spendableBalance },
    { name: 'In pending offers', value: balance - spendableBalance },
  ]
  return (
    <Col className="h-fit">
      <Row className="h-fit justify-between gap-1 sm:gap-4 lg:gap-8">
        <Col className="justify-between">
          {accredited ? (
            <a
              href="https://airtable.com/shrIB5yGc56DoQBhJ"
              className="rounded bg-white shadow"
            >
              <Tooltip text="Add funds">
                <PlusSmallIcon className="h-4 w-4 text-gray-500" />
              </Tooltip>
            </a>
          ) : (
            <StripeDepositButton />
          )}

          <a
            href="https://airtable.com/shrI3XFPivduhbnGa"
            className="rounded bg-white p-1 shadow"
          >
            <Tooltip text="Withdraw funds">
              <MinusSmallIcon className="h-4 w-4 text-gray-500" />
            </Tooltip>
          </a>
        </Col>
        <div className="w-full min-w-fit rounded border-none bg-orange-500 py-1 px-2">
          <DataPoint
            label="Balance"
            value={`$${balance.toString()}`}
            theme="white"
          />
        </div>
        {stats.map((stat) => (
          <Card
            key={stat.name}
            className="w-full min-w-fit border-none py-1 px-2"
          >
            <DataPoint label={stat.name} value={`$${stat.value.toString()}`} />
          </Card>
        ))}
      </Row>
      <p className="mt-2 w-full rounded bg-gray-100 p-1 text-center text-sm tracking-wider text-gray-400">
        You can withdraw up to ${withdrawBalance}.
      </p>
    </Col>
  )
}

const stripePromise = loadStripe(NEXT_PUBLIC_STRIPE_KEY ?? '')
function StripeDepositButton() {
  const { session } = useSupabase()
  const user = session?.user
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(10)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const purchaseOptions = [10, 50, 100, 500]
  return (
    <>
      <button
        type="button"
        className="rounded bg-white p-1 shadow"
        onClick={() => setOpen(true)}
      >
        <Tooltip text="Add funds">
          <PlusSmallIcon className="h-4 w-4 text-gray-500" />
        </Tooltip>
      </button>

      <Modal open={open}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
          <CircleStackIcon
            className="h-6 w-6 text-orange-600"
            aria-hidden="true"
          />
        </div>
        <div className="mt-3 text-center sm:mt-5">
          <Dialog.Title
            as="h3"
            className="text-base font-semibold leading-6 text-gray-900"
          >
            Add money to your Manifund account
          </Dialog.Title>
          <div className="mt-2">
            <p className="text-gray-500">
              As a non-accredited investor, you can add money to your Manifund
              account, grow your portfolio by investing in projects, and donate
              your earnings to charity. However, you cannot withdraw your funds.
            </p>
          </div>
          <Row className="justify-center">
            <RadioGroup value={amount} onChange={setAmount} className="mt-2">
              <RadioGroup.Label className="sr-only">
                {' '}
                Choose an amount option{' '}
              </RadioGroup.Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {purchaseOptions.map((option) => (
                  <RadioGroup.Option
                    key={option}
                    value={option}
                    className={({ active, checked }) =>
                      clsx(
                        'cursor-pointer focus:outline-none',
                        active ? 'ring-2 ring-orange-500 ring-offset-2' : '',
                        checked
                          ? 'bg-orange-500 text-white hover:bg-orange-600'
                          : 'bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50',
                        'flex items-center justify-center rounded-md py-3 px-3 text-sm font-semibold uppercase sm:flex-1'
                      )
                    }
                  >
                    <RadioGroup.Label as="span">${option}</RadioGroup.Label>
                  </RadioGroup.Option>
                ))}
              </div>
            </RadioGroup>
          </Row>
        </div>

        <div className="sm:flex-2 mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row">
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
            className="sm:flex-2 inline-flex w-full justify-center"
            loading={isSubmitting}
            onClick={async () => {
              setIsSubmitting(true)
              const response = await fetch('/api/checkout-sessions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  dollarQuantity: amount,
                  userId: user?.id,
                }),
              })
              const json = await response.json()
              setIsSubmitting(false)
              router.push(json.url)
            }}
          >
            Add ${amount} to your account
          </Button>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          Your purchase constitutes a donation to Manifold for Charity, a
          registered 501(c)(3) nonprofit. Money in your Manifund account has
          zero monetary value and is not redeemable for cash, but can be donated
          to charity.
        </p>
      </Modal>
    </>
  )
}
