import { createServerClient } from '@/db/supabase-server'
import { getProfileByUsername, getProfileById, getUser } from '@/db/profile'
import { Button } from '@/components/button'
import { BigButton } from './big-button'

export default async function DonateButtonPage(props: {
  params: { charitySlug: string }
}) {
  const { charitySlug } = props.params
  const supabase = createServerClient()
  const charity = await getProfileByUsername(supabase, charitySlug)
  if (!charity) {
    return <div>Charity not found.</div>
  }
  return (
    <div className="p-4">
      Charity: {charity.full_name}
      <BigButton />
    </div>
  )
}
