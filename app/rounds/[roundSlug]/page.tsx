import { createServerClient } from '@/db/supabase-server'
import { getRoundBySlug } from '@/db/round'
import { getFullProjectsByRound } from '@/db/project'
import { RoundTabs } from './round-tabs'
import { RoundData } from '@/components/round-data'
import Image from 'next/image'
import { getRegranters } from '@/db/profile'

export const revalidate = 0

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
  const projects = await getFullProjectsByRound(supabase, round.title)
  const regranters = await getRegranters(supabase)
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
        <RoundData round={round} projects={projects} />
      </div>
      <RoundTabs
        round={round}
        projects={projects}
        regranters={round.title === 'Regranters' ? regranters : undefined}
      />
    </div>
  )
}
