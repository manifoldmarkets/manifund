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

export function AllRoundsDisplay(props: {
  rounds: Round[]
  projects: FullProject[]
  regranters: Profile[]
}) {
  const { rounds, projects, regranters } = props
  const sortedRounds = sortRoundsForPreview(rounds)
  return (
    <div className=" py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Active rounds
          </h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            Organized funding rounds for impact certificates and grants.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {sortedRounds.map((round) => (
            <article
              key={round.title}
              className="flex flex-col items-start justify-between"
            >
              <div className="relative w-full">
                <Image
                  src={round.header_image_url ?? ''}
                  width="800"
                  height="500"
                  alt=""
                  className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
                />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
              </div>
              <div className="max-w-xl">
                {/* @ts-expect-error server component*/}
                <RoundData round={round} projects={projects} simple />
                <div className="group relative">
                  <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                    <a href={`/rounds/${round.slug}`}>
                      <span className="absolute inset-0" />
                      {round.title}
                    </a>
                  </h3>
                  <p className="mt-5 text-sm leading-6 text-gray-600 line-clamp-3">
                    {JSON.stringify(round.description)}
                  </p>
                </div>
                <div className="relative mt-8 flex items-center gap-x-4">
                  <Image
                    src={round.header_image_url ?? ''}
                    width="800"
                    height="500"
                    alt=""
                    className="h-10 w-10 rounded-full bg-gray-100"
                  />
                </div>
              </div>
            </article>
          ))}
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
