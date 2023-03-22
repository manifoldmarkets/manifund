import { createServerClient } from '@/db/supabase-server'
import { getRoundBySlug } from '@/db/round'
import { getFullProjectsByRound } from '@/db/project'
import { RoundTabs } from './round-tabs'
import { RoundData } from '@/components/round-data'
import Image from 'next/image'

export default async function RoundPage(props: {
  params: { roundSlug: string }
}) {
  const { roundSlug } = props.params
  const supabase = createServerClient()
  const round = await getRoundBySlug(supabase, roundSlug)
  const projects = await getFullProjectsByRound(supabase, round.title)
  return (
    <div className="bg-dark-200 max-w-4xl">
      {round.header_image_url && (
        <Image
          src={round.header_image_url}
          width={1000}
          height={500}
          className="relative aspect-[4/1] w-full flex-shrink-0 bg-white object-cover"
          alt="round header image"
        />
      )}
      <h1 className="my-2 text-4xl font-bold">{round.title}</h1>
      <div className="my-5 mx-5">
        <RoundData round={round} projects={projects} />
      </div>
      <RoundTabs round={round} projects={projects} />
    </div>
  )
}
