import 'server-only'

import SupabaseListener from '@/db/supabase-listener'
import SupabaseProvider from '@/db/supabase-provider'
import { createServerClient } from '@/db/supabase-server'
import './globals.css'
import Sidebar from './sidebar'
import { Poiret_One, Readex_Pro, Josefin_Slab } from '@next/font/google'
import BetaBanner from './beta-banner'
import { BottomNavBar } from './bottom-nav-bar'
import Script from 'next/script'

const readex = Readex_Pro({ subsets: ['latin'], variable: '--font-readex-pro' })
const poiret = Poiret_One({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-poiret-one',
})
const josefin = Josefin_Slab({
  subsets: ['latin'],
  variable: '--font-josefin-slab',
})
const fontVars = [readex.variable, poiret.variable, josefin.variable].join(' ')

// do not cache this layout
export const revalidate = 0

export const metadata = {
  title: {
    default: 'Manifund',
    template: '%s | Manifund',
  },
  description: 'A platform for funding impactful projects',
  icons: {
    icon: '/favicon.ico',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="en">
      {/*
      <head /> will contain the components returned by the nearest parent
      head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
    */}
      <head />
      <body
        className={`${fontVars} mx-auto mt-4 mb-20 min-h-screen w-full bg-gray-50 font-sans md:grid md:max-w-7xl md:grid-cols-12`}
      >
        <SupabaseProvider session={session}>
          {/* @ts-expect-error Server Component */}
          <Sidebar />
          <SupabaseListener serverAccessToken={session?.access_token} />
          <div className="mx-2 flex flex-1 flex-col md:col-span-8">
            {children}
          </div>
          {/* @ts-expect-error Server Component */}
          <BottomNavBar />
        </SupabaseProvider>
        <Script
          src="https://analytics.umami.is/script.js"
          data-website-id="5bd676d9-a4fd-4b50-bed5-b15a561c7374"
        />
      </body>
    </html>
  )
}
