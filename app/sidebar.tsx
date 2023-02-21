import { createServerClient } from '@/db/supabase-server'
import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { getUser, getProfileById } from '@/db/profile'
import { SidebarItem } from './sidebar-item'

import { CreateProjectButton } from './create-project-button'

export default async function Sidebar() {
  const supabase = createServerClient()
  const user = await getUser(supabase)
  const profile = await getProfileById(supabase, user?.id)

  return (
    <div className="sticky top-0 mt-10 hidden h-full gap-1 self-start pl-2 md:col-span-3 md:flex">
      <nav aria-label="Sidebar" className="flex h-screen flex-col">
        <Link href="/">
          <div className="group flex flex-row items-center gap-1">
            <Image
              src="/Manifox.png"
              alt="Manifold Markets"
              className="-translate-y-2 transition-all group-hover:-translate-y-3"
              width={60}
              height={60}
            />
            <span className="bg-gradient-to-r from-orange-500  to-rose-400 bg-clip-text font-josefin text-4xl font-[650] text-transparent">
              Manifund
            </span>
          </div>
        </Link>
        <div className="h-6" />

        {user === undefined && <div className="h-[56px]" />}
        <SidebarItem item={{ name: 'Home', href: '/' }} />
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
        <SidebarItem item={{ name: 'About', href: '/about' }} />
        <CreateProjectButton />
      </nav>
    </div>
  )
}
