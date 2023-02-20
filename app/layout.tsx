import 'server-only'

import SupabaseListener from '@/db/supabase-listener'
import SupabaseProvider from '@/db/supabase-provider'
import { createClient } from '@/db/supabase-server'
import './globals.css'
import Sidebar from './sidebar'
import { Poiret_One, Readex_Pro, Josefin_Slab } from '@next/font/google'

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

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
        className={`${fontVars} mx-auto mt-4 min-h-screen w-full bg-gray-50 font-sans lg:grid lg:grid-cols-12 lg:gap-x-2 xl:max-w-7xl xl:gap-x-8`}
      >
        <SupabaseProvider session={session}>
          {/* @ts-expect-error Server Component */}
          <Sidebar />
          <SupabaseListener serverAccessToken={session?.access_token} />
          <div className="flex flex-1 flex-col lg:col-span-8">{children}</div>
        </SupabaseProvider>
      </body>
    </html>
  )
}
