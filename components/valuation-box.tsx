import { formatLargeNumber } from '@/db/project'

export function ValuationBox(props: { valuation: string | number }) {
  const { valuation } = props
  const valuation_string =
    typeof valuation == 'string' ? valuation : formatLargeNumber(valuation)
  return (
    <div
      className={`flex flex-col rounded bg-gray-100 px-1 pt-1 pb-0 text-center`}
    >
      <div className={`text-sm text-gray-500`}>Valuation</div>
      <div
        className={`text-md relative bottom-1 m-auto font-bold text-gray-500`}
      >
        ${valuation_string}
      </div>
    </div>
  )
}
