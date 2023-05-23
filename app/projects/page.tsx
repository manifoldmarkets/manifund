import { createServerClient } from '@/db/supabase-server'
import { listProjects } from '@/db/project'
import { getRounds } from '@/db/round'
import { AllRoundsDisplay } from './all-rounds-display'
import { ProjectsDisplay } from '@/components/projects-display'
import { getRegranters, getUser } from '@/db/profile'
import { SupabaseClient } from '@supabase/supabase-js'
import Image from 'next/image'
import { Row } from '@/components/layout/row'
import {
  ArrowPathIcon,
  ArrowRightIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/20/solid'
import { Col } from '@/components/layout/col'
import { Button } from '@/components/button'

export const revalidate = 30

export default async function Projects() {
  const supabase = createServerClient()
  const user = await getUser(supabase)
  const projects = await listProjects(supabase)
  const rounds = await getRounds(supabase)
  const regranters = await getRegranters(supabase)
  return (
    <div className="bg-dark-200 max-w-4xl px-3 pt-5 sm:px-6">
      {user === null && <LandingSection />}
      <AllRoundsDisplay
        rounds={rounds}
        projects={projects}
        regranters={regranters}
      />
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
            <p className="text-2xl font-medium text-white shadow-rose-500 text-shadow-lg sm:text-4xl">
              Give impactfully,
            </p>
            <p className="text-right text-2xl font-medium text-white shadow-orange-500 text-shadow-lg sm:text-4xl">
              get funded efficiently.
            </p>
            <p className="mt-3 text-center text-xs text-white sm:mt-5 sm:text-sm">
              Manifund offers charitable funding infrastructure designed to
              improve incentives, efficiency, and transparency.
            </p>
          </div>
          <Image
            className="hidden w-40 xl:block"
            src="/SolidWhiteManifox.png"
            alt="Manifox"
            width={1000}
            height={1000}
          />
        </Row>
        <Row className="mt-5 justify-center">
          <a
            className="rounded bg-white px-3 py-2 text-sm font-medium text-orange-500 shadow hover:bg-orange-500 hover:text-white"
            href="/login"
          >
            Start giving
          </a>
        </Row>
      </div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row">
        <div className="rounded-lg border-2 border-orange-500 bg-white p-3">
          <Row className="mb-1 gap-1 text-orange-500">
            <ArrowPathIcon className="h-7 w-7 text-orange-500" />
            <p className="text-lg font-medium">Regranting</p>
          </Row>
          <p className="text-sm text-gray-600">
            Allows donors to outsource their giving to qualified and trusted
            regrantors.
          </p>
          <LearnMoreButton url="/rounds/regrants?tab=about" />
        </div>
        <div className="rounded-lg border-2 border-orange-500 bg-white p-3">
          <Row className="mb-1 gap-1 text-orange-500">
            <ArrowTrendingUpIcon className="h-7 w-7" />
            <p className="text-lg font-medium">Impact certificates</p>
          </Row>
          <p className="text-sm text-gray-600">
            Align incentives with impact by bringing for-profit funding
            mechanisms to the non-profit world.
          </p>
          <LearnMoreButton url="/about" />
        </div>
      </div>
    </Col>
  )
}

function LearnMoreButton(props: { url: string }) {
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
