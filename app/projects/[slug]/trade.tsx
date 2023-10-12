'use client'

import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Card } from '@/components/layout/card'
import { Row } from '@/components/layout/row'
import { HorizontalRadioGroup } from '@/components/radio-group'
import { MySlider } from '@/components/slider'
import { TOTAL_SHARES } from '@/db/project'
import { Txn } from '@/db/txn'
import { useState } from 'react'

export function Trade(props: {
  ammTxns: Txn[]
  ammId: string
  userSpendableFunds: number
}) {
  const { ammTxns, ammId } = props
  const [mode, setMode] = useState<string>('buy')
  const [portion, setPortion] = useState(0)
  const [ammShares, ammUSD] = calculateAMMPorfolio(ammTxns, ammId)
  const [submitting, setSubmitting] = useState(false)
  const portionForSale = ammShares / TOTAL_SHARES
  const percentForSale = portionForSale * 100
  const price =
    (ammUSD * ammShares) / (ammShares - portion * TOTAL_SHARES) - ammUSD
  console.log('buy portion', portion)
  return (
    <Card className="flex flex-col gap-4">
      <Row className="justify-between">
        <h1 className="text-xl font-bold">Trade</h1>
        <p>valuation: ${(ammUSD / ammShares) * TOTAL_SHARES}</p>
      </Row>
      <HorizontalRadioGroup
        value={mode}
        onChange={(event) => setMode(event)}
        options={{ buy: 'buy', sell: 'sell' }}
      />
      <div className="flex w-full flex-col gap-4 md:flex-row">
        <Input
          value={portion}
          type="number"
          className="w-1/3"
          onChange={(event) => setPortion(Number(event.target.value))}
        />
        <MySlider
          value={(portion / portionForSale) * 100}
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
            setPortion(((value as number) * portionForSale) / 100)
          }}
        />
      </div>
      <p>price: {price}</p>
      <Button
        loading={submitting}
        onClick={async () => {
          setSubmitting(true)
          const response = await fetch('/api/trade-with-amm', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              projectId: ammId,
              numShares: portion * TOTAL_SHARES,
            }),
          })
          setPortion(0)
          setSubmitting(false)
        }}
      >
        Buy {portion}
      </Button>
    </Card>
  )
}

export function calculateAMMPorfolio(ammTxns: Txn[], ammId: string) {
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
