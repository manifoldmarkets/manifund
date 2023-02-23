'use client'
import { RoundTag } from '@/components/round-tag'
import { UserAvatarAndBadge } from '@/components/user-link'
import { ValuationBox } from '@/components/valuation-box'
import { Profile } from '@/db/profile'

export function ProjectPageHeader(props: {
  round: string
  creator: Profile
  valuation: string
}) {
  const { round, creator, valuation } = props
  return (
    <div className="flex justify-between">
      <UserAvatarAndBadge
        id={creator.id}
        name={creator.full_name}
        username={creator.username}
      />
      <RoundTag round={round} />
    </div>
  )
}
