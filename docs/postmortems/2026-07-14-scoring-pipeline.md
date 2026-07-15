# Postmortem: New projects not scored/embedded + creation flow 500s

**Date:** 2026-07-13 → 2026-07-14 · **Author:** Claude (w/ Austin) · **Status:** Resolved, verified in prod

## Impact

- Every project submission on Manifund returned a **500 to the user** after the
  project was silently created (duration: since `revalidateTag` was introduced
  into the creation path; also affected edit, publish, hide, close, and
  reactivate endpoints).
- **No project was ever scored or embedded at submission time.** Slop detection
  ran only via the nightly cron, so AI-generated proposals sat unflagged for up
  to 24h.
- 2026-07-12/13: the nightly cron safety net also failed (OpenRouter credits
  exhausted), making the gap visible — ~535 projects accumulated missing or
  partial scores and ~10 missing embeddings.

## Root causes (three, stacked)

1. **`invalidateProjectsCache()` called `revalidateTag`, an App Router-only
   API, from seven Pages Router endpoints.** It threw `Invariant: static
   generation store missing` on *every* invocation — after the DB writes,
   before the response and the scoring hooks. This was the true reason
   on-create scoring never fired, and it failed at runtime only, so builds
   stayed green.
2. **Credit exhaustion:** OpenRouter ($10) ran dry mid-backfill, 402ing the
   quality judge and all embeddings (the OpenAI key was already quota-dead,
   which is why embeddings routed through OpenRouter). This disabled the cron
   that had been masking bug #1.
3. **Original hook gaps:** `create-project` never called `scoreProject` at
   all, and background work relied on fire-and-forget promises in edge
   functions.

## Resolution

- `invalidateProjectsCache` now try/catches; real revalidation moved to the
  App Router `/api/score-project` route (`413e6d0c`).
- Scoring/embedding moved to a dedicated Node route (`maxDuration: 300`); the
  four creation/edit endpoints await a fast fetch to it (`0f479376`).
- OpenRouter topped up; all projects backfilled (1,265+ complete; 4 known
  judge-refusal partials).
- Verified end-to-end by creating a test project through the production
  endpoint: 200 in 1.4s, scored + embedded within seconds.

## What made this hard to find

- **Two masking layers:** the nightly cron hid the broken hooks for months;
  then a plausible-but-wrong theory (`waitUntil` broken in edge runtime)
  survived one deploy cycle because the 500 upstream made *any* hook change
  look ineffective.
- **Invisible failure:** users got a 500 but the project existed on refresh,
  so nobody reported creation as broken; `vercel logs` is live-tail-only,
  delaying discovery of the Invariant error (found via the dashboard Logs
  page).

## Follow-ups

- [ ] Austin: delete the two `TEST PROJECT` rows (ids `c7c641c3-…`, `60b22476-…`)
- [ ] Consider `CRON_SECRET` to lock down `/api/score-project` and the sync endpoints
- [ ] Billing alerts on OpenRouter (single point of failure for judge + embeddings)
- [ ] Audit other Pages Router routes for App Router-only API imports
- [ ] Consider alerting on 5xx rates for `/api/create-project` (a week of 100% 500s went unnoticed)
