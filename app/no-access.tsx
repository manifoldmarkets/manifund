import { buttonClass } from '@/components/button'
import Link from 'next/link'

export default function NoAccess() {
  return (
    <div className="grid min-h-full place-items-center px-6 py-8 sm:py-12 lg:px-8">
      <div className="py-24 text-center">
        <p className="text-base font-semibold text-orange-500">403</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Access denied
        </h1>
        <p className="mt-6 text-base leading-7 text-gray-600">
          Sorry, you don’t have access to this page. Make sure you’re signed in
          to the correct account.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href="/" className={buttonClass('md', 'orange')}>
            Go back home
          </Link>
        </div>
      </div>
      <p className="text-center text-sm leading-7 text-gray-600">
        If you weren’t expecting this, you can email{' '}
        <a
          className="font-semibold text-orange-600 hover:underline"
          href="mailto:austin@manifund.org"
        >
          austin@manifund.org
        </a>{' '}
        or send us a message on{' '}
        <a
          className="font-semibold text-orange-600 hover:underline"
          href="https://discord.gg/ZGsDMWSA5Q"
        >
          Discord
        </a>{' '}
        for help sorting out the issue.
      </p>
    </div>
  )
}
