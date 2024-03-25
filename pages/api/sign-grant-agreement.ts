import { getProjectAndProfileById, ProjectAndProfile } from '@/db/project'
import { NextRequest, NextResponse } from 'next/server'
import { createEdgeClient } from './_db'
import { maybeActivateProject } from '@/utils/activate-project'
import { sendTemplateEmail, TEMPLATE_IDS } from '@/utils/email'
import { format } from 'date-fns'

export const config = {
  runtime: 'edge',
  regions: ['sfo1'],
  // From https://github.com/lodash/lodash/issues/5525
  unstable_allowDynamic: [
    '**/node_modules/lodash/_root.js', // Use a glob to allow anything in the function-bind 3rd party module
  ],
}

const CURRENT_AGREEMENT_VERSION = 3

export default async function handler(req: NextRequest) {
  const { projectId } = await req.json()
  const supabase = createEdgeClient(req)
  const project = await getProjectAndProfileById(supabase, projectId)
  const resp = await supabase.auth.getUser()
  const user = resp.data.user
  if (!project || user?.id !== project.creator) {
    return Response.error()
  }
  await supabase
    .from('projects')
    .update({ signed_agreement: true })
    .eq('id', projectId)
    .throwOnError()
  await supabase
    .from('grant_agreements')
    .upsert(
      {
        project_id: projectId,
        signed_at: new Date().toISOString(),
        recipient_name: project.profiles.full_name,
        project_description: project.description,
        project_title: project.title,
        lobbying_clause_excluded: project.lobbying,
        version: CURRENT_AGREEMENT_VERSION,
      },
      { onConflict: 'project_id' }
    )
    .select()
    .throwOnError()
  await maybeActivateProject(supabase, projectId)
  await sendTemplateEmail(
    TEMPLATE_IDS.GENERIC_NOTIF_HTML,
    {
      subject: 'Your Manifund grant agreement',
      htmlContent: genGrantAgreementHtml(project),
      buttonUrl: `manifund.org/projects/${project.slug}`,
      buttonText: 'View your project',
    },
    user.id
  )
  return NextResponse.json({ success: true })
}

