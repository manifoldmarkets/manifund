import { createServerClient } from '@/db/supabase-server'
import { listProjects } from '@/db/project'
import { getRounds } from '@/db/round'
import { AllRoundsDisplay } from './all-rounds-display'
import { ProjectsDisplay } from '@/components/projects-display'
import { getUser } from '@/db/profile'
import Image from 'next/image'
import { Row } from '@/components/layout/row'
import {
  ArrowPathIcon,
  ArrowRightIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/20/solid'
import { Col } from '@/components/layout/col'
import { FeatureCard } from '@/components/feature-card'

export const revalidate = 30

export default async function Projects() {
  const supabase = createServerClient()
  const user = await getUser(supabase)
  const projects = await listProjects(supabase)
  const rounds = await getRounds(supabase)
  return (
    <div className="bg-dark-200 max-w-4xl px-3 pt-5 sm:px-6">
      {user === null && <LandingSection />}
      <AllRoundsDisplay rounds={rounds} projects={projects} />
      <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
        All projects
      </h2>
      <p className="mt-1 mb-2 text-gray-600">
        Including projects in all stages and from all rounds.
      </p>
      <ProjectsDisplay projects={projects} />
    </div>
  )
}

function LandingSection() {
  return (
    <Col className="mb-10 gap-4">
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
