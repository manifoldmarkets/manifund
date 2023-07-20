import { RoundData } from '@/components/round-data'
import { FullProject } from '@/db/project'
import { Round } from '@/db/round'
import Image from 'next/image'
import { orderBy, sortBy } from 'lodash'
import { Col } from '@/components/layout/col'
import { Profile } from '@/db/profile'
import { Row } from '@/components/layout/row'
import { RegranterHighlight } from '@/components/regranter-card'
import { ProjectHighlight } from '@/components/project-card'
import Link from 'next/link'
import { ArrowRightIcon, PlusIcon } from '@heroicons/react/20/solid'

export function AllRoundsDisplay(props: {
  rounds: Round[]
  projects: FullProject[]
  regrantors: Profile[]
}) {
  const { rounds, projects, regrantors } = props
  const sortedRounds = sortRoundsForPreview(rounds)
  return (
    <div className="pb-20">
      <RegrantsHighlight
        round={sortedRounds[0]}
        projects={projects}
        regrantors={regrantors}
      />
      <Col className="mt-16 gap-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Previous funding rounds
        </h2>

        <div className="flex flex-col gap-10 sm:grid sm:grid-cols-2">
          {sortedRounds.slice(1).map((round) => (
            <Round key={round.title} round={round} projects={projects} />
          ))}
        </div>
      </Col>
    </div>
  )
}

function Round(props: { round: Round; projects: FullProject[] }) {
  const { round, projects } = props
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

function RegrantsHighlight(props: {
  round: Round
  projects: FullProject[]
  regrantors: Profile[]
}) {
  const { round, projects, regrantors } = props
  const highlightedRegrantors = regrantors.slice(5, 8)
  const highlightedProjects = projects.slice(0, 3)
  return (
    <Col className="gap-8">
      <Col className="items-center justify-between gap-8">
        <div className="flex w-full flex-col items-center gap-8 sm:flex-row-reverse">
          <Col className="flex-1 gap-4">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Regranting
            </h2>
            <p className="leading-7 text-gray-600">{round.subtitle}</p>
          </Col>
        </div>
        <div className="w-full">
          <div className="grid grid-cols-3 gap-2">
            {highlightedRegrantors.map((regrantor) => (
              <RegranterHighlight key={regrantor.id} regranter={regrantor} />
            ))}
          </div>
          <div className="relative">
            <Row className="absolute inset-0 items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200" />
            </Row>
            <Row className="relative items-center justify-end">
              <Link
                href="/rounds/regrants?tab=regrants"
                className="flex items-center gap-2 bg-gray-50 p-4 text-sm font-semibold leading-6 text-orange-600"
              >
                Meet the regrantors
                <ArrowRightIcon className="h-5 w-5 stroke-2" />
              </Link>
            </Row>
          </div>
        </div>
        <div className="w-full">
          <ul className="divide-y divide-gray-100">
            {highlightedProjects.map((project) => (
              <li key={project.id} className="py-3">
                <ProjectHighlight project={project} />
              </li>
            ))}
          </ul>
          <div className="relative">
            <Row className="absolute inset-0 items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200" />
            </Row>
            <Row className="relative items-center justify-end">
              <Link
                href="/rounds/regrants?tab=projects"
                className="flex items-center gap-2 bg-gray-50 p-4 text-sm font-semibold leading-6 text-orange-600"
              >
                See what they&apos;re funding
                <ArrowRightIcon className="h-5 w-5 stroke-2" />
              </Link>
            </Row>
          </div>
        </div>
      </Col>
    </Col>
  )
}

function sortRoundsForPreview(rounds: Round[]) {
  const sortedByDueDate = orderBy(rounds, 'proposal_due_date', 'desc')
  const customSorted = sortBy(sortedByDueDate, [
    function (round: Round) {
      if (round.title === 'Regrants') {
        return 0
      } else {
        return 1
      }
    },
  ])
  return customSorted.filter((round) => round.title !== 'Independent')
}