function genGrantAgreementHtml(project: ProjectAndProfile) {
  return `<p>Dear ${project.profiles.full_name},</p>
  <p>Thank you for signing your grant agreement. Below is a copy of the agreement for your records.</p>
  <hr style="border-top: 3px solid #bbb" />
  <table>
  <tbody>
    <tr>
      <td>1</td>
      <td>Background</td>
    </tr>
    <tr>
      <td />
      <td>
        <p>
          1.1 Manifold for Charity, 1621 E 6th Street Unit 1440, Austin,
          TX 78702, United States, a registered 501(c)3-nonprofit with EIN
          88-3668801 (the “Charity”).
        </p>
        <p>1.2 ${project.profiles.full_name} (the “Recipient”)</p>
        <p>
          1.3 Based on the information provided to Manifold for Charity,
          this grant is to be used exclusively for the following purposes
          in accordance with the terms and conditions of this letter,
          unless otherwise approved in advance [in writing] by Manifold
          for Charity: &quot;${project.title}&quot; (the “Project”).
        </p>
        <p>
          1.4 The start date for this grant will be 
          ${format(new Date(project.created_at), 'MMMM do, yyyy')} (the
          “Commencement Date”) and will run for the duration (the “Grant
          Period”) until the Recipient marks the Project as complete (the
          “Expiry Date”).
        </p>
        ${
          project.approved === null &&
          '<p>1.5 The Charity has not yet decided to give this grant. Rather, it has been recommended to the Charity to give this grant. After the signing of this agreement, the Charity will review the grant application and may decide not to send funds to the Recipient if the Project is not in line with the Charity’s mission.</p>'
        }
      </td>
    </tr>
    <tr>
      <td>2</td>
      <td>Purpose and Use of Grant</td>
    </tr>
    <tr>
      <td />
      <td>
        <p>
          2.1 The Grant is conditional on the satisfactory use of the
          money and on compliance with the terms of this Agreement.
        </p>
        <p>
          2.2 The Recipient shall not make any substantive change to the
          Project without the Charity’s prior written agreement.
        </p>
        <p>
          2.3 Should any part of the Grant remain unspent at the end of
          the Grant Period, the Recipient shall ensure that the unspent
          money is returned to the Charity.
        </p>
      </td>
    </tr>
    <tr>
      <td>3</td>
      <td>Prohibited Uses</td>
    </tr>
    <tr>
      <td />
      <td>
        <p>3.1 The Recipient shall not use the Grant:</p>
        <div>
          <p>
            (a) Otherwise than for the purposes which fall within the
            charitable purposes of the Recipient, or to undertake an
            activity for any purpose other than a religious, charitable,
            scientific, literary, educational, or other purpose specified
            in Section 170(c)(2)(B) of the Internal Revenue Code ("IRC").
          </p>
          ${
            !project.lobbying
              ? '<p>(b) To attempt to influence legislation, within the meaning of Section 501(c)(3) of the IRC.</p>'
              : ''
          }
          <p>
            (${project.lobbying ? 'b' : 'c'}) To participate or intervene
            in any political campaign on behalf of or in opposition to any
            candidate for public office, to induce or encourage violations
            of law or public policy, to cause any private inurement or
            improper private benefit to occur, or to take any other action
            inconsistent with Section 501(c)(3) of the IRC.
          </p>
        <div>
      </td>
    </tr>
    <tr>
      <td>4</td>
      <td>Monitoring and Reporting</td>
    </tr>
    <tr>
      <td />
      <td>
        <p>
          4.1 The Recipient is responsible for ensuring that the purposes
          for which the Grant is given are being met throughout the Grant
          Period and that the terms of this letter are being adhered to.
        </p>
        <p>
          4.2 Upon the Charity’s request, the Recipient shall share a
          progress report every 6 months from the Commencement Date and
          shall share a final report upon the Expiry Date. If applicable,
          the Recipient shall receive instructions for submitting the
          report before it is due.
        </p>
      </td>
    </tr>
    <tr>
      <td>5</td>
      <td>
        Payment, Withholding, and Recovery of the Grant
      </td>
    </tr>
    <tr>
      <td />
      <td>
        <p>
          5.1 The Charity may at its discretion withhold or suspend
          payment of the Grant and/or require repayment of all or part of
          the Grant and/or terminate this Agreement if:
        </p>
        <div>
          <p>
            (a) the Recipient uses any of the Grant for purposes other
            than those for which they have been awarded.
          </p>
          <p>
            (b) all activities associated with the Project are not run in
            accordance with all statutory or other regulatory requirements
            in the country where the Recipient is established and in the
            country where the Project takes place, and in a manner
            consistent with the good name and reputation of the Charity.
          </p>
          <p>
            (c) the Charity reasonably considers that the Recipient has
            not made satisfactory progress with the delivery of the
            Project, in which case any repayment shall be no greater than
            the unspent balance of the grant.
          </p>
          <p>
            (d) the Recipient provides the Charity with any materially
            misleading or inaccurate information.
          </p>
          <p>
            (e) the Recipient ceases to work on the Project for any
            reason.
          </p>
          <p>
            (f) the Recipient fails to comply with any of the terms and
            conditions of this Agreement.
          </p>
        </div>
        <p>
          5.2 The Recipient agrees and acknowledges that the Grant is
          expressed as a maximum sum and is not a guaranteed payment. It
          shall be paid only to the extent that the Charity has available
          funds. The Charity does it all it can to keep fees low and
          foreign exchange rates fair, however, due to the nature of these
          fees, the amount the Recipient receives may be reduced by bank
          transfer fees and, for international transfers, also by forex
          fees.
        </p>
        <p>
          5.3 The Recipient shall promptly repay to the Charity any money
          incorrectly paid to it either as a result of an administrative
          error or otherwise. This includes (without limitation)
          situations where either an incorrect sum of money has been paid
          or where Grant money has been paid in error before all
          conditions attaching to the Grant have been complied with by the
          Recipient.
        </p>
        <p>
          5.4 If the Charity exercises its right to terminate pursuant to
          Section 5.1, then without prejudice to any other rights and
          remedies of the Charity, the Recipient shall, at the Charity’s
          sole discretion, return any remaining part of the Grant to the
          Charity, or any money that has not been used in accordance with
          Section 2 of this Agreement.
        </p>
        <p>
          5.5 The Charity will make the payment using the standard payment
          routes, but the onus is on the Recipient to help the Charity
          complete the payment if those routes fail, for example, by
          providing alternative bank accounts or payment methods, subject
          to the Charity&apos;s acceptance.
        </p>
      </td>
    </tr>
    <tr>
      <td>6</td>
      <td>Limitation of Liability</td>
    </tr>
    <tr>
      <td />
      <td>
        The Charity accepts no liability for any consequences, whether
        direct or indirect, that may come about from the Recipient running
        the Project, the use of the Grant or from withdrawal of the Grant.
        The Recipient shall indemnify and hold harmless the Charity, its
        employees, agents, officers or subcontractors with respect to all
        claims, demands, actions, costs, expenses, losses, damages and all
        other liabilities arising from or incurred by reason of the
        Recipient’s actions and/or omissions in relation to the Project,
        the non-fulfilment of the Recipient’s obligations under this
        letter or the Recipient’s obligations to third parties. Subject to
        the foregoing, the Charity’s liability under this letter is
        limited to the payment of the Grant.
      </td>
    </tr>
    <tr>
      <td>7</td>
      <td>Personal taxes</td>
    </tr>
    <tr>
      <td />
      <td>
        If applicable, the Recipient is responsible to pay when due all
        local taxes, duties, and other governmental fees, taxes or other
        governmental charges that may apply to personal income. The Grant
        shall not be increased in the event of any tax become payable on
        the Grant money. The Grant may be classified as taxable income. It
        is up to the Recipient to check with an accountant or tax
        professional to see whether they need to declare the Grant for tax
        purposes.
      </td>
    </tr>
    <tr>
      <td>8</td>
      <td>Federal tax law compliance</td>
    </tr>
    <tr>
      <td />
      <td>
        Recipient acknowledges that it understands its obligations imposed
        by this Agreement, including but not limited to those obligations
        imposed by reference to the IRC. Recipient agrees that if
        Recipient has any doubts about its obligations under this
        Agreement, including those incorporated by reference to the IRC,
        Recipient will promptly contact Charity or its own legal counsel.
      </td>
    </tr>
    <tr>
      <td>9</td>
      <td >No employment</td>
    </tr>
    <tr>
      <td />
      <td>
        The making of this Grant does not represent or imply any kind of
        employment relationship between the Recipient and the Charity.
      </td>
    </tr>
    <tr>
      <td>10</td>
      <td >Publications; License</td>
    </tr>
    <tr>
      <td />
      <td>
        Any information contained in publications, studies, or research
        funded by this Grant shall be made available to the public
        following such reasonable requirements or procedures as Charity
        may establish from time to time. Promptly after creation of any
        publications, studies, or research funded by this Grant, Recipient
        agrees to grant to Charity an irrevocable, worldwide,
        nonexclusive, fully-paid up license to publish, in Charity’s
        discretion, such intellectual property, and to execute promptly
        any documents and instruments that the Charity may reasonably
        request in order to effect such license, without further
        consideration.
      </td>
    </tr>
    <tr>
      <td>11</td>
      <td >No Agency</td>
    </tr>
    <tr>
      <td />
      <td>
        Recipient is solely responsible for all activities supported by
        the Grant funds, the content of any product created with the Grant
        funds, and the manner in which any such product may be
        disseminated. This Agreement shall not create any agency
        relationship, partnership, or joint venture between the parties,
        and Recipient shall make no such representation to anyone.
      </td>
    </tr>
    <tr>
      <td>12</td>
      <td >Terrorist Activity</td>
    </tr>
    <tr>
      <td />
      <td>
        Recipient warrants that it does not support or conduct, directly
        or indirectly, violence or terrorist activity of any kind.
      </td>
    </tr>
    <tr>
      <td>13</td>
      <td >Variations</td>
    </tr>
    <tr>
      <td />
      <td>
        No variation of this Agreement shall be effective unless it is in
        writing and signed by or on behalf of each party.
      </td>
    </tr>
    <tr>
      <td>14</td>
      <td >Entire agreement</td>
    </tr>
    <tr>
      <td />
      <td>
        This Agreement is the entire agreement between the parties, and
        replaces all previous agreements and understandings between them,
        relating to its subject matter.
      </td>
    </tr>
    <tr>
      <td>15</td>
      <td>Governing Law</td>
    </tr>
    <tr>
      <td />
      <td>
        This Agreement shall be governed by the laws of the State of
        California applicable to contracts to be performed entirely within
        the State.
      </td>
    </tr>
    <tr>
    <td><input type="checkbox" id="signature" checked disabled /></td>
    <td><p>I, ${
      project.profiles.full_name
    }, agree to the terms of this grant as laid out in the above document.</p>
    </tr></td>
  </tbody>
</table>`
}
