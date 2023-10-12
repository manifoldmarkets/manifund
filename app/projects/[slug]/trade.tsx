'use client'

import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Card } from '@/components/layout/card'
import { Row } from '@/components/layout/row'
import { HorizontalRadioGroup } from '@/components/radio-group'
import { MySlider } from '@/components/slider'
import { TOTAL_SHARES } from '@/db/project'
import { Txn } from '@/db/txn'
import clsx from 'clsx'
import { useState } from 'react'

const MODES = [
  {
    label: 'Buy',
    id: 'buy',
    buttonClass: '!bg-emerald-500 hover:!bg-emerald-600',
    sliderClass:
      '[&>.rc-slider-handle]:bg-emerald-500 [&>.rc-slider-track]:bg-emerald-500',
    cardClass: 'bg-emerald-50',
  },
  {
    label: 'Sell',
    id: 'sell',
    buttonClass: 'bg-rose-500 hover:bg-rose-600',
    sliderClass:
      '[&>.rc-slider-handle]:bg-rose-500 [&>.rc-slider-track]:bg-rose-500',
    cardClass: 'bg-rose-50',
  },
  {
    label: '#',
    id: 'limit order',
    buttonClass: 'bg-orange-500 hover:bg-orange-600',
    sliderClass:
      '[&>.rc-slider-handle]:bg-orange-500 [&>.rc-slider-track]:bg-orange-500',
    cardClass: 'bg-orange-50',
  },
]

export function Trade(props: {
  ammTxns: Txn[]
  ammId: string
  userSpendableFunds: number
  userSellableShares: number
}) {
  const { ammTxns, ammId, userSpendableFunds, userSellableShares } = props
  const [modeId, setModeId] = useState<string>('buy')
  const mode = MODES.find((mode) => mode.id === modeId)
  const [portion, setPortion] = useState(0)
  const [ammShares, ammUSD] = calculateAMMPorfolio(ammTxns, ammId)
  const [submitting, setSubmitting] = useState(false)
  const portionForSale =
    (modeId === 'buy' ? ammShares : userSellableShares) / TOTAL_SHARES
  const percentForSale = portionForSale * 100
  const price =
    modeId === 'buy'
      ? calculateBuyPrice(portion, ammShares, ammUSD)
      : calculateSellPrice(portion, ammShares, ammUSD)
  console.log('buy portion', portion)
  return (
    <div>
      <Row className="mb-3 w-full justify-between gap-3">
        <Button
          className={clsx(
            'w-full',
            MODES.find((mode) => mode.id === 'buy')?.buttonClass
          )}
          onClick={() => setModeId('buy')}
        >
          Buy
        </Button>
        <Button
          className={clsx(
            'w-full',
            MODES.find((mode) => mode.id === 'sell')?.buttonClass
          )}
          onClick={() => setModeId('sell')}
        >
          Sell
        </Button>
        <Button
          className={clsx(
            'w-32',
            MODES.find((mode) => mode.id === 'limit order')?.buttonClass
          )}
          onClick={() => setModeId('limit order')}
        >
          #
        </Button>
      </Row>
      <div
        className={clsx('flex flex-col gap-4 rounded-md p-4', mode?.cardClass)}
      >
        <p>valuation: ${(ammUSD / ammShares) * TOTAL_SHARES}</p>
        <Row className="w-full items-center gap-4">
          <Input
            value={portion}
            type="number"
            className="w-1/3"
            onChange={(event) => setPortion(Number(event.target.value))}
          />
          <MySlider
            value={(portion / portionForSale) * 100}
            className={clsx(mode?.sliderClass)}
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
        </Row>
        <p>price: {price}</p>
        <Button
          className={mode?.buttonClass}
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
                buying: modeId === 'buy',
              }),
            })
            setPortion(0)
            setSubmitting(false)
          }}
        >
          {modeId} {portion}
        </Button>
      </div>
    </div>
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

export function calculateBuyPrice(
  portion: number,
  ammShares: number,
  ammUSD: number
) {
  return (ammUSD * ammShares) / (ammShares - portion * TOTAL_SHARES) - ammUSD
}

export function calculateSellPrice(
  portion: number,
  ammShares: number,
  ammUSD: number
) {
  return ammUSD - (ammUSD * ammShares) / (ammShares + portion * TOTAL_SHARES)
}
