'use client'
import { RoundTag } from '@/components/round-tag'
import { UserAvatarAndBadge } from '@/components/user-link'
import { Profile } from '@/db/profile'
import { Round } from '@/db/round'

export function ProjectPageHeader(props: { round: Round; creator: Profile }) {
  const { round, creator } = props
  return (
    <div className="flex justify-between">
      <UserAvatarAndBadge profile={creator} />
      <RoundTag roundTitle={round.title} />
    </div>
  )
}
