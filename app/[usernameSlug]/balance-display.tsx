'use client'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { Tooltip } from '@/components/tooltip'
import { PlusSmallIcon, MinusSmallIcon } from '@heroicons/react/24/solid'
import React from 'react'
import { DataPoint } from '@/components/data-point'
import { Card } from '@/components/card'
import { StripeDepositButton } from '@/components/stripe-deposit-button'
import { roundMoney } from '@/utils/formatting'
import Link from 'next/link'

export function BalanceDisplay(props: {
  balance: number
  withdrawBalance: number
  spendableBalance: number
  accredited: boolean
  isOwnProfile?: boolean
  userId?: string
}) {
  const {
    balance,
    withdrawBalance,
    spendableBalance,
    accredited,
    isOwnProfile,
    userId,
  } = props
  const stats = [
    { name: 'Spendable', value: spendableBalance },
    { name: 'In pending offers', value: balance - spendableBalance },
  ]
  return (
    <Col className="h-fit">
      <Row className="h-fit justify-between gap-1 sm:gap-4 lg:gap-8">
        {isOwnProfile && userId && (
          <Col className="justify-between">
            {accredited ? (
              <a
                href="https://airtable.com/shrIB5yGc56DoQBhJ"
                className="rounded bg-white shadow"
              >
                <Tooltip text="Add funds">
                  <PlusSmallIcon className="h-4 w-4 text-gray-500" />
                </Tooltip>
              </a>
            ) : (
              <StripeDepositButton userId={userId} />
            )}

            <Link href="/withdraw" className="rounded bg-white p-1 shadow">
              <Tooltip text="Withdraw funds">
                <MinusSmallIcon className="h-4 w-4 text-gray-500" />
              </Tooltip>
            </Link>
          </Col>
        )}
        <div className="w-full min-w-fit rounded border-none bg-orange-500 py-1 px-2">
          <DataPoint
            label="Balance"
            value={`$${roundMoney(balance)}`}
            theme="white"
          />
        </div>
        {stats.map((stat) => (
          <Card
            key={stat.name}
            className="w-full min-w-fit border-none py-1 px-2"
          >
            <DataPoint label={stat.name} value={`$${roundMoney(stat.value)}`} />
          </Card>
        ))}
      </Row>
      <p className="mt-2 w-full rounded bg-gray-100 p-1 text-center text-sm tracking-wider text-gray-400">
        {isOwnProfile ? 'You can ' : 'This user can '} withdraw up to $
        {withdrawBalance}.
      </p>
    </Col>
  )
}
