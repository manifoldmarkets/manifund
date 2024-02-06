import { createServerClient } from '@/db/supabase-server'
import { getFullProjectsByCause } from '@/db/project'
import Image from 'next/image'
import { getCause, listMiniCauses } from '@/db/cause'
import { CauseContent } from './cause-content'
import { CauseData } from './cause-data'

export const revalidate = 60

export async function generateMetadata(props: {
  params: { causeSlug: string }
}) {
  const { causeSlug } = props.params
  const supabase = createServerClient()
  const cause = await getCause(supabase, causeSlug)
  return {
    title: cause.slug,
  }
}

export default async function CausePage(props: {
  params: { causeSlug: string }
}) {
  const { causeSlug } = props.params
  const supabase = createServerClient()
  const cause = await getCause(supabase, causeSlug)
  const causesList = await listMiniCauses(supabase)
  const projects = await getFullProjectsByCause(supabase, cause.slug)
  return (
    <div className="bg-dark-200 max-w-4xl p-6">
      {cause.header_image_url && (
        <Image
          src={cause.header_image_url}
          width={1000}
          height={500}
          className="relative aspect-[3/1] w-full flex-shrink-0 rounded bg-white object-cover"
          alt="round header image"
        />
      )}
      <h1 className="mb-1 mt-3 text-3xl font-bold lg:text-4xl">
        {cause.title}
      </h1>
      <CauseData projects={projects} />
      <CauseContent cause={cause} projects={projects} causesList={causesList} />
    </div>
  )
}
