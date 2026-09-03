// State machine shared by the Mercury withdrawal routes: the request endpoint,
// the hourly sync cron, the nudge cron, and the webhook. Side effects (email,
// Discord) live here so no two routes can disagree about what a transition means.

import { SupabaseClient } from '@supabase/supabase-js'
import { WithdrawalRequest } from '@/db/withdrawal-request'
import { getUserEmail, sendTemplateEmail, TEMPLATE_IDS } from '@/utils/email'
import { sendDiscordAlert } from '@/utils/discord'
import {
  getRecipientInvite,
  listSendMoneyRequests,
  PaymentMethod,
  requestSendMoney,
} from '@/utils/mercury'

const REQUEST_URL = 'https://manifund.org/withdraw/request'

function methodLabel(paymentMethod: string) {
  return paymentMethod === 'internationalWire' ? 'International wire' : 'Bank transfer (ACH)'
}

async function patch(admin: SupabaseClient, id: string, fields: Record<string, unknown>) {
  await admin
    .from('withdrawal_requests')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .throwOnError()
}

// Queue the payment for approval in Mercury. Reuses the stored idempotency key
// so a retry after a timeout can't double-pay.
export async function submitSendMoney(admin: SupabaseClient, request: WithdrawalRequest) {
  const recipientId = request.mercury_recipient_id
  if (!recipientId) throw new Error(`No recipient on withdrawal request ${request.id}`)
  const sent = await requestSendMoney({
    recipientId,
    amount: Number(request.amount),
    paymentMethod: request.payment_method as PaymentMethod,
    idempotencyKey: request.idempotency_key,
    withdrawalRequestId: request.id,
  })
  await patch(admin, request.id, {
    status: 'pending_approval',
    mercury_request_id: sent.requestId,
    submitted_at: new Date().toISOString(),
  })
  return sent
}

// Undo a withdrawal that will never be paid: delete the reserving txn so the
// money reappears in the grantee's balance, then tell them.
//
// A DELETE rather than a compensating deposit -- a 'deposit' row from the bank
// account is indistinguishable from a real donation and would corrupt receipts,
// the admin transactions view, and tools/recon.
export async function reverseWithdrawalRequest(
  admin: SupabaseClient,
  request: WithdrawalRequest,
  status: 'failed' | 'rejected',
  reason: string
) {
  if (request.txn_id) {
    await admin.from('txns').delete().eq('id', request.txn_id).throwOnError()
  }
  await patch(admin, request.id, { status, failure_reason: reason })

  const email = await getUserEmail(admin, request.profile_id)
  if (email) {
    await sendTemplateEmail(
      TEMPLATE_IDS.GENERIC_NOTIF,
      {
        notifText:
          `Your withdrawal of $${Number(request.amount).toLocaleString()} didn't go through (${reason}). ` +
          `The money is back in your Manifund account and you can request it again whenever you like.`,
        buttonUrl: REQUEST_URL,
        buttonText: 'Try again',
        subject: 'Manifund: your withdrawal was not completed',
      },
      undefined,
      email
    )
  }
  await sendDiscordAlert(
    `⚠️ Withdrawal reversed for ${request.profile_id}: $${request.amount}, ${reason} (request ${request.id})`
  )
}

export async function markSent(
  admin: SupabaseClient,
  request: WithdrawalRequest,
  sentAt: string,
  transactionId?: string
) {
  await patch(admin, request.id, {
    status: 'sent',
    sent_at: sentAt,
    ...(transactionId ? { mercury_transaction_id: transactionId } : {}),
  })
  const email = await getUserEmail(admin, request.profile_id)
  if (email) {
    await sendTemplateEmail(
      TEMPLATE_IDS.CONFIRM_WITHDRAWAL,
      {
        amount: Number(request.amount),
        id: request.id,
        methodText: methodLabel(request.payment_method),
        fullName: '',
        email,
      },
      undefined,
      email
    )
  }
}

// One open request, advanced as far as it can go. Safe to call repeatedly.
export async function syncWithdrawalRequest(admin: SupabaseClient, request: WithdrawalRequest) {
  if (request.status === 'awaiting_recipient') {
    if (!request.mercury_invite_id) return
    const invite = await getRecipientInvite(request.mercury_invite_id)
    if (invite.status === 'expired') {
      await reverseWithdrawalRequest(admin, request, 'failed', 'bank details were never submitted')
      return
    }
    if (invite.status !== 'completed' || !invite.recipientId) return

    // Cache on the profile too, so their next withdrawal skips onboarding.
    await admin
      .from('profiles')
      .update({ mercury_recipient_id: invite.recipientId })
      .eq('id', request.profile_id)
      .throwOnError()
    await patch(admin, request.id, {
      status: 'ready_to_pay',
      mercury_recipient_id: invite.recipientId,
    })
    await submitSendMoney(admin, { ...request, mercury_recipient_id: invite.recipientId })
    return
  }

  if (request.status === 'ready_to_pay') {
    await submitSendMoney(admin, request)
    return
  }

  if (request.status === 'pending_approval') {
    if (!request.mercury_request_id) return
    const all = await listSendMoneyRequests()
    const match = all.find((r) => r.requestId === request.mercury_request_id)
    if (!match) return
    if (match.status === 'approved') {
      await markSent(admin, request, new Date().toISOString())
    } else if (match.status === 'rejected' || match.status === 'cancelled') {
      await reverseWithdrawalRequest(
        admin,
        request,
        'rejected',
        `payment ${match.status} in Mercury`
      )
    }
  }
}
