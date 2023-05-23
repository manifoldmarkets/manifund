import { createServerClient } from '@/db/supabase-server'
import { listProjects } from '@/db/project'
import { getRounds } from '@/db/round'
import { AllRoundsDisplay } from './all-rounds-display'
import { ProjectsDisplay } from '@/components/projects-display'
import { getRegranters, getUser } from '@/db/profile'
import { SupabaseClient } from '@supabase/supabase-js'
import { Row } from '@/components/layout/row'
import {
  ArrowPathIcon,
  ArrowRightIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/20/solid'
import { Col } from '@/components/layout/col'

export const revalidate = 30

export default async function Projects() {
  const supabase = createServerClient()
  const user = await getUser(supabase)
  const projects = await listProjects(supabase)
  const rounds = await getRounds(supabase)
  const regranters = await getRegranters(supabase)
  return (
    <div className="bg-dark-200 max-w-4xl px-6 pt-5">
      {!user && <LandingSection />}
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
        <p className="text-4xl font-medium text-white shadow-rose-500 text-shadow-lg">
          Give impactfully,
        </p>
        <p className="text-right text-4xl font-medium text-white shadow-orange-500 text-shadow-lg">
          get funded efficiently.
        </p>
        <p className="mt-5 text-center text-white">
          Manifund offers charitable funding infrastructure designed to improve
          incentives, efficiency, and transparency.
        </p>
      </div>
      <Row className="justify-between gap-3">
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
            mechanisms to the non-profit space.
          </p>
          <LearnMoreButton url="/about" />
        </div>
      </Row>
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
