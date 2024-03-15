'use client'
import { Button } from '@/components/button'

export function RunScript() {
  return (
    <Button
      onClick={async () => {
        // Change script here
        const response = await fetch('/api/backfill-grant-agreements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }}
    >
      Backfill grant agreements
    </Button>
  )
}
