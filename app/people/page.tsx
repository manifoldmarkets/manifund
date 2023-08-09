import { Avatar } from '@/components/avatar'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { MiniProfileTag } from '@/components/tags'
import { Profile } from '@/db/profile'
import { createServerClient } from '@/db/supabase-server'
import Link from 'next/link'

export default async function PeoplePage() {
  const supabase = createServerClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*, projects(title)')
  const profilesToShow = profiles
    ?.filter((profile) => profile.type === 'individual')
    .filter((profile) => checkProfileComplete(profile))

  return (
    <Row className="w-full justify-center p-6">
      <div className="w-fit">
        {profilesToShow?.map((profile) => (
          <ProfileRow
            key={profile.id}
            profile={profile}
            isCreator={profile.projects.length > 0}
          />
        ))}
      </div>
    </Row>
  )
}

// TODO: use on other profile complete checks
export function checkProfileComplete(profile: Profile) {
  return profile.username !== profile.id && profile.full_name
}

function ProfileRow(props: { profile: Profile; isCreator?: boolean }) {
  const { profile, isCreator } = props
  return (
    <Link
      className="flex-2 flex w-fit items-center gap-3 rounded p-3 hover:bg-gray-100"
      href={`/${profile.username}`}
    >
      <Avatar
        username={profile.username}
        avatarUrl={profile.avatar_url}
        id={profile.id}
        size={12}
        className="hidden sm:block"
      />
      <Avatar
        username={profile.username}
        avatarUrl={profile.avatar_url}
        id={profile.id}
        size={8}
        className="sm:hidden"
      />
      <Col className="w-72 truncate overflow-ellipsis sm:w-96">
        <Row className="text-md w-full justify-between font-semibold text-gray-900 sm:text-lg">
          {profile.full_name}
          <Row className="gap-1">
            {profile.regranter_status && <MiniProfileTag role="regrantor" />}
            {isCreator && <MiniProfileTag role="creator" />}
            {profile.accreditation_status && (
              <MiniProfileTag role="accredited" />
            )}
          </Row>
        </Row>
        <span className="truncate overflow-ellipsis text-xs text-gray-500">
          {profile.bio}
        </span>
      </Col>
    </Link>
  )
}
