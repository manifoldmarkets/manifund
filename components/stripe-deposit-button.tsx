'use client'
import { useSupabase } from '@/db/supabase-provider'
import { Dialog } from '@headlessui/react'
import { CircleStackIcon, PlusSmallIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from './button'
import { Input } from './input'
import { Modal } from './modal'
import { Tooltip } from './tooltip'

export function StripeDepositButton(props: {
  userId: string
  small?: boolean
}) {
  const { userId, small } = props
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
        className={clsx('rounded bg-white shadow', small ? 'p-0.5' : 'p-1')}
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
          <div className="my-2">
            <p className="text-gray-500">
              As a non-accredited investor, you can donate your deposit and any
              profits to a charity of your choice, but you can only withdraw
              money donated or invested in your projects.
            </p>
          </div>
          <label htmlFor="amount">Amount (USD): </label>
          <Input
            type="number"
            step="0.01"
            id="amount"
            autoComplete="off"
            required
            value={amount ?? ''}
            onChange={(event) => setAmount(Number(event.target.value))}
          />
        </div>
        <p className="mt-3 mb-2 text-center text-rose-500">{errorMessage}</p>
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
                  userId: userId,
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
          registered 501(c)(3) nonprofit. Money in your Manifund account has
          zero monetary value and is not redeemable for cash, but can be donated
          to charity.
        </p>
      </Modal>
    </>
  )
}
