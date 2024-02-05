import { createServerClient } from '@/db/supabase-server'
import { FullCause, listFullCauses } from '@/db/cause'
import Image from 'next/image'
import Link from 'next/link'

export default async function CausesPage() {
  const supabase = createServerClient()
  const causesList = await listFullCauses(supabase)
  return (
    <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {causesList.map((cause) => (
        <CauseCard key={cause.slug} cause={cause} />
      ))}
    </div>
  )
}

function CauseCard(props: { cause: FullCause }) {
  const { cause } = props
  const numProjects = cause.projects.filter(
    (project) => project.stage !== 'hidden'
  ).length
  return (
    <Link
      className="relative rounded bg-white shadow-md"
      href={`/causes/${cause.slug}`}
    >
      <Image
        src={cause.header_image_url}
        width={240}
        height={120}
        className="relative aspect-[3/1] w-full flex-shrink-0 rounded-t bg-white object-cover sm:aspect-[5/3]"
        alt="round header image"
      />
      <p className="px-4 pb-10 pt-2 font-semibold leading-tight lg:text-lg">
        {cause.title}
      </p>
      <p className="absolute bottom-2 right-4 text-xs text-gray-600 sm:text-sm">
        {numProjects} projects
      </p>
    </Link>
  )
}
