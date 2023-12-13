import { getFundByUsername } from '@/db/profile'
import { createServerClient } from '@/db/supabase-server'
import Image from 'next/image'

export default async function FundPage(props: {
  params: { fundSlug: string }
}) {
  const { fundSlug } = props.params
  const supabase = createServerClient()
  const fund = await getFundByUsername(supabase, fundSlug)
  if (!fund) {
    return <div>Fund not found</div>
  }
  return (
    <div className="p-3">
      {fund.avatar_url && (
        <Image
          src={fund.avatar_url}
          width={1000}
          height={500}
          className="relative aspect-[4/1] w-full flex-shrink-0 rounded bg-white object-cover"
          alt="fund header image"
        />
      )}
      fund {fund.full_name}
    </div>
  )
}
