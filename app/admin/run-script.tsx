'use client'
import { Button } from '@/components/button'

export function RunScript() {
  return (
    <Button
      // disabled
      onClick={async () => {
        // Change script here
        const response = await fetch('/api/add-all-followers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }}
    >
      Add followers
    </Button>
  )
}
