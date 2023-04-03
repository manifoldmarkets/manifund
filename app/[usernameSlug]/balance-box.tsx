'use client'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { Tooltip } from '@/components/tooltip'
import {
  CurrencyDollarIcon,
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
import { Dialog } from '@headlessui/react'

export function BalanceBox(props: {
  balance: number
  withdrawBalance: number
  accredited: boolean
}) {
  const { balance, withdrawBalance, accredited } = props
  return (
    <Col className="h-fit">
      <Row className="h-fit gap-1">
        <Col className="my-2 justify-between">
          {accredited ? (
            <a
              href="https://airtable.com/shrIB5yGc56DoQBhJ"
              className="rounded bg-gray-200 p-1"
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
            className="rounded bg-gray-200 p-1"
          >
            <Tooltip text="Withdraw funds">
              <MinusSmallIcon className="h-4 w-4 text-gray-500" />
            </Tooltip>
          </a>
        </Col>
        <Col className="flex rounded bg-gray-200 py-2 px-3 text-center">
          <div className="text-md text-gray-500">Balance</div>
          <div className=" flex text-2xl font-bold text-gray-500">
            <CurrencyDollarIcon className="h-8 w-8" />
            <p>{balance}</p>
          </div>
        </Col>
      </Row>
      {!accredited && (
        <Row className="justify-center text-sm font-normal text-gray-500">
          ${withdrawBalance} withdrawable
        </Row>
      )}
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
        className="rounded bg-gray-200 p-1"
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
          <Row className="mt-3 justify-center">
            <div>
              {purchaseOptions.map((option) => (
                <Row key={option} className="relative items-start">
                  <Row className="h-6 items-center">
                    <input
                      id={option.toString()}
                      checked={amount === option}
                      name="amount-option"
                      type="radio"
                      onChange={() => {
                        setAmount(option)
                      }}
                      className="h-4 w-4 border-gray-300 text-orange-600 focus:ring-orange-600"
                    />
                  </Row>
                  <div className="ml-3">
                    <Row>
                      <label
                        htmlFor={option.toString()}
                        className="text-md block font-medium"
                      >
                        ${option.toString()}
                      </label>
                    </Row>
                  </div>
                </Row>
              ))}
            </div>
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
