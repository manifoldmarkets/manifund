import posthog from 'posthog-js'
import { NEXT_PUBLIC_POSTHOG_KEY } from './db/env'

// Gate on NODE_ENV, not isProd(): `bun run dev` uses prod Supabase but must not send analytics.
// The key is only set in Vercel's Production environment, so preview deploys are excluded too.
if (process.env.NODE_ENV === 'production' && NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(NEXT_PUBLIC_POSTHOG_KEY, {
    // First-party reverse proxy (see rewrites in next.config.js) so adblockers don't block capture
    api_host: '/flux',
    ui_host: 'https://us.posthog.com',
    defaults: '2026-08-29',
    // Nothing is stored on the user's device, so no cookie consent banner is needed.
    // Anonymous visitors get a new id per hard page load; logged-in users are stitched via identify().
    persistence: 'memory',
    capture_pageleave: true,
    session_recording: {
      maskAllInputs: true,
      maskInputOptions: { password: true },
    },
  })
}
