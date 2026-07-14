import { NextResponse } from 'next/server'
import { getURL } from '@/utils/constants'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
}

// Temporary diagnostic: reports what getURL() resolves to inside the deployed
// edge runtime and whether the internal hop to /api/score-project works.
// Read-only (empty body -> score-project 400s without doing work). Remove
// once the on-create scoring trigger is confirmed working.
export default async function handler() {
  const url = getURL()
  let hop: string
  try {
    const res = await fetch(`${url}api/score-project`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    hop = `${res.status} ${(await res.text()).slice(0, 200)}`
  } catch (error) {
    hop = `FETCH ERROR: ${String(error).slice(0, 300)}`
  }
  return NextResponse.json({
    getURL: url,
    optionalChained: process?.env?.NEXT_PUBLIC_SITE_URL ?? null,
    direct: process.env.NEXT_PUBLIC_SITE_URL ?? null,
    vercelUrl: process?.env?.NEXT_PUBLIC_VERCEL_URL ?? null,
    hop,
  })
}
