import { createServerClient } from '@/db/supabase-server'
import { getRoundBySlug } from '@/db/round'
import { getFullProjectsByRound } from '@/db/project'

export default async function RoundPage(props: {
  params: { roundSlug: string }
}) {
  const { roundSlug } = props.params
  const supabase = createServerClient()
  const round = await getRoundBySlug(supabase, roundSlug)
  const projects = await getFullProjectsByRound(supabase, round.title)
  return (
    <div className="bg-dark-200 max-w-4xl">Round Page for {round.title}</div>
  )
}
