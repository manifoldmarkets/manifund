import { getProfileById, getUser } from '@/db/profile'
import { createServerClient } from '@/db/supabase-server'
import { NavBarItem } from './bottom-nav-bar-item'

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
  const navigationOptions = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Profile', href: user ? `/${profile?.username}` : '/login' },
    {
      name: 'Discord',
      href: 'https://discord.gg/zPnPtx6jBS',
    },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex select-none items-center justify-between border-t-2 bg-white text-xs text-gray-700 md:hidden">
      {navigationOptions.map((item) => (
        <NavBarItem key={item.name} item={item} />
      ))}
    </nav>
  )
}
