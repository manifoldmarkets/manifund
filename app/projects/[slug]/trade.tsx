'use client'

import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { MySlider } from '@/components/slider'
import { TOTAL_SHARES } from '@/db/project'
import { Txn } from '@/db/txn'
import {
  formatMoney,
  formatMoneyPrecise,
  formatPercent,
  showPrecision,
} from '@/utils/formatting'
import clsx from 'clsx'
import { useState } from 'react'

type BinaryModeId = 'buy' | 'sell' | null
const MODES = [
  {
    label: 'Buy',
    id: 'buy' as BinaryModeId,
    buttonClass: '!bg-emerald-500 hover:!bg-emerald-600',
    buttonUnselectedClass:
      'ring-emerald-500 bg-white !text-emerald-500 ring-2 hover:!bg-emerald-500 hover:!text-white',
    cardClass: 'bg-emerald-50',
  },
  {
    label: 'Sell',
    id: 'sell' as BinaryModeId,
    buttonClass: 'bg-rose-500 hover:bg-rose-600',
    buttonUnselectedClass:
      'ring-rose-500 bg-white !text-rose-500 ring-2 hover:bg-rose-500 hover:!text-white',
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
  const [isLimitOrder, setIsLimitOrder] = useState(false)
  return (
    <div>
      <Row className="mb-3 w-full justify-between gap-3 font-semibold">
        {MODES.map((mode) => {
          return (
            <Button
              key={mode.id}
              className={clsx(
                'w-full',
                modeId === mode.id && !isLimitOrder
                  ? mode.buttonClass
                  : mode.buttonUnselectedClass
              )}
              onClick={() => {
                setModeId(modeId === mode.id && !isLimitOrder ? null : mode.id)
                setIsLimitOrder(false)
              }}
            >
              {mode.label}
            </Button>
          )
        })}
        <Button
          className={clsx(
            isLimitOrder
              ? 'bg-orange-500 !text-white hover:!bg-orange-600'
              : 'w-full bg-white !text-orange-500 ring-2 ring-orange-500 hover:bg-orange-500 hover:!text-white',
            '!w-32'
          )}
          onClick={() => {
            setIsLimitOrder(!isLimitOrder)
            setModeId(null)
          }}
        >
          #
        </Button>
      </Row>
      {(modeId !== null || isLimitOrder) && (
        <TradeInputsPanel
          modeId={modeId}
          setModeId={isLimitOrder ? setModeId : undefined}
          ammTxns={ammTxns}
          ammId={ammId}
          userSpendableFunds={userSpendableFunds}
          userSellableShares={userSellableShares}
        />
      )}
    </div>
  )
}

function TradeInputsPanel(props: {
  modeId: BinaryModeId
  setModeId?: (modeId: BinaryModeId) => void
  ammTxns: Txn[]
  ammId: string
  userSpendableFunds: number
  userSellableShares: number
}) {
  const {
    modeId,
    setModeId,
    ammTxns,
    ammId,
    userSpendableFunds,
    userSellableShares,
  } = props
  const [amount, setAmount] = useState(0)
  const [valuation, setValuation] = useState(0)
  const [ammShares, ammUSD] = calculateAMMPorfolio(ammTxns, ammId)
  const [submitting, setSubmitting] = useState(false)
  const mode = MODES.find((mode) => mode.id === modeId)
  const isLimitOrder = !!setModeId
  const valuationAfterTrade = calculateValuationAfterTrade(
    amount,
    ammShares,
    ammUSD,
    modeId === 'buy',
    isLimitOrder ? valuation : undefined
  )
  const ammSharesAtTrade = isLimitOrder
    ? ammSharesAtValuation(ammUSD * ammShares, valuation)
    : ammShares
  const ammUSDAtTrade = isLimitOrder
    ? (ammUSD * ammShares) / ammSharesAtTrade
    : ammUSD
  const percentEquity =
    modeId === 'buy'
      ? (calculateBuyShares(amount, ammSharesAtTrade, ammUSDAtTrade) /
          TOTAL_SHARES) *
        100
      : (amount / TOTAL_SHARES) * 100
  const amountUSD =
    modeId === 'buy'
      ? amount
      : calculateSellPayout(amount, ammSharesAtTrade, ammUSDAtTrade)
  return (
    <div
      className={clsx(
        'flex flex-col gap-4 rounded-md p-4',
        isLimitOrder ? 'bg-orange-50' : mode?.cardClass
      )}
    >
      <p>valuation: ${(ammUSD / ammShares) * TOTAL_SHARES}</p>
      {isLimitOrder && (
        <div className="flex flex-col justify-between gap-3 sm:flex-row">
          <Row className="items-center gap-2">
            <label className="text-sm text-gray-600">Valuation (USD):</label>
            <Input
              type="number"
              className="w-24"
              onChange={(event) => setValuation(Number(event.target.value))}
            />
          </Row>
          <Row className="items-center gap-2">
            <label className="text-sm text-gray-600">Mode:</label>
            {MODES.map((mode) => {
              return (
                <Button
                  key={mode.id}
                  className={clsx(
                    'w-24 font-semibold',
                    modeId === mode.id
                      ? mode.buttonClass
                      : mode.buttonUnselectedClass
                  )}
                  onClick={() => {
                    setModeId(modeId === mode.id ? null : mode.id)
                  }}
                >
                  {mode.label}
                </Button>
              )
            })}
          </Row>
        </div>
      )}
      {modeId === 'buy' && (
        <BuyPanelContent
          isLimitOrder={isLimitOrder}
          userSpendableFunds={userSpendableFunds}
          amount={amount}
          setAmount={setAmount}
        />
      )}
      {modeId === 'sell' && (
        <SellPanelContent
          isLimitOrder={isLimitOrder}
          userSellableShares={userSellableShares}
          amount={amount}
          setAmount={setAmount}
        />
      )}
      <Row className="m-auto justify-between gap-32">
        {modeId === 'buy' && (!isLimitOrder || !!valuation) && (
          <Col>
            <label className="text-xs text-gray-600">Equity</label>
            <span className="font-semibold">
              {(
                (calculateBuyShares(amount, ammSharesAtTrade, ammUSDAtTrade) /
                  TOTAL_SHARES) *
                100
              ).toFixed(2)}
              %
            </span>
          </Col>
        )}
        {modeId === 'sell' && (!isLimitOrder || !!valuation) && (
          <Col>
            <label className="text-xs text-gray-600">Payout</label>
            <span className="font-semibold">
              {formatMoneyPrecise(
                calculateSellPayout(amount, ammSharesAtTrade, ammUSDAtTrade)
              )}
            </span>
          </Col>
        )}
        {modeId && (!isLimitOrder || !!valuation) && (
          <Col>
            <label className="text-xs text-gray-600">
              Valuation after trade
            </label>
            <span className="font-semibold">
              {formatMoneyPrecise(valuationAfterTrade)}
            </span>
          </Col>
        )}
      </Row>
      <Button
        className={clsx(
          isLimitOrder ? '' : mode?.buttonClass,
          'w-full font-semibold'
        )}
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
              amount,
              buying: modeId === 'buy',
              valuation: isLimitOrder ? valuation : undefined,
            }),
          })
          setAmount(0)
          setSubmitting(false)
        }}
      >
        {mode?.label} {isLimitOrder ? 'limit order' : ''}:{' '}
        {isNaN(percentEquity) ? '0%' : formatPercent(percentEquity)} for{' '}
        {formatMoneyPrecise(amountUSD)}{' '}
        {isLimitOrder ? `at ${formatMoneyPrecise(valuation)} valuation` : ''}
      </Button>
    </div>
  )
}

