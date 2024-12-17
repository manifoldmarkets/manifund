import { createServerClient } from '@/db/supabase-server'
import { FullCause, getSomeFullCauses } from '@/db/cause'
import { Col } from '@/components/layout/col'
import { CausePreview } from './cause-preview'
import { RegrantingCause } from './regranting-cause'

export const revalidate = 86400 // 24 hours
export function CausesSection(props: { causes?: FullCause[] }) {
  const { causes } = props

  return (
    <Col className="gap-3">
      <h3 className="text-2xl font-semibold">Active programs</h3>
      <RegrantingCause />
      {causes?.map((cause) => (
        <CausePreview cause={cause} key={cause.slug} />
      ))}
    </Col>
  )
}

// Use this version if you want to show featured causes
export async function CausesWithFeatured() {
  const supabase = createServerClient()
  const featuredCauses = await getSomeFullCauses([], supabase)
  return <CausesSection causes={featuredCauses} />
}
