import { getFullProjectBySlug, getProjectBySlug } from '@/db/project'
import { createServerClient } from '@/db/supabase-server'
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// Image metadata
export const alt = 'Project OpenGraph Image'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Image generation
export default async function Image({ params }: { params: { slug: string } }) {
  const supabase = createServerClient()
  const project = await getFullProjectBySlug(supabase, params.slug)
  if (!project) {
    return new Response('Not found', { status: 404 })
  }

  const readexProFont = await fetch(
    new URL('../../../public/ReadexPro-Regular.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer())

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div tw="bg-orange-100 w-full h-full flex flex-col items-center justify-center relative">
        <div tw="text-[60px] text-center px-20 mb-6">{project.title}</div>
        <div tw="flex text-[32px] text-gray-600">
          By {project.profiles.full_name}
        </div>
        <div tw="flex flex-row absolute bottom-5 left-5 text-[24px] text-gray-500 items-center">
          <img
            src="https://manifund.org/Manifox.png"
            width={32}
            height={32}
            tw="mr-2"
          />
          <span tw="text-orange-500">manifund.org</span>
          /projects/{project.slug}
        </div>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse's width and height.
      ...size,
      fonts: [
        {
          name: 'Readex Pro',
          data: readexProFont,
          style: 'normal',
          weight: 400,
        },
      ],
    }
  )
}
