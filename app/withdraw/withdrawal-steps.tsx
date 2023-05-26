'use client'
import { Button } from '@/components/button'
import { Row } from '@/components/layout/row'
import { CheckIcon } from '@heroicons/react/20/solid'
import { useRouter } from 'next/navigation'
import Stripe from 'stripe'

export function WithdrawalSteps(props: {
  account: Stripe.Account | null
  userId: string
}) {
  const { account, userId } = props
  const steps = [
    {
      id: 1,
      name: 'Withdrawal details',
      status: 'current',
      display: <WithdrawalDetails account={account} userId={userId} />,
    },
    {
      id: 2,
      name: 'Select amount',
      status: 'upcoming',
      display: <div>Select amount</div>,
    },
    {
      id: 3,
      name: 'Confirm withdrawal',
      status: 'upcoming',
      display: <div>Confirm withdrawal</div>,
    },
  ]
  return (
    <>
      <nav aria-label="Progress">
        <ol
          role="list"
          className="mx-5 mt-5 divide-y divide-gray-300 rounded-md border border-gray-300 sm:flex sm:divide-y-0"
        >
          {steps.map((step, stepIdx) => (
            <li key={step.name} className="relative sm:flex sm:flex-1">
              {step.status === 'complete' ? (
                <Row className="group w-full items-center">
                  <span className="flex items-center px-6 py-4 text-sm font-medium">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 group-hover:bg-orange-700">
                      <CheckIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="ml-4 text-sm font-medium text-gray-900">
                      {step.name}
                    </span>
                  </span>
                </Row>
              ) : step.status === 'current' ? (
                <Row
                  className="items-center px-6 py-4 text-sm font-medium"
                  aria-current="step"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-orange-500">
                    <span className="text-orange-500">{step.id}</span>
                  </span>
                  <span className="ml-4 text-sm font-medium text-orange-500">
                    {step.name}
                  </span>
                </Row>
              ) : (
                <Row className="items-center">
                  <span className="flex items-center px-6 py-4 text-sm font-medium">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300">
                      <span className="text-gray-500">{step.id}</span>
                    </span>
                    <span className="ml-4 text-sm font-medium text-gray-500">
                      {step.name}
                    </span>
                  </span>
                </Row>
              )}

              {stepIdx !== steps.length - 1 ? (
                <>
                  {/* Arrow separator for sm screens and up */}
                  <div
                    className="absolute right-0 top-0 hidden h-full w-5 sm:block"
                    aria-hidden="true"
                  >
                    <svg
                      className="h-full w-full text-gray-300"
                      viewBox="0 0 22 80"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0 -2L20 40L0 82"
                        vectorEffect="non-scaling-stroke"
                        stroke="currentcolor"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </>
              ) : null}
            </li>
          ))}
        </ol>
      </nav>
      {steps.find((step) => step.status === 'current')?.display}
    </>
  )
}

function WithdrawalDetails(props: {
  account: Stripe.Account | null
  userId: string
}) {
  const { account, userId } = props
  const router = useRouter()
  if (!account) {
    // TODO: pull out into pretty component
    return (
      <Button
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
        Set up withdrawals
      </Button>
    )
  }
  return (
    <div>
      Bank details:
      {account.external_accounts?.data[0]?.last4}
    </div>
  )
}
