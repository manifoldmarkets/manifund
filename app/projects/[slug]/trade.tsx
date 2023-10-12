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
    buttonClass: '!bg-emerald-500 hover:!bg-emerald-600',
    buttonUnselectedClass:
      'ring-emerald-500 bg-white !text-emerald-500 ring-2 hover:!bg-emerald-500 hover:ring-emerald-600 hover:!text-white',
    sliderClass:
      '[&>.rc-slider-handle]:bg-emerald-500 [&>.rc-slider-track]:bg-emerald-500',
    cardClass: 'bg-emerald-50',
  },
  {
    label: 'Sell',
    id: 'sell' as BinaryModeId,
    buttonClass: 'bg-rose-500 hover:bg-rose-600',
    buttonUnselectedClass:
      'ring-rose-500 bg-white !text-rose-500 ring-2 hover:bg-rose-500 hover:ring-rose-600 hover:!text-white',
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
  const [isLimit, setIsLimit] = useState(false)
  return (
    <div>
      <Row className="mb-3 w-full justify-between gap-3 font-semibold">
        {MODES.map((mode) => {
          return (
            <Button
              key={mode.id}
              className={clsx(
                'w-full',
                modeId === mode.id
                  ? mode.buttonClass
                  : mode.buttonUnselectedClass
              )}
              onClick={() => {
                setModeId(modeId === mode.id ? null : mode.id)
                setIsLimit(false)
              }}
            >
              {mode.label}
            </Button>
          )
        })}
        <Button
          className={clsx(
            isLimit
              ? 'bg-orange-500 !text-white hover:!bg-orange-600'
              : 'w-full bg-white !text-orange-500 ring-2 ring-orange-500 hover:bg-orange-500 hover:!text-white hover:!ring-orange-600',
            '!w-32'
          )}
          onClick={() => {
            setIsLimit(!isLimit)
            setModeId(null)
          }}
        >
          #
        </Button>
      </Row>
      {modeId !== null && !isLimit && (
        <BinaryTradePanel
          modeId={modeId}
          ammTxns={ammTxns}
          ammId={ammId}
          userSpendableFunds={userSpendableFunds}
          userSellableShares={userSellableShares}
        />
      )}
      {isLimit && (
        <LimitOrderPanel
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

function BinaryTradePanel(props: {
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
      ? calculateBuyShares(percent / 100, ammShares, ammUSD)
      : calculateSellPayout(percent / 100, ammShares, ammUSD)
  return (
    <div
      className={clsx('flex flex-col gap-4 rounded-md p-4', mode?.cardClass)}
    >
      <p>valuation: ${(ammUSD / ammShares) * TOTAL_SHARES}</p>
      {modeId === 'buy' ? (
        <BuyPanelContent
          ammShares={ammShares}
          ammUSD={ammUSD}
          userSpendableFunds={userSpendableFunds}
          amount={price}
          setAmount={(amount) => {
            setPercent((amount / userSpendableFunds) * 100)
          }}
        />
      ) : (
        <SellPanelContent
          ammShares={ammShares}
          ammUSD={ammUSD}
          userSellableShares={userSellableShares}
          amount={price}
          setAmount={(amount) => {
            setPercent((amount / sliderMax) * 100)
          }}
        />
      )}
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

function LimitOrderPanel(props: {
  modeId: BinaryModeId
  ammTxns: Txn[]
  ammId: string
  userSpendableFunds: number
  userSellableShares: number
}) {
  return <div>Limit order panel</div>
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

function BuyPanelContent(props: {
  ammShares: number
  ammUSD: number
  userSpendableFunds: number
  amount: number
  setAmount: (amount: number) => void
}) {
  const { ammShares, ammUSD, userSpendableFunds, amount, setAmount } = props
  const sliderMax = Math.min(userSpendableFunds, 100)
  const shares = calculateBuyShares(amount, ammShares, ammUSD)
  return (
    <div>
      <Row className="w-full items-center gap-4">
        <Input
          value={amount}
          type="number"
          className="w-1/3"
          onChange={(event) => setAmount(Number(event.target.value))}
        />
        <MySlider
          value={(amount / sliderMax) * 100}
          className="[&>.rc-slider-handle]:bg-emerald-500 [&>.rc-slider-track]:bg-emerald-500"
          marks={{
            0: {
              label: '$0',
              style: { color: '#000' },
            },
            25: {
              label: formatMoney(sliderMax / 4),
              style: { color: '#000' },
            },
            50: {
              label: formatMoney(sliderMax / 2),
              style: { color: '#000' },
            },
            75: {
              label: formatMoney((sliderMax / 4) * 3),
              style: { color: '#000' },
            },
            100: {
              label: formatMoney(sliderMax),
              style: { color: '#000' },
            },
          }}
          onChange={(value) => {
            setAmount(((value as number) * sliderMax) / 100)
          }}
        />
      </Row>
      <p>equity: {(shares / TOTAL_SHARES) * 100}</p>
    </div>
  )
}

function SellPanelContent(props: {
  ammShares: number
  ammUSD: number
  userSellableShares: number
  amount: number
  setAmount: (amount: number) => void
}) {
  const { ammShares, ammUSD, userSellableShares, amount, setAmount } = props
  const sliderMax = (userSellableShares / TOTAL_SHARES) * 100
  const payout = calculateSellPayout(amount, ammShares, ammUSD)
  return (
    <div>
      <Row className="w-full items-center gap-4">
        <Input
          value={amount}
          type="number"
          className="w-1/3"
          onChange={(event) => setAmount(Number(event.target.value))}
        />
        <MySlider
          value={(amount / sliderMax) * 100}
          className="[&>.rc-slider-handle]:bg-emerald-500 [&>.rc-slider-track]:bg-emerald-500"
          marks={{
            0: {
              label: '0%',
              style: { color: '#000' },
            },
            25: {
              label: `${Math.round((sliderMax / 4) * 100) / 100}%`,
              style: { color: '#000' },
            },
            50: {
              label: `${Math.round((sliderMax / 2) * 100) / 100}%`,
              style: { color: '#000' },
            },
            75: {
              label: `${Math.round((sliderMax / 4) * 3 * 100) / 100}%`,
              style: { color: '#000' },
            },
            100: {
              label: `${Math.round(sliderMax * 100) / 100}%`,
              style: { color: '#000' },
            },
          }}
          onChange={(value) => {
            setAmount(((value as number) * sliderMax) / 100)
          }}
        />
      </Row>
      <p>payout: ${payout}</p>
    </div>
  )
}

export function calculateBuyShares(
  dollarAmount: number,
  ammShares: number,
  ammUSD: number
) {
  return ammShares - (ammUSD * ammShares) / (ammUSD + dollarAmount)
}

export function calculateSellPayout(
  portion: number,
  ammShares: number,
  ammUSD: number
) {
  return ammUSD - (ammUSD * ammShares) / (ammShares + portion * TOTAL_SHARES)
}
