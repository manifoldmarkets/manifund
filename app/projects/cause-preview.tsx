import { FullCause } from '@/db/cause'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import Image from 'next/image'
import Link from 'next/link'

export function CausePreview(props: { cause: FullCause }) {
  const { cause } = props
  const visibleProjects = cause.projects.filter(
    (project) => project.stage !== 'hidden' && project.stage !== 'draft'
  )
  const numGrants = visibleProjects.filter(
    (project) => project.type === 'grant'
  ).length
  const numCerts = visibleProjects.filter(
    (project) => project.type === 'cert'
  ).length

  return (
    <Link
      className="relative flex flex-col gap-4 rounded-lg bg-white p-4 shadow-md sm:flex-row"
      href={`/causes/${cause.slug}?tab=${
        numCerts > numGrants ? 'certs' : 'grants'
      }`}
    >
      <Image
        src={cause.header_image_url}
        width={240}
        height={120}
        className="relative aspect-[3/1] w-full flex-shrink-0 rounded bg-white object-cover sm:aspect-[5/3] sm:w-60"
        alt="round header image"
      />
      <Col className="w-full justify-between">
        <Col className="mb-5 gap-2">
          <p className="text-lg font-semibold leading-tight lg:text-xl">
            {cause.title}
          </p>
          <span className="text-sm text-gray-600 sm:text-base">
            {cause.subtitle}
          </span>
        </Col>
        <Row className="justify-between">
          <span className="text-xs text-gray-600 sm:text-sm">
            {numGrants} grants
          </span>
          <span className="text-xs text-gray-600 sm:text-sm">
            {numCerts} certs
          </span>
        </Row>
      </Col>
    </Link>
  )
}
