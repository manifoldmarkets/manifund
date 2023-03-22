import { Col } from '@/components/layout/col'
import { RoundData } from '@/components/round-data'
import { FullProject } from '@/db/project'
import { Round } from '@/db/round'
import Link from 'next/link'
import { RoundCarousel } from './round-carousel'
import Image from 'next/image'
import clsx from 'clsx'
import { getRoundTheme } from '@/utils/constants'
import { RoundTag } from '@/components/round-tag'

export function AllRoundsDisplay(props: {
  rounds: Round[]
  projects: FullProject[]
}) {
  const { rounds, projects } = props
  return (
    <Col className="mb-5 gap-3">
      {rounds.map((round) => {
        const roundProjects = projects.filter(
          (project) => project.rounds.title === round.title
        )
        if (roundProjects.length > 0) {
          return (
            <Round key={round.title} round={round} projects={roundProjects} />
          )
        }
        return null
      })}
    </Col>
  )
}

function Round(props: { round: Round; projects: FullProject[] }) {
  const { round, projects } = props
  const theme = getRoundTheme(round.title)
  return (
    <Col
      className={clsx(
        'isolate overflow-hidden rounded-md py-6',
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
            className="absolute -top-10 left-1/2 -z-10 h-96 w-full -translate-x-1/2 object-cover"
          />
        )}
      </div>
      <Link href={`/rounds/${round.slug}`} className="relative px-6">
        <RoundTag roundTitle={round.title} size="xl" />
      </Link>
      <div className="px-6">
        <RoundCarousel projects={projects} theme={theme} />
      </div>
      <div className="my-5 flex justify-center px-6">
        <div className="w-10/12">
          <RoundData round={round} projects={projects} />
        </div>
      </div>
    </Col>
  )
}
