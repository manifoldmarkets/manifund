-- Close a pre-existing hole: any authenticated user could write any grant agreement.
--
-- The live policies on grant_agreements (verified against prod pg_policies on
-- 2026-07-25) are:
--   SELECT TO public        USING (true)         -- intended, the doc is public
--   INSERT TO authenticated WITH CHECK (true)    -- hole
--   UPDATE TO authenticated USING (true)         -- hole
--
-- The write policies are unscoped, so any signed-in user could insert or
-- overwrite the grant agreement row of any project -- including signed_at,
-- recipient_name and approved_at. Harmless-ish while the table held only a
-- snapshot; not harmless once it carries signing state and signatory identity,
-- where it amounts to forgeable signatures.
--
-- Every legitimate write already goes through the service role:
--   pages/api/sign-grant-agreement.ts        (switched to createAdminClient in this change)
--   pages/api/sign-grant-agreement-external.ts (new, admin client, token-authed)
--   pages/api/save-agreement-recipient.ts    (new, admin client)
--   pages/api/backfill-grant-agreements.ts   (createAdminClient)
--   pages/api/fix-unupdated-agreements.ts    (createAdminClient)
--   scripts/backfill-approved-at.ts          (SUPABASE_SERVICE_ROLE_KEY)
--   execute_grant_verdict()                  (SECURITY INVOKER, but called via
--                                             createAdminClient in issue-grant-verdict.ts)
-- so dropping the policies needs no replacement: the service role bypasses RLS.
--
-- !! DEPLOY ORDER !!
-- Apply this AFTER the application code ships. sign-grant-agreement.ts writes
-- with the caller's cookie-authed client today; if this lands first, signing
-- breaks for every user until the deploy catches up. The companion additive
-- migration (20260725000000) has no such constraint and can go early.

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.grant_agreements;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.grant_agreements;

-- SELECT stays public: the agreement page is world-viewable by design, and
-- everything on this table is document-visible. Sensitive fields live in
-- grant_agreement_private.
