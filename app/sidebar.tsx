import { createClient, getUser } from '@/utils/supabase-server'
import React from 'react'
import { CreateProjectButton } from './create-project-button'

export default async function Sidebar() {
  const supabase = createClient()
  const user = await getUser(supabase)

  const navOptions = [
    { name: 'Home', href: '/' },
    { name: 'Projects', href: '/projects' },
  ]

  return (
    <div className="sticky top-0 hidden divide-gray-300 self-start pl-2 lg:col-span-2 lg:flex">
      <nav aria-label="Sidebar" className="flex h-screen flex-col">
        <div>logo</div>
        <div className="height-6" />

        {user === undefined && <div className="h-[56px]" />}
        {user === null && <a href="/login">Login</a>}

        {user && <div>Profile Summary</div>}
        {user && <a href="/edit-profile">Edit Profile</a>}

        <div className="flex flex-col gap-1">
          {navOptions.map((item) => (
            <a href={item.href} key={item.href}>
              {item.name}
            </a>
          ))}

          <CreateProjectButton />
        </div>
      </nav>
    </div>
  )
}
