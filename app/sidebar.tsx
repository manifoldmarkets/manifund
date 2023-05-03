import { createServerClient } from '@/db/supabase-server'
import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { getUser, getProfileById } from '@/db/profile'
import { SidebarItem } from './sidebar-item'
import { CreateProjectButton } from './create-project-button'
import { SUPABASE_ENV } from '@/db/env'
import { User } from '@supabase/supabase-js'
import { Avatar } from '@/components/avatar'
import { formatMoney } from '@/utils/formatting'
import { calculateUserBalance } from '@/utils/math'
import { getTxnsByUser } from '@/db/txn'

export default async function Sidebar() {
  const supabase = createServerClient()
  const user = await getUser(supabase)

  return (
    <>
      <nav
        aria-label="Sidebar"
        className="sticky top-0 hidden max-h-[100vh] divide-gray-300 self-start pt-10 pl-2 pr-2 md:col-span-3 md:flex md:flex-col"
      >
        <Link href="/">
          <div className="group flex flex-row items-center gap-1">
            <Image
              src="/Manifox.png"
              alt="Manifund fox"
              className="-translate-y-2 transition-all group-hover:-translate-y-3"
              width={60}
              height={60}
            />
            <span className="bg-gradient-to-r from-orange-500  to-rose-400 bg-clip-text font-josefin text-4xl font-[650] text-transparent">
              {SUPABASE_ENV === 'PROD' ? 'Manifund' : 'Devifund'}
            </span>
          </div>
        </Link>
        <div className="h-6" />
        {/* @ts-expect-error Server Component */}
        {user && <ProfileSummary user={user} />}
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
        <SidebarItem item={{ name: 'About', href: '/about' }} />
        <SidebarItem item={{ name: 'Charity', href: '/charity' }} />
        <SidebarItem
          item={{ name: 'Discord', href: 'https://discord.gg/zPnPtx6jBS' }}
        />
        <CreateProjectButton />
      </nav>
    </>
  )
}

export async function ProfileSummary(props: { user: User }) {
  const { user } = props
  const supabase = createServerClient()
  const profile = await getProfileById(supabase, user.id)
  if (profile === null) return null
  const txns = await getTxnsByUser(supabase, user.id)
  return (
    <div className="group mb-3 flex flex-row items-center gap-2 truncate rounded-md py-3 px-1 text-gray-600 hover:bg-gray-100 hover:text-gray-800">
      <Avatar username={profile.username} avatarUrl={profile.avatar_url} />
      <Link href={`/${profile.username}`} className="truncate">
        <div className="font-medium">{profile.full_name}</div>
        <div className="text-sm">
          {formatMoney(calculateUserBalance(txns, profile.id))}
        </div>
      </Link>
    </div>
  )
}
