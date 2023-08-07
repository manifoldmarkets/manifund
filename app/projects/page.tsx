import { createServerClient } from '@/db/supabase-server'
import { FullProject, listProjects } from '@/db/project'
import { getRounds, Round } from '@/db/round'
import { ProjectsDisplay } from '@/components/projects-display'
import { getUser, Profile } from '@/db/profile'
import Image from 'next/image'
import { Row } from '@/components/layout/row'
import {
  ArrowLongRightIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/20/solid'
import { Col } from '@/components/layout/col'
import { FeatureCard } from '@/components/feature-card'
import { getRegranters } from '@/db/profile'
import Link from 'next/link'
import clsx from 'clsx'
import { CardlessProject } from '@/components/project-card'
import { CardlessRegranter } from '@/components/regranter-card'

export const revalidate = 60

export default async function Projects() {
  const supabase = createServerClient()
  const [user, projects, rounds, regrantors] = await Promise.all([
    getUser(supabase),
    listProjects(supabase),
    getRounds(supabase),
    getRegranters(supabase),
  ])
  const regrants = rounds.find((round) => round.title === 'Regrants') as Round
  const otherRounds = rounds.filter(
    (round) => round.title !== 'Regrants' && round.title !== 'Independent'
  )
  return (
    <Col className="max-w-4xl gap-12 px-3 py-5 sm:px-6">
      {user === null && <LandingSection />}
      <RegrantsHighlight
        round={regrants}
        projects={projects}
        regrantors={regrantors}
        loggedIn={user !== null}
      />
      <Col className="gap-3">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Other funding rounds
        </h2>
        <p className="text-gray-600">
          In the past, we experimented with funding projects through impact
          certificates, which you can read more about{' '}
          <Link href="/about#impact-certificates">here</Link>. These rounds are
          no longer accepting submissions, but many projects are still active
          and are awaiting retroactive evaluation.
        </p>
        <div className="mt-5 flex flex-col gap-10 sm:grid sm:grid-cols-2">
          {otherRounds.map((round) => (
            <Round key={round.title} round={round} />
          ))}
        </div>
      </Col>
      <Col className="gap-3">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          All projects
        </h2>
        <p className="text-gray-600">
          Including projects in all stages and from all rounds.
        </p>
        <ProjectsDisplay
          projects={projects}
          defaultSort={'newest first'}
          sortOptions={[
            'votes',
            'newest first',
            'oldest first',
            'price',
            'percent funded',
            'number of comments',
          ]}
        />
      </Col>
    </Col>
  )
}

function LandingSection() {
  return (
    <Col className="gap-4">
      <div className="rounded-lg bg-gradient-to-r from-orange-500 to-rose-500 p-5">
        <Row>
          <div>
            <p className="text-3xl font-medium text-white shadow-rose-500 text-shadow-lg sm:text-4xl">
              Impactful giving,
            </p>
            <p className="text-right text-3xl font-medium text-white shadow-orange-500 text-shadow-lg sm:text-4xl">
              efficient funding.
            </p>
            <p className="mt-3 text-center text-xs text-white sm:mt-5 sm:text-sm">
              Manifund offers charitable funding infrastructure designed to
              improve incentives, efficiency, and transparency.
            </p>
            <Row className="mt-5 justify-center">
              <Link
                className="rounded bg-white px-3 py-2 text-sm font-medium text-orange-600 shadow hover:bg-orange-600 hover:text-white"
                href="/login"
              >
                Get started
              </Link>
            </Row>
          </div>
          <Image
            className="hidden w-48 lg:block"
            src="/SolidWhiteManifox.png"
            alt="Manifox"
            width={1000}
            height={1000}
          />
        </Row>
      </div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row">
        <FeatureCard
          icon={<ArrowPathIcon className="h-7 w-7" />}
          title="Regranting"
          description="Lets donors to outsource their donation decisions to regrantors of their choice."
          url="/rounds/regrants?tab=about"
        />
        <FeatureCard
          icon={<ArrowTrendingUpIcon className="h-7 w-7" />}
          title="Impact certificates"
          description="Align incentives with impact by bringing for-profit funding mechanisms to the non-profit world."
          url="/about#impact-certificates"
        />
      </div>
    </Col>
  )
}

const featuredRegrantorIds = [
  '1398ed62-4213-4923-a84e-a9931ae19492', // Adam
  '647c9b3c-65ce-40cf-9464-ac02c741aacd', // Evan
  'b11620f2-fdc7-414c-8a63-9ddee17ee669', // Marcus
  '8aa331b7-3602-4001-9bc6-2b71b1c8ddd1', // Renan
]

const featuredProjectIds = [
  '51b9e659-2486-5f9b-bf49-342b095580ce', // Vector Steering
  'd3060c60-beec-9c6a-6f69-ccf8cc10d603', // Apollo
  '39d6e7d5-bb12-41a2-ceaf-71fa618385d5', // Joseph Bloom
]

function RegrantsHighlight(props: {
  round: Round
  projects: FullProject[]
  regrantors: Profile[]
  loggedIn: boolean
}) {
  const { round, projects, regrantors, loggedIn } = props
  const featuredRegrantors = featuredRegrantorIds.map((id) => {
    return regrantors.find((regranter) => regranter.id === id)
  })
  const featuredProjects = featuredProjectIds.map((id) => {
    return projects.find((project) => project.id === id)
  })
  return (
    <Col className="gap-12">
      <Col className="items-center justify-between gap-8">
        {loggedIn && (
          <div className="relative isolate flex w-full flex-col gap-4 overflow-hidden rounded-lg py-16">
            <Image
              src={round.header_image_url ?? ''}
              height="500"
              width="800"
              alt="Regrants header image"
              className="absolute inset-0 -z-10 h-full w-full rounded-lg object-cover"
            />
            <div
              className="absolute -top-10 right-1/2 -z-10 mr-10 transform-gpu blur-3xl"
              aria-hidden="true"
            >
              <div
                className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-tr from-[#ea580c] to-[#e11d48] opacity-80"
                style={{
                  clipPath:
                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
              />
              <div
                className="absolute  left-1/2 top-[-28rem] -z-10 ml-16 translate-x-0 transform-gpu blur-3xl"
                aria-hidden="true"
              >
                <div
                  className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-tr from-[#ea580c] to-[#e11d48] opacity-80"
                  style={{
                    clipPath:
                      'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                  }}
                />
              </div>
            </div>
            <Link
              href="/rounds/regrants"
              className="max-w-7xl px-6 sm:px-8 lg:px-10"
            >
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Regranting
              </h2>
              <p className="max-w-xl leading-7 text-gray-200">
                {round.subtitle}
              </p>
            </Link>
            <ArrowLink
              href="/rounds/regrants?tab=about"
              text="Learn more"
              className="absolute bottom-5 right-5"
            />
          </div>
        )}
        <div className="w-full">
          <DividerHeader text="Featured regrantors" />
          <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {featuredRegrantors.map((regrantor, idx) => (
              <li className={clsx(idx > 2 && 'sm:hidden')} key={regrantor?.id}>
                <CardlessRegranter regranter={regrantor as Profile} />
              </li>
            ))}
          </ul>
          <ArrowLink
            href="/rounds/regrants?tab=regrants"
            text="See all regrantors"
            className="mt-5"
            color="orange"
          />
        </div>
        <div className="w-full max-w-2xl">
          <DividerHeader text="Featured projects" />
          <ul className="mt-5 divide-y divide-gray-100">
            {featuredProjects.map((project) => (
              <li key={project?.id} className="py-3">
                <CardlessProject project={project as FullProject} />
              </li>
            ))}
          </ul>
          <ArrowLink
            href="/rounds/regrants?tab=projects"
            text="See all projects"
            color="orange"
          />
        </div>
      </Col>
    </Col>
  )
}

function ArrowLink(props: {
  href: string
  text: string
  className?: string
  color?: string
}) {
  const { href, text, className, color } = props
  return (
    <Link
      href={href}
      className={clsx(
        'flex items-center justify-end gap-2 text-sm font-semibold hover:underline',
        color ? `text-${color}-600` : 'text-white',
        className
      )}
    >
      {text}
      <ArrowLongRightIcon className="h-5 w-5 stroke-2" />
    </Link>
  )
}

function DividerHeader(props: { text: string }) {
  const { text } = props
  return (
    <div className="relative">
      <Row className="absolute inset-0 items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-400" />
      </Row>
      <Row className="relative items-center justify-center">
        <h3 className=" bg-gray-50 p-3 text-center text-xl font-bold text-gray-900">
          {text}
        </h3>
      </Row>
    </div>
  )
}

function Round(props: { round: Round }) {
  const { round } = props
  return (
    <Col key={round.title} className="relative isolate h-full gap-3">
      <div className="relative aspect-[16/9] sm:aspect-[2/1]">
        <Image
          src={round.header_image_url ?? ''}
          height="500"
          width="800"
          alt=""
          className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
        />
      </div>
      <Col className="justify-between">
        <div className="group relative">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:underline lg:text-xl">
            <a href={`/rounds/${round.slug}`}>
              <span className="absolute inset-0" />
              {round.title}
            </a>
          </h3>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            {round.subtitle}
          </p>
        </div>
      </Col>
    </Col>
  )
}
