'use client'

import { Card } from '@/components/layout/card'
import { Profile } from '@/db/profile'

export function Donate(props: { fund: Profile; userId: string }) {
  const { fund, userId } = props
  return <Card className="p-4">Donate</Card>
}
