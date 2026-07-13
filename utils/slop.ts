// Client-safe constants and helpers for slop detection.
// Scoring itself lives in app/utils/project-scores.ts (server-only deps).

import { FullProject } from '@/db/project'
import { getAmountRaised } from './math'

// Pangram fraction_ai at or above this marks a project as likely AI-written,
// which hides it from the default feed and shows a flag on its card/page.
export const SLOP_AI_FRACTION_THRESHOLD = 0.5

// Projects that raised more than this are never hidden by the slop filter -
// someone put real money behind them
export const SLOP_FUNDING_EXEMPTION_DOLLARS = 100

export function isLikelyAiWritten(aiFraction: number | null | undefined): boolean {
  return aiFraction != null && aiFraction >= SLOP_AI_FRACTION_THRESHOLD
}

// Flagged as AI-written, unless real money is behind it
export function isSlopProject(project: FullProject): boolean {
  return (
    isLikelyAiWritten(project.ai_fraction) &&
    getAmountRaised(project, project.bids, project.txns) <= SLOP_FUNDING_EXEMPTION_DOLLARS
  )
}
