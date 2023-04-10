import { createServerClient } from '@/db/supabase-server'
import { getProfileByUsername } from '@/db/profile'

export default async function CharityPage(props: {
  params: { charitySlug: string }
}) {
  const { charitySlug } = props.params
  const supabase = createServerClient()
  const charity = await getProfileByUsername(supabase, charitySlug)
  return <div>{charity.full_name}</div>
}
