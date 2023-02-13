'use client'
import { useSearchParams } from 'next/navigation'

export default function ConfirmSignup() {
  const confirmation_url = useSearchParams().get('confirmation_url')
  console.log(confirmation_url)
  if (!confirmation_url) return <div>no confirmation url</div>
  return (
    <div className="max-w-md bg-dark-200">
      <a className="p-5 bg-rose-200" href={confirmation_url}>
        confirmation link
      </a>
    </div>
  )
}
