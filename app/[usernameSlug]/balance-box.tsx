'use client'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { Tooltip } from '@/components/tooltip'
import {
  CurrencyDollarIcon,
  PlusSmallIcon,
  MinusSmallIcon,
} from '@heroicons/react/24/solid'
import React from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { NEXT_PUBLIC_STRIPE_KEY } from '@/db/env'
import { useSupabase } from '@/db/supabase-provider'
import { useRouter } from 'next/navigation'

export function BalanceBox(props: { balance: number; accredited: boolean }) {
  const { balance, accredited } = props
  return (
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
  )
}

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(NEXT_PUBLIC_STRIPE_KEY ?? '')
function StripeDepositButton() {
  React.useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search)
    if (query.get('success')) {
      console.log('Order placed! You will receive an email confirmation.')
    }

    if (query.get('canceled')) {
      console.log(
        'Order canceled -- continue to shop around and checkout when you’re ready.'
      )
    }
  }, [])

  const { session } = useSupabase()
  const user = session?.user
  const router = useRouter()

  return (
    <div>
      <button
        type="submit"
        role="link"
        className="rounded bg-gray-200 p-1"
        onClick={async () => {
          const response = await fetch('/api/checkout-sessions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              dollarQuantity: 10,
              userId: user?.id,
            }),
          })
          const json = await response.json()
          router.push(json.url)
        }}
      >
        <Tooltip text="Withdraw funds">
          <PlusSmallIcon className="h-4 w-4 text-gray-500" />
        </Tooltip>
      </button>
    </div>
  )
}
