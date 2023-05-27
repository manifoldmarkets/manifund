import {
  BuildingLibraryIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  HashtagIcon,
} from '@heroicons/react/20/solid'
import { useRouter } from 'next/navigation'
import Stripe from 'stripe'
import { EmptyContent } from './empty-content'
import { Row } from './layout/row'

export function WithdrawalDetails(props: {
  account: Stripe.Account | null
  userId: string
  loginLink: Stripe.LoginLink | null
}) {
  const { account, userId, loginLink } = props
  const router = useRouter()
  if (!account || !account.charges_enabled || !account.payouts_enabled) {
    return (
      <button
        onClick={async () => {
          const response = await fetch('/api/create-connect-account', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              profileId: userId,
            }),
          })
          const json = await response.json()
          router.push(json.url)
        }}
      >
        <EmptyContent
          icon={<CurrencyDollarIcon className="h-10 w-10 text-gray-400" />}
          title="Withdrawals not enabled."
          subtitle={
            !account
              ? 'Set up your Stripe connect account to enable withdrawals!'
              : 'Finish setting up your Stripe connect account to enable withdrawals!'
          }
        />
      </button>
    )
  }

  const withdrawalMethod = account.external_accounts?.data[0]
  if (!withdrawalMethod) {
    throw new Error('No withdrawal method')
  }
  const isBank = withdrawalMethod.object === 'bank_account'

  return (
    <div className="lg:col-start-3 lg:row-end-1">
      <h2 className="sr-only">{isBank ? 'Bank details' : 'Card details'}</h2>
      <div className="rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5">
        <dl className="flex flex-wrap">
          <div className="flex-auto pl-6 pt-6">
            <dt className="text-lg font-semibold leading-6 text-gray-900">
              {isBank ? 'Bank details' : 'Card details'}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-500">
              This is where your funds will be sent.
            </dd>
          </div>
          <div className="self-end px-6 pt-4">
            {isBank ? (
              <BuildingLibraryIcon
                className="h-16 w-16 text-gray-400"
                aria-hidden="true"
              />
            ) : (
              <CreditCardIcon
                className="h-16 w-16 text-gray-400"
                aria-hidden="true"
              />
            )}
          </div>
          <Row className="mt-4 w-full flex-none gap-x-4 px-6">
            <dt className="flex-none">
              <span className="sr-only">
                {isBank ? 'bank name' : 'brand name'}
              </span>
              {isBank ? (
                <BuildingLibraryIcon
                  className="h-6 w-6 text-gray-400"
                  aria-hidden="true"
                />
              ) : (
                <CreditCardIcon
                  className="h-6 w-6 text-gray-400"
                  aria-hidden="true"
                />
              )}
            </dt>
            <dd className="text-sm leading-6 text-gray-500">
              {isBank
                ? (withdrawalMethod as Stripe.BankAccount).bank_name
                : (withdrawalMethod as Stripe.Card).brand}
            </dd>
          </Row>
          <Row className="mt-4 w-full flex-none gap-x-4 px-6">
            <dt className="flex-none">
              <span className="sr-only">
                {isBank
                  ? 'last 4 digits of routing number'
                  : 'last 4 digits of credit card number'}
              </span>
              <HashtagIcon
                className="h-6 w-5 text-gray-400"
                aria-hidden="true"
              />
            </dt>
            <dd className="text-sm leading-6 text-gray-500">
              <p>
                {isBank ? '∙∙∙∙∙' : '∙∙∙∙∙∙∙∙∙∙∙∙'}
                {withdrawalMethod.last4}
              </p>
            </dd>
          </Row>
        </dl>
        <div className="mt-6 border-t border-gray-900/5 px-6 py-6">
          <a
            href={`${loginLink?.url}#settings`}
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            Edit details <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </div>
  )
}
