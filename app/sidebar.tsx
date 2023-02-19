import { createClient, getUser } from '@/db/supabase-server'
import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import getProfileById from '@/db/profile'
import { SidebarItem } from './sidebar-item'

import { CreateProjectButton } from './create-project-button'

export default async function Sidebar() {
  const supabase = createClient()
  const user = await getUser(supabase)
  const profile = await getProfileById(supabase, user?.id)

  return (
    <div className="sticky top-0 hidden self-start pl-2 lg:col-span-3 lg:flex gap-1 h-full">
      <nav aria-label="Sidebar" className="flex h-screen flex-col">
        <Link href="/">
          <div className="flex flex-row text-xl font-bold text-orange-500 items-center gap-4">
            <Image
              src="/Manifox.png"
              alt="Manifold Markets"
              width={60}
              height={60}
            />
            Manifund
          </div>
        </Link>
        <div className="h-6" />

        {user === undefined && <div className="h-[56px]" />}
        {user === null && (
          <SidebarItem
            item={{
              name: 'Login',
              href: `/login`,
            }}
          />
        )}

        {user && (
          <SidebarItem
            item={{
              name: 'Profile',
              href: `/${profile.username}`,
            }}
          />
        )}
        <SidebarItem item={{ name: 'Projects', href: '/projects' }} />
        <SidebarItem item={{ name: 'About', href: '/about' }} />
        <CreateProjectButton />
      </nav>
    </div>
  )
}
