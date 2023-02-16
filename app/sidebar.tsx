import { createClient, getUser } from '@/db/supabase-server'
import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import getProfileById from '@/db/profile'

import { CreateProjectButton } from './create-project-button'

export default async function Sidebar() {
  const supabase = createClient()
  const user = await getUser(supabase)
  const profile = await getProfileById(supabase, user?.id)

  const navOptions = [{ name: 'Projects', href: '/projects' }]

  return (
    <div className="sticky top-0 hidden divide-gray-300 self-start pl-2 lg:col-span-2 lg:flex">
      <nav aria-label="Sidebar" className="flex h-screen flex-col">
        <Link href="/">
          <div className="flex flex-row text-xl text-orange-600 items-center gap-4">
            <Image
              src="https://manifold.markets/logo.png"
              alt="Manifold Markets"
              width={60}
              height={60}
            />
            Manifund
          </div>
        </Link>
        <div className="h-6" />

        {user === undefined && <div className="h-[56px]" />}
        {user === null && <Link href="/login">Login</Link>}

        {/* {user && <div>Profile Summary</div>} */}
        {user && <Link href={`/${profile.username}`}>Profile</Link>}

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
