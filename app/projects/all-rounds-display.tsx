import { Col } from '@/components/layout/col'
import { RoundData } from '@/components/round-data'
import { FullProject } from '@/db/project'
import { Round } from '@/db/round'
import { RegranterCarousel, RoundCarousel } from './round-carousel'
import Image from 'next/image'
import clsx from 'clsx'
import { getRoundTheme } from '@/utils/constants'
import { RoundTag } from '@/components/tags'
import { orderBy, sortBy } from 'lodash'
import { Profile } from '@/db/profile'
import { RichContent } from '@/components/editor'

export function AllRoundsDisplay(props: {
  rounds: Round[]
  projects: FullProject[]
  regranters: Profile[]
}) {
  const { rounds, projects, regranters } = props
  const sortedRounds = sortRoundsForPreview(rounds)
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Active rounds
          </h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            Organized funding rounds with active projects.
          </p>
          <div className="mt-16 space-y-20 lg:mt-20 lg:space-y-20">
            {sortedRounds.map((round) => (
              <article
                key={round.title}
                className="relative isolate flex flex-col gap-8 lg:flex-row"
              >
                <div className="relative aspect-[16/9] sm:aspect-[2/1] lg:aspect-square lg:w-64 lg:shrink-0">
                  <Image
                    src={round.header_image_url ?? ''}
                    height="500"
                    width="800"
                    alt=""
                    className="absolute inset-0 h-full w-full rounded-2xl bg-gray-50 object-cover"
                  />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
                </div>
                <div>
                  <div className="group relative max-w-xl">
                    <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:underline">
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
                    <RoundData round={round} projects={projects} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
// return (
//   <Col className="mb-5 gap-3">
//     {sortedRounds.map((round) => {
//       const roundProjects = projects.filter(
//         (project) =>
//           project.rounds.title === round.title && project.stage !== 'hidden'
//       )
//       if (roundProjects.length > 0) {
//         return (
//           <Round
//             key={round.title}
//             round={round}
//             projects={sortProjectsForPreview(roundProjects)}
//             regranters={round.title === 'Regrants' ? regranters : undefined}
//           />
//         )
//       }
//       return null
//     })}
//   </Col>
// )

function Round(props: {
  round: Round
  projects: FullProject[]
  regranters?: Profile[]
}) {
  const { round, projects, regranters } = props
  const theme = getRoundTheme(round.title)
  return (
    <Col
      className={clsx(
        'isolate mx-4 overflow-hidden rounded-md py-6 md:mx-0',
        `bg-${theme}-200`
      )}
    >
      <div className="relative">
        {round.header_image_url && (
          <Image
            src={round.header_image_url}
            width={1000}
            height={500}
            alt="round header image"
            className="absolute -top-10 left-1/2 -z-10 h-72 w-full -translate-x-1/2 object-cover"
          />
        )}
      </div>
      <div className="mx-6">
        <RoundTag
          roundTitle={round.title === 'Regrants' ? 'Regranters' : round.title}
          size="xl"
          roundSlug={round.slug}
        />
      </div>
      <div className="px-3">
        {regranters && regranters.length > 0 ? (
          <RegranterCarousel regranters={regranters} theme={theme} />
        ) : (
          <RoundCarousel projects={projects} theme={theme} />
        )}
      </div>
      <div className="my-2 flex justify-center px-6">
        <div className="w-10/12">
          {/* @ts-expect-error server component*/}
          <RoundData round={round} projects={projects} />
        </div>
      </div>
    </Col>
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
  return customSorted.filter((round) => round.title !== 'Independent')
}
