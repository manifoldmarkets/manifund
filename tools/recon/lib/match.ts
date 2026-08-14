import { autoCategory } from './categorize'
import {
  AMOUNT_TOLERANCE,
  BankTxn,
  Match,
  NEVER_PLATFORM_MATCH,
  PlatformTxn,
} from './types'

const DAY = 86400000
const daysBetween = (a: string, b: string) =>
  (new Date(a.slice(0, 10)).getTime() - new Date(b.slice(0, 10)).getTime()) / DAY

const amountsClose = (a: number, b: number) => Math.abs(a - b) <= AMOUNT_TOLERANCE

let counter = 0
const newId = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${counter++}`

export type AutoMatchResult = {
  matches: Match[]
  categorized: { id: string; category: string }[]
  phaseCounts: Record<string, number>
  suggestions: Record<string, string[]> // bankTxnId -> ranked platform txn ids
}

// name-token overlap between a bank description and a platform profile
function nameScore(bankText: string, p: PlatformTxn): number {
  const tokens = (s: string) =>
    new Set(s.toLowerCase().split(/[^a-z]+/).filter((t) => t.length > 2))
  const bank = tokens(bankText)
  const profile = tokens(`${p.fullName} ${p.username}`)
  let overlap = 0
  for (const t of bank) if (profile.has(t)) overlap++
  return overlap
}

// direction-aware date window: platform event usually precedes the bank movement
function inWindow(bank: BankTxn, platform: PlatformTxn): boolean {
  const lag = daysBetween(bank.date, platform.created_at) // >0: platform first
  return lag >= -7 && lag <= 120
}

export function runAutoMatch(
  bankTxns: BankTxn[],
  platformTxns: PlatformTxn[],
  existingMatches: Match[]
): AutoMatchResult {
  const matchedBank = new Set(existingMatches.flatMap((m) => m.bankTxnIds))
  const matchedPlatform = new Set(existingMatches.flatMap((m) => m.platformTxnIds))
  const unmatchedBank = bankTxns.filter((t) => !t.matchId && !matchedBank.has(t.id))
  let openPlatform = platformTxns.filter((t) => !matchedPlatform.has(t.id))

  const result: AutoMatchResult = {
    matches: [],
    categorized: [],
    phaseCounts: { categorized: 0, internal_transfer: 0, stripe: 0, mercury: 0 },
    suggestions: {},
  }

  // Phase 1: categorize
  for (const t of unmatchedBank) {
    if (t.category) continue
    const cat = autoCategory(t)
    if (cat) {
      t.category = cat
      t.categorySource = 'auto'
      result.categorized.push({ id: t.id, category: cat })
      result.phaseCounts.categorized++
    }
  }

  const taken = new Set<string>()

  // Phase 2: internal transfers pair across accounts
  const internals = unmatchedBank.filter((t) => t.category === 'internal_transfer')
  for (const a of internals) {
    if (taken.has(a.id)) continue
    const partner = internals.find(
      (b) =>
        !taken.has(b.id) &&
        b.id !== a.id &&
        b.source !== a.source &&
        amountsClose(a.amount, -b.amount) &&
        Math.abs(daysBetween(a.date, b.date)) <= 3
    )
    if (partner) {
      taken.add(a.id)
      taken.add(partner.id)
      result.matches.push({
        id: newId('m'),
        kind: 'internal_transfer',
        bankTxnIds: [a.id, partner.id],
        platformTxnIds: [],
        createdAt: new Date().toISOString(),
      })
      result.phaseCounts.internal_transfer++
    }
  }

  const matchable = unmatchedBank.filter(
    (t) => !taken.has(t.id) && !(t.category && NEVER_PLATFORM_MATCH.has(t.category))
  )

  const claim = (bank: BankTxn, platform: PlatformTxn, phase: 'stripe' | 'mercury') => {
    taken.add(bank.id)
    openPlatform = openPlatform.filter((p) => p.id !== platform.id)
    result.matches.push({
      id: newId('m'),
      kind: 'auto',
      bankTxnIds: [bank.id],
      platformTxnIds: [platform.id],
      createdAt: new Date().toISOString(),
    })
    result.phaseCounts[phase]++
  }

  // Phase 3: stripe charges -> platform deposits by amount + email + <=3 days
  for (const t of matchable) {
    if (!t.source.startsWith('stripe') || t.amount <= 0) continue
    const email = (t.counterparty ?? '').toLowerCase()
    if (!email) continue
    const candidates = openPlatform.filter(
      (p) =>
        p.type === 'deposit' &&
        p.email.toLowerCase() === email &&
        amountsClose(p.amount, t.amount) &&
        Math.abs(daysBetween(t.date, p.created_at)) <= 3
    )
    if (candidates.length === 1) claim(t, candidates[0], 'stripe')
  }

  // Phase 4: bank <-> platform deposits/withdrawals
  // (stripe inflows are handled in phase 3; stripe OUTFLOWS are Connect transfers paying users)
  for (const t of matchable) {
    if (taken.has(t.id)) continue
    const isStripeTransfer = t.source.startsWith('stripe') && t.amount < 0
    if (t.source.startsWith('stripe') && !isStripeTransfer) continue
    const wantType = t.amount > 0 ? 'deposit' : 'withdraw'
    const candidates = openPlatform.filter(
      (p) => p.type === wantType && amountsClose(p.amount, Math.abs(t.amount)) && inWindow(t, p)
    )
    if (candidates.length === 1) {
      claim(t, candidates[0], 'mercury')
    } else if (candidates.length > 1) {
      if (isStripeTransfer) {
        // Connect transfers execute the moment the withdrawal txn is created — same-day wins
        const byLag = candidates
          .map((p) => ({ p, lag: Math.abs(daysBetween(t.date, p.created_at)) }))
          .sort((a, b) => a.lag - b.lag)
        if (byLag.length === 1 || byLag[0].lag < byLag[1].lag) claim(t, byLag[0].p, 'mercury')
        else result.suggestions[t.id] = byLag.map((s) => s.p.id)
        continue
      }
      const scored = candidates
        .map((p) => ({ p, score: nameScore(t.description, p) }))
        .sort((a, b) => b.score - a.score)
      if (scored[0].score > 0 && (scored.length === 1 || scored[0].score > scored[1].score)) {
        claim(t, scored[0].p, 'mercury')
      } else {
        result.suggestions[t.id] = scored.map((s) => s.p.id)
      }
    }
  }

  return result
}

// ranked suggestions for a single bank txn (used by the UI when a row is selected)
export function suggestFor(bank: BankTxn, openPlatform: PlatformTxn[]): string[] {
  const wantType = bank.amount > 0 ? 'deposit' : 'withdraw'
  const bankEmail = (bank.counterparty ?? '').toLowerCase()
  const bankLocal = bankEmail.includes('@') ? bankEmail.split('@')[0].replace(/[^a-z0-9]/g, '') : ''
  return openPlatform
    .filter((p) => p.type === wantType)
    .map((p) => {
      let score = 0
      const bankAbs = Math.abs(bank.amount)
      if (amountsClose(p.amount, bankAbs)) score += 10
      // large donations often carry a 5% fee: bank inflow ≈ platform credit × 1.05
      else if (bank.amount > 0 && Math.abs(bankAbs / 1.05 - p.amount) <= Math.max(1, p.amount * 0.001))
        score += 9
      if (inWindow(bank, p)) score += 3
      score += nameScore(bank.description, p)
      const pEmail = p.email.toLowerCase()
      if (bankEmail && pEmail) {
        if (pEmail === bankEmail) score += 8
        else {
          // fuzzy: shared local-part prefix (omotarita ~ omotara.edu3)
          const pLocal = pEmail.split('@')[0].replace(/[^a-z0-9]/g, '')
          let common = 0
          while (common < Math.min(bankLocal.length, pLocal.length) && bankLocal[common] === pLocal[common]) common++
          if (common >= 5) score += 4
        }
      }
      return { p, score }
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map((s) => s.p.id)
}
