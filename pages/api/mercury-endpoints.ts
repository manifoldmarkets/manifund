import { NextApiRequest, NextApiResponse } from 'next'
import { Readable } from 'node:stream'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { createAdminClient } from '@/db/edge'
import { WithdrawalRequest } from '@/db/withdrawal-request'
import { getTransaction } from '@/utils/mercury'
import { markSent, reverseWithdrawalRequest } from '@/utils/mercury-withdrawals'
import { sendDiscordAlert } from '@/utils/discord'

// Node runtime (no `runtime` declaration) because the signature covers the raw
// request body. Same shape as pages/api/stripe-endpoints.ts.
export const config = {
  api: {
    bodyParser: false,
  },
}
async function buffer(readable: Readable) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

const MAX_SIGNATURE_AGE_SECONDS = 300
const FAILED_TRANSACTION_STATUSES = ['failed', 'returned', 'cancelled']

// Header format is `t=<unix seconds>,v1=<hex hmac>`; the signed message is
// `<timestamp>.<raw body>`.
function verifySignature(rawBody: Buffer, header: string | undefined, secret: string) {
  if (!header) return false
  const parts = Object.fromEntries(
    header.split(',').map((piece) => {
      const [key, ...rest] = piece.trim().split('=')
      return [key, rest.join('=')]
    })
  )
  const timestamp = Number(parts.t)
  const provided = parts.v1
  if (!timestamp || !provided) return false
  if (Math.abs(Date.now() / 1000 - timestamp) > MAX_SIGNATURE_AGE_SECONDS) return false

  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody.toString('utf8')}`)
    .digest('hex')
  if (provided.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
}

type MercuryEvent = {
  resourceType?: string
  resourceId?: string
  mergePatch?: { status?: string; postedAt?: string | null }
}

// Enrichment only: mercury-sync decides whether a withdrawal is sent. This
// exists for the one thing the approval poll can't see -- a wire that was
// approved and then returned by the receiving bank, which would otherwise leave
// the request looking fine forever.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const secret = process.env.MERCURY_WEBHOOK_SECRET
  if (!secret) return res.status(503).send('Mercury webhook not configured')

  const buf = await buffer(req)
  if (!verifySignature(buf, req.headers['mercury-signature'] as string, secret)) {
    await sendDiscordAlert('🚨 Mercury webhook signature verification failed')
    return res.status(400).send('Invalid signature')
  }

  let event: MercuryEvent
  try {
    event = JSON.parse(buf.toString('utf8'))
  } catch {
    return res.status(400).send('Invalid JSON')
  }

  if (event.resourceType !== 'transaction' || !event.resourceId) {
    return res.status(200).send('success')
  }

  const supabaseAdmin = createAdminClient()
  try {
    // The payload is a merge patch, so fetch the transaction for its own fields.
    const txn = await getTransaction(event.resourceId)
    const request = await matchRequest(supabaseAdmin, txn)
    if (!request) {
      await sendDiscordAlert(
        `⚠️ Mercury transaction ${event.resourceId} ($${txn.amount}) didn't match any withdrawal request`
      )
      return res.status(200).send('success')
    }

    if (FAILED_TRANSACTION_STATUSES.includes(txn.status)) {
      await reverseWithdrawalRequest(
        supabaseAdmin,
        request,
        'failed',
        `the bank returned the payment (${txn.status})`
      )
      await sendDiscordAlert(
        `🚨 Mercury payment returned: $${request.amount} for ${request.profile_id} (request ${request.id})`
      )
    } else if (event.mergePatch?.status === 'sent') {
      const sentAt = event.mergePatch.postedAt ?? txn.postedAt ?? new Date().toISOString()
      if (request.status === 'sent') {
        // Already handled by the poll; just record the precise timestamp and id.
        await supabaseAdmin
          .from('withdrawal_requests')
          .update({ sent_at: sentAt, mercury_transaction_id: txn.id })
          .eq('id', request.id)
          .throwOnError()
      } else {
        await markSent(supabaseAdmin, request, sentAt, txn.id)
      }
    }
  } catch (e) {
    console.error('mercury webhook failed', event.resourceId, e)
    await sendDiscordAlert(`⚠️ Mercury webhook error on ${event.resourceId}: ${e}`)
  }

  return res.status(200).send('success')
}

// Primary key is the `note` we stamp on request-send-money. Falls back to
// recipient + amount, which the one-active-request-per-profile index keeps
// unambiguous. Never guesses beyond that.
async function matchRequest(
  supabaseAdmin: any,
  txn: { id: string; note?: string | null; amount: number; counterpartyId?: string | null }
) {
  const noteId = txn.note?.match(/mfw:([0-9a-f-]{36})/i)?.[1]
  if (noteId) {
    const { data } = await supabaseAdmin
      .from('withdrawal_requests')
      .select('*')
      .eq('id', noteId)
      .maybeSingle()
    if (data) return data as WithdrawalRequest
  }
  if (!txn.counterpartyId) return null
  const { data } = await supabaseAdmin
    .from('withdrawal_requests')
    .select('*')
    .eq('mercury_recipient_id', txn.counterpartyId)
    .eq('amount', Math.abs(txn.amount))
    .in('status', ['pending_approval', 'sent'])
    .order('requested_at', { ascending: false })
    .limit(2)
  const rows = (data ?? []) as WithdrawalRequest[]
  return rows.length === 1 ? rows[0] : null
}
