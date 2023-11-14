'use client'
import { Button } from '@/components/button'
import { Txn } from '@/db/txn'

export function CategorizeTxns(props: { txns: Txn[] }) {
  const { txns } = props
  return (
    <Button
      disabled
      onClick={async () => {
        const response = await fetch('/api/categorize-txns', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            txns,
          }),
        })
      }}
    >
      Categorize Txns
    </Button>
  )
}
