import { createServerClient } from '@/db/supabase-server'
import { FullProject, listProjects } from '@/db/project'
import { ProjectsDisplay } from '@/components/projects-display'
import { getUser, Profile } from '@/db/profile'
import Image from 'next/image'
import { Row } from '@/components/layout/row'
import { ArrowLongRightIcon, ArrowRightIcon } from '@heroicons/react/20/solid'
import { Col } from '@/components/layout/col'
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
                  <CardlessProject
                    project={project as FullProject}
                    showFundingBar
                  />
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
    <div className="rounded-lg bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-10 sm:px-8">
      <div className="relative mx-auto mb-5 w-fit rounded-full px-3 py-1 text-xs leading-6 ring-1 ring-white ring-opacity-20 hover:bg-white hover:bg-opacity-20">
        <span className="text-white text-opacity-50">
          We&apos;re fundraising.{' '}
        </span>
        <a href="#" className="font-semibold text-white">
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
          <p className="mt-4 mb-8 text-center text-xs text-white sm:mt-5 sm:text-sm">
            Manifund offers charitable funding infrastructure designed to
            improve incentives, efficiency, and transparency.
          </p>
          <Row className="justify-center gap-3 text-sm">
            <Link
              className="group rounded-lg bg-white py-2 px-3 text-white ring-2 ring-white hover:bg-transparent"
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
