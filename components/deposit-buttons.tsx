'use client'
import { Profile } from '@/db/profile'
import { Dialog } from '@headlessui/react'
import { CircleStackIcon, PlusSmallIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { ReactNode, useState } from 'react'
import { Button } from './button'
import { Input } from './input'
import { Modal } from './modal'
import { Tooltip } from './tooltip'

export function StripeDepositButton(props: {
  userId: string
  children?: ReactNode
  passFundsTo?: Profile
}) {
  const { userId, children, passFundsTo } = props
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(10)
  const [isSubmitting, setIsSubmitting] = useState(false)
  let errorMessage = null
  if (amount < 10) {
    errorMessage = 'Minimum deposit is $10.'
  }
  return (
    <>
      <button
        type="button"
        className="rounded shadow"
        onClick={() => setOpen(true)}
      >
        {children}
      </button>
      <Modal open={open} setOpen={setOpen}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
          <CircleStackIcon
            className="h-6 w-6 text-orange-600"
            aria-hidden="true"
          />
        </div>
        <div className="mt-3 text-center sm:mt-5">
          <Dialog.Title
            as="h3"
            className="mb-1 text-base font-semibold leading-6 text-gray-900"
          >
            {passFundsTo
              ? `Send money to ${passFundsTo.full_name}`
              : 'Add money to your Manifund account'}
          </Dialog.Title>
          {!passFundsTo && (
            <p className="my-2 text-sm text-gray-500">
              This money will go into your charity balance, which can be donated
              but not withdrawn.
            </p>
          )}
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
        <p className="mb-2 mt-3 text-center text-rose-500">{errorMessage}</p>
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
                  userId,
                  passFundsToId: passFundsTo?.id,
                }),
              })
              const json = await response.json()
              setIsSubmitting(false)
              router.push(json.url)
            }}
          >
            Proceed to checkout
          </Button>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          Your purchase constitutes a donation to Manifold for Charity, a
          registered 501(c)(3) nonprofit.{' '}
          {passFundsTo
            ? ''
            : 'Money in your charity balance has zero monetary value and is not redeemable for cash, but can be donated to charity.'}
        </p>
      </Modal>
    </>
  )
}

export function AirtableDepositButton() {
  return (
    <a
      href="https://airtable.com/shrIB5yGc56DoQBhJ"
      className="rounded bg-orange-500 p-0.5 shadow"
      target="_blank"
    >
      <Tooltip text="Add funds" placement="left">
        <PlusSmallIcon className={clsx('h-4 w-4 stroke-2 text-white')} />
      </Tooltip>
    </a>
  )
}
