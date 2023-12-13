'use client'

import { Button } from '@/components/button'
import { DepositButton } from '@/components/deposit-buttons'
import { AmountInput } from '@/components/input'
import { Card } from '@/components/layout/card'
import { Profile } from '@/db/profile'
import { useState } from 'react'

export function DonateTab(props: {
  fund: Profile
  userId: string
  charityBalance?: number
}) {
  const { fund, userId, charityBalance } = props
  const [amount, setAmount] = useState<number>()
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <h3 className="text-lg font-bold">Deposit funds directly</h3>
        <p className="text-gray-600">
          Click the button below and you&apos;ll be taken directly to a checkout
          page. Any funds you deposit there will go straight to {fund.full_name}
          .
        </p>
        <DepositButton userId={userId} passFundsTo={fund}>
          Donate
        </DepositButton>
      </Card>
      <Card>
        <h3 className="text-lg font-bold">Donate from your Manifund account</h3>
        <p className="text-gray-600">
          Transfer money from your charity balance in Manifund to{' '}
          {fund.full_name}. You currently have ${charityBalance} available to
          give.
        </p>
        <AmountInput
          amount={amount}
          onChangeAmount={setAmount}
          placeholder="Amount"
        />
        <Button>Donate</Button>
      </Card>
      <Card>
        <h3 className="text-lg font-bold">ACH Transfer</h3>
        <p className="text-gray-600">
          You can donate to {fund.full_name} by ACH transfer. First, follow the
          link below to see our ACH details. Then email rachel@manifund.org with
          your full name, your Manifund username, how much you transfered, and
          let us know that you&apos; like your donation to be passed on to ACX.
        </p>
        <a
          href={`https://venmo.com/${fund.username}`}
          className="inline-block"
        />
      </Card>
    </div>
  )
}
