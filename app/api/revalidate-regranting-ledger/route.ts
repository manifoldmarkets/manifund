import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// revalidatePath is an App Router API and needs the Node runtime.
export const runtime = 'nodejs'

const LEDGER_PATH = '/about/regranting-data'

// Hourly cron (see vercel.json). The regranting ledger is statically prerendered
// with ISR, so with no organic traffic a rare visitor could be served a copy
// generated at the *previous* visit — potentially days stale. This runs every
// hour to invalidate and re-warm the page so the cached copy is never more than
// ~1hr behind, independent of who's looking. See app/about/regranting-data/page.tsx.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  revalidatePath(LEDGER_PATH)

  // revalidatePath only marks the page stale; without a reader nothing
  // regenerates. Fetch it to force a fresh copy into the cache now.
  await fetch(`https://manifund.org${LEDGER_PATH}`, { cache: 'no-store' }).catch((error) =>
    console.error('regranting-ledger warm fetch failed:', error)
  )

  return NextResponse.json({ revalidated: true, path: LEDGER_PATH })
}
