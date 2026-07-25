-- Org & fiscal-sponsor grant agreements: let the Recipient be an organization
-- rather than always the individual who created the project.
--
-- See docs/org-grant-agreements-plan.md.
--
-- This migration is purely additive (new nullable/defaulted columns + a new
-- table), so it is safe to apply before the application code ships.
--
-- !! It is also REQUIRED before that code ships. !!
-- sign-grant-agreement.ts writes recipient_type and upserts
-- grant_agreement_private on EVERY signature, including the plain individual
-- path -- so if the code deploys first, all grant signing fails on an unknown
-- column/relation, not just the new org flow.
--
-- The companion migration that tightens grant_agreements write policies has the
-- opposite constraint and must land AFTER the deploy -- see 20260725000001.

-- Public, document-visible fields. grant_agreements is world-readable and the
-- /agreement page is public, so ONLY fields that appear in the rendered
-- document belong here. Anything sensitive goes in grant_agreement_private.
--
-- Note: the existing `recipient_name` column is reused as the Recipient's
-- legal name, and the existing (previously unwritten) `signatory_name` is
-- reused as the signing human's name. No duplicate columns for those.
ALTER TABLE public.grant_agreements
  ADD COLUMN IF NOT EXISTS recipient_type text NOT NULL DEFAULT 'individual',
  ADD COLUMN IF NOT EXISTS recipient_address text,
  ADD COLUMN IF NOT EXISTS recipient_country text,
  ADD COLUMN IF NOT EXISTS recipient_entity_class text,
  -- The EIN is part of the agreement as published: it identifies the
  -- contracting party in section 1.2, and an organization's EIN is not treated
  -- as confidential (nonprofit EINs are on public Form 990 filings).
  ADD COLUMN IF NOT EXISTS recipient_tax_id text,
  ADD COLUMN IF NOT EXISTS foreign_no_tin boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS signatory_authority_attested boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS org_agreement_version int2,
  -- The agreement HTML as rendered at signing time: the signed artifact of
  -- record. Re-rendering from components would let later edits silently change
  -- what a past signer is recorded as having agreed to.
  --
  -- Lives with the rest of the agreement rather than on the private table: it
  -- is the agreement, everything in it is already on this row, and the page
  -- that displays it is public. Revisit only if the document ever comes to
  -- contain something confidential -- an individual recipient's home address,
  -- say -- which today it does not.
  ADD COLUMN IF NOT EXISTS rendered_document text;

-- Text + CHECK rather than Postgres enums: these vocabularies (entity class
-- especially) are likely to grow, and altering an enum in place is painful.
-- The corresponding TS union types live in db/grant_agreement.ts.
ALTER TABLE public.grant_agreements
  DROP CONSTRAINT IF EXISTS grant_agreements_recipient_type_check;
ALTER TABLE public.grant_agreements
  ADD CONSTRAINT grant_agreements_recipient_type_check
  CHECK (recipient_type IN ('individual', 'organization'));

ALTER TABLE public.grant_agreements
  DROP CONSTRAINT IF EXISTS grant_agreements_recipient_entity_class_check;
ALTER TABLE public.grant_agreements
  ADD CONSTRAINT grant_agreements_recipient_entity_class_check
  -- Organizations only: this is only ever set when recipient_type is
  -- 'organization', so there are no individual classifications.
  CHECK (recipient_entity_class IS NULL OR recipient_entity_class IN (
    'us_501c3',
    'us_nonprofit_other',
    'us_for_profit',
    'foreign_org'
  ));

-- Deliberately NOT recorded: whether the Recipient runs the Project itself or
-- fiscally sponsors someone who does. Manifund contracts with the Recipient
-- either way, so the org document is written to be true in both cases -- the
-- discretion-and-control warranty is unconditional and section 5.1(e) turns on
-- work ceasing rather than on the Recipient ceasing to work.

COMMENT ON COLUMN public.grant_agreements.recipient_name IS
  'Legal name of the contracting party. For orgs, the exact registered name (not a DBA).';

-- Sensitive fields. Deliberately a separate table because grant_agreements is
-- world-readable (SELECT TO public USING (true)); signatory emails, signing
-- tokens and the audit trail must never be reachable from the anon key.
--
-- The EIN is NOT here: it identifies the contracting party in the published
-- agreement and isn't treated as confidential.
--
-- RLS is enabled with NO policies, so anon/authenticated get nothing. All
-- access is via the service role (createAdminClient), which bypasses RLS.
CREATE TABLE IF NOT EXISTS public.grant_agreement_private (
  project_id uuid NOT NULL PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,

  -- Signatory contact. This is the address the signing link was sent to, and
  -- therefore the authentication evidence for who signed.
  signatory_email text,

  -- Emailed-signature-link state. Only the sha256 of the token is stored.
  signing_token_hash text,
  token_sent_to text,
  token_sent_at timestamptz,
  token_expires_at timestamptz,

  -- E-signature audit trail (ESIGN / UETA)
  signed_ip text,
  signed_user_agent text,

  -- Tax / reporting diligence, collected out-of-band and flagged here
  w9_received_at timestamptz,
  w8_received_at timestamptz,
  determination_letter_on_file boolean NOT NULL DEFAULT false,
  foreign_withholding_flag boolean NOT NULL DEFAULT false,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.grant_agreement_private ENABLE ROW LEVEL SECURITY;

-- Token lookup path for the public signing route.
CREATE UNIQUE INDEX IF NOT EXISTS grant_agreement_private_signing_token_hash_idx
  ON public.grant_agreement_private (signing_token_hash)
  WHERE signing_token_hash IS NOT NULL;

COMMENT ON TABLE public.grant_agreement_private IS
  'Sensitive counterpart to grant_agreements, which is world-readable. '
  'RLS enabled with no policies: service-role access only.';
