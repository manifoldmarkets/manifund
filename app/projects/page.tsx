import { createServerClient } from '@/db/supabase-server'
import { listProjects } from '@/db/project'
import { getUser } from '@/db/profile'
import Image from 'next/image'
import { Row } from '@/components/layout/row'
import { ArrowLongRightIcon } from '@heroicons/react/20/solid'
import { Col } from '@/components/layout/col'
import { getRegranters } from '@/db/profile'
import Link from 'next/link'
import { FullCause, getSomeFullCauses, listMiniCauses } from '@/db/cause'
import { getRecentFullComments } from '@/db/comment'
import { getRecentFullTxns } from '@/db/txn'
import { FeedTabs } from './feed-tabs'
import { getRecentFullBids } from '@/db/bid'
import { timeit } from '@/utils/perf'

export const revalidate = 60

export default async function Projects(props: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const PAGE_SIZE = 20
  // Extract `page` from ?p=X param as an 1-indexed integer
  const page = parseInt(props.searchParams?.p as string) || 1
  const start = (page - 1) * PAGE_SIZE
  const supabase = createServerClient()
  const [
    user,
    projects,
    recentComments,
    recentDonations,
    recentBids,
    causesList,
    featuredCauses,
  ] = await Promise.all([
    timeit(getUser)(supabase),
    timeit(listProjects)(supabase),
    timeit(getRecentFullComments)(supabase, PAGE_SIZE, start),
    timeit(getRecentFullTxns)(supabase, PAGE_SIZE, start),
    timeit(getRecentFullBids)(supabase, PAGE_SIZE, start),
    timeit(listMiniCauses)(supabase),
    getSomeFullCauses(['acx-grants-2024', 'manifold-community'], supabase),
  ])
  return (
    <Col className="gap-16 px-3 py-5 sm:px-6">
      {user === null && <LandingSection />}
      <Col className="gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Current programs
        </h1>
        {featuredCauses.map((cause) => (
          <CausePreview cause={cause} key={cause.slug} />
        ))}
      </Col>
      <FeedTabs
        recentComments={recentComments}
        recentDonations={recentDonations}
        recentBids={recentBids}
        projects={projects}
        causesList={causesList}
      />
    </Col>
  )
}

function CausePreview(props: { cause: FullCause }) {
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
      href={`/causes/${cause.slug}`}
    >
      <Image
        src={cause.header_image_url}
        width={240}
        height={120}
        className="sm:max-w-60 relative aspect-[3/1] w-full flex-shrink-0 rounded bg-white object-cover sm:aspect-[5/3]"
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

function LandingSection() {
  return (
    <div className="rounded-lg bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-10 sm:px-8">
      <div className="relative mx-auto mb-5 w-fit rounded-full px-3 py-1 text-xs leading-6 ring-1 ring-white ring-opacity-20 hover:bg-white hover:bg-opacity-20">
        <span className="text-white text-opacity-50">
          We&apos;re fundraising.{' '}
        </span>
        <a href="/about/donate" className="font-semibold text-white">
          Read more <ArrowLongRightIcon className="inline h-4 w-4 stroke-2" />
        </a>
      </div>
      <Row className="flex-2">
        <div>
          <p className="text-3xl font-medium text-white shadow-rose-500 text-shadow-lg sm:text-4xl">
            Impactful giving,
          </p>
          <p className="text-right text-3xl font-medium text-white shadow-orange-500 text-shadow-lg sm:text-4xl">
            efficient funding.
          </p>
          <p className="mb-8 mt-4 text-center text-xs text-white sm:mt-5 sm:text-sm">
            Manifund offers charitable funding infrastructure designed to
            improve incentives, efficiency, and transparency.
          </p>
          <Row className="justify-center gap-3 text-sm">
            <Link
              className="group rounded-lg bg-white px-3 py-2 text-white ring-2 ring-white hover:bg-transparent"
              href="/login"
            >
              <span className="bg-gradient-to-r from-orange-500 to-rose-600 bg-clip-text text-sm font-semibold text-transparent group-hover:text-white">
                Get started
              </span>
            </Link>
            <Link
              className="group flex w-fit items-center gap-1 rounded-lg p-2 text-white ring-2 ring-white hover:bg-white"
              href="/login"
            >
              <span className="from-orange-500 to-rose-600 bg-clip-text text-sm font-semibold group-hover:bg-gradient-to-r group-hover:text-transparent">
                About regranting
              </span>
              <ArrowLongRightIcon className="h-4 w-4 stroke-2 text-white group-hover:text-rose-500" />
            </Link>
          </Row>
        </div>
        <Image
          className="hidden max-h-fit w-48 object-contain lg:block"
          src="/SolidWhiteManifox.png"
          alt="Manifox"
          width={1000}
          height={1000}
        />
      </Row>
    </div>
  )
}
