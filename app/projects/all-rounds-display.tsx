import { RoundData } from '@/components/round-data'
import { FullProject } from '@/db/project'
import { Round } from '@/db/round'
import Image from 'next/image'
import { orderBy, sortBy } from 'lodash'
import { Col } from '@/components/layout/col'
import { Profile } from '@/db/profile'
import { Row } from '@/components/layout/row'
import { RegranterCard, RegranterHighlight } from '@/components/regranter-card'
import {
  MiniProjectCard,
  ProjectCard,
  ProjectHighlight,
} from '@/components/project-card'

export function AllRoundsDisplay(props: {
  rounds: Round[]
  projects: FullProject[]
  regrantors: Profile[]
}) {
  const { rounds, projects, regrantors } = props
  const sortedRounds = sortRoundsForPreview(rounds)
  return (
    <div className="pb-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          <RegrantsHighlight
            round={sortedRounds[0]}
            projects={projects}
            regrantors={regrantors}
          />
        </div>
      </div>
    </div>
  )
}

function Round(props: { round: Round; projects: FullProject[] }) {
  const { round, projects } = props
  return (
    <article
      key={round.title}
      className="relative isolate flex h-full flex-col gap-3 lg:flex-row lg:gap-8"
    >
      <div className="relative aspect-[16/9] sm:aspect-[2/1] lg:aspect-square lg:w-64 lg:shrink-0">
        <Image
          src={round.header_image_url ?? ''}
          height="500"
          width="800"
          alt=""
          className="absolute inset-0 h-full w-full rounded-2xl bg-gray-50 object-cover"
        />
      </div>
      <Col className="justify-between lg:py-3">
        <div className="group relative max-w-xl">
          <h3 className="text-xl font-semibold text-gray-900 group-hover:underline lg:text-2xl">
            <a href={`/rounds/${round.slug}`}>
              <span className="absolute inset-0" />
              {round.title}
            </a>
          </h3>
          <p className="mt-5 text-sm leading-6 text-gray-600">
            {round.subtitle}
          </p>
        </div>
        <div className="mt-6 border-t border-gray-900/5 pt-6">
          {/* @ts-expect-error server component*/}
          <RoundData
            round={round}
            projects={projects.filter(
              (project) =>
                project.rounds.title === round.title &&
                project.stage !== 'hidden'
            )}
          />
        </div>
      </Col>
    </article>
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
      <Round round={round} projects={projects} />
      <div className="grid grid-cols-3 gap-5">
        {highlightedRegrantors.map((regrantor) => (
          <RegranterHighlight key={regrantor.id} regranter={regrantor} />
        ))}
      </div>
      <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-8 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16 xl:mx-0 xl:max-w-none xl:grid-cols-3">
        {highlightedProjects.map((project) => (
          <ProjectHighlight key={project.id} project={project} />
        ))}
      </div>
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
