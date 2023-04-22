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
    <Col className="mb-5 gap-3">
      {sortedRounds.map((round) => {
        const roundProjects = projects.filter(
          (project) =>
            project.rounds.title === round.title && project.stage !== 'hidden'
        )
        if (roundProjects.length > 0) {
          return (
            <Round
              key={round.title}
              round={round}
              projects={sortProjectsForPreview(roundProjects)}
              regranters={round.title === 'Regrants' ? regranters : undefined}
            />
          )
        }
        return null
      })}
    </Col>
  )
}

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
