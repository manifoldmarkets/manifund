import 'server-only'

import SupabaseListener from '../components/supabase-listener'
import SupabaseProvider from '../components/supabase-provider'
import './globals.css'
import { createClient } from '../utils/supabase-server'
import Sidebar from './sidebar'
import { Readex_Pro } from '@next/font/google'
import clsx from 'clsx'

const readex = Readex_Pro({ subsets: ['latin'], variable: '--font-readex-pro' })

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
        className={`${readex.variable} font-sans mx-auto min-h-screen w-full lg:grid lg:grid-cols-12 lg:gap-x-2 xl:max-w-7xl xl:gap-x-8`}
      >
        <SupabaseProvider session={session}>
          {/* @ts-expect-error Server Component */}
          <Sidebar />
          <SupabaseListener serverAccessToken={session?.access_token} />
          <div className="flex flex-col flex-1 lg:col-span-8">{children}</div>
        </SupabaseProvider>
      </body>
    </html>
  )
}
