import { Col } from '@/components/layout/col'
import { format } from 'date-fns'

export function SignatureDisplay(props: {
  signatoryTitle: string
  fullName: string
  signedAt?: Date
}) {
  const { signatoryTitle, fullName, signedAt } = props
  return (
    <div className="flex flex-col gap-5 md:flex-row md:justify-between">
      <Col className="gap-2">
        <span className="font-medium">{signatoryTitle} full name</span>
        <span className="h-6 w-52 border-b border-black">
          {signedAt ? fullName : ''}
        </span>
      </Col>
      <Col className="gap-2">
        <span className="font-medium">{signatoryTitle} signature</span>
        <span className="h-6 w-52 border-b border-black font-satisfy">
          {signedAt ? fullName : ''}
        </span>
      </Col>
      <Col className="justify-between gap-2">
        <span className="font-medium">Date</span>
        <span className="h-6 w-52 border-b border-black">
          {signedAt ? format(signedAt, 'MMMM do, yyyy') : ''}
        </span>
      </Col>
    </div>
  )
}
