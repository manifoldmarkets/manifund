'use client'
import { useSearchParams } from 'next/navigation'

export default function ConfirmSignup() {
  const confirmation_url = useSearchParams().get('confirmation_url')
  const type = useSearchParams().get('type')
  const redirect_to = useSearchParams().get('redirect_to')
  console.log(confirmation_url)
  if (!confirmation_url) return <div>no confirmation url</div>
  return (
    <div className="max-w-md bg-dark-200">
      <a
        className="p-5 bg-rose-200"
        href={
          confirmation_url + '&type=' + type + '&redirect_to=' + redirect_to
        }
      >
        confirmation link
      </a>
    </div>
  )
}
