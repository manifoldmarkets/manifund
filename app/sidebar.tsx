import { createServerClient } from '@/db/supabase-server'
import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { getUser, getProfileById, Profile } from '@/db/profile'
import { SidebarItem } from './sidebar-item'
import { SUPABASE_ENV } from '@/db/env'
import { Avatar } from '@/components/avatar'
import { formatMoney } from '@/utils/formatting'
import { calculateUserBalance } from '@/utils/math'
import { getTxnsByUser } from '@/db/txn'
import { buttonClass } from '@/components/button'
import clsx from 'clsx'
import { Row } from '@/components/layout/row'
import {
  AirtableDepositButton,
  StripeDepositButton,
} from '@/components/deposit-buttons'

export const revalidate = 30
export default async function Sidebar() {
  const supabase = createServerClient()
  const user = await getUser(supabase)
  const profile = user ? await getProfileById(supabase, user.id) : null
  const isRegranter = profile?.regranter_status
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
        {profile && <ProfileSummary profile={profile} />}
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
          item={{ name: 'Discord', href: 'https://discord.gg/ZGsDMWSA5Q' }}
        />
        <SidebarItem
          item={{
            name: 'Substack',
            href: 'https://manifund.substack.com/',
          }}
        />
        {user && (
          <Link
            href={isRegranter ? '/create-grant' : '/create'}
            className={clsx(
              buttonClass('xl', 'gradient'),
              'mt-4 w-full bg-gradient-to-r'
            )}
          >
            {isRegranter ? 'Give a Grant' : 'Create a Project'}
          </Link>
        )}
      </nav>
    </>
  )
}

export async function ProfileSummary(props: { profile: Profile }) {
  const { profile } = props
  const supabase = createServerClient()
  const txns = await getTxnsByUser(supabase, profile.id)
  return (
    <div className="group mb-3 flex flex-row items-center gap-2 truncate rounded-md py-3 px-1 text-gray-600 hover:bg-gray-100 hover:text-gray-800">
      <Avatar username={profile.username} avatarUrl={profile.avatar_url} />
      <Link href={`/${profile.username}`} className="truncate">
        <div className="font-medium">{profile.full_name}</div>
        <Row className="gap-2 py-0.5 text-sm">
          {formatMoney(calculateUserBalance(txns, profile.id))}
          {profile.accreditation_status ? (
            <AirtableDepositButton small />
          ) : (
            <StripeDepositButton userId={profile.id} small />
          )}
        </Row>
      </Link>
    </div>
  )
}
