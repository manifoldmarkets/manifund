import { NextResponse } from 'next/server'

// Temporary: verifies function egress routes through the static IPs. Delete before merge.
export const dynamic = 'force-dynamic'

export async function GET() {
  const ip = await fetch('https://checkip.amazonaws.com', { cache: 'no-store' }).then((r) =>
    r.text()
  )
  return NextResponse.json({ egressIp: ip.trim() })
}
