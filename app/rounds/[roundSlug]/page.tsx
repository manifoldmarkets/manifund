import { createServerClient } from '@/db/supabase-server'
import { getRoundBySlug } from '@/db/round'
import { getFullProjectsByRound } from '@/db/project'
import { RoundTabs } from './round-tabs'
import { RoundData } from '@/components/round-data'
import Image from 'next/image'
import { getRegranters } from '@/db/profile'
import { listMiniCauses } from '@/db/cause'

export const revalidate = 60

export async function generateMetadata(props: {
  params: { roundSlug: string }
}) {
  const { roundSlug } = props.params
  const supabase = createServerClient()
  const round = await getRoundBySlug(supabase, roundSlug)
  return {
    title: round.title,
  }
}

export default async function RoundPage(props: {
  params: { roundSlug: string }
}) {
  const { roundSlug } = props.params
  const supabase = createServerClient()
  const round = await getRoundBySlug(supabase, roundSlug)
  const [projects, regranters, causesList] = await Promise.all([
    getFullProjectsByRound(supabase, round.title),
    round.title === 'Regrants' ? getRegranters(supabase) : [],
    listMiniCauses(supabase),
  ])
  const visibleProjects = projects.filter(
    (project) => project.stage !== 'hidden'
  )
  return (
    <div className="bg-dark-200 max-w-4xl">
      {round.header_image_url && (
        <Image
          src={round.header_image_url}
          width={1000}
          height={500}
          className="relative aspect-[4/1] w-full flex-shrink-0 rounded bg-white object-cover"
          alt="round header image"
        />
      )}
      <h1 className="my-2 text-4xl font-bold">{round.title}</h1>
      <div className="my-5 mx-5">
        {/* @ts-expect-error server component */}
        <RoundData round={round} projects={visibleProjects} />
      </div>
      <RoundTabs
        round={round}
        projects={visibleProjects}
        causesList={causesList}
        regranters={round.title === 'Regrants' ? regranters : undefined}
      />
    </div>
  )
}
