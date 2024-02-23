'use client'
import { Button } from '@/components/button'

export function RunScript() {
  return (
    <Button
      disabled
      onClick={async () => {
        // Change script here
        const response = await fetch('/api/email-mcf-creator', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }}
    >
      Email MCF creators
    </Button>
  )
}
