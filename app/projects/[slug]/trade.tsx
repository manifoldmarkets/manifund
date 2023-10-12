'use client'

import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Row } from '@/components/layout/row'
import { MySlider } from '@/components/slider'
import { TOTAL_SHARES } from '@/db/project'
import { Txn } from '@/db/txn'
import { formatMoney } from '@/utils/formatting'
import clsx from 'clsx'
import { useState } from 'react'

type BinaryModeId = 'buy' | 'sell' | null
const MODES = [
  {
    label: 'Buy',
    id: 'buy' as BinaryModeId,
    buttonClass: '!bg-emerald-500 hover:!bg-emerald-600 w-full',
    buttonUnselectedClass:
      'ring-emerald-500 bg-white !text-emerald-500 ring-2 hover:bg-emerald-500 hover:ring-emerald-600 hover:!text-white w-full',
    sliderClass:
      '[&>.rc-slider-handle]:bg-emerald-500 [&>.rc-slider-track]:bg-emerald-500',
    cardClass: 'bg-emerald-50',
  },
  {
    label: 'Sell',
    id: 'sell' as BinaryModeId,
    buttonClass: 'bg-rose-500 hover:bg-rose-600 w-full',
    buttonUnselectedClass:
      'ring-rose-500 bg-white !text-rose-500 ring-2 hover:bg-rose-500 hover:ring-rose-600 hover:!text-white w-full',
    sliderClass:
      '[&>.rc-slider-handle]:bg-rose-500 [&>.rc-slider-track]:bg-rose-500',
    cardClass: 'bg-rose-50',
  },
]

export function Trade(props: {
  ammTxns: Txn[]
  ammId: string
  userSpendableFunds: number
  userSellableShares: number
}) {
  const { ammTxns, ammId, userSpendableFunds, userSellableShares } = props
  const [modeId, setModeId] = useState<BinaryModeId>(null)
  return (
    <div>
      <Row className="mb-3 w-full justify-between gap-3">
        {MODES.map((mode) => {
          return (
            <Button
              key={mode.id}
              className={clsx(
                modeId === mode.id
                  ? mode.buttonClass
                  : mode.buttonUnselectedClass
              )}
              onClick={() => setModeId(mode.id)}
            >
              {mode.label}
            </Button>
          )
        })}
      </Row>
      {modeId !== null && (
        <TradeDetails
          modeId={modeId}
          ammTxns={ammTxns}
          ammId={ammId}
          userSpendableFunds={userSpendableFunds}
          userSellableShares={userSellableShares}
        />
      )}
    </div>
  )
}

function TradeDetails(props: {
  modeId: BinaryModeId
  ammTxns: Txn[]
  ammId: string
  userSpendableFunds: number
  userSellableShares: number
}) {
  const { modeId, ammTxns, ammId, userSpendableFunds, userSellableShares } =
    props
  const mode = MODES.find((mode) => mode.id === modeId)
  const [percent, setPercent] = useState(0)
  const [ammShares, ammUSD] = calculateAMMPorfolio(ammTxns, ammId)
  const [submitting, setSubmitting] = useState(false)
  const sliderMax =
    ((modeId === 'buy' ? ammShares : userSellableShares) / TOTAL_SHARES) * 100
  const price =
    modeId === 'buy'
      ? calculateBuyPrice(percent / 100, ammShares, ammUSD)
      : calculateSellPrice(percent / 100, ammShares, ammUSD)
  return (
    <div
      className={clsx('flex flex-col gap-4 rounded-md p-4', mode?.cardClass)}
    >
      <p>valuation: ${(ammUSD / ammShares) * TOTAL_SHARES}</p>
      <Row className="w-full items-center gap-4">
        <Input
          value={percent}
          type="number"
          className="w-1/3"
          onChange={(event) => setPercent(Number(event.target.value))}
        />
        <MySlider
          value={(percent / sliderMax) * 100}
          className={clsx(mode?.sliderClass)}
          marks={{
            0: {
              label: modeId === 'buy' ? '$0' : '0%',
              style: { color: '#000' },
            },
            25: {
              label:
                modeId === 'buy'
                  ? formatMoney(sliderMax / 4)
                  : `${Math.round((sliderMax / 4) * 100) / 100}%`,
              style: { color: '#000' },
            },
            50: {
              label:
                modeId === 'buy'
                  ? formatMoney(sliderMax / 2)
                  : `${Math.round((sliderMax / 2) * 100) / 100}%`,
              style: { color: '#000' },
            },
            75: {
              label:
                modeId === 'buy'
                  ? formatMoney((sliderMax / 4) * 3)
                  : `${Math.round((sliderMax / 4) * 3 * 100) / 100}%`,
              style: { color: '#000' },
            },
            100: {
              label:
                modeId === 'buy'
                  ? formatMoney(sliderMax)
                  : `${Math.round(sliderMax * 100) / 100}%`,
              style: { color: '#000' },
            },
          }}
          onChange={(value) => {
            setPercent(((value as number) * sliderMax) / 100)
          }}
        />
      </Row>
      <p>price: {price}</p>
      <Button
        className={clsx(mode?.buttonClass, 'w-full')}
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
              numShares: (percent / 100) * TOTAL_SHARES,
              buying: modeId === 'buy',
            }),
          })
          setPercent(0)
          setSubmitting(false)
        }}
      >
        {modeId} {percent}
      </Button>
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
