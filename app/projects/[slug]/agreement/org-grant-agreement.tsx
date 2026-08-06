'use client'
import { type Project } from '@/db/project'
import { type OrgAgreementValues, type RecipientEntityClass } from '@/db/grant_agreement'
import { Col } from '@/components/layout/col'
import { format } from 'date-fns'
import React from 'react'

// The grant agreement used when the Recipient is an organization rather than an
// individual — including the case where the Recipient is a fiscal sponsor
// signing for a project run by someone else.
//
// Deliberately a separate document from grant-agreement.tsx rather than a set of
// conditionals inside it, so the two can be versioned independently
// (CURRENT_ORG_AGREEMENT_VERSION vs CURRENT_AGREEMENT_VERSION) and so no edit
// here can change how an already-signed individual agreement renders.
//
// !! This text has NOT had a legal review. See docs/org-grant-agreements-plan.md.

function Section(props: { number: number | string; title: string; children: React.ReactNode }) {
  const { number, title, children } = props
  return (
    <>
      <tr className="font-bold">
        <td className="pr-10 pt-6">{number}</td>
        <td className="pt-6">{title}</td>
      </tr>
      <tr>
        <td />
        <td className="flex flex-col gap-2">{children}</td>
      </tr>
    </>
  )
}

const ENTITY_DESCRIPTIONS: Record<RecipientEntityClass, string> = {
  us_501c3: 'a registered 501(c)(3) nonprofit',
  us_nonprofit_other: 'a US nonprofit organization',
  us_for_profit: 'a US for-profit entity',
  foreign_org: 'a non-US organization',
}

function entityDescription(entityClass: RecipientEntityClass | null) {
  return entityClass ? ENTITY_DESCRIPTIONS[entityClass] : 'an organization'
}

