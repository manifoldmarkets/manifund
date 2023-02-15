'use client'
import { useSearchParams } from 'next/navigation'

export default function ConfirmSignup() {
  const params = useSearchParams()
  const confirmation_url = params.get('confirmation_url')
  if (!confirmation_url) return <div>no confirmation url</div>
  const href = `${confirmation_url}&type=signup&redirect_to=${params.get(
    'redirect_to'
  )}`
  return (
    <div className="max-w-md bg-dark-200">
      <a className="p-5 bg-rose-200" href={href}>
        confirmation link
      </a>
    </div>
  )
}
