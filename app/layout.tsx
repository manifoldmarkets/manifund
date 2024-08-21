import 'server-only'

import SupabaseListener from '@/db/supabase-listener'
import SupabaseProvider from '@/db/supabase-provider'
import { createServerClient } from '@/db/supabase-server'
import './globals.css'
import Sidebar from './sidebar'
import { Readex_Pro, Josefin_Slab, Satisfy } from 'next/font/google'
import { BottomNavBar } from './bottom-nav-bar'
import Script from 'next/script'
import { CompleteProfileBanner } from '@/components/complete-profile-banner'
import { Toaster } from 'react-hot-toast'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Suspense } from 'react'

const readex = Readex_Pro({ subsets: ['latin'], variable: '--font-readex-pro' })
const josefin = Josefin_Slab({
  subsets: ['latin'],
  variable: '--font-josefin-slab',
})
const satisfy = Satisfy({
  subsets: ['latin'],
  variable: '--font-satisfy-regular',
  weight: '400',
})
const fontVars = [readex.variable, josefin.variable, satisfy.variable].join(' ')

export const runtime = 'edge'

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
    <html lang="en" className={fontVars}>
      <head />
      <body className="min-h-screen w-full bg-gray-50">
        <SupabaseProvider
          session={session}
          className={`mx-auto mb-20 w-full font-sans lg:grid lg:max-w-7xl lg:grid-cols-12 lg:gap-x-2 xl:max-w-7xl xl:gap-x-8`}
        >
          <Toaster />
          <Suspense fallback={null}>
            {/* @ts-expect-error Server Component */}
            <Sidebar />
          </Suspense>
          <SupabaseListener serverAccessToken={session?.access_token} />
          <main className="flex flex-col lg:col-span-8">
            <Suspense fallback={null}>
              {/* @ts-expect-error Server Component */}
              <CompleteProfileBanner user={session?.user} />
            </Suspense>
            {children}
          </main>
          <Suspense fallback={null}>
            {/* @ts-expect-error Server Component */}
            <BottomNavBar />
          </Suspense>
        </SupabaseProvider>
        <Script
          src="https://analytics.umami.is/script.js"
          data-website-id="5bd676d9-a4fd-4b50-bed5-b15a561c7374"
        />
        <SpeedInsights />
      </body>
    </html>
  )
}
