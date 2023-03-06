'use client'

import { Button } from '@/components/button'
import { useRouter } from 'next/navigation'

export type VerifyInvestorProps = {
  userId: string
  accredited: boolean
}

export function VerifyInvestor(props: { userId: string; accredited: boolean }) {
  const { userId } = props
  const router = useRouter()

  return (
    <Button
      onClick={async () => {
        await verifyInvestor({ userId, accredited: !props.accredited })
        router.refresh()
      }}
    >
      {props.accredited ? '✅' : '❌'}
    </Button>
  )
}

async function verifyInvestor(props: VerifyInvestorProps) {
  await fetch('/api/verify-investor', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(props),
  })
}
