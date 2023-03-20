import { formatLargeNumber } from '@/utils/formatting'
import { Col } from './layout/col'

export function ValuationBox(props: { valuation: string | number }) {
  const { valuation } = props
  const valuation_string =
    typeof valuation == 'string' ? valuation : formatLargeNumber(valuation)
  return (
    <Col className="mx-1 rounded bg-gray-100 p-1 text-center">
      <div className={`text-sm text-gray-500`}>Valuation</div>
      <div className="text-md relative m-auto font-bold text-gray-500">
        ${valuation_string}
      </div>
    </Col>
  )
}
