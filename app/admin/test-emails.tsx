'use client'
import { Button } from '@/components/button'

export function TestEmail() {
  return (
    <Button
      onClick={async () => {
        const response = await fetch('/api/comment-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        })
        console.log(response)
      }}
    >
      Send Email to Rachel
    </Button>
  )
}
