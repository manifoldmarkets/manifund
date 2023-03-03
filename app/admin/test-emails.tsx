'use client'
import { Button } from '@/components/button'

export function TestEmail() {
  return (
    <Button
      onClick={async () => {
        const response = await fetch('/api/comment-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'test/json',
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
