import { getProfileById, getUser } from '@/db/profile'
import { createServerClient } from '@/db/supabase-server'
import clsx from 'clsx'
import { NavBarItem } from './bottom-nav-bar-item'
import Link from 'next/link'
import { Avatar } from '@/components/avatar'
import { Col } from '@/components/layout/col'
import { calculateUserBalance } from '@/utils/math'
import { getTxnsByUser } from '@/db/txn'
import { formatLargeNumber, formatMoney } from '@/utils/formatting'

export const BOTTOM_NAV_BAR_HEIGHT = 58

export type Item = {
  name: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
}

export async function BottomNavBar() {
  const supabase = createServerClient()
  const user = await getUser(supabase)
  const profile = await getProfileById(supabase, user?.id)
  const txns = await getTxnsByUser(supabase, user?.id as string)
  const navigationOptions = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    {
      name: user ? 'Profile' : 'Login',
      href: user ? `/${profile?.username}` : '/login',
    },
    {
      name: 'Discord',
      href: 'https://discord.gg/zPnPtx6jBS',
    },
    {
      name: 'Create',
      href: '/create',
    },
  ]
  const navOptionsDisplay = navigationOptions.map((item) => {
    if (item.name === 'Profile' && profile !== null) {
      return (
        <Link
          key={item.name}
          href={item.href ?? '#'}
          className="block w-full py-1 px-3 text-center transition-colors sm:hover:bg-gray-200 sm:hover:text-orange-600"
        >
          <Col>
            <div className="mx-auto my-1">
              <Avatar
                size={6}
                username={profile.username}
                avatarUrl={profile.avatar_url}
                // avatarUrl={user.avatarUrl}
                noLink
              />
            </div>
            <p className="text-center">
              {formatMoney(calculateUserBalance(txns, profile.id))}{' '}
            </p>
          </Col>
        </Link>
      )
    } else {
      return <NavBarItem key={item.name} item={item} />
    }
  })
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex select-none items-center justify-between border-t-2 bg-white text-xs text-gray-700 md:hidden">
      {navOptionsDisplay}
    </nav>
  )
}
