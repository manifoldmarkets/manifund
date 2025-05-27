import { Row } from '@/components/layout/row'
import { listProfiles } from '@/db/profile'
import { createServerSupabaseClient } from '@/db/supabase-server'
import { PeopleDisplay } from './people-display'

export default async function PeoplePage() {
  const supabase = await createServerSupabaseClient()
  const profiles = await listProfiles(supabase)

  return (
    <Row className="w-full justify-center p-6">
      <div className="w-fit">
        <PeopleDisplay profiles={profiles} />
      </div>
    </Row>
  )
}
