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
      <UserAvatarAndBadge profile={creator} />
      <RoundTag round={round} />
    </div>
  )
}
