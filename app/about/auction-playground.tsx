import { Button } from '@/components/button'
import { Input } from '@/components/input'
import {
  PlusIcon,
  XCircleIcon,
  ArrowRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

type playBid = {
  index: number
  amount: number
  valuation: number
  resolution: number
}

export function AuctionPlayground() {
  const [minFunding, setMinFunding] = useState<number>(1000)
  const [founderPortion, setFounderPortion] = useState<number>(0)
  const [playBids, setPlayBids] = useState<playBid[]>([])
  const [playBidsDisplay, setPlayBidsDisplay] = useState<JSX.Element[]>([])
  const [seeResults, setSeeResults] = useState<boolean>(false)
  const [resultsText, setResultsText] = useState<JSX.Element>(<></>)
  const [minValuation, setMinValuation] = useState<number>(minFunding)

  useEffect(() => {
    setMinValuation(
      Math.round((minFunding / (1 - founderPortion / 100)) * 100) / 100
    )
  }, [minFunding, founderPortion])

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
            {seeResults && <BidResult portionPaid={playBid.resolution * 100} />}
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
          value={founderPortion || ''}
          onChange={(e: { target: { value: any } }) => {
            setFounderPortion(Number(e.target.value))
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
                resolution: -1,
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
              let bidResults = resolveBids(playBids, minFunding, founderPortion)
              setPlayBids(bidResults.bids)
              setResultsText(
                <ResultsText
                  valuation={bidResults.valuation}
                  total_funding={bidResults.total_funding}
                  founder_portion={founderPortion / 100}
                  funded={bidResults.funded}
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
  founderPortion: number
) {
  let i = 0
  let total_funding = 0
  playBids.sort((a, b) => a.valuation - b.valuation)
  playBids.forEach((playBid) => {
    if (!playBid.amount) {
      playBid.amount = 0
    }
  })
  while (i < playBids.length) {
    let valuation = playBids[i].valuation
    total_funding += playBids[i].amount
    let dollars_missing = (1 - founderPortion) * valuation - total_funding
    if (dollars_missing <= 0) {
      playBids.forEach((playBid, index) => {
        if (index < i) {
          playBid.resolution = 1
        } else if (index == i) {
          playBid.resolution =
            (playBids[i].amount + dollars_missing) / playBids[i].amount
        } else {
          playBid.resolution = 0
        }
      })
      playBids.sort((a, b) => a.index - b.index)
      return {
        bids: playBids,
        valuation: valuation,
        total_funding: valuation * (1 - founderPortion),
        funded: true,
      }
    } else if (i == playBids.length - 1 && total_funding >= minFunding) {
      playBids.forEach((playBid) => {
        playBid.resolution = 1
      })
      playBids.sort((a, b) => a.index - b.index)
      return {
        bids: playBids,
        valuation: valuation,
        total_funding: total_funding,
        funded: true,
      }
    }
    i++
  }
  playBids.forEach((playBid) => {
    playBid.resolution = 0
  })
  playBids.sort((a, b) => a.index - b.index)
  return { bids: playBids, valuation: 0, total_funding: 0, funded: false }
}

function BidResult(props: { portionPaid: number }) {
  const { portionPaid } = props
  let color =
    portionPaid == 0
      ? 'text-rose-500'
      : portionPaid == 1
      ? 'text-emerald-500'
      : 'text-amber-500'
  return (
    <div className={`flex font-bold ${color}`}>
      <ArrowRightIcon className="relative top-1 mx-3 h-5 w-5" />
      {portionPaid * 100}% paid
    </div>
  )
}

function ResultsText(props: {
  valuation: number
  total_funding: number
  founder_portion: number
  funded: boolean
}) {
  const { valuation, total_funding, founder_portion, funded } = props
  if (funded && total_funding == valuation * (1 - founder_portion)) {
    return (
      <div className="rounded-md  bg-emerald-100 p-3 text-center font-bold text-emerald-500 shadow-sm">
        Funding successful! All shares were sold. Valuation: ${valuation} Total
        Funding: ${total_funding}
      </div>
    )
  } else if (funded) {
    return (
      <div className=" rounded-md  bg-emerald-100 p-3 text-center font-bold text-emerald-500 shadow-sm">
        Funding successful!{' '}
        {((valuation * (1 - founder_portion) - total_funding) * 100) /
          valuation}
        % of the equity remains unbought and will be put on the market.
        Valuation: ${valuation} Total Funding: ${total_funding}
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
