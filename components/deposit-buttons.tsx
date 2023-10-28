'use client'
import { Profile } from '@/db/profile'
import { Dialog } from '@headlessui/react'
import {
  CircleStackIcon,
  PlusSmallIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { useRouter, useSearchParams } from 'next/navigation'
import { ReactNode, useState } from 'react'
import { Button } from './button'
import { Input } from './input'
import { Modal } from './modal'
import { Tabs } from './tabs'
import { Tooltip } from './tooltip'

// TODO: rename to DepositButton
export function StripeDepositButton(props: {
  userId: string
  accredited: boolean
  children?: ReactNode
  passFundsTo?: Profile
}) {
  const { userId, children, accredited, passFundsTo } = props
  const [open, setOpen] = useState(false)
  const searchParams = useSearchParams() ?? new URLSearchParams()
  const currentTabId = searchParams.get('tab')
  let errorMessage = null
  // if (amount < 10) {
  // errorMessage = 'Minimum deposit is $10.'
  // }
  return (
    <>
      <button
        type="button"
        className="rounded shadow"
        onClick={() => setOpen(true)}
      >
        {children}
      </button>
      <Modal open={open}>
        <div className="flex justify-end">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 focus:text-gray-700 focus:outline-none"
            onClick={() => setOpen(false)}
          >
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <Tabs
          tabs={[
            {
              name: 'Donate money',
              id: 'donate',
              count: 0,
              display: <DonateTab userId={userId} passFundsTo={passFundsTo} />,
            },
            {
              name: 'Transfer mana',
              id: 'mana',
              count: 0,
              display: <ManaTab />,
            },
            ...(accredited
              ? [
                  {
                    name: 'Add cash',
                    id: 'cash',
                    count: 0,
                    display: <AirtableDepositTab />,
                  },
                ]
              : []),
          ]}
          currentTabId={currentTabId}
        />
      </Modal>
    </>
  )
}

function DonateTab(props: { userId: string; passFundsTo?: Profile }) {
  const { userId, passFundsTo } = props
  const router = useRouter()
  const [amount, setAmount] = useState(10)
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <div className="flex flex-col gap-4">
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
      {/* <p className="mb-2 mt-3 text-center text-rose-500">{errorMessage}</p> */}
      <div className="sm:flex-2 flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          color={'gray'}
          className="inline-flex w-full justify-center sm:col-start-1"
          // onClick={() => setOpen(false)}
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
          Checkout
        </Button>
      </div>
      <p className="mt-4 text-xs text-gray-500">
        Your purchase constitutes a donation to Manifold for Charity, a
        registered 501(c)(3) nonprofit.{' '}
        {passFundsTo
          ? ''
          : 'Money in your charity balance has zero monetary value and is not redeemable for cash, but can be donated to charity.'}
      </p>
    </div>
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

function ManaTab() {
  return (
    <div className="flex flex-col gap-2 p-4">
      <p className="my-2 text-sm text-gray-600">
        Enter your Manifold API key to turn mana into your charity balance.
      </p>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none">API Key</label>
        <input
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          id="api-key"
          placeholder="Paste your API key"
        />
      </div>
      <div className="space-y-2 rounded-md bg-gray-100 p-4 dark:bg-gray-700">
        <p className="font-bold">Your Balance:</p>
        <p className="text-green-600 dark:text-green-400">$0.00</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none">
          Transfer Amount
        </label>
        <input
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          id="amount"
          placeholder="Enter amount to transfer"
          type="number"
        />
      </div>
    </div>
  )
}

function AirtableDepositTab() {
  return (
    <div>
      <div className="flex flex-col space-y-1.5 p-4">
        <h3 className="text-2xl font-semibold tracking-tight">ACH Deposit</h3>
        <p className="mt-2 text-sm text-gray-600">
          Please fill out the form to deposit money via ACH. This form is
          intended for accredited investors only.
        </p>
      </div>
      <div className="flex items-center justify-end space-x-4 p-6">
        <Button>Go to form</Button>
      </div>
    </div>
  )
}
