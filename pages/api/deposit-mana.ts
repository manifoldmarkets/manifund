import { getUser } from '@/db/profile'
import { createEdgeClient } from '@/pages/api/_db'
import { NextRequest, NextResponse } from 'next/server'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

// Manifold user ID for hi@manifund.org
const MANAGRAM_DEST_ID = 'pyBueUg9y3hrDIUtrus5uAkPHCr1'

export type DepositManaProps = {
  manifoldApiKey: string
  manaToDeposit: number
}
export default async function handler(req: NextRequest) {
  const { manifoldApiKey, manaToDeposit } =
    (await req.json()) as DepositManaProps
  const supabase = createEdgeClient(req)
  const user = await getUser(supabase)
  if (!user) {
    return NextResponse.json({ error: 'no user' }, { status: 400 })
  }
  // 1. Make the managram
  const response = await fetch('https://manifold.markets/api/v0/managram', {
    method: 'POST',
    headers: {
      Authorization: `Key ${manifoldApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      toIds: [MANAGRAM_DEST_ID], // This expects an array of IDs
      amount: manaToDeposit,
      message: `mana => Manifund for user id ${user.id}`,
    }),
  })
  // If the managram fails, return an error
  if (!response.ok) {
    const errorJson = await response.json()
    return NextResponse.json(
      { error: `Mana transfer failed: ${errorJson.message}` },
      { status: 400 }
    )
  }

  // 2. If successful, create a txn adding that much money to the user's account
  await supabase
    .from('txns')
    .insert({
      from_id: process.env.NEXT_PUBLIC_PROD_BANK_ID ?? '',
      to_id: user.id,
      amount: manaToDeposit / 100,
      token: 'USD',
      project: null,
      type: 'mana deposit',
    })
    .throwOnError()

  return NextResponse.json({ message: 'Mana deposited' })
}
