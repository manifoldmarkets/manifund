'use client'
import { Profile } from '@/db/profile'
import { Dialog } from '@headlessui/react'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid'
import {
  CircleStackIcon,
  PlusSmallIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { useRouter, useSearchParams } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import { Button } from './button'
import { AmountInput, Input } from './input'
import { Modal } from './modal'
import { SiteLink } from './site-link'
import { Tabs } from './tabs'
import { Tooltip } from './tooltip'
import { toast } from 'react-hot-toast'
import { DepositManaProps } from '@/pages/api/deposit-mana'
import { Col } from './layout/col'
import Link from 'next/link'
import AlertBox from './alert-box'

export function DepositButton(props: {
  userId: string
  children?: ReactNode
  passFundsTo?: Profile
}) {
  const { userId, children, passFundsTo } = props
  const [open, setOpen] = useState(false)
  const searchParams = useSearchParams() ?? new URLSearchParams()
  const currentTabId = searchParams.get('tab')
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        {children}
      </button>
      <Modal open={open} setOpen={setOpen}>
        <div className="flex justify-end">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 focus:text-gray-700 focus:outline-none"
            onClick={() => setOpen(false)}
          >
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        {passFundsTo ? (
          <DonateTab
            userId={userId}
            setOpen={setOpen}
            passFundsTo={passFundsTo}
          />
        ) : (
          <Tabs
            tabs={[
              {
                name: 'Credit card',
                id: 'donate',
                count: 0,
                display: <DonateTab userId={userId} setOpen={setOpen} />,
              },
              {
                name: 'Transfer mana',
                id: 'mana',
                count: 0,
                display: <ManaTab />,
              },
            ]}
            currentTabId={currentTabId}
          />
        )}
      </Modal>
    </>
  )
}

function DonateTab(props: {
  userId: string
  setOpen: (value: boolean) => void
  passFundsTo?: Profile
}) {
  const { userId, setOpen, passFundsTo } = props
  const router = useRouter()
  const [amount, setAmount] = useState<number | undefined>(100)
  const [isSubmitting, setIsSubmitting] = useState(false)
  let errorMessage = null
  if (!amount || amount < 10) {
    errorMessage = 'Minimum deposit is $10.'
  }

  return (
    <div className="flex flex-col gap-4">
      {/* <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
        <CircleStackIcon
          className="h-6 w-6 text-orange-600"
          aria-hidden="true"
        />
      </div> */}
      <div className="mt-3 sm:mt-5">
        <Dialog.Title
          as="h3"
          className="mb-1 text-base font-semibold leading-6 text-gray-900"
        >
          {passFundsTo
            ? `Send money to ${passFundsTo.full_name}`
            : 'Add funds to your Manifund account'}
        </Dialog.Title>
        {!passFundsTo && (
          <p className="my-2 text-sm text-gray-500">
            This money will go into your charity balance, which can be donated
            but not withdrawn.
          </p>
        )}
        <label htmlFor="amount">$ </label>
        <AmountInput
          step="0.01"
          id="amount"
          amount={amount}
          onChangeAmount={setAmount}
        />
        {/* Show an alert box if the user is trying to donate $10k or more */}
        {amount && amount >= 10000 && (
          <AlertBox title="Large donations" type="warning">
            For donations of $10,000+, consider{' '}
            <Link
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:underline hover:decoration-orange-500 hover:decoration-2"
              href="https://manifoldmarkets.notion.site/Donations-via-DAF-wire-ACH-crypto-02aee92e884a47e49efd4d93242e2080?pvs=4"
            >
              using a DAF, bank transfer, or crypto
              <ArrowTopRightOnSquareIcon className="inline h-4 w-4" />
            </Link>{' '}
            for lower fees.
          </AlertBox>
        )}
      </div>
      {errorMessage && <AlertBox title={errorMessage} type="error" />}
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
          disabled={errorMessage !== null}
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
      <p className="mt-4 text-xs font-light text-gray-500">
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

type ManifoldUser = {
  username: string
  balance: string
}

async function checkBalance(apiKey: string) {
  const response = await fetch('https://manifold.markets/api/v0/me', {
    method: 'GET',
    headers: {
      Authorization: `Key ${apiKey}`,
    },
  })
  const manifoldUser = (await response.json()) as ManifoldUser
  return manifoldUser
}

async function transfer(props: DepositManaProps) {
  const response = await fetch('/api/deposit-mana', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(props),
  })
  const json = await response.json()
  return json
}

function ManaTab() {
  const [apiKey, setApiKey] = useState('')
  const [manifoldUser, setManifoldUser] = useState<ManifoldUser | null>(null)
  const [transferAmount, setTransferAmount] = useState<number | undefined>(10)
  const manaToDeposit = (transferAmount ?? 0) * 100
  const [transferring, setTransferring] = useState(false)

  // Check balance every time the API key changes
  useEffect(() => {
    checkBalance(apiKey).then(setManifoldUser).catch(console.error)
  }, [apiKey])

  async function transferMana() {
    setTransferring(true)
    const resp = await transfer({
      manifoldApiKey: apiKey,
      manaToDeposit,
    })
    // If error, show an error toast
    if (resp.error) {
      toast.error(resp.error)
    } else {
      toast.success('Mana transfered successfully')
      // TODO: Route to the user's profile page after 3 seconds?
    }
    setTransferring(false)
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <p className="my-2 text-sm text-gray-600">
        Enter your{' '}
        <SiteLink
          href="https://manifold.markets/profile"
          className="text-orange-500 hover:underline hover:decoration-orange-500 hover:decoration-2"
        >
          Manifold API key{' '}
          <ArrowTopRightOnSquareIcon className="inline h-4 w-4" />
        </SiteLink>{' '}
        to turn mana into your charity balance.
      </p>
      <label className="text-sm font-medium leading-none">API Key</label>
      <Input
        type="password"
        id="api-key"
        autoComplete="off"
        value={apiKey ?? ''}
        onChange={(event) => setApiKey(event.target.value)}
      />
      {apiKey ? (
        <div className="rounded-md bg-gray-100 p-4 dark:bg-gray-700">
          <p className="font-bold">{manifoldUser?.username}&rsquo;s balance</p>
          <p className="text-green-600 dark:text-green-400">
            {Math.round(Number(manifoldUser?.balance))} mana
          </p>

          <div className="mt-8 flex flex-col gap-2">
            <label className="text-sm font-medium leading-none">
              USD to deposit
            </label>
            <AmountInput
              id="amount"
              autoComplete="off"
              amount={transferAmount}
              onChangeAmount={setTransferAmount}
              allowFloat={false}
            />
            <Button loading={transferring} onClick={transferMana}>
              Transfer {manaToDeposit} mana
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
