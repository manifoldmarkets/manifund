import { createServerClient } from '@/db/supabase-server'
import { getRoundBySlug } from '@/db/round'
import { getFullProjectsByRound } from '@/db/project'
import { RoundTabs } from './round-tabs'
import { RoundData } from '@/components/round-data'
import { Row } from '@/components/layout/row'

export default async function RoundPage(props: {
  params: { roundSlug: string }
}) {
  const { roundSlug } = props.params
  const supabase = createServerClient()
  const round = await getRoundBySlug(supabase, roundSlug)
  const projects = await getFullProjectsByRound(supabase, round.title)
  return (
    <div className="bg-dark-200 max-w-4xl">
      <h1 className="text-4xl font-bold">{round.title}</h1>
      <div className="my-5">
        <RoundData round={round} projects={projects} />
      </div>
      <RoundTabs round={round} projects={projects} />
    </div>
  )
}
