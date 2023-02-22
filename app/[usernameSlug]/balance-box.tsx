import { CurrencyDollarIcon } from '@heroicons/react/24/solid'

export function BalanceBox(props: { balance: number }) {
  const { balance } = props
  return (
    <div className="flex flex-col rounded bg-emerald-100 py-2 px-3 text-center">
      <div className="text-md text-emerald-500">Balance</div>
      <div className=" flex text-2xl font-bold text-emerald-500">
        <CurrencyDollarIcon className="h-8 w-8" />
        <p>{balance}</p>
      </div>
    </div>
  )
}
