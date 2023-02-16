import { createClient, getUser } from '@/utils/supabase-server'
import Link from 'next/link'
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
        {user === null && <Link href="/login">Login</Link>}

        {user && <div>Profile Summary</div>}
        {user && <Link href="/edit-profile">Edit Profile</Link>}

        <div className="flex flex-col gap-1">
          {navOptions.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.name}
            </Link>
          ))}

          <CreateProjectButton />
        </div>
      </nav>
    </div>
  )
}
