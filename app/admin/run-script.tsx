'use client'
import { Button } from '@/components/button'

export function RunScript() {
  return (
    <Button
      onClick={async () => {
        // Change script here
        const response = await fetch('/api/acx-email-script', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }}
    >
      ACX email script
    </Button>
  )
}
