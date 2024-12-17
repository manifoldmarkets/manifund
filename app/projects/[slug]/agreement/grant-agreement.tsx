'use client'
import { type ProjectAndProfile } from '@/db/project'
import { type GrantAgreement } from '@/db/grant_agreement'
import { Col } from '@/components/layout/col'
import { format } from 'date-fns'
import React from 'react'
import { CURRENT_AGREEMENT_VERSION } from '@/utils/constants'

export function GrantAgreement(props: {
  project: ProjectAndProfile
  agreement?: GrantAgreement
}) {
  const { project, agreement } = props
  const signed = agreement && !!agreement.signed_at
  const excludeLobbyingClause = signed
    ? agreement.lobbying_clause_excluded
    : project.lobbying
  const version =
    signed && agreement?.version ? agreement.version : CURRENT_AGREEMENT_VERSION
  return (
    <table className="text-gray-900">
      <tbody>
        <tr className="font-bold">
          <td className="pr-10 ">1</td>
          <td>Background</td>
        </tr>
        <tr>
          <td />
          <td className="flex flex-col gap-2">
            <p>
              1.1 Manifold for Charity, 1621 E 6th Street Unit 1440, Austin, TX
              78702, United States, a registered 501(c)3-nonprofit with EIN
              88-3668801 (the “Charity”).
            </p>
            <p>
              1.2{' '}
              {signed ? agreement.recipient_name : project.profiles.full_name}{' '}
              (the “Recipient”)
            </p>
            <p>
              1.3 Based on the information provided to Manifold for Charity,
              this grant is to be used exclusively for the following purposes in
              accordance with the terms and conditions of this letter, unless
              otherwise approved in advance [in writing] by Manifold for
              Charity: &quot;
              {signed ? agreement.project_title : project.title}&quot; (the
              “Project”).
            </p>
            <p>
              1.4 The start date for {version < 3 ? 'your grant' : 'this grant'}{' '}
              will be {format(new Date(project.created_at), 'MMMM do, yyyy')}{' '}
              (the “Commencement Date”) and will run for the duration (the
              “Grant Period”) until the Recipient marks the Project as complete
              (the “Expiry Date”).
            </p>
            {project.approved === null && (
              <p>
                1.5 The Charity has not yet decided to give this grant. Rather,
                it has been recommended to the Charity to give this grant. After
                the signing of this agreement, the Charity will review the grant
                application and may decide not to send funds to the Recipient if
                the Project is not in line with the Charity’s mission.
              </p>
            )}
          </td>
        </tr>
        <tr className="font-bold">
          <td className="pr-10 pt-6">2</td>
          <td className="pt-6 ">Purpose and Use of Grant</td>
        </tr>
        <tr>
          <td />
          <td className="flex flex-col gap-2">
            <p>
              2.1 The Grant is conditional on the satisfactory use of the money
              and on compliance with the terms of this Agreement.
            </p>
            <p>
              2.2 The Recipient shall not make any substantive change to the
              Project without the Charity’s prior written agreement.
            </p>
            <p>
              2.3 Should any part of the Grant remain unspent at the end of the
              Grant Period, the Recipient shall ensure that the unspent money is
              returned to the Charity.
            </p>
          </td>
        </tr>
        <tr className="font-bold">
          <td className="pr-10 pt-6 ">3</td>
          <td className="pt-6 ">Prohibited Uses</td>
        </tr>
        <tr>
          <td />
          <td className="flex flex-col gap-2">
            <p>3.1 The Recipient shall not use the Grant:</p>
            <Col className="gap-2 pl-5">
              <p>
                (a) Otherwise than for the purposes which fall within the
                charitable purposes of the Recipient, or to undertake an
                activity for any purpose other than a religious, charitable,
                scientific, literary, educational, or other purpose specified in
                Section 170(c)(2)(B) of the Internal Revenue Code (“IRC”).
              </p>
              {!excludeLobbyingClause && (
                <p>
                  (b) To attempt to influence legislation, within the meaning of
                  Section 501(c)(3) of the IRC.
                </p>
              )}
              <p>
                ({excludeLobbyingClause ? 'b' : 'c'}) To participate or
                intervene in any political campaign on behalf of or in
                opposition to any candidate for public office, to induce or
                encourage violations of law or public policy, to cause any
                private inurement or improper private benefit to occur, or to
                take any other action inconsistent with Section 501(c)(3) of the
                IRC.
              </p>
            </Col>
          </td>
        </tr>
        <tr className="font-bold">
          <td className="pr-10 pt-6">4</td>
          <td className="pt-6 ">Monitoring and Reporting</td>
        </tr>
        <tr>
          <td />
          <td className="flex flex-col gap-2">
            <p>
              4.1 The Recipient is responsible for ensuring that the purposes
              for which the Grant is given are being met throughout the Grant
              Period and that the terms of this letter are being adhered to.
            </p>
            <p>
              4.2 Upon the Charity’s request, the Recipient shall share a
              progress report every 6 months from the Commencement Date and
              shall share a final report upon the Expiry Date. If applicable,
              the Recipient shall receive instructions for submitting the report
              before it is due.
            </p>
          </td>
        </tr>
        <tr className="font-bold">
          <td className="pr-10 pt-6 ">5</td>
          <td className="pt-6 ">
            Payment, Withholding, and Recovery of the Grant
          </td>
        </tr>
        <tr>
          <td />
          <td className="flex flex-col gap-2">
            <p>
              5.1 The Charity may at its discretion withhold or suspend payment
              of the Grant and/or require repayment of all or part of the Grant
              and/or terminate this Agreement if:
            </p>
            <Col className="gap-2 pl-5">
              <p>
                (a) the Recipient uses any of the Grant for purposes other than
                those for which they have been awarded.
              </p>
              <p>
                (b) all activities associated with the Project are not run in
                accordance with all statutory or other regulatory requirements
                in the country where the Recipient is established and in the
                country where the Project takes place, and in a manner
                consistent with the good name and reputation of the Charity.
              </p>
              <p>
                (c){' '}
                {version === 1
                  ? 'the Charity considers that the Recipient has not made satisfactory progress with the delivery of the Project'
                  : 'the Charity reasonably considers that the Recipient has not made satisfactory progress with the delivery of the Project, in which case any repayment shall be no greater than the unspent balance of the grant.'}
              </p>
              <p>
                (d) the Recipient provides the Charity with any materially
                misleading or inaccurate information.
              </p>
              <p>
                (e) the Recipient ceases to work on the Project for any reason.
              </p>
              <p>
                (f) the Recipient fails to comply with any of the terms and
                conditions of this Agreement.
              </p>
            </Col>
            <p>
              5.2 The Recipient agrees and acknowledges that the Grant is
              expressed as a maximum sum and is not a guaranteed payment. It
              shall be paid only to the extent that the Charity has available
              funds. The Charity does it all it can to keep fees low and foreign
              exchange rates fair, however, due to the nature of these fees, the
              amount the Recipient receives may be reduced by bank transfer fees
              and, for international transfers, also by forex fees.
            </p>
            <p>
              5.3 The Recipient shall promptly repay to the Charity any money
              incorrectly paid to it either as a result of an administrative
              error or otherwise. This includes (without limitation) situations
              where either an incorrect sum of money has been paid or where
              Grant money has been paid in error before all conditions attaching
              to the Grant have been complied with by the Recipient.
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
              providing alternative bank accounts or payment methods, subject to
              the Charity&apos;s acceptance.
            </p>
          </td>
        </tr>
        {version === 1 && (
          <>
            <tr className=" font-bold">
              <td className="pr-10 pt-6 ">6</td>
              <td className="pt-6 ">Communication</td>
            </tr>
            <tr>
              <td />
              <td className="flex flex-col gap-2">
                <p>
                  6.1 The Recipient agrees not to make any press release, media
                  announcement, any other major public relations activity in
                  respect of the Grant or the relationship between the parties
                  without the prior written consent of the Charity, such consent
                  not to be unreasonably withheld.
                </p>
                <p>
                  6.2 The Recipient may make general and non-detailed references
                  to the Charity’s support of the Recipient during the course of
                  the Project.
                </p>
              </td>
            </tr>
          </>
        )}
        <tr className=" font-bold">
          <td className="pr-10 pt-6 ">{version === 1 ? '7' : '6'}</td>
          <td className="pt-6 ">Limitation of Liability</td>
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
            Recipient’s actions and/or omissions in relation to the Project, the
            non-fulfilment of the Recipient’s obligations under this letter or
            the Recipient’s obligations to third parties. Subject to the
            foregoing, the Charity’s liability under this letter is limited to
            the payment of the Grant.
          </td>
        </tr>
        <tr className=" font-bold">
          <td className="pr-10 pt-6 ">{version === 1 ? '8' : '7'}</td>
          <td className="pt-6 ">Personal taxes</td>
        </tr>
        <tr>
          <td />
          <td>
            If applicable, the Recipient is responsible to pay when due all
            local taxes, duties, and other governmental fees, taxes or other
            governmental charges that may apply to personal income. The Grant
            shall not be increased in the event of any tax become payable on the
            Grant money. The Grant may be classified as taxable income. It is up
            to the Recipient to check with an accountant or tax professional to
            see whether they need to declare the Grant for tax purposes.
          </td>
        </tr>
        <tr className=" font-bold">
          <td className="pr-10 pt-6 ">{version === 1 ? '9' : '8'}</td>
          <td className="pt-6 ">Federal tax law compliance</td>
        </tr>
        <tr>
          <td />
          <td>
            Recipient acknowledges that it understands its obligations imposed
            by this Agreement, including but not limited to those obligations
            imposed by reference to the IRC. Recipient agrees that if Recipient
            has any doubts about its obligations under this Agreement, including
            those incorporated by reference to the IRC, Recipient will promptly
            contact Charity or its own legal counsel.{' '}
          </td>
        </tr>
        <tr className=" font-bold">
          <td className="pr-10 pt-6 text-gray-900">
            {version === 1 ? '10' : '9'}
          </td>
          <td className="pt-6 text-gray-900">No employment</td>
        </tr>
        <tr>
          <td />
          <td>
            The making of this Grant does not represent or imply any kind of
            employment relationship between the Recipient and the Charity.
          </td>
        </tr>
        <tr className=" font-bold">
          <td className="pr-10 pt-6 text-gray-900">
            {version === 1 ? '11' : '10'}
          </td>
          <td className="pt-6 text-gray-900">Publications; License</td>
        </tr>
        <tr>
          <td />
          <td>
            Any information contained in publications, studies, or research
            funded by this Grant shall be made available to the public following
            such reasonable requirements or procedures as Charity may establish
            from time to time. Promptly after creation of any publications,
            studies, or research funded by this Grant, Recipient agrees to grant
            to Charity an irrevocable, worldwide, nonexclusive, fully-paid up
            license to publish, in Charity’s discretion, such intellectual
            property, and to execute promptly any documents and instruments that
            the Charity may reasonably request in order to effect such license,
            without further consideration.
          </td>
        </tr>
        <tr className=" font-bold">
          <td className="pr-10 pt-6 text-gray-900">
            {version === 1 ? '12' : '11'}
          </td>
          <td className="pt-6 text-gray-900">No Agency</td>
        </tr>
        <tr>
          <td />
          <td>
            Recipient is solely responsible for all activities supported by the
            Grant funds, the content of any product created with the Grant
            funds, and the manner in which any such product may be disseminated.
            This Agreement shall not create any agency relationship,
            partnership, or joint venture between the parties, and Recipient
            shall make no such representation to anyone.
          </td>
        </tr>
        <tr className="font-bold">
          <td className="pr-10 pt-6 text-gray-900">
            {version === 1 ? '13' : '12'}
          </td>
          <td className="pt-6 text-gray-900">Terrorist Activity</td>
        </tr>
        <tr>
          <td />
          <td>
            Recipient warrants that it does not support or conduct, directly or
            indirectly, violence or terrorist activity of any kind.
          </td>
        </tr>
        <tr className=" font-bold">
          <td className="pr-10 pt-6 text-gray-900">
            {version === 1 ? '14' : '13'}
          </td>
          <td className="pt-6 text-gray-900">Variations</td>
        </tr>
        <tr>
          <td />
          <td>
            No variation of this Agreement shall be effective unless it is in
            writing and signed by or on behalf of each party.{' '}
          </td>
        </tr>
        <tr className=" font-bold">
          <td className="pr-10 pt-6 text-gray-900">
            {version === 1 ? '15' : '14'}
          </td>
          <td className="pt-6 text-gray-900">Entire agreement</td>
        </tr>
        <tr>
          <td />
          <td>
            This Agreement is the entire agreement between the parties, and
            replaces all previous agreements and understandings between them,
            relating to its subject matter.{' '}
          </td>
        </tr>
        <tr className=" font-bold">
          <td className="pr-10 pt-6 ">{version === 1 ? '16' : '15'}</td>
          <td className="pt-6 ">Governing Law</td>
        </tr>
        <tr>
          <td />
          <td>
            This Agreement shall be governed by the laws of the State of
            California applicable to contracts to be performed entirely within
            the State.
          </td>
        </tr>
      </tbody>
    </table>
  )
}
