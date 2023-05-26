import { CheckIcon } from '@heroicons/react/20/solid'
import Stripe from 'stripe'

export function WithdrawalSteps(props: { account: Stripe.Account | null }) {
  const { account } = props
  const steps = [
    { id: 0, name: 'Withdrawal details', href: '#', status: 'current' },
    { id: 1, name: 'Select amount', href: '#', status: 'upcoming' },
    { id: 2, name: 'Confirm withdrawal', href: '#', status: 'upcoming' },
  ]
  return (
    <nav aria-label="Progress">
      <ol
        role="list"
        className="mx-5 mt-5 divide-y divide-gray-300 rounded-md border border-gray-300 sm:flex sm:divide-y-0"
      >
        {steps.map((step, stepIdx) => (
          <li key={step.name} className="relative sm:flex sm:flex-1">
            {step.status === 'complete' ? (
              <a href={step.href} className="group flex w-full items-center">
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
              </a>
            ) : step.status === 'current' ? (
              <a
                href={step.href}
                className="flex items-center px-6 py-4 text-sm font-medium"
                aria-current="step"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-orange-500">
                  <span className="text-orange-500">{step.id}</span>
                </span>
                <span className="ml-4 text-sm font-medium text-orange-500">
                  {step.name}
                </span>
              </a>
            ) : (
              <a href={step.href} className="group flex items-center">
                <span className="flex items-center px-6 py-4 text-sm font-medium">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 group-hover:border-gray-400">
                    <span className="text-gray-500 group-hover:text-gray-900">
                      {step.id}
                    </span>
                  </span>
                  <span className="ml-4 text-sm font-medium text-gray-500 group-hover:text-gray-900">
                    {step.name}
                  </span>
                </span>
              </a>
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
  )
}