function BuyPanelContent(props: {
  isLimitOrder: boolean
  userSpendableFunds: number
  amount: number
  setAmount: (amount: number) => void
}) {
  const { isLimitOrder, userSpendableFunds, amount, setAmount } = props
  const sliderMax = Math.min(userSpendableFunds, 100)
  return (
    <div>
      <label className="text-sm text-gray-600">Amount (USD)</label>
      <Row className="w-full items-center gap-4">
        <Input
          value={amount}
          type="number"
          className="w-1/3"
          onChange={(event) => setAmount(Number(event.target.value))}
        />
        <MySlider
          value={(amount / sliderMax) * 100}
          className={
            isLimitOrder
              ? ''
              : '[&>.rc-slider-handle]:!bg-emerald-500 [&>.rc-slider-track]:!bg-emerald-500'
          }
          marks={{
            0: {
              label: '$0',
            },
            25: {
              label: formatMoney(sliderMax / 4),
            },
            50: {
              label: formatMoney(sliderMax / 2),
            },
            75: {
              label: formatMoney((sliderMax / 4) * 3),
            },
            100: {
              label: formatMoney(sliderMax),
            },
          }}
          onChange={(value) => {
            setAmount(((value as number) * sliderMax) / 100)
          }}
        />
      </Row>
    </div>
  )
}

