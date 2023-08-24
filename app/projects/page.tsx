import { createServerClient } from '@/db/supabase-server'
import { FullProject, listProjects } from '@/db/project'
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
import { CardlessProfile } from '@/components/profile-card'
import { listMiniCauses } from '@/db/cause'

export const revalidate = 60

const featuredRegrantorIds = [
  '75420de8-7e37-4971-bb29-9bfada0c453b', // Leopold
  'b11620f2-fdc7-414c-8a63-9ddee17ee669', // Marcus
  'aa7c88dc-7311-4577-8cd3-c58a0d41fc31', // Joel
  '8aa331b7-3602-4001-9bc6-2b71b1c8ddd1', // Renan
]

const featuredProjectSlugs = [
  'design-and-testing-of-broad-spectrum-antivirals',
  'compute-funding-for-seri-mats-llm-alignment-research',
  'forecasting--treaty-on-artificial-intelligence-safety-and-cooperation-taisc-',
]

export default async function Projects() {
  const supabase = createServerClient()
  const [user, projects, regrantors] = await Promise.all([
    getUser(supabase),
    listProjects(supabase),
    getRegranters(supabase),
  ])
  const featuredRegrantors = featuredRegrantorIds.map((id) => {
    return regrantors.find((regranter) => regranter.id === id)
  })
  const featuredProjects = featuredProjectSlugs.map((slug) => {
    return projects.find((project) => project.slug === slug)
  })
  const causesList = await listMiniCauses(supabase)
  return (
    <Col className="max-w-4xl gap-16 px-3 py-5 sm:px-6">
      {user === null && <LandingSection />}
      <Col className="items-center justify-between gap-8">
        <div className="w-full">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Featured regrantors
          </h1>
          <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {featuredRegrantors.map((regrantor, idx) => (
              <li className={clsx(idx > 2 && 'sm:hidden')} key={regrantor?.id}>
                <CardlessProfile profile={regrantor as Profile} />
              </li>
            ))}
          </ul>
          <Link
            href="/rounds/regrants?tab=regrants"
            className="flex items-center justify-end gap-2 text-sm font-semibold text-orange-600 hover:underline"
          >
            See all regrantors
            <ArrowLongRightIcon className="h-5 w-5 stroke-2" />
          </Link>
        </div>
        <div className="w-full">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Featured projects
          </h1>{' '}
          <Col className="w-full items-center">
            <ul className="mt-5 max-w-2xl divide-y divide-gray-100">
              {featuredProjects.map((project) => (
                <li key={project?.id} className="py-3">
                  <CardlessProject project={project as FullProject} />
                </li>
              ))}
            </ul>
          </Col>
        </div>
        <Col className="gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            All projects
          </h1>
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
            causesList={causesList}
          />
        </Col>
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
