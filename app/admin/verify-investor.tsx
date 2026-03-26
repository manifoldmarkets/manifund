'use client'

export type VerifyInvestorProps = {
  userId: string
  accredited: boolean
}

export function VerifyInvestor(props: { userId: string; accredited: boolean }) {
  const { userId } = props

  return (
    <button
      className="cursor-pointer text-sm leading-none"
      onClick={async () => {
        await verifyInvestor({ userId, accredited: !props.accredited })
        window.location.reload()
      }}
    >
      {props.accredited ? '✅' : '❌'}
    </button>
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