function SellPanelContent(props: {
  isLimitOrder: boolean
  userSellableShares: number
  amount: number
  setAmount: (amount: number) => void
}) {
  const { isLimitOrder, userSellableShares, amount, setAmount } = props
  const sliderMax = userSellableShares
  return (
    <div>
      <label className="text-sm text-gray-600">Amount (% equity)</label>
      <Row className="w-full items-center gap-4">
        <Input
          value={(amount / TOTAL_SHARES) * 100}
          type="number"
          className="w-1/3"
          onChange={(event) =>
            setAmount((Number(event.target.value) / 100) * TOTAL_SHARES)
          }
        />
        <MySlider
          value={(amount / sliderMax) * 100}
          className={
            isLimitOrder
              ? ''
              : '[&>.rc-slider-handle]:bg-rose-500 [&>.rc-slider-track]:bg-rose-500'
          }
          marks={{
            0: {
              label: '0%',
            },
            25: {
              label: `${formatPercent(sliderMax / 4 / TOTAL_SHARES)}`,
            },
            50: {
              label: `${formatPercent(sliderMax / 2 / TOTAL_SHARES)}`,
            },
            75: {
              label: `${formatPercent(((sliderMax / 4) * 3) / TOTAL_SHARES)}`,
            },
            100: {
              label: `${formatPercent(sliderMax / TOTAL_SHARES)}`,
            },
          }}
          onChange={(value) => {
            setAmount(((value as number) * sliderMax) / 100)
          }}
        />
      </Row>
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

export function calculateBuyShares(
  dollarAmount: number,
  ammShares: number,
  ammUSD: number
) {
  const uniswapProduct = ammUSD * ammShares
  return ammShares - uniswapProduct / (ammUSD + dollarAmount)
}

export function calculateSellPayout(
  shares: number,
  ammShares: number,
  ammUSD: number
) {
  const uniswapProduct = ammUSD * ammShares
  return ammUSD - uniswapProduct / (ammShares + shares)
}

export function ammSharesAtValuation(
  uniswapProduct: number,
  valuationAtTrade: number
) {
  return Math.sqrt((uniswapProduct / valuationAtTrade) * TOTAL_SHARES)
}

function calculateValuationAfterTrade(
  amount: number, // USD if buying, shares if selling
  ammShares: number,
  ammUSD: number,
  isBuying: boolean,
  valuationAtTrade?: number // If limit order
) {
  const uniswapProduct = ammUSD * ammShares
  const ammSharesAtTrade = valuationAtTrade
    ? ammSharesAtValuation(uniswapProduct, valuationAtTrade)
    : ammShares
  console.log('AMM shares at trade', ammSharesAtTrade)
  const ammUSDAtTrade = valuationAtTrade
    ? uniswapProduct / ammSharesAtTrade
    : ammUSD
  console.log('AMM usd at trade', ammUSDAtTrade)
  const sharesInTrade = isBuying
    ? calculateBuyShares(amount, ammSharesAtTrade, ammUSDAtTrade)
    : amount
  const usdInTrade = isBuying
    ? amount
    : calculateSellPayout(amount, ammSharesAtTrade, ammUSDAtTrade)
  console.log('Shares in trade', sharesInTrade)
  console.log('usd in trade', usdInTrade)
  const ammUSDAfterTrade = isBuying
    ? ammUSDAtTrade + usdInTrade
    : ammUSDAtTrade - usdInTrade
  console.log('AMM usd after trade', ammUSDAfterTrade)
  const ammSharesAfterTrade = isBuying
    ? ammSharesAtTrade - sharesInTrade
    : ammSharesAtTrade + sharesInTrade
  console.log('AMM shares after trade', ammSharesAfterTrade)
  return (ammUSDAfterTrade / ammSharesAfterTrade) * TOTAL_SHARES
}
