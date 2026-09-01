import { renderToStaticMarkup } from 'react-dom/server'
import { GrantAgreement as IndividualGrantAgreement } from '@/app/projects/[slug]/agreement/grant-agreement'
import { OrgGrantAgreement } from '@/app/projects/[slug]/agreement/org-grant-agreement'
import { type GrantAgreement, type OrgAgreementValues } from '@/db/grant_agreement'
import { type ProjectAndProfile } from '@/db/project'
import { escapeHtml } from '@/utils/email'

// Renders the agreement to HTML from the same components the page displays.
//
// This is deliberately not a second hand-written copy of the document: the
// previous genGrantAgreementHtml in sign-grant-agreement.ts was exactly that,
// and had already drifted (it hardcoded v2+ clause numbering and re-derived
// from the project rather than the signed snapshot). One source of truth means
// the archived artifact and the emailed copy can't disagree with what was on
// screen.
//
// The output carries Tailwind class names that won't resolve in an email
// client, so it renders as plain semantic HTML there. That's acceptable for a
// records copy, and far better than a duplicate that silently diverges.

export function renderOrgAgreementHtml(props: {
  project: ProjectAndProfile
  values: OrgAgreementValues
  excludeLobbyingClause: boolean
}) {
  return renderToStaticMarkup(
    <OrgGrantAgreement
      project={props.project}
      values={props.values}
      excludeLobbyingClause={props.excludeLobbyingClause}
    />
  )
}

export function renderIndividualAgreementHtml(props: {
  project: ProjectAndProfile
  agreement?: GrantAgreement
}) {
  return renderToStaticMarkup(
    <IndividualGrantAgreement project={props.project} agreement={props.agreement} />
  )
}

// documentHtml comes from renderToStaticMarkup, so React has already escaped
// its interpolated values; greetingName and attestation are raw user input and
// are escaped here.
export function agreementEmailHtml(props: {
  greetingName: string
  documentHtml: string
  attestation: string
}) {
  return `<p>Dear ${escapeHtml(props.greetingName)},</p>
  <p>Thank you for signing this grant agreement. Below is a copy for your records.</p>
  <hr style="border-top: 3px solid #bbb" />
  ${props.documentHtml}
  <hr style="border-top: 3px solid #bbb" />
  <p>${escapeHtml(props.attestation)}</p>`
}
