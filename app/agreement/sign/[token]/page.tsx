import { createAdminClient } from '@/db/edge'
import {
  getAgreementBySigningTokenHash,
  getGrantAgreement,
  orgValuesFromAgreement,
} from '@/db/grant_agreement'
import { getProjectAndProfileById } from '@/db/project'
import { hashSigningToken } from '@/utils/signing-token'
import { Col } from '@/components/layout/col'
import { ExternalSignForm } from './external-sign-form'

// Public, unauthenticated signing page. The emailed token is the only
// credential: the signatory here is typically a fiscal sponsor's officer with
// no Manifund account. Deliberately lives outside /projects/[slug] so it needs
// no project context or session.
export const dynamic = 'force-dynamic'

function InvalidLink() {
  return (
    <Col className="mx-auto max-w-2xl gap-3 p-10">
      <h1 className="text-xl font-semibold">This signing link isn&apos;t valid</h1>
      <p className="text-gray-600">
        It may have expired, already been used to sign, or been replaced by a newer link. If you
        already signed, a copy was emailed to you and nothing further is needed. Otherwise, ask
        whoever sent it to you to resend it from their Manifund project page.
      </p>
    </Col>
  )
}

export default async function ExternalSignPage(props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params
  const supabaseAdmin = createAdminClient()
  const priv = await getAgreementBySigningTokenHash(supabaseAdmin, await hashSigningToken(token))
  if (!priv) {
    return <InvalidLink />
  }

  const project = await getProjectAndProfileById(supabaseAdmin, priv.project_id)
  const agreement = await getGrantAgreement(supabaseAdmin, priv.project_id)
  if (!project || !agreement) {
    return <InvalidLink />
  }
  // Signing burns the token, so a signed agreement is normally unreachable from
  // here — this is the belt-and-braces case where the creator signed some other
  // way while this link was outstanding.
  if (agreement.signed_at) {
    return (
      <Col className="mx-auto max-w-2xl gap-3 p-10">
        <h1 className="text-xl font-semibold">This agreement has already been signed</h1>
        <p className="text-gray-600">Nothing further is needed from you.</p>
      </Col>
    )
  }

  return (
    <div className="mx-auto max-w-4xl p-5">
      <h1 className="text-xl font-semibold">Grant Agreement</h1>
      <p className="mb-5 text-sm text-gray-500">
        {project.profiles.full_name} has asked you to sign this grant agreement on behalf of{' '}
        {agreement.recipient_name}. Please check the details below — correct anything that&apos;s
        wrong — and sign at the bottom.
      </p>
      <ExternalSignForm
        token={token}
        project={project}
        initialValues={orgValuesFromAgreement(agreement)}
      />
    </div>
  )
}
