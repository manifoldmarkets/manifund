'use client'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Row } from '@/components/layout/row'
import { Tooltip } from '@/components/tooltip'
import {
  ArrowLeftCircleIcon,
  BuildingLibraryIcon,
  CheckCircleIcon,
  CheckIcon,
  CreditCardIcon,
  HashtagIcon,
} from '@heroicons/react/20/solid'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Stripe from 'stripe'

export function WithdrawalSteps(props: {
  account: Stripe.Account | null
  userId: string
  withdrawBalance: number
  loginLink: Stripe.LoginLink | null
}) {
  const { account, userId, withdrawBalance, loginLink } = props
  const [withdrawAmount, setWithdrawAmount] = useState(0)
  const [complete, setComplete] = useState(false)
  const steps = [
    {
      id: 1,
      name: 'Withdrawal details',
      display: (
        <WithdrawalDetails
          account={account}
          userId={userId}
          loginLink={loginLink}
        />
      ),
    },
    {
      id: 2,
      name: 'Select amount',
      display: (
        <div>
          <label
            htmlFor="price"
            className="block font-medium leading-6 text-gray-900"
          >
            Withdrawal amount
          </label>
          <p className="mt-1 text-sm text-gray-500">
            You may withdraw up to ${withdrawBalance}.
          </p>
          <div className="relative mt-2 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <Input
              type="text"
              id="withdrawal-amount"
              className="block w-full rounded-md border-0 py-2 pl-7 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6"
              placeholder="0.00"
              aria-describedby="price-currency"
              onChange={(event) =>
                setWithdrawAmount(Number(event.target.value))
              }
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-500 sm:text-sm" id="price-currency">
                USD
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      name: 'Confirm withdrawal',
      display: (
        <>
          {account ? (
            <AllDetailsCard account={account} amount={withdrawAmount} />
          ) : (
            <div>
              You need to set up your stripe account before withdrawing.
            </div>
          )}
        </>
      ),
    },
  ]
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(steps[0])
  const nextStep = () => {
    if (currentStep.id === steps.length) {
      router.push('/')
    } else {
      setCurrentStep(steps[currentStep.id])
    }
  }
  const previousStep = () => {
    if (currentStep.id === 1) {
      router.push('/')
    } else {
      setCurrentStep(steps[currentStep.id - 2])
    }
  }
  let errorMessage = null
  if (withdrawAmount < 10 && currentStep.id === 2) {
    errorMessage = 'Minimum withdrawal is $10.'
  } else if (withdrawAmount > withdrawBalance && currentStep.id === 2) {
    errorMessage = `You cannot withdraw more than $${withdrawBalance} .`
  } else if (!complete && currentStep.id === 3) {
    errorMessage = 'Complete your withdrawal to continue.'
  } else {
    errorMessage = null
  }
  return (
    <>
      <nav aria-label="Progress">
        <ol
          role="list"
          className="mx-5 mt-5 divide-y divide-gray-300 rounded-md border border-gray-300 sm:flex sm:divide-y-0"
        >
          <a
            href="/"
            className="flex justify-center px-3.5 py-1 text-sm text-gray-500 hover:text-orange-500 sm:flex-col sm:border-r sm:border-r-gray-300"
          >
            Cancel
          </a>
          {steps.map((step, stepIdx) => (
            <li key={step.name} className="relative sm:flex sm:flex-1">
              {step.id < currentStep.id ? (
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
              ) : step.id === currentStep.id ? (
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
      <Row className="w-full justify-center p-10">
        <div className="w-full max-w-xl">
          {currentStep.display}
          <Row className="mt-10 justify-between">
            <button
              className="inline-flex items-center gap-x-2 rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              onClick={() => previousStep()}
            >
              <ArrowLeftCircleIcon
                className="-ml-0.5 h-5 w-5"
                aria-hidden="true"
              />
              Back
            </button>
            <Tooltip text={errorMessage ?? ''}>
              <button
                type="button"
                className="inline-flex items-center gap-x-2 rounded-md bg-orange-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:bg-gray-300"
                onClick={() => nextStep()}
                disabled={errorMessage !== null}
              >
                <CheckCircleIcon
                  className="-ml-0.5 h-5 w-5"
                  aria-hidden="true"
                />
                {currentStep.id === 3
                  ? 'Return to Manifund'
                  : 'Confirm & continue'}
              </button>
            </Tooltip>
          </Row>
        </div>
      </Row>
    </>
  )
}

function WithdrawalDetails(props: {
  account: Stripe.Account | null
  userId: string
  loginLink: Stripe.LoginLink | null
}) {
  const { account, userId, loginLink } = props
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

function AllDetailsCard(props: { account: Stripe.Account; amount: number }) {
  const { account, amount } = props
  const withdrawalMethod = account.external_accounts?.data[0]
  if (!withdrawalMethod) {
    throw new Error('No withdrawal method')
  }
  const isBank = withdrawalMethod.object === 'bank_account'
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="px-4 py-6 sm:px-6">
        <h3 className="text-base font-semibold leading-7 text-gray-900">
          Withdrawal destination and amount confirmation
        </h3>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
          Confirm the following details are correct before completing your
          withdrawal.
        </p>
      </div>
      <div className="border-t border-gray-100">
        <dl className="divide-y divide-gray-100">
          <div className="grid grid-cols-2 gap-4 py-6 px-6">
            <dt className=" text-sm font-medium text-gray-900">
              {isBank ? 'Bank name' : 'Card brand name'}
            </dt>
            <dd className="mt-0 text-sm leading-6 text-gray-700">
              {isBank
                ? (withdrawalMethod as Stripe.BankAccount).bank_name
                : (withdrawalMethod as Stripe.Card).brand}
            </dd>
          </div>
          <div className="grid grid-cols-2 gap-4 py-6 px-6">
            <dt className=" text-sm font-medium text-gray-900">
              {isBank
                ? 'last 4 digits of routing number'
                : 'last 4 digits of credit card number'}
            </dt>
            <dd className=" mt-0 text-sm leading-6 text-gray-700">
              {isBank ? '∙∙∙∙∙' : '∙∙∙∙∙∙∙∙∙∙∙∙'}
              {withdrawalMethod.last4}
            </dd>
          </div>
          <div className="grid grid-cols-2 gap-4 py-6 px-6">
            <dt className=" text-sm font-medium text-gray-900">
              Amount to withdraw
            </dt>
            <dd className=" mt-0 text-sm leading-6 text-gray-700">${amount}</dd>
          </div>
          <Row className="justify-center py-6 px-6">
            <Button className="font-semibold">Withdraw</Button>
          </Row>
        </dl>
      </div>
    </div>
  )
}