export function OrgGrantAgreement(props: {
  project: Project
  values: OrgAgreementValues
  excludeLobbyingClause: boolean
}) {
  const { project, values, excludeLobbyingClause } = props
  const ein = values.recipientTaxId

  // Numbered dynamically because the last recital only appears while the grant
  // is still undecided.
  const background: React.ReactNode[] = [
    <p key="charity">
      Manifold for Charity, 1621 E 6th Street Unit 1440, Austin, TX 78702, United States, a
      registered 501(c)3-nonprofit with EIN 88-3668801 (the “Charity”).
    </p>,
    <p key="recipient">
      {values.recipientName || '[Recipient legal name]'}
      {values.recipientAddress ? `, ${values.recipientAddress}` : ''}
      {values.recipientCountry ? `, ${values.recipientCountry}` : ''},{' '}
      {entityDescription(values.recipientEntityClass)}
      {ein ? ` with EIN ${ein}` : ''} (the “Recipient”).
    </p>,
  ]
  background.push(
    <p key="purpose">
      Based on the information provided to Manifold for Charity, this grant is to be used
      exclusively for the following purposes in accordance with the terms and conditions of this
      letter, unless otherwise approved in advance [in writing] by Manifold for Charity: &quot;
      {project.title}&quot; (the “Project”).
    </p>,
    <p key="dates">
      The start date for this grant will be {format(new Date(project.created_at), 'MMMM do, yyyy')}{' '}
      (the “Commencement Date”) and will run for the duration (the “Grant Period”) until the Project
      is marked as complete (the “Expiry Date”).
    </p>
  )
  if (project.approved === null) {
    background.push(
      <p key="undecided">
        The Charity has not yet decided to give this grant. Rather, it has been recommended to the
        Charity to give this grant. After the signing of this agreement, the Charity will review the
        grant application and may decide not to send funds to the Recipient if the Project is not in
        line with the Charity’s mission.
      </p>
    )
  }

  return (
    <table className="text-gray-900">
      <tbody>
        <tr className="font-bold">
          <td className="pr-10">1</td>
          <td>Background</td>
        </tr>
        <tr>
          <td />
          <td className="flex flex-col gap-2">
            {background.map((clause, i) => (
              <NumberedClause key={i} number={`1.${i + 1}`}>
                {clause}
              </NumberedClause>
            ))}
          </td>
        </tr>

        <Section number={2} title="Purpose and Use of Grant">
          <p>
            2.1 The Grant is conditional on the satisfactory use of the money and on compliance with
            the terms of this Agreement.
          </p>
          <p>
            2.2 The Recipient shall not make any substantive change to the Project without the
            Charity’s prior written agreement.
          </p>
          <p>
            2.3 Should any part of the Grant remain unspent at the end of the Grant Period, the
            Recipient shall ensure that the unspent money is returned to the Charity.
          </p>
        </Section>

        <Section number={3} title="Prohibited Uses">
          <p>3.1 The Recipient shall not use the Grant:</p>
          <Col className="gap-2 pl-5">
            <p>
              (a) Otherwise than to undertake activities in furtherance of a religious, charitable,
              scientific, literary, educational, or other purpose specified in Section 170(c)(2)(B)
              of the Internal Revenue Code (“IRC”).
            </p>
            {!excludeLobbyingClause && (
              <p>
                (b) To attempt to influence legislation, within the meaning of Section 501(c)(3) of
                the IRC.
              </p>
            )}
            <p>
              ({excludeLobbyingClause ? 'b' : 'c'}) To participate or intervene in any political
              campaign on behalf of or in opposition to any candidate for public office, to induce
              or encourage violations of law or public policy, to cause any private inurement or
              improper private benefit to occur, or to take any other action inconsistent with
              Section 501(c)(3) of the IRC.
            </p>
          </Col>
        </Section>

        <Section number={4} title="Monitoring and Reporting">
          <p>
            4.1 The Recipient is responsible for ensuring that the purposes for which the Grant is
            given are being met throughout the Grant Period and that the terms of this letter are
            being adhered to.
          </p>
          <p>
            4.2 Upon the Charity’s request, the Recipient shall share a progress report every 6
            months from the Commencement Date and shall share a final report upon the Expiry Date.
            If applicable, the Recipient shall receive instructions for submitting the report before
            it is due.
          </p>
          <p>
            4.3 The Recipient shall maintain records adequate to show that the Grant has been used
            solely for the purposes set out in Section 1, and shall make those records available to
            the Charity on reasonable request.
          </p>
        </Section>

        <Section number={5} title="Payment, Withholding, and Recovery of the Grant">
          <p>
            5.1 The Charity may at its discretion withhold or suspend payment of the Grant and/or
            require repayment of all or part of the Grant and/or terminate this Agreement if:
          </p>
          <Col className="gap-2 pl-5">
            <p>
              (a) the Recipient uses any of the Grant for purposes other than those for which they
              have been awarded.
            </p>
            <p>
              (b) all activities associated with the Project are not run in accordance with all
              statutory or other regulatory requirements in the country where the Recipient is
              established and in the country where the Project takes place, and in a manner
              consistent with the good name and reputation of the Charity.
            </p>
            <p>
              (c) the Charity reasonably considers that the Recipient has not made satisfactory
              progress with the delivery of the Project, in which case any repayment shall be no
              greater than the unspent balance of the grant.
            </p>
            <p>
              (d) the Recipient provides the Charity with any materially misleading or inaccurate
              information.
            </p>
            {/* Deliberately "work on the Project ceases" rather than "the
                Recipient ceases to work on the Project": the Recipient may be
                fiscally sponsoring whoever does the work, and this clause has
                to hold either way. */}
            <p>(e) work on the Project ceases for any reason.</p>
            <p>
              (f) the Recipient fails to comply with any of the terms and conditions of this
              Agreement.
            </p>
          </Col>
          <p>
            5.2 The Recipient agrees and acknowledges that the Grant is expressed as a maximum sum
            and is not a guaranteed payment. It shall be paid only to the extent that the Charity
            has available funds. The Charity does all it can to keep fees low and foreign exchange
            rates fair, however, due to the nature of these fees, the amount the Recipient receives
            may be reduced by bank transfer fees and, for international transfers, also by forex
            fees.
          </p>
          <p>
            5.3 The Recipient shall promptly repay to the Charity any money incorrectly paid to it
            either as a result of an administrative error or otherwise. This includes (without
            limitation) situations where either an incorrect sum of money has been paid or where
            Grant money has been paid in error before all conditions attaching to the Grant have
            been complied with by the Recipient.
          </p>
          <p>
            5.4 If the Charity exercises its right to terminate pursuant to Section 5.1, then
            without prejudice to any other rights and remedies of the Charity, the Recipient shall,
            at the Charity’s sole discretion, return any remaining part of the Grant to the Charity,
            or any money that has not been used in accordance with Section 2 of this Agreement.
          </p>
          <p>
            5.5 The Charity will make the payment using the standard payment routes, but the onus is
            on the Recipient to help the Charity complete the payment if those routes fail, for
            example, by providing alternative bank accounts or payment methods, subject to the
            Charity&apos;s acceptance.
          </p>
        </Section>

        <Section number={6} title="Authority and Application of the Grant">
          <p>
            6.1 The individual signing this Agreement on behalf of the Recipient warrants that they
            are duly authorized to enter into this Agreement and to bind the Recipient to its terms.
          </p>
          <p>
            6.2 The Recipient shall promptly notify the Charity of any change to the individuals
            authorized to act on its behalf in respect of the Grant.
          </p>
          {/* Unconditional, rather than a fiscal-sponsor-only clause: it is the
              provision that protects the Charity's 501(c)(3) position wherever
              the funds go next, and it holds whether the Recipient does the
              work itself or applies the Grant through someone else. */}
          <p>
            6.3 The Recipient warrants that it will apply the Grant exclusively to the Project, and
            that it retains full discretion and control over the use of the Grant, consistent with
            the Charity’s obligations under Section 501(c)(3) of the IRC.
          </p>
          <p>
            6.4 Where the Recipient applies the Grant to the Project through another person or
            organization, the Recipient remains responsible to the Charity for the obligations in
            this Agreement, and shall promptly notify the Charity if that arrangement terminates or
            materially changes during the Grant Period.
          </p>
        </Section>

        <Section number={7} title="Limitation of Liability">
          <p>
            The Charity accepts no liability for any consequences, whether direct or indirect, that
            may come about from the Recipient running the Project, the use of the Grant or from
            withdrawal of the Grant. The Recipient shall indemnify and hold harmless the Charity,
            its employees, agents, officers or subcontractors with respect to all claims, demands,
            actions, costs, expenses, losses, damages and all other liabilities arising from or
            incurred by reason of the Recipient’s actions and/or omissions in relation to the
            Project, the non-fulfilment of the Recipient’s obligations under this letter or the
            Recipient’s obligations to third parties. Subject to the foregoing, the Charity’s
            liability under this letter is limited to the payment of the Grant.
          </p>
        </Section>

        <Section number={8} title="Taxes">
          <p>
            The Recipient is responsible for determining the tax treatment of the Grant in its own
            jurisdiction and for paying when due all taxes, duties and other governmental charges
            that may apply to it. The Grant shall not be increased in the event that any tax becomes
            payable on the Grant money. The Recipient shall provide the Charity with any tax
            documentation the Charity reasonably requires in order to make the payment and to meet
            its own reporting obligations, including an IRS Form W-9 or the applicable IRS Form W-8.
          </p>
        </Section>

        <Section number={9} title="Federal tax law compliance">
          <p>
            Recipient acknowledges that it understands its obligations imposed by this Agreement,
            including but not limited to those obligations imposed by reference to the IRC.
            Recipient agrees that if Recipient has any doubts about its obligations under this
            Agreement, including those incorporated by reference to the IRC, Recipient will promptly
            contact Charity or its own legal counsel.
          </p>
        </Section>

        <Section number={10} title="No employment">
          <p>
            The making of this Grant does not represent or imply any kind of employment relationship
            between the Recipient, any of the Recipient’s personnel, or anyone working on the
            Project, and the Charity.
          </p>
        </Section>

        <Section number={11} title="Publications; License">
          <p>
            Any information contained in publications, studies, or research funded by this Grant
            shall be made available to the public following such reasonable requirements or
            procedures as Charity may establish from time to time. Promptly after creation of any
            publications, studies, or research funded by this Grant, Recipient agrees to grant to
            Charity an irrevocable, worldwide, nonexclusive, fully-paid up license to publish, in
            Charity’s discretion, such intellectual property, and to execute promptly any documents
            and instruments that the Charity may reasonably request in order to effect such license,
            without further consideration.
          </p>
        </Section>

        <Section number={12} title="No Agency">
          <p>
            Recipient is solely responsible for all activities supported by the Grant funds, the
            content of any product created with the Grant funds, and the manner in which any such
            product may be disseminated. This Agreement shall not create any agency relationship,
            partnership, or joint venture between the parties, and Recipient shall make no such
            representation to anyone. For the avoidance of doubt, the Recipient acts in its own name
            and on its own behalf in applying the Grant to the Project, and not as an agent of the
            Charity.
          </p>
        </Section>

        <Section number={13} title="Terrorist Activity">
          <p>
            Recipient warrants that it does not support or conduct, directly or indirectly, violence
            or terrorist activity of any kind.
          </p>
        </Section>

        <Section number={14} title="Variations">
          <p>
            No variation of this Agreement shall be effective unless it is in writing and signed by
            or on behalf of each party.
          </p>
        </Section>

        <Section number={15} title="Entire agreement">
          <p>
            This Agreement is the entire agreement between the parties, and replaces all previous
            agreements and understandings between them, relating to its subject matter.
          </p>
        </Section>

        <Section number={16} title="Governing Law">
          <p>
            This Agreement shall be governed by the laws of the State of California applicable to
            contracts to be performed entirely within the State.
          </p>
        </Section>
      </tbody>
    </table>
  )
}

// Section 1's clauses are numbered at render time, since the "not yet decided"
// recital drops out once the grant is approved.
function NumberedClause(props: { number: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span>{props.number}</span>
      <div>{props.children}</div>
    </div>
  )
}
