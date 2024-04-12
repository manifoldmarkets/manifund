import { ProfileCard } from '@/components/profile-card'
import { getRegranters, Profile } from '@/db/profile'
import { createServerClient } from '@/db/supabase-server'
import { getSponsoredAmount } from '@/utils/constants'
import { sortBy } from 'lodash'

export default async function RegrantingPage() {
  const supabase = createServerClient()
  const regrantors = await getRegranters(supabase)
  const sortedRegranters = sortBy(regrantors, [
    function (regranter: Profile) {
      return -getSponsoredAmount(regranter.id)
    },
  ])
  return (
    <div className="mx-auto max-w-3xl p-5">
      <div className="prose mx-auto max-w-none font-light">
        <h1>Regranting</h1>
        <p>
          For our regranting program, we work with donors to delegate a
          grantmaking budget to individuals known as “regrantors”. Regrantors
          independently make grant decisions, based on the goals of the original
          donor, and their own expertise.
        </p>
        {/* <p>
          This model was pioneered by the FTX Future Fund; among the grantmaking
          models they experimented with in 2022, they{' '}
          <a href="https://forum.effectivealtruism.org/posts/paMYXYFYbbjpdjgbt/future-fund-june-2022-update#Expectations_vs__reality">
            considered regranting to be the most promising.
          </a>
        </p> */}
        <h3>Our regrantors</h3>
      </div>
      <div className="mx-auto mb-5 mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {sortedRegranters.map((regranter) => {
          return <ProfileCard key={regranter.id} profile={regranter} />
        })}
      </div>
      <div className="prose mx-auto max-w-none font-light">
        <h3>Why regranting?</h3>
        <ul>
          <li>
            Regranting surfaces opportunities that donors and large grantmaking
            organizations might otherwise miss, as regrantors can tap into their
            personal networks and fields of expertise.
          </li>
          <li>
            The regranting model requires less overhead than traditional
            grantmaking, as one person is responsible for the budget rather than
            a committee. This allows for faster grant turnaround times, solving
            a key pain point for grantees.
          </li>
          <li>
            Certain cause areas like longtermism can be speculative, opaque, and
            nascent, making it harder for donors to know where to direct their
            money. Regranting allows donors to outsource these decisions to
            trustworthy individuals.
          </li>
        </ul>
        <h3>How does regranting on Manifund work?</h3>
        <p>Our website makes the regranting process simple and transparent:</p>
        <ol>
          <li>
            A donor contributes money to Manifold for Charity, a registered
            501c3 nonprofit, when they add money to their Manifund account.
          </li>
          <li>
            The donor can then allocate the money between regrantors of their
            choice (or they can give directly to projects).
          </li>
          <li>
            Regrantors choose which opportunities, including projects posted on
            Manifund through our open call or projects they learn about
            elsewhere, to spend their budgets on, writing up an explanation for
            each grant made.
          </li>
          <li>
            Manifold for Charity reviews the grant to make sure it is
            legitimate, legal, and aligned with our mission.
          </li>
          <li>
            If we approve the grant, the money will be transferred to the
            grantee&apos;s Manifund account, at which point they request to
            withdraw and we send them their funds.
          </li>
        </ol>
        <h3>FAQ</h3>
        <strong>Who can see the information about grants?</strong>
        <br />
        <p>
          Currently all grant information is made public. This includes the
          identity of the regrantor and grant recipient, the project
          description, the grant size, and the regrantor’s writeup.
        </p>
        <p>
          We strongly believe in transparency as it allows for meaningful public
          feedback, accountability of decisions, and establishment of a
          regrantor track records. We recognize that not all grants are suited
          for publishing; for now, we recommend such grants be made through
          other funders, such as the Long Term Future Fund, the Survival and
          Flourishing Fund, or Open Philanthropy.
        </p>
        <strong>What kinds of projects are eligible for regranting?</strong>
        <br />
        <p>
          We have no official cause-area restrictions on grants, though most of
          our regrantors are focused on mitigating global catastrophic risk.
        </p>
        <p>
          We support regrants to registered charities and individuals.
          For-profit organizations may also be eligible, pending due diligence.
          As a US-registered 501c3, we do not permit donations to political
          campaigns.
        </p>
        <p>
          We will look over all grants before fulfilling withdrawal requests to
          make sure they meet these requirements. We reserve the right to veto
          grants for any reason, though will strongly defer to regrantors’
          judgement.
        </p>
        <strong>Can regrantors send money to themselves?</strong>
        <br />
        <p>
          Regrantors are allowed to donate to their own projects, though we’ll
          evaluate these projects with more scrutiny before fulfilling
          withdrawal requests.
        </p>
        <strong>How do I become a regrantor?</strong>
        <p>
          Apply{' '}
          <a
            className="font-bold hover:underline"
            href="https://airtable.com/appOfJtzt8yUTBFcD/shrZW7S069EmghCSV"
          >
            here
          </a>
          !
        </p>
      </div>
    </div>
  )
}
