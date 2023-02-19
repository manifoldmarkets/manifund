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
    <div className="bg-dark-200 max-w-md">
      <a className="bg-rose-200 p-5" href={href}>
        confirmation link
      </a>
    </div>
  )
}
