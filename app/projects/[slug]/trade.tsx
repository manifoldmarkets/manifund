'use client'

import { Button, ColorType } from '@/components/button'
import { AmountInput } from '@/components/input'
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
  getTradeErrorMessage,
} from '@/utils/amm'
import { useRouter } from 'next/navigation'
import { SignInButton } from '@/components/sign-in-button'

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
  ammTxns?: Txn[]
  projectId: string
  userSpendableFunds: number
  userSellableShares: number
  signedIn?: boolean
}) {
  const {
    ammTxns,
    projectId,
    userSpendableFunds,
    userSellableShares,
    signedIn,
  } = props
  const usingAmm = !!ammTxns
  const [modeId, setModeId] = useState<BinaryModeId>(null)
  const [isLimitOrder, setIsLimitOrder] = useState(false)
  if (signedIn) {
    return (
      <>
        <Row className="mb-3 w-full justify-between gap-3 font-semibold">
          {usingAmm &&
            MODES.map((mode) => {
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
                    setModeId(
                      modeId === mode.id && !isLimitOrder ? null : mode.id
                    )
                    setIsLimitOrder(false)
                  }}
                >
                  {mode.label}
                </Button>
              )
            })}
          <Button
            color={isLimitOrder ? 'orange' : 'orange-outline'}
            className={clsx(usingAmm ? 'w-32' : 'w-full')}
            onClick={() => {
              setIsLimitOrder(!isLimitOrder)
              setModeId(null)
            }}
          >
            {usingAmm ? (
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
            ) : (
              'Make a trade offer'
            )}
          </Button>
        </Row>
        {(modeId !== null || isLimitOrder) && (
          <TradeInputsPanel
            modeId={modeId}
            setModeId={isLimitOrder ? setModeId : undefined}
            ammTxns={ammTxns}
            projectId={projectId}
            userSpendableFunds={userSpendableFunds}
            userSellableShares={userSellableShares}
          />
        )}
      </>
    )
  } else {
    return <SignInButton buttonText="Sign in to trade" />
  }
}

function TradeInputsPanel(props: {
  modeId: BinaryModeId
  setModeId?: (modeId: BinaryModeId) => void // Include only for limit orders
  ammTxns?: Txn[]
  projectId: string
  userSpendableFunds: number
  userSellableShares: number
}) {
  const {
    modeId,
    setModeId,
    ammTxns,
    projectId,
    userSpendableFunds,
    userSellableShares,
  } = props
  const usingAmm = !!ammTxns
  const [amount, setAmount] = useState<number>()
  const [limitValuation, setLimitValuation] = useState<number>()
  const [ammShares, ammUSD] = usingAmm
    ? calculateAMMPorfolio(ammTxns, projectId)
    : [0, 0]
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const mode = MODES.find((mode) => mode.id === modeId)
  const isLimitOrder = !!setModeId
  if (!isLimitOrder && !usingAmm) {
    return (
      <span className="text-center text-sm text-rose-600">
        Something went wrong.
      </span>
    )
  }
  const valuationAfterTrade = isLimitOrder
    ? limitValuation
    : calculateValuationAfterTrade(
        amount ?? 0,
        ammShares,
        ammUSD,
        modeId === 'buy'
      )
  const ammSharesAtTrade = isLimitOrder
    ? ammSharesAtValuation(ammUSD * ammShares, limitValuation ?? 0)
    : ammShares
  const ammUSDAtTrade = isLimitOrder
    ? (ammUSD * ammShares) / ammSharesAtTrade
    : ammUSD
  const percentEquity =
    modeId === 'buy'
      ? isLimitOrder
        ? (amount ?? 0) / (limitValuation ?? 1)
        : calculateBuyShares(amount ?? 0, ammSharesAtTrade, ammUSDAtTrade) /
          TOTAL_SHARES
      : (amount ?? 0) / TOTAL_SHARES
  const amountUSD =
    modeId === 'buy'
      ? amount
      : isLimitOrder
      ? ((amount ?? 0) / TOTAL_SHARES) * (limitValuation ?? 0)
      : calculateSellPayout(amount ?? 0, ammSharesAtTrade, ammUSDAtTrade)

  const handleSubmit = async () => {
    setSubmitting(true)
    await fetch('/api/trade-with-amm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: projectId,
        amount,
        buying: modeId === 'buy',
        valuation: isLimitOrder ? limitValuation : undefined,
      }),
    })
    setAmount(0)
    // TODO: Set modeId null so panel closes after submission
    setSubmitting(false)
    router.refresh()
  }

  const errorMessage = getTradeErrorMessage(
    modeId,
    ammShares,
    ammUSD,
    userSpendableFunds,
    userSellableShares,
    isLimitOrder,
    limitValuation,
    amountUSD,
    percentEquity
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
            <AmountInput
              className="w-24"
              onChangeAmount={setLimitValuation}
              amount={limitValuation}
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
              {formatMoneyPrecise(amountUSD ?? 0)}
            </span>
          </Col>
        )}
        {modeId && (!isLimitOrder || !!limitValuation) && (
          <Col>
            <label className="text-xs text-gray-600">
              Valuation after trade
            </label>
            <span className="font-semibold">
              {formatMoneyPrecise(valuationAfterTrade ?? 0)}
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
            amountUSD ?? 0,
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
  } for ${formatMoneyPrecise(amountUSD)} ${
    limitValuation ? `at ${formatMoneyPrecise(limitValuation)} valuation` : ''
  }`
}

function BuyPanelContent(props: {
  isLimitOrder: boolean
  userSpendableFunds: number
  amount: number | undefined
  setAmount: (amount: number | undefined) => void
}) {
  const { isLimitOrder, userSpendableFunds, amount, setAmount } = props
  if (userSpendableFunds <= 0) {
    return (
      <div className="text-center text-sm text-gray-600">
        You don&apos;t have any funds to buy with. Add funds to your account
        through your profile page.
      </div>
    )
  }
  const sliderMax = Math.min(userSpendableFunds, 100)
  return (
    <div>
      <label className="text-sm text-gray-600">Amount (USD)</label>
      <Row className="w-full items-center gap-4">
        <AmountInput
          amount={amount}
          className="w-1/3"
          onChangeAmount={setAmount}
        />
        <Slider
          amount={((amount ?? 0) / sliderMax) * 100}
          step={0.01}
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
  amount: number | undefined
  setAmount: (amount: number | undefined) => void
}) {
  const { isLimitOrder, userSellableShares, amount, setAmount } = props
  if (userSellableShares <= 0) {
    return (
      <div className="text-center text-sm text-gray-600">
        You don&apos;t have any shares to sell.
      </div>
    )
  }
  const sliderMax = userSellableShares
  return (
    <div>
      <label className="text-sm text-gray-600">Amount (% equity)</label>
      <Row className="w-full items-center gap-4">
        <AmountInput
          amount={((amount ?? 0) / TOTAL_SHARES) * 100}
          className="w-1/3"
          maxLength={4}
          onChangeAmount={(newAmount) =>
            setAmount((Number(newAmount) / 100) * TOTAL_SHARES)
          }
        />
        <Slider
          amount={((amount ?? 0) / sliderMax) * 100}
          step={0.01}
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
