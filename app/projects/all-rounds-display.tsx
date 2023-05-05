import { RoundData } from '@/components/round-data'
import { FullProject } from '@/db/project'
import { Round } from '@/db/round'
import Image from 'next/image'
import { orderBy, sortBy } from 'lodash'
import { Profile } from '@/db/profile'

export function AllRoundsDisplay(props: {
  rounds: Round[]
  projects: FullProject[]
  regranters: Profile[]
}) {
  const { rounds, projects, regranters } = props
  const sortedRounds = sortRoundsForPreview(rounds)
  return (
    <div className="pb-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Active rounds
          </h2>
          <p className="mt-1 text-gray-600">
            Organized funding rounds with active projects.
          </p>
          <div className="mt-8 space-y-10 lg:mt-12 lg:space-y-14">
            {sortedRounds.map((round) => (
              <Round round={round} projects={projects} key={round.title} />
            ))}
          </div>
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
      className="relative isolate flex flex-col gap-3 lg:flex-row lg:gap-8"
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
      <div>
        <div className="group relative max-w-xl">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:underline">
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
      </div>
    </article>
  )
}

function sortProjectsForPreview(projects: FullProject[]) {
  const sortedByComments = projects.sort((a, b) =>
    a.comments.length < b.comments.length ? 1 : -1
  )
  const sortedByStage = sortBy(sortedByComments, [
    function (project: FullProject) {
      switch (project.stage) {
        case 'proposal':
          return 0
        case 'active':
          return 1
        case 'complete':
          return 2
        default:
          return 3
      }
    },
  ])
  return sortedByStage
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
  // Exclude Regrants until launch
  return customSorted.filter(
    (round) => round.title !== 'Independent' && round.title !== 'Regrants'
  )
}
