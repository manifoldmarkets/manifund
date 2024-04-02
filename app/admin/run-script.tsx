'use client'
import { Button } from '@/components/button'

export function RunScript() {
  return (
    <Button
      onClick={async () => {
        // Change script here
        const response = await fetch('/api/fix-txn-type-labels', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }}
    >
      Fix old txn type labels
    </Button>
  )
}
