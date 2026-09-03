// Mercury Bank API client. No SDK exists, so this is a thin fetch wrapper.
//
// Kept free of Node-only imports so it can be pulled into the edge-runtime
// Pages API routes. Signature verification lives in the webhook receiver
// instead, since that route runs on Node and needs the raw request body.

const MERCURY_API = 'https://api.mercury.com/api/v1'

// Env var names match the unmerged withdraw-mercury branch, in case those
// secrets are already set in Vercel.
export function hasMercuryKeys() {
  return Boolean(process.env.MERCURY_API_KEY) && Boolean(process.env.MERCURY_GRANTS_ACCOUNT_ID)
}

export type PaymentMethod = 'ach' | 'internationalWire'
export type InviteStatus = 'created' | 'completed' | 'expired'
export type ApprovalStatus = 'pendingApproval' | 'approved' | 'rejected' | 'cancelled'

export type RecipientInvite = {
  id: string
  status: InviteStatus
  onboardingUrl?: string
  recipientId?: string
  expiresAt?: string | null
}

export type SendMoneyRequest = {
  requestId: string
  status: ApprovalStatus
  amount: number
  recipientId: string
}

export type MercuryTransaction = {
  id: string
  status: string
  amount: number
  postedAt?: string | null
  note?: string | null
  externalMemo?: string | null
  counterpartyId?: string | null
  counterpartyName?: string | null
}

async function mercuryFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const apiKey = process.env.MERCURY_API_KEY
  if (!apiKey) throw new Error('Missing MERCURY_API_KEY')
  const res = await fetch(`${MERCURY_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
  if (!res.ok) {
    throw new Error(
      `Mercury ${init?.method ?? 'GET'} ${path} failed: ${res.status} ${await res.text()}`
    )
  }
  return (await res.json()) as T
}

function grantsAccountId() {
  const id = process.env.MERCURY_GRANTS_ACCOUNT_ID
  if (!id) throw new Error('Missing MERCURY_GRANTS_ACCOUNT_ID')
  return id
}

// Only ask for the method that applies: offering internationalWire to a US
// recipient makes Mercury's form demand an IBAN they don't have.
export async function createRecipientInvite(props: {
  name: string
  contactEmail: string
  paymentMethod: PaymentMethod
  requireTaxDocument: boolean
}) {
  const { name, contactEmail, paymentMethod, requireTaxDocument } = props
  return await mercuryFetch<RecipientInvite>('/recipients/invites', {
    method: 'POST',
    body: JSON.stringify({
      name,
      contactEmail,
      paymentMethods: [paymentMethod],
      requireTaxDocument,
      sendEmail: true,
      organizationNameOnRequest: 'Manifund',
    }),
  })
}

export async function getRecipientInvite(inviteId: string) {
  return await mercuryFetch<RecipientInvite>(`/recipients/invites/${inviteId}`)
}

// Mercury requires a purpose for both wire types. 'other' needs additionalInfo.
const WIRE_PURPOSE = {
  simple: { category: 'other', additionalInfo: 'Grant disbursement from Manifund' },
}

// Lands in Mercury's approval queue rather than sending: the "Send Money with
// Approval" scope needs no IP allowlist, which Vercel can't provide.
export async function requestSendMoney(props: {
  recipientId: string
  amount: number
  paymentMethod: PaymentMethod
  idempotencyKey: string
  withdrawalRequestId: string
}) {
  const { recipientId, amount, paymentMethod, idempotencyKey, withdrawalRequestId } = props
  return await mercuryFetch<SendMoneyRequest>(`/account/${grantsAccountId()}/request-send-money`, {
    method: 'POST',
    body: JSON.stringify({
      recipientId,
      amount,
      paymentMethod,
      idempotencyKey,
      purpose: WIRE_PURPOSE,
      // note is our machine key for matching the webhook back to a request;
      // externalMemo hits the recipient's bank statement, so keep it readable.
      note: `mfw:${withdrawalRequestId}`,
      externalMemo: 'Manifund grant',
    }),
  })
}

export async function listSendMoneyRequests() {
  const res = await mercuryFetch<{ requests?: SendMoneyRequest[] }>(
    `/request-send-money?accountId=${grantsAccountId()}`
  )
  return res.requests ?? []
}

export async function getTransaction(transactionId: string) {
  return await mercuryFetch<MercuryTransaction>(`/transactions/${transactionId}`)
}
