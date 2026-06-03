// ============================================================================
// HISTORICAL RECORD — one-off repair, run once against production 2026-06-02.
// ----------------------------------------------------------------------------
// Why this existed:
//
// The `execute_grant_verdict` Postgres function (run whenever an admin approves
// a project) declared `#variable_conflict use_variable` and contained:
//
//     UPDATE grant_agreements
//     SET approved_at = NOW(), approved_by = admin_id
//     WHERE project_id = project_id;   -- both sides resolve to the PARAMETER
//
// Because of `use_variable`, the unqualified column `project_id` resolved to the
// function parameter on BOTH sides of the WHERE, so the condition was always
// TRUE. Every single grant approval therefore re-stamped approved_at = NOW() and
// approved_by = <the latest approver> onto EVERY row in grant_agreements.
//
// User-visible symptom: the charity signatory date (and name) on every project's
// /agreement page always showed ~today's date and the most recent approver,
// instead of that grant's real approval date/approver. All 1142 non-null
// approved_at values had collapsed to a single day (2026-06-01).
//
// The function bug was fixed in migration:
//   supabase/migrations/20260602000000_fix_grant_verdict_project_id_conflict.sql
// (qualifies the column: WHERE grant_agreements.project_id = execute_grant_verdict.project_id)
//
// This script repaired the already-corrupted data. The true historical approval
// timestamps were unrecoverable, so we approximated approved_at from the
// recipient's signed_at (the two events are normally close in time). Repair rules:
//   - approved project + has signed_at -> approved_at = signed_at  (leave approved_by)
//   - approved project + no signed_at  -> approved_at = NULL
//   - not approved                     -> approved_at = NULL, approved_by = NULL
//
// Result: 363 rows set from signed_at, 7 approved-but-unsigned cleared, 776
// non-approved cleared. approved_at then spanned 237 distinct days (2023→2026).
//
// IMPORTANT: this is a destructive, already-completed migration. Do not re-run it
// unless the corruption recurs (which it should not, now that the function is
// fixed). Run with --dry-run first to inspect counts.
// ============================================================================
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env' })

const DRY_RUN = process.argv.includes('--dry-run')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  const { data: agreements } = await supabase
    .from('grant_agreements')
    .select('project_id, signed_at')
    .throwOnError()
  const rows = agreements ?? []

  const ids = rows.map((r) => r.project_id)
  const approvedById = new Map<string, boolean>()
  for (let i = 0; i < ids.length; i += 150) {
    const { data: projects } = await supabase
      .from('projects')
      .select('id, approved')
      .in('id', ids.slice(i, i + 150))
      .throwOnError()
    for (const p of projects ?? []) approvedById.set(p.id, p.approved === true)
  }

  const approvedWithSigned: { project_id: string; signed_at: string }[] = []
  const approvedNoSigned: string[] = []
  const notApproved: string[] = []
  for (const r of rows) {
    const approved = approvedById.get(r.project_id) ?? false
    if (!approved) notApproved.push(r.project_id)
    else if (r.signed_at) approvedWithSigned.push({ project_id: r.project_id, signed_at: r.signed_at })
    else approvedNoSigned.push(r.project_id)
  }

  console.log('total:', rows.length)
  console.log('approved + signed_at -> approved_at = signed_at:', approvedWithSigned.length)
  console.log('approved + no signed_at -> approved_at = NULL:', approvedNoSigned.length)
  console.log('not approved -> approved_at = NULL, approved_by = NULL:', notApproved.length)

  if (DRY_RUN) {
    console.log('\n(dry run — no writes)')
    return
  }

  // not approved: clear both
  for (let i = 0; i < notApproved.length; i += 150) {
    await supabase
      .from('grant_agreements')
      .update({ approved_at: null, approved_by: null })
      .in('project_id', notApproved.slice(i, i + 150))
      .throwOnError()
  }
  // approved but unsigned: clear date only
  for (let i = 0; i < approvedNoSigned.length; i += 150) {
    await supabase
      .from('grant_agreements')
      .update({ approved_at: null })
      .in('project_id', approvedNoSigned.slice(i, i + 150))
      .throwOnError()
  }
  // approved + signed: set approved_at = signed_at (per row, distinct values)
  let done = 0
  for (const r of approvedWithSigned) {
    await supabase
      .from('grant_agreements')
      .update({ approved_at: r.signed_at })
      .eq('project_id', r.project_id)
      .throwOnError()
    if (++done % 100 === 0) console.log(`  set approved_at for ${done}/${approvedWithSigned.length}`)
  }
  console.log('done.')
}

main().then(() => process.exit(0))
