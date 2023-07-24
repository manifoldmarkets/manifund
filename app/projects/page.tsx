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
    <Col className="max-w-4xl gap-20 px-3 py-5 sm:px-6">
      {user === null && <LandingSection />}
      <RegrantsHighlight
        round={regrants}
        projects={projects}
        regrantors={regrantors}
      />
      <Col className="gap-3">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Other funding rounds
        </h2>
        <p className="text-gray-600">
          These rounds used impact certificates to fund projects. They are no
          longer accepting submissions, but many projects are still active and
          awaiting evaluation.
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
              <a
                className="rounded bg-white px-3 py-2 text-sm font-medium text-orange-500 shadow hover:bg-orange-500 hover:text-white"
                href="/login"
              >
                Start giving
              </a>
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
          description="Allows donors to outsource their giving to qualified and trusted regrantors."
          url="/about#regranting"
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
  '6fac4945-95ba-43ac-e548-b960e7f1db57', // Cavity
  'c76614f2-7d71-ae49-c0e2-9d32d642ea3c', // Jesse
  'ebf3d790-c893-b968-7ac9-83c90bd8e795', // (Dis)empowerment
]

function RegrantsHighlight(props: {
  round: Round
  projects: FullProject[]
  regrantors: Profile[]
}) {
  const { round, projects, regrantors } = props
  const featuredRegrantors = featuredRegrantorIds.map((id) => {
    return regrantors.find((regranter) => regranter.id === id)
  })
  const featuredProjects = featuredProjectIds.map((id) => {
    return projects.find((project) => project.id === id)
  })
  return (
    <Col className="mt-10 gap-12">
      <Col className="items-center justify-between gap-8">
        <Link
          href="/rounds/regrants"
          className="flex flex-col items-center gap-4 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 group-hover:underline sm:text-4xl">
            Regranting
          </h2>
          <p className="max-w-xl leading-7 text-gray-600">{round.subtitle}</p>
        </Link>
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
          />
        </div>
      </Col>
    </Col>
  )
}

function ArrowLink(props: { href: string; text: string; className?: string }) {
  const { href, text, className } = props
  return (
    <Link
      href={href}
      className={clsx(
        'flex items-center justify-end gap-2 text-sm font-semibold text-orange-600 hover:underline',
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
        <h3 className=" bg-gray-50 p-3 text-center text-lg font-bold text-gray-900">
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
