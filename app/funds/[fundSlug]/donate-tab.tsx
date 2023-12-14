'use client'

import { Button, buttonClass } from '@/components/button'
import { DepositButton } from '@/components/deposit-buttons'
import { AmountInput } from '@/components/input'
import { Card } from '@/components/layout/card'
import { Profile } from '@/db/profile'
import clsx from 'clsx'
import { useState } from 'react'

export function DonateTab(props: {
  fund: Profile
  userId: string
  charityBalance?: number
}) {
  const { fund, userId, charityBalance } = props
  const [amount, setAmount] = useState<number>()
  return (
    <div className="my-5">
      <h1 className="text-lg font-bold">Donate via...</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex flex-col items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Credit card</h3>
            <p className="text-gray-600">
              Any funds you deposit will go straight to {fund.full_name}.
            </p>
          </div>
          <DepositButton userId={userId} passFundsTo={fund}>
            <span className={buttonClass('md', 'orange')}>Check out</span>
          </DepositButton>
        </Card>
        <Card className="flex flex-col items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold">Manifund balance</h3>
            <p className="text-gray-600">
              Transfer money from your existing charity balance to{' '}
              {fund.full_name}. You currently have ${charityBalance} available
              to give.
            </p>
          </div>
          <AmountInput
            amount={amount}
            onChangeAmount={setAmount}
            placeholder="Amount"
            className="w-full"
          />
          <Button className="w-fit">Donate</Button>
        </Card>
        <Card className="flex flex-col items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">US bank or DAF</h3>
            <p className="text-gray-600">
              For {'>'}$5k only. Follow the link below for details on how you
              can make a donation with lower transaction fees.
            </p>
          </div>
          <a
            href={`https://venmo.com/${fund.username}`}
            className={clsx(buttonClass('md', 'orange'), 'w-fit')}
          >
            See details
          </a>
        </Card>
      </div>
    </div>
  )
}
