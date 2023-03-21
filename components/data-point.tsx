import { Col } from './layout/col'

export function DataPoint(props: { value: string; label: string }) {
  const { value, label } = props
  return (
    <Col>
      <span className="text-xl font-bold text-orange-500">{value}</span>
      <span className="text-sm text-gray-500">{label}</span>
    </Col>
  )
}
