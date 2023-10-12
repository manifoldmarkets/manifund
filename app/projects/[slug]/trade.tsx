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
  const [buyPortion, setBuyPortion] = useState(0)
  const [ammShares, ammUSD] = calculateAMMPorfolio(ammTxns, ammId)
  const portionForSale = ammShares / TOTAL_SHARES
  const percentForSale = portionForSale * 100
  const price = (ammUSD * ammShares) / (ammShares - buyPortion * TOTAL_SHARES)
  console.log('buy portion', buyPortion)
  return (
    <Card>
      <Row className="justify-between">
        <h1 className="text-xl font-bold">Trade</h1>
        <Tag
          text={`valuation: $${(ammUSD / ammShares) * TOTAL_SHARES}`}
          className="!text-lg"
        />
      </Row>
      <div className="flex w-full flex-col gap-4 md:flex-row">
        <Input
          value={buyPortion}
          type="number"
          className="w-1/3"
          onChange={(event) => setBuyPortion(Number(event.target.value))}
        />
        <MySlider
          value={(buyPortion / portionForSale) * 100}
          marks={{
            0: { label: `0%`, style: { color: '#000' } },
            25: {
              label: `${Math.round((percentForSale / 4) * 100) / 100}%`,
              style: { color: '#000' },
            },
            50: {
              label: `${Math.round((percentForSale / 3) * 100) / 100}%`,
              style: { color: '#000' },
            },
            75: {
              label: `${Math.round((percentForSale / 4) * 3 * 100) / 100}%`,
              style: { color: '#000' },
            },
            100: {
              label: `${Math.round(percentForSale * 100) / 100}%`,
              style: { color: '#000' },
            },
          }}
          onChange={(value) => {
            console.log(value)
            setBuyPortion(((value as number) * portionForSale) / 100)
          }}
        />
      </div>
      <p>price: {price}</p>
    </Card>
  )
}

function calculateAMMPorfolio(ammTxns: Txn[], ammId: string) {
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
  return [ammShares, ammUSD]
}
