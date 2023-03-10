import { Button } from '@/components/button'
import { Input } from '@/components/input'
import {
  PlusIcon,
  XCircleIcon,
  ArrowRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { sortBy, orderBy } from 'lodash'
import { formatLargeNumber, formatMoney } from '@/utils/formatting'
import { MutableBid, resolveBids } from '@/pages/api/close-bidding'
import { Bids } from '../[usernameSlug]/user-bids'

export function AuctionPlayground() {
  const INITIAL_BIDS = [
    {
      createdAt: 0,
      amount: 100,
      valuation: 1000,
      amountPaid: -1,
    },
    {
      createdAt: 1,
      amount: 500,
      valuation: 1200,
      amountPaid: -1,
    },
    {
      createdAt: 2,
      amount: 600,
      valuation: 1000,
      amountPaid: -1,
    },
    {
      createdAt: 3,
      amount: 100,
      valuation: 1500,
      amountPaid: -1,
    },
  ]

  const [minFunding, setMinFunding] = useState<number>(900)
  const [founderPortion, setFounderPortion] = useState<number | null>(0.1)
  const [playBids, setPlayBids] = useState<MutableBid[]>(INITIAL_BIDS)
  const [playBidsDisplay, setPlayBidsDisplay] = useState<JSX.Element[]>([])
  const [seeResults, setSeeResults] = useState<boolean>(false)
  const [resultsText, setResultsText] = useState<JSX.Element>(<></>)
  const [resolvedValuation, setResolvedValuation] = useState<number>(0)

  let minValuation = founderPortion
    ? Math.round(minFunding / (1 - founderPortion))
    : 0

  let errorMessage: string | null = null
  if (founderPortion === null || founderPortion < 0 || founderPortion >= 1) {
    errorMessage = 'Founder portion must be at least 0% and below 100%.'
  } else if (playBids.find((playBid) => playBid.valuation < minValuation)) {
    errorMessage = `All bids on this project must have a valuation of at least $${minValuation}.`
  } else if (!minFunding) {
    errorMessage = 'Please enter a minimum funding amount.'
  }

  useEffect(() => {
    setPlayBidsDisplay(
      playBids.map((playBid, index) => {
        return (
          <div key={index} className="flex justify-center gap-1">
            <XCircleIcon
              className="relative top-1 h-6 w-6 cursor-pointer text-rose-500"
              onClick={() => {
                setPlayBids(
                  playBids.filter(
                    (bid) => bid.createdAt !== playBids[index].createdAt
                  )
                )
                setSeeResults(false)
              }}
            />
            <label htmlFor="amount">Bid</label>
            <Input
              id="amount"
              className="relative bottom-2 w-24"
              value={playBid.amount || ''}
              onChange={(e: { target: { value: any } }) => {
                setPlayBids(
                  playBids.map((bid) => {
                    if (bid.createdAt === playBid.createdAt) {
                      return { ...playBid, amount: Number(e.target.value) }
                    }
                    return bid
                  })
                )
                setSeeResults(false)
              }}
            />
            <label htmlFor="valuation">@</label>
            <Input
              id="valuation"
              className="relative bottom-2 w-24"
              value={playBid.valuation || ''}
              onChange={(e: { target: { value: any } }) => {
                setPlayBids(
                  playBids.map((bid) => {
                    if (bid.createdAt === playBid.createdAt) {
                      return {
                        ...playBid,
                        valuation: Number(e.target.value),
                      }
                    }
                    return bid
                  })
                )
                setSeeResults(false)
              }}
            />
            valuation
            {seeResults && (
              <BidResult
                amountPaid={playBid.amountPaid}
                resolvedValuation={resolvedValuation}
              />
            )}
          </div>
        )
      })
    )
  }, [playBids, seeResults])

  return (
    <div className="relative flex flex-col gap-2 rounded-lg border border-gray-300 bg-white px-4 py-7 shadow-md">
      <ArrowPathIcon
        className="absolute top-4 right-5 h-6 w-6 text-gray-500 hover:cursor-pointer"
        onClick={() => {
          setPlayBids(INITIAL_BIDS)
          setFounderPortion(0.1)
          setMinFunding(900)
          setSeeResults(false)
        }}
      />
      <h3 className="mt-0 text-center">Auction Playground</h3>
      <p className="relative bottom-3 mt-0 text-center">
        Use this widget to play around with different auction scenarios and see
        what would happen!
      </p>
      <div className="flex justify-center gap-1">
        <label htmlFor="min_funding">Project Minimum Funding: $</label>
        <Input
          id="min_funding"
          value={minFunding || ''}
          type="number"
          className="relative bottom-2 w-24"
          onChange={(e: { target: { value: any } }) => {
            setMinFunding(Number(e.target.value))
            setSeeResults(false)
          }}
        />
      </div>
      <div className="flex justify-center gap-1">
        <label htmlFor="founder_portion">Equity held by founder: </label>
        <Input
          id="founder_portion"
          type="number"
          className=" relative bottom-2 w-24"
          value={founderPortion === null ? '' : founderPortion * 100}
          onChange={(e: { target: { value: any } }) => {
            setFounderPortion(
              e.target.value === '' ? null : Number(e.target.value) / 100
            )
            setSeeResults(false)
          }}
        />
        %
      </div>
      <p className="text-center">
        {formatMoney(minValuation)} minimum valuation
      </p>
      <hr className="mt-2 mb-5 h-0.5 rounded-sm bg-gray-500" />
      {playBidsDisplay}
      <div className="flex justify-center gap-1">
        <Button
          onClick={() => {
            setPlayBids([
              ...playBids,
              {
                createdAt: playBids[playBids.length - 1]
                  ? playBids[playBids.length - 1].createdAt + 2
                  : 0,
                amount: 0,
                valuation: minValuation,
                amountPaid: -1,
              },
            ])
            console.log(playBids)
            setSeeResults(false)
          }}
          size={'xs'}
          color={'gray-outline'}
          className="w-24 rounded-xl"
        >
          <PlusIcon className="h-5 w-5" />
          Add Bid
        </Button>
      </div>
      {errorMessage && (
        <p className="text-center text-rose-500">{errorMessage}</p>
      )}
      {!seeResults && (
        <div className="flex justify-center">
          <Button
            size={'lg'}
            className="mt-3 w-48"
            disabled={errorMessage ? true : false}
            onClick={() => {
              let results = resolvePlayBids(
                playBids,
                minFunding,
                founderPortion ?? 0
              )
              setPlayBids(results.bids)
              setResolvedValuation(results.resolvedValuation)
              setResultsText(
                <ResultsText
                  playBids={results.bids}
                  founderPortion={founderPortion ?? 0}
                  resolvedValuation={results.resolvedValuation}
                />
              )
              setSeeResults(true)
            }}
          >
            Resolve Bids
          </Button>
        </div>
      )}
      {seeResults && resultsText}
    </div>
  )
}

function resolvePlayBids(
  playBids: MutableBid[],
  minFunding: number,
  founderPortion: number
) {
  // Sort bids by valuation (keep $0 bids so they don't disappear from UI)
  const sortedBids = orderBy(playBids, 'valuation', 'desc')
  sortedBids.forEach((bid) => {
    if (!bid.amount) {
      bid.amount = 0
    }
    bid.amountPaid = -1
  })
  const resolution = resolveBids(sortedBids, minFunding, founderPortion)
  console.log('resolution', resolution)
  if (resolution.resolvedValuation === -1) {
    playBids.forEach((bid) => (bid.amountPaid = -1))
    return {
      bids: playBids,
      resolvedValuation: -1,
    }
  }
  return resolution
}

function BidResult(props: { amountPaid: number; resolvedValuation: number }) {
  const { amountPaid, resolvedValuation } = props
  if (amountPaid <= 0) {
    return (
      <div className="flex text-rose-500">
        <ArrowRightIcon className="relative top-1 mx-3 h-5 w-5" />
        Bid rejected
      </div>
    )
  }
  return (
    <div className="flex text-emerald-500">
      <ArrowRightIcon className="relative top-1 mx-3 h-5 w-5" />$
      {formatLargeNumber(amountPaid)} for{' '}
      {formatLargeNumber((amountPaid / resolvedValuation) * 100)}% ownership
    </div>
  )
}

function ResultsText(props: {
  playBids: MutableBid[]
  founderPortion: number
  resolvedValuation: number
}) {
  const { playBids, founderPortion, resolvedValuation } = props
  let totalFunding = playBids.reduce(
    (total, current) =>
      current.amountPaid > 0 ? total + current.amountPaid : total,
    0
  )
  let portionSold = totalFunding / resolvedValuation
  // accounting for floating point arithmetic errors
  if (portionSold + founderPortion >= 0.999999999999) {
    return (
      <div className="rounded-md  bg-emerald-100 p-3 text-center font-bold text-emerald-500 shadow-sm">
        Funding successful! All shares were sold at a valuation of{' '}
        {formatMoney(resolvedValuation)} and the project recieved $
        {formatLargeNumber(totalFunding)} in funding.
      </div>
    )
  } else if (totalFunding > 0) {
    return (
      <div className=" rounded-md  bg-emerald-100 p-3 text-center font-bold text-emerald-500 shadow-sm">
        Funding successful! The project recieved {formatMoney(totalFunding)} in
        funding. {formatLargeNumber(portionSold * 100)}% of shares were sold at
        a valuation of {formatMoney(resolvedValuation)}, the founder holds
        another {formatLargeNumber(founderPortion * 100)}%, and the remaining
        shares will be sold on the market.
      </div>
    )
  } else {
    return (
      <div className="rounded-md  bg-rose-100 p-3 text-center font-bold text-rose-500 shadow-sm">
        Funding unsuccessful. The project will not proceed :{'('}
      </div>
    )
  }
}
