'use client'

import { Button, buttonClass } from '@/components/button'
import { DepositButton } from '@/components/deposit-buttons'
import { AmountInput } from '@/components/input'
import { Card } from '@/components/layout/card'
import { Profile } from '@/db/profile'
import { useState } from 'react'
import { Row } from '@/components/layout/row'
import { Tooltip } from '@/components/tooltip'
import { formatMoneyPrecise } from '@/utils/formatting'
import clsx from 'clsx'

export function DonateSection(props: {
  fund: Profile
  userId: string
  charityBalance: number
}) {
  const { fund, userId, charityBalance } = props
  const [amount, setAmount] = useState<number>()
  let fromBalanceError = null
  if (!amount) {
    fromBalanceError = 'Please enter an amount'
  } else if (amount > charityBalance) {
    fromBalanceError = `Not enough funds. You only have ${formatMoneyPrecise(
      charityBalance
    )} available to give.`
  } else fromBalanceError = null
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
            <span
              className={clsx(
                buttonClass('sm', 'light-orange'),
                'w-fit font-bold'
              )}
            >
              Checkout
            </span>
          </DepositButton>
        </Card>
        <Card className="flex flex-col items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">Manifund balance</h3>
            <p className="text-gray-600">
              Transfer money from your existing charity balance to{' '}
              {fund.full_name}.
            </p>
          </div>
          <Row className="items-center justify-center gap-1 text-gray-500">
            $
            <AmountInput
              amount={amount}
              onChangeAmount={setAmount}
              placeholder="Amount"
              className="!h-8 !w-24 !px-3 text-sm"
            />
          </Row>
          <Tooltip text={fromBalanceError}>
            <Button
              className="w-fit font-bold"
              color="light-orange"
              size="sm"
              disabled={fromBalanceError !== null}
              onClick={async () => {
                await fetch('/api/transfer-money', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    amount,
                    toId: fund.id,
                    fromId: userId,
                  }),
                })
              }}
            >
              Donate
            </Button>
          </Tooltip>
        </Card>
        <Card className="flex flex-col items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Wire, ACH, or DAF</h3>
            <p className="text-gray-600">
              Recommended for large donations (e.g. {'>'}$5k) for lower fees.
            </p>
          </div>
          <a
            href="https://manifoldmarkets.notion.site/Instructions-for-donations-via-wire-ACH-or-DAF-02aee92e884a47e49efd4d93242e2080?pvs=4"
            className={clsx(
              buttonClass('sm', 'light-orange'),
              'w-fit font-bold'
            )}
            target="_blank"
          >
            See details
          </a>
        </Card>
      </div>
    </div>
  )
}
