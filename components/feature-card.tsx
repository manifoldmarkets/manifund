import { ArrowRightIcon } from '@heroicons/react/20/solid'
import { Col } from './layout/col'
import { Row } from './layout/row'

export function FeatureCard(props: {
  icon: JSX.Element
  title: string
  description: string
  url: string
}) {
  const { icon, title, description, url } = props
  return (
    <Col className="justify-between rounded-lg border-2 border-orange-500 bg-white p-3">
      <div>
        <Row className="mb-1 gap-1 text-orange-500">
          {icon}
          <p className="text-lg font-medium">{title}</p>
        </Row>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <ArrowLink url={url} />
    </Col>
  )
}

export function ArrowLink(props: { url: string }) {
  const { url } = props
  return (
    <a
      href={url}
      className="flex w-full justify-end text-xs text-orange-500 hover:underline"
    >
      Learn more
      <ArrowRightIcon className="ml-1 h-4 w-4" />
    </a>
  )
}
