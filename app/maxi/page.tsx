import { getRecentFullBids } from '@/db/bid'
import { getRecentFullComments } from '@/db/comment'
import { listProjects } from '@/db/project'
import { createServerClient } from '@/db/supabase-server'
import { getRecentFullTxns } from '@/db/txn'

export default async function Maxifund() {
  const PAGE_SIZE = 20
  const start = 0

  const supabase = createServerClient()
  const [projects] = await Promise.all([listProjects(supabase)])
  const projectsToShow = projects.slice(0, 20)

  // Create a grid of images, 3 across
  return (
    <div>
      <div className="overflow-x-hidden">
        <h1 className="animate-marquee whitespace-nowrap py-12 text-8xl">
          {/* Repeat the word MAXIFUND 10 times */}
          {Array.from({ length: 30 }, (_, i) => (
            <span key={i}>MAXIFUND </span>
          ))}
        </h1>
      </div>
      <div className="grid grid-cols-3">
        {projectsToShow.map((project) => (
          <div
            className="group relative transition hover:z-10 hover:scale-[2]"
            key={project.id}
          >
            <a href={`/projects/${project.slug}`}>
              <img
                className="aspect-square w-full object-cover"
                alt={project.title}
                src={`https://source.unsplash.com/random/400x400&${project.id}`}
              />
              <div className="pointer-events-none absolute inset-0 flex items-end">
                <span className="h-24 w-full bg-gradient-to-t from-black to-transparent opacity-50" />
                <div className="absolute inset-0 flex items-center px-2">
                  <p className="text-center text-xl font-bold uppercase text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                    {project.title}
                  </p>
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
