import Link from 'next/link'

export const metadata = {
  title: 'Donor FAQ',
  description: 'Frequently asked questions for donors using Manifund.',
}

export default function DonorFaqPage() {
  return (
    <div className="p-5">
      <div className="prose mx-auto font-light">
        <h1>Donor FAQ</h1>
        <h2>What is Manifund?</h2>
        <p>
          Manifund is a 501c3 charity, formally &ldquo;Manifold for Charity Inc.&rdquo;, EIN
          88-3668801. We help a variety of projects find funding, especially projects in EA &amp; AI
          safety. We prioritize transparency, moving funds quickly (&lt;48h if needed), and an
          excellent grantee &amp; donor experience.
        </p>
        <h2>What services does Manifund provide for large donors?</h2>
        <p>Our donors often use Manifund for:</p>
        <ul>
          <li>
            <strong>Fiscal sponsorship</strong>, for non-501c3 entities, including individuals,
            for-profits, and international organizations. This is a lightweight (&rdquo;
            <a href="https://fiscalsponsorship.com/the-models-summary/">Model C</a>&rdquo;)
            sponsorship, where we remit funds after reviewing a project proposal.
          </li>
          <li>
            <strong>Investing 501c3 dollars in aligned for-profit startups</strong>. Any profits
            from an exit are returned to the donor&apos;s account. We prefer this setup for large
            grants made to startups; see{' '}
            <a href="https://manifund.org/projects/operating-capital-for-ai-safety-evaluation-infrastructure">
              this
            </a>{' '}
            and{' '}
            <a href="https://manifund.org/projects/ai-security-startup-accelerator-batch-2">this</a>{' '}
            as examples.
          </li>
          <li>
            <strong>Regranting, and other custom programs</strong> for large donors.
            <ul>
              <li>
                <strong>
                  We&apos;ve run 3 years of{' '}
                  <a href="https://manifund.org/about/regranting">AI safety regranting</a>:
                </strong>{' '}
                experts like Neel Nanda, Ryan Kidd, and Ethan Perez make grants out of a
                discretionary budget provided by a donor.
              </li>
              <li>
                <strong>We&apos;ve run 2 rounds of ACX Grants:</strong> Scott Alexander solicits
                project applications and raises funding, and recommends a set of grants which we
                review and fulfill.
              </li>
            </ul>
          </li>
        </ul>
        <h2>If I want to fund a new project, what is the process?</h2>
        <p>The standard process is:</p>
        <ol>
          <li>
            You and the recipient create Manifund accounts on{' '}
            <Link href="/">https://manifund.org/</Link>
          </li>
          <li>
            The recipient creates a public project proposal on{' '}
            <Link href="/create">https://manifund.org/create</Link>
          </li>
          <li>You deposit money with us. Once the funds arrive, we credit your account.</li>
          <li>
            You make a donation through the site, with a public comment explaining why you&apos;re
            donating, noting any potential conflicts of interest.
          </li>
          <li>
            We review the proposal and your comment, to ensure compliance with our mission as a
            501c3 charity.
          </li>
          <li>Once approved, the recipient withdraws the funds to their bank account.</li>
        </ol>
        <h2>How do I deposit money?</h2>
        <p>
          We can accept transfers from DAFs, or direct donations via wire, ACH, credit card or
          crypto. See{' '}
          <a href="https://www.notion.so/Manifund-Deposit-via-DAF-ACH-wire-or-crypto-02aee92e884a47e49efd4d93242e2080?pvs=21">
            Manifund: Deposit via DAF, ACH/wire, or crypto
          </a>
        </p>
        <h2>What are Manifund&apos;s fees?</h2>
        <p>
          We typically ask donors to cover a 5% ops &amp; fiscal sponsorship fee on donations.
          (Manifund is primarily self-funded, on the basis of this fee.) For example, if you would
          like to donate $100k to a project, please send $105k.
        </p>
        <h2>Do all grants have to be public?</h2>
        <p>
          We have a very strong preference for facilitating public grants; &gt;99% of all grants on
          Manifund are conducted in public. Contact us if you have a specific reason why you or your
          recipient needs privacy; we may ask for a higher ops fee on anonymous grants.
        </p>
        <h2>Does Manifund support grants to 501c4 entities?</h2>
        <p>
          Yes, in certain situations, with the caveat that we are limited in how much funding we can
          direct to c4s, and prioritize orgs we feel are doing exceptional work. Contact us if
          interested.
        </p>
        <h2>How is Manifund related to&hellip;</h2>
        <h3>
          <a href="https://manifold.markets">Manifold</a>?
        </h3>
        <p>
          Manifund was started by Austin in 2022 while working on Manifold, the prediction market
          startup. Austin{' '}
          <a href="https://manifold.markets/Austin/will-i-regret-leaving-manifold">
            left Manifold in April 2024
          </a>
          ; the two orgs are now separate entities, with no shared employees.
        </p>
        <p>
          (We have considered renaming away from &ldquo;Manifund&rdquo; to make this less
          confusing.)
        </p>
        <h3>
          <a href="https://manifest.is">Manifest</a>?
        </h3>
        <p>
          Manifest is an annual festival originally started at Manifold; in some past years,
          it&apos;s been organized with help from Manifund. Manifest is now an independent PBC,
          which Manifund holds equity in.
        </p>
        <h3>
          <a href="https://moxsf.com">Mox</a>?
        </h3>
        <p>
          Mox is a community space in SF, started in early 2025; Mox is formally a subproject of
          Manifund.
        </p>
        <h2>More questions? Contact us!</h2>
        <p>
          Reach out to <a href="mailto:austin@manifund.org">austin@manifund.org</a> with any
          questions you have~
        </p>
      </div>
    </div>
  )
}
