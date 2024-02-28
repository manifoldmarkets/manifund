'use client'
import { Button } from '@/components/button'

export function RunScript() {
  return (
    <Button
      onClick={async () => {
        // Change script here
        const response = await fetch('/api/acx-certs-email-script', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }}
    >
      Transfer ACX certs
    </Button>
  )
}
