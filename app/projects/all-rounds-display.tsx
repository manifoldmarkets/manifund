import { Col } from '@/components/layout/col'
import { RoundData } from '@/components/round-data'
import { FullProject } from '@/db/project'
import { Round } from '@/db/round'
import Link from 'next/link'
import { RoundCarousel } from './round-carousel'

export function AllRoundsDisplay(props: {
  rounds: Round[]
  projects: FullProject[]
}) {
  const { rounds, projects } = props
  return (
    <Col className="mb-5 gap-3">
      {rounds.map((round) => {
        const roundProjects = projects.filter(
          (project) => project.round === round.title
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
  return (
    <Col className=" p-3 ">
      <Link
        href={`/rounds/${round.slug}`}
        className="mb-3 cursor-pointer text-3xl font-bold"
      >
        {round.title}
      </Link>
      <RoundCarousel projects={projects} />
      <div className="my-5 flex justify-center">
        <div className="w-10/12">
          <RoundData round={round} projects={projects} />
        </div>
      </div>
    </Col>
  )
}
