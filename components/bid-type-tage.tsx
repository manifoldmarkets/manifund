export function BidTypeTag(props: { bid_type: string }) {
  const { bid_type } = props
  switch (bid_type) {
    case 'ipo':
      return (
        <p className="inline-flex rounded-full bg-amber-100 px-2 text-xs font-semibold leading-5 text-amber-800">
          IPO Bid
        </p>
      )
    case 'buy':
      return (
        <p className="inline-flex rounded-full bg-emerald-100 px-2 text-xs font-semibold leading-5 text-emerald-800">
          Buy
        </p>
      )
    case 'sell':
      return (
        <p className="inline-flex rounded-full bg-rose-100 px-2 text-xs font-semibold leading-5 text-rose-800">
          Sell
        </p>
      )
  }
}
