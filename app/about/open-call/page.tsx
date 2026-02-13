import Image from 'next/image'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/db/supabase-server'
import { listCauses } from '@/db/cause'

export default async function OpenCallPage() {
  const supabase = await createServerSupabaseClient()
  const causesList = await listCauses(supabase)
  const nonPrizeCauses = causesList.filter((cause) => cause.open && !cause.prize)
  return (
    <div className="p-5">
      <div className="prose mx-auto font-light">
        <h1>Funding Your Project on Manifund</h1>
        <p>
          Anyone can create a public proposal on Manifund for grant funding. If you&apos;d like to
          apply, follow these steps:
        </p>
        <h2>1. Start a new project</h2>
        <p>
          Create an proposal <Link href="/create">here</Link>.
        </p>
        <p>Most grants on Manifund are related to one of the following causes:</p>
        <ul>
          {nonPrizeCauses.map((cause) => (
            <li key={cause.title}>{cause.title}</li>
          ))}
        </ul>
        <p>
          However, you&apos;re welcome to submit an application for any public-benefit project, as
          long as it meets legal requirements about what we can fund as a 501(c)(3).
        </p>
        <h2>2. Complete the proposal form</h2>
        <p>
          Write up a description of your project and set parameters around the amount of funding
          you&apos;re trying to raise and the deadline for raising it. For examples and inspiration,
          you can browse the projects on the Manifund <Link href="/">homepage</Link>.
        </p>
        <h2>3. Sign the grant agreement</h2>
        <p>
          This is the legal paperwork stipulating the terms of any grant funding you receive. It can
          be found on your project&apos;s page once you publish your proposal.
        </p>
        <h2>4. Receive funding</h2>
        <p>
          If donors collectively offer your project the minimum funding amount you specify before
          the deadline, then you&apos;ll receive payment through Manifund to start your project!
        </p>
        <div>
          <Image
            src="/ManifundProcessHorizontal.png"
            alt="Manifund funding process diagram"
            className="mx-auto hidden sm:block"
            height={1000}
            width={1000}
          />
          <Image
            src="/ManifundProcessVertical.png"
            alt="Manifund funding process diagram"
            className="mx-auto sm:hidden"
            height={1000}
            width={1000}
          />
        </div>
      </div>
    </div>
  )
}
