'use client'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Row } from '@/components/layout/row'
import { Tooltip } from '@/components/tooltip'
import {
  AccountStatus,
  WithdrawalDetails,
} from '@/components/withdrawal-details'
import {
  ArrowLeftCircleIcon,
  CheckCircleIcon,
  CheckIcon,
} from '@heroicons/react/20/solid'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Stripe from 'stripe'

export function WithdrawalSteps(props: {
  accountStatus: AccountStatus
  withdrawalMethod?: Stripe.BankAccount | Stripe.Card
  userId: string
  withdrawBalance: number
  loginUrl?: string
}) {
  const { accountStatus, withdrawalMethod, userId, withdrawBalance, loginUrl } =
    props
  const router = useRouter()
  const [withdrawAmount, setWithdrawAmount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [complete, setComplete] = useState(false)
  const isBank = withdrawalMethod?.object === 'bank_account'
  const steps = [
    {
      id: 1,
      name: 'Withdrawal details',
      display: (
        <WithdrawalDetails
          accountStatus={accountStatus}
          withdrawalMethod={withdrawalMethod}
          userId={userId}
          loginUrl={loginUrl}
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
          {withdrawalMethod ? (
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="px-4 py-6 sm:px-6">
                {complete ? (
                  <div>
                    <Row className="justify-center">
                      <CheckCircleIcon className="h-16 w-16 text-orange-500" />
                    </Row>
                    <h3 className="text-center text-lg font-semibold leading-7 text-gray-900">
                      Withdrawal complete!
                    </h3>
                    <p className="mt-1 max-w-2xl text-center text-sm leading-6 text-gray-500">
                      Your payment is on the way. It may take up to 2 days to
                      process.
                    </p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-base font-semibold leading-7 text-gray-900">
                      Withdrawal destination and amount confirmation
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                      Confirm the following details are correct before
                      completing your withdrawal.
                    </p>
                  </>
                )}
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
                    <dd className=" mt-0 text-sm leading-6 text-gray-700">
                      ${withdrawAmount}
                    </dd>
                  </div>
                  {!complete && (
                    <Row className="justify-center py-6 px-6">
                      <Button
                        className="font-semibold"
                        onClick={async () => {
                          setIsSubmitting
                          const response = await fetch(
                            '/api/stripe-connect-withdraw',
                            {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                amount: withdrawAmount,
                              }),
                            }
                          )
                          const json = await response.json()
                          if (json.error) {
                            console.error(json.error)
                          } else {
                            setComplete(true)
                          }
                          setIsSubmitting(false)
                        }}
                      >
                        Withdraw
                      </Button>
                    </Row>
                  )}
                </dl>
              </div>
            </div>
          ) : (
            <div>
              You need to set up your stripe account before withdrawing.
            </div>
          )}
        </>
      ),
    },
  ]

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
  if (accountStatus !== 'complete' && currentStep.id === 1) {
    errorMessage = 'You need to set up your stripe account before continuing.'
  } else if (withdrawAmount < 10 && currentStep.id === 2) {
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
              <Button
                className="inline-flex items-center gap-x-2 rounded-md bg-orange-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:bg-gray-300"
                onClick={() => nextStep()}
                disabled={errorMessage !== null}
                loading={isSubmitting}
              >
                <CheckCircleIcon
                  className="-ml-0.5 h-5 w-5"
                  aria-hidden="true"
                />
                {currentStep.id === 3
                  ? 'Return to Manifund'
                  : 'Confirm & continue'}
              </Button>
            </Tooltip>
          </Row>
        </div>
      </Row>
    </>
  )
}
