'use client'

import { loadUserPreferences } from '@/utils/preferences'
import { useEffect } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  // Load preferences as soon as the app mounts
  useEffect(() => {
    loadUserPreferences()
  }, [])

  return <>{children}</>
}
