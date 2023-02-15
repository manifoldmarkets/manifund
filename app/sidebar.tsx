import { createClient, getUser } from '@/utils/supabase-server'
import React from 'react'

export default async function Sidebar() {
  const supabase = createClient()
  const user = await getUser(supabase)

  const navOptions = [{ name: 'Home', href: '/' }]

  return (
    <div className="sticky top-0 hidden divide-gray-300 self-start pl-2 lg:col-span-2 lg:flex">
      <nav aria-label="Sidebar" className="flex h-screen flex-col">
        <div>logo</div>
        <div className="height-6" />

        {user === undefined && <div className="h-[56px]" />}
        {user === null && <a href="/test">Login</a>}

        {user && <div>Profile Summary</div>}
        {user && <a href="/edit-profile">Edit Profile</a>}

        <div className="flex flex-col gap-1">
          {navOptions.map((item) => (
            <a href={item.href} key={item.href}>
              {item.name}
            </a>
          ))}

          <a href="/create">Create Impact Certificate</a>
        </div>
      </nav>
    </div>
  )
}
