import { TOTAL_SHARES } from '@/db/project'
import { Txn } from '@/db/txn'
import { formatMoneyPrecise } from './formatting'

export type BinaryModeId = 'buy' | 'sell' | null

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

export function calculateValuationAfterTrade(
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
  const ammUSDAtTrade = valuationAtTrade
    ? uniswapProduct / ammSharesAtTrade
    : ammUSD
  const sharesInTrade = isBuying
    ? calculateBuyShares(amount, ammSharesAtTrade, ammUSDAtTrade)
    : amount
  const usdInTrade = isBuying
    ? amount
    : calculateSellPayout(amount, ammSharesAtTrade, ammUSDAtTrade)
  const ammUSDAfterTrade = isBuying
    ? ammUSDAtTrade + usdInTrade
    : ammUSDAtTrade - usdInTrade
  const ammSharesAfterTrade = isBuying
    ? ammSharesAtTrade - sharesInTrade
    : ammSharesAtTrade + sharesInTrade
  return calculateValuation(ammSharesAfterTrade, ammUSDAfterTrade)
}

export function calculateValuation(ammShares: number, ammUSD: number) {
  return (ammUSD / ammShares) * TOTAL_SHARES
}

export function calculateMinimumValuation(ammShares: number, ammUSD: number) {
  return (ammUSD * ammShares) / TOTAL_SHARES
}

export const checkTradeValidity = (
  amountUSD: number,
  percentEquity: number,
  modeId: BinaryModeId,
  ammShares: number,
  ammUSD: number,
  userSpendableFunds: number,
  userSellableShares: number,
  isLimitOrder: boolean,
  limitValuation?: number
) => {
  const minValuation = calculateMinimumValuation(ammShares, ammUSD)
  const currentValuation = calculateValuation(ammShares, ammUSD)
  if (isLimitOrder) {
    if (!limitValuation) {
      return 'Please enter a valuation'
    } else if (modeId === 'buy' && limitValuation > minValuation) {
      return `Valuation must be greater than ${formatMoneyPrecise(
        minValuation
      )}`
    } else if (modeId === 'sell' && limitValuation < currentValuation) {
      return 'For sell limit orders, valuation must be greater than current valuation'
    } else if (limitValuation < minValuation) {
      return `Valuation must be greater than ${formatMoneyPrecise(
        minValuation
      )}`
    }
  } else if (amountUSD === 0 || percentEquity === 0) {
    return 'Please enter an amount'
  } else if (modeId === 'buy' && amountUSD > userSpendableFunds) {
    return 'Insufficient funds'
  } else if (
    modeId === 'sell' &&
    percentEquity * TOTAL_SHARES > userSellableShares
  ) {
    return 'Insufficient shares'
  } else {
    return undefined
  }
}
