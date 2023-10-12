'use client'

import { Input } from '@/components/input'
import { Card } from '@/components/layout/card'
import { Row } from '@/components/layout/row'
import { MySlider } from '@/components/slider'
import { Tag } from '@/components/tags'
import { TOTAL_SHARES } from '@/db/project'
import { Txn } from '@/db/txn'
import { useState } from 'react'

export function Trade(props: {
  ammTxns: Txn[]
  ammId: string
  userSpendableFunds: number
}) {
  const { ammTxns, ammId } = props
  const [buyAmount, setBuyAmount] = useState(0)
  const ammShares = ammTxns.reduce((total, txn) => {
    if (txn.token !== 'USD') {
      if (txn.to_id == ammId) {
        total += txn.amount
      } else {
        total -= txn.amount
      }
    }
    return total
  }, 0)
  const ammUSD = ammTxns.reduce((total, txn) => {
    if (txn.token === 'USD') {
      if (txn.to_id == ammId) {
        total += txn.amount
      } else {
        total -= txn.amount
      }
    }
    return total
  }, 0)
  return (
    <Card>
      <Row className="justify-between">
        <h1 className="text-xl font-bold">Trade</h1>
        <Tag
          text={`price: ${calculatePrice(ammTxns, ammId)}`}
          className="!text-lg"
        />
      </Row>
      <div className="flex w-full flex-col gap-4 md:flex-row">
        <Input
          value={buyAmount}
          type="number"
          className="w-1/3"
          onChange={(event) => setBuyAmount(Number(event.target.value))}
        />
        <MySlider
          value={buyAmount}
          marks={{
            0: { label: '0%', style: { color: '#000' } },
            25: { label: '25%', style: { color: '#000' } },
            50: { label: '50%', style: { color: '#000' } },
            75: { label: '75%', style: { color: '#000' } },
            100: { label: '100%', style: { color: '#000' } },
          }}
          onChange={(value) => {
            setBuyAmount(value as number)
          }}
        />
      </div>
    </Card>
  )
}

function calculatePrice(ammTxns: Txn[], ammId: string) {
  const ammShares = ammTxns.reduce((total, txn) => {
    if (txn.token !== 'USD') {
      if (txn.to_id == ammId) {
        total += txn.amount
      } else {
        total -= txn.amount
      }
    }
    return total
  }, 0)
  const ammUSD = ammTxns.reduce((total, txn) => {
    if (txn.token === 'USD') {
      if (txn.to_id == ammId) {
        total += txn.amount
      } else {
        total -= txn.amount
      }
    }
    return total
  }, 0)
  return (ammUSD / ammShares) * TOTAL_SHARES
}
