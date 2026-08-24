import posthog from 'posthog-js'
// Bundle the replay recorder: fetching it at runtime gets adblocked by filename
import 'posthog-js/dist/posthog-recorder'
import { NEXT_PUBLIC_POSTHOG_KEY } from './db/env'

// NODE_ENV gate rather than isProd(): `bun run dev` uses prod Supabase but must not send analytics
if (process.env.NODE_ENV === 'production' && NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: '/flux', // reverse-proxied to PostHog via rewrites in next.config.js
    ui_host: 'https://us.posthog.com',
    defaults: '2026-08-29',
    persistence: 'memory', // nothing stored on device, so no cookie banner needed
    capture_pageleave: true,
    session_recording: {
      maskAllInputs: true,
      maskInputOptions: { password: true },
    },
  })
}
