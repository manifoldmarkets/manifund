import 'server-only'

import SupabaseListener from '@/db/supabase-listener'
import SupabaseProvider from '@/db/supabase-provider'
import { createServerSupabaseClient } from '@/db/supabase-server'
import './globals.css'
import Sidebar from './sidebar'
import { Readex_Pro, Josefin_Slab, Satisfy } from 'next/font/google'
import { BottomNavBar } from './bottom-nav-bar'
import Script from 'next/script'
import { CompleteProfileBanner } from '@/components/complete-profile-banner'
import { Toaster } from 'react-hot-toast'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Suspense } from 'react'
import { OAuthCodeHandler } from '@/components/oauth-code-handler'

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
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return (
    <html lang="en" className={fontVars}>
      <head />
      <body className="min-h-screen w-full bg-gray-50">
        <SupabaseProvider
          user={user}
          className={`mx-auto mb-20 w-full font-sans lg:grid lg:max-w-7xl lg:grid-cols-12 lg:gap-x-2 xl:max-w-7xl xl:gap-x-8`}
        >
          <Toaster />
          <Suspense fallback={null}>
            <Sidebar />
          </Suspense>
          <SupabaseListener serverAccessToken={user?.id} />
          <main className="flex flex-col lg:col-span-8">
            <Suspense fallback={null}>
              <CompleteProfileBanner />
            </Suspense>
            {children}
          </main>
          <Suspense fallback={null}>
            <BottomNavBar />
          </Suspense>
          <OAuthCodeHandler />
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
