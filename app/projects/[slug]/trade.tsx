'use client'

import { Button, ColorType } from '@/components/button'
import { Input } from '@/components/input'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { Slider } from '@/components/slider'
import { TOTAL_SHARES } from '@/db/project'
import { Txn } from '@/db/txn'
import {
  formatMoney,
  formatMoneyPrecise,
  formatPercent,
} from '@/utils/formatting'
import clsx from 'clsx'
import { useState } from 'react'
import { Tooltip } from '@/components/tooltip'
import { AdjustmentsHorizontalIcon } from '@heroicons/react/20/solid'
import {
  ammSharesAtValuation,
  BinaryModeId,
  calculateAMMPorfolio,
  calculateBuyShares,
  calculateSellPayout,
  calculateValuationAfterTrade,
  checkTradeValidity,
} from '@/utils/amm'

const MODES = [
  {
    label: 'Buy',
    id: 'buy' as BinaryModeId,
    buttonColor: 'emerald',
    cardClass: 'bg-emerald-50',
  },
  {
    label: 'Sell',
    id: 'sell' as BinaryModeId,
    buttonColor: 'rose',
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
              color={
                (modeId === mode.id && !isLimitOrder
                  ? mode.buttonColor
                  : `${mode.buttonColor}-outline`) as ColorType
              }
              className="w-full"
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
          color={isLimitOrder ? 'orange' : 'orange-outline'}
          className="w-32"
          onClick={() => {
            setIsLimitOrder(!isLimitOrder)
            setModeId(null)
          }}
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5" />
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
  const [limitValuation, setLimitValuation] = useState(0)
  const [ammShares, ammUSD] = calculateAMMPorfolio(ammTxns, ammId)
  const [submitting, setSubmitting] = useState(false)

  const mode = MODES.find((mode) => mode.id === modeId)
  const isLimitOrder = !!setModeId
  const valuationAfterTrade = calculateValuationAfterTrade(
    amount,
    ammShares,
    ammUSD,
    modeId === 'buy',
    isLimitOrder ? limitValuation : undefined
  )
  const ammSharesAtTrade = isLimitOrder
    ? ammSharesAtValuation(ammUSD * ammShares, limitValuation)
    : ammShares
  const ammUSDAtTrade = isLimitOrder
    ? (ammUSD * ammShares) / ammSharesAtTrade
    : ammUSD
  const percentEquity =
    modeId === 'buy'
      ? calculateBuyShares(amount, ammSharesAtTrade, ammUSDAtTrade) /
        TOTAL_SHARES
      : amount / TOTAL_SHARES
  const amountUSD =
    modeId === 'buy'
      ? amount
      : calculateSellPayout(amount, ammSharesAtTrade, ammUSDAtTrade)

  const handleSubmit = async () => {
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
        valuation: isLimitOrder ? limitValuation : undefined,
      }),
    })
    setAmount(0)
    setSubmitting(false)
  }

  const errorMessage = checkTradeValidity(
    amountUSD,
    percentEquity,
    modeId,
    ammShares,
    ammUSD,
    userSpendableFunds,
    userSellableShares,
    isLimitOrder,
    limitValuation
  )
  return (
    <div
      className={clsx(
        'flex flex-col gap-4 rounded-md p-4',
        isLimitOrder ? 'bg-orange-50' : mode?.cardClass
      )}
    >
      {isLimitOrder && (
        <div className="flex flex-col justify-between gap-3 sm:flex-row">
          <Row className="items-center gap-2">
            <label className="text-sm text-gray-600">Valuation (USD):</label>
            <Input
              type="number"
              className="w-24"
              onChange={(event) =>
                setLimitValuation(Number(event.target.value))
              }
            />
          </Row>
          <Row className="items-center gap-2">
            <label className="text-sm text-gray-600">Mode:</label>
            {MODES.map((mode) => {
              return (
                <Button
                  key={mode.id}
                  color={
                    (modeId === mode.id
                      ? mode.buttonColor
                      : `${mode.buttonColor}-outline`) as ColorType
                  }
                  className="w-24 font-semibold"
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
        {modeId === 'buy' && (!isLimitOrder || !!limitValuation) && (
          <Col>
            <label className="text-xs text-gray-600">Equity</label>
            <span className="font-semibold">
              {formatPercent(percentEquity)}
            </span>
          </Col>
        )}
        {modeId === 'sell' && (!isLimitOrder || !!limitValuation) && (
          <Col>
            <label className="text-xs text-gray-600">Payout</label>
            <span className="font-semibold">
              {formatMoneyPrecise(amountUSD)}
            </span>
          </Col>
        )}
        {modeId && (!isLimitOrder || !!limitValuation) && (
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
      <Tooltip text={errorMessage}>
        <Button
          color={isLimitOrder ? 'orange' : (mode?.buttonColor as ColorType)}
          className="w-full font-semibold"
          disabled={!!errorMessage}
          loading={submitting}
          onClick={handleSubmit}
        >
          {submitTradeButtonText(
            amountUSD,
            percentEquity,
            isLimitOrder,
            mode?.label,
            isLimitOrder ? limitValuation : undefined
          )}
        </Button>
      </Tooltip>
    </div>
  )
}

const submitTradeButtonText = (
  amountUSD: number,
  percentEquity: number,
  isLimitOrder: boolean,
  modeLabel?: string,
  limitValuation?: number
) => {
  return `${modeLabel ?? ''} ${isLimitOrder ? 'limit order' : ''}: ${
    isNaN(percentEquity) ? '0%' : formatPercent(percentEquity)
  } for ${isNaN(amountUSD) ? '$0' : formatMoneyPrecise(amountUSD)} ${
    limitValuation ? `at ${formatMoneyPrecise(limitValuation)} valuation` : ''
  }`
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
        <Slider
          amount={(amount / sliderMax) * 100}
          rangeColor={isLimitOrder ? 'orange' : 'emerald'}
          marks={[
            { value: 0, label: '$0' },
            { value: 25, label: formatMoney(sliderMax / 4) },
            { value: 50, label: formatMoney(sliderMax / 2) },
            { value: 75, label: formatMoney((sliderMax / 4) * 3) },
            { value: 100, label: formatMoney(sliderMax) },
          ]}
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
        <Slider
          amount={(amount / sliderMax) * 100}
          rangeColor={isLimitOrder ? 'orange' : 'rose'}
          marks={[
            { value: 0, label: '0%' },
            {
              value: 25,
              label: `${formatPercent(sliderMax / 4 / TOTAL_SHARES)}`,
            },
            {
              value: 50,
              label: `${formatPercent(sliderMax / 2 / TOTAL_SHARES)}`,
            },
            {
              value: 75,
              label: `${formatPercent(((sliderMax / 4) * 3) / TOTAL_SHARES)}`,
            },
            { value: 100, label: `${formatPercent(sliderMax / TOTAL_SHARES)}` },
          ]}
          onChange={(value) => {
            setAmount(((value as number) * sliderMax) / 100)
          }}
        />
      </Row>
    </div>
  )
}
