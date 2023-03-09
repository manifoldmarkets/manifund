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
import { formatLargeNumber } from '@/utils/formatting'

type playBid = {
  index: number
  amount: number
  valuation: number
  resolvedValuation: number
  amountPaid: number
}

export function AuctionPlayground() {
  const [minFunding, setMinFunding] = useState<number>(1000)
  const [founderPortion, setFounderPortion] = useState<number>(0)
  const [playBids, setPlayBids] = useState<playBid[]>([])
  const [playBidsDisplay, setPlayBidsDisplay] = useState<JSX.Element[]>([])
  const [seeResults, setSeeResults] = useState<boolean>(false)
  const [resultsText, setResultsText] = useState<JSX.Element>(<></>)

  let minValuation = Math.round(minFunding / (1 - founderPortion))

  let errorMessage: string | null = null
  if (playBids.find((playBid) => playBid.valuation < minValuation)) {
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
                setPlayBids(playBids.filter((bid) => bid.index != index))
                setSeeResults(false)
              }}
            />
            <label htmlFor="amount">Bid $</label>
            <Input
              id="amount"
              className="relative bottom-2 w-24"
              value={playBid.amount || ''}
              onChange={(e: { target: { value: any } }) => {
                setPlayBids(
                  playBids.map((playBid, i) => {
                    if (i === index) {
                      return { ...playBid, amount: Number(e.target.value) }
                    }
                    return playBid
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
                  playBids.map((playBid, i) => {
                    if (i === index) {
                      return { ...playBid, valuation: Number(e.target.value) }
                    }
                    return playBid
                  })
                )
                setSeeResults(false)
              }}
            />
            valuation
            {seeResults && (
              <BidResult
                amountPaid={playBid.amountPaid}
                resolvedValuation={playBid.resolvedValuation}
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
          setPlayBids([])
          setFounderPortion(0)
          setMinFunding(1000)
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
          value={founderPortion * 100 || ''}
          onChange={(e: { target: { value: any } }) => {
            setFounderPortion(Number(e.target.value) / 100)
            setSeeResults(false)
          }}
        />
        %
      </div>
      <hr className="mt-2 mb-5 h-0.5 rounded-sm bg-gray-500" />
      {playBidsDisplay}
      <div className="flex justify-center gap-1">
        <Button
          onClick={() => {
            setPlayBids([
              ...playBids,
              {
                index: playBids.length,
                amount: 0,
                valuation: minValuation,
                resolvedValuation: -1,
                amountPaid: -1,
              },
            ])
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
            onClick={() => {
              setPlayBids(
                resolveBids(playBids, minFunding, minValuation, founderPortion)
              )
              console.log('just resolved', playBids)
              setResultsText(
                <ResultsText
                  playBids={playBids}
                  founderPortion={founderPortion}
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

function resolveBids(
  playBids: playBid[],
  minFunding: number,
  minValuation: number,
  founderPortion: number
) {
  let i = 0
  let totalFunding = 0
  let unsoldPortion = 1 - founderPortion
  const sortedBids = orderBy(playBids, 'valuation', 'desc')
  sortedBids.forEach((bid) => {
    if (!bid.amount) {
      bid.amount = 0
    }
  })
  while (i < sortedBids.length) {
    sortedBids[i].resolvedValuation = minValuation
    if (i + 1 < sortedBids.length) {
      sortedBids[i].resolvedValuation = sortedBids[i + 1].valuation
    }
    totalFunding += sortedBids[i].amount
    unsoldPortion -= sortedBids[i].amount / sortedBids[i].resolvedValuation
    if (unsoldPortion <= 0) {
      sortedBids[i].amountPaid =
        sortedBids[i].amount + unsoldPortion * sortedBids[i].resolvedValuation
      console.log('re-unsorted bids', sortBy(sortedBids, 'index'))
      return sortBy(sortedBids, 'index')
    } else if (totalFunding >= minFunding && i + 1 == sortedBids.length) {
      console.log('accidentally hit success condiiton')
      sortedBids[i].amountPaid = sortedBids[i].amount
      return sortBy(sortedBids, 'index')
    } else {
      sortedBids[i].amountPaid = sortedBids[i].amount
    }
    i++
  }
  playBids.forEach((bid) => {
    bid.amountPaid = -1
    bid.resolvedValuation = -1
  })
  return playBids
}

function BidResult(props: { amountPaid: number; resolvedValuation: number }) {
  const { amountPaid, resolvedValuation } = props
  if (amountPaid === -1 || resolvedValuation === -1) {
    return (
      <div className="flex text-rose-500">
        <ArrowRightIcon className="relative top-1 mx-3 h-5 w-5" />
        Bid rejected
      </div>
    )
  }
  return (
    <div className="flex text-emerald-500">
      <ArrowRightIcon className="relative top-1 mx-3 h-5 w-5" />
      paid ${formatLargeNumber(amountPaid)} @ $
      {formatLargeNumber(resolvedValuation)} for{' '}
      {formatLargeNumber((amountPaid / resolvedValuation) * 100, 3)}% ownership
    </div>
  )
}

function ResultsText(props: { playBids: playBid[]; founderPortion: number }) {
  const { playBids, founderPortion } = props
  let totalFunding = playBids.reduce(
    (total, current) =>
      current.amountPaid > 0 ? total + current.amountPaid : total,
    0
  )
  let portionSold = playBids.reduce(
    (total, current) =>
      current.amountPaid > 0
        ? total + current.amountPaid / current.resolvedValuation
        : total,
    0
  )
  console.log(founderPortion + portionSold)
  // accounting for floating point arithmetic imprecision
  if (portionSold + founderPortion >= 0.999999999999) {
    return (
      <div className="rounded-md  bg-emerald-100 p-3 text-center font-bold text-emerald-500 shadow-sm">
        Funding successful! All shares were sold, and the project recieved $
        {formatLargeNumber(totalFunding)} in funding.
      </div>
    )
  } else if (totalFunding > 0) {
    return (
      <div className=" rounded-md  bg-emerald-100 p-3 text-center font-bold text-emerald-500 shadow-sm">
        Funding successful! {formatLargeNumber(portionSold * 100)}% of shares
        were sold, the founder holds another{' '}
        {formatLargeNumber(founderPortion * 100)}%, and the project recieved $
        {formatLargeNumber(totalFunding)} in funding. The remaining shares will
        be sold on the market.
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
