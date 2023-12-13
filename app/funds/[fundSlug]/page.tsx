import { RichContent } from '@/components/editor'
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
      <h1 className="mt-4 text-4xl font-bold">{fund.full_name}</h1>
      <span className="text-gray-600">{fund.bio}</span>
      <RichContent className="mt-6" content={fund.long_description} />
    </div>
  )
}
