'use client'
import { Button } from '@/components/button'

export function RunScript() {
  return (
    <Button
      disabled
      onClick={async () => {
        // Change script here
        const response = await fetch('/api/change-acx-close-dates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }}
    >
      Change ACX close dates
    </Button>
  )
}
