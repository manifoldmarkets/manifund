'use client'
import { use } from 'react'

import AuthModal from '@/components/auth/AuthModal'
import { safeNext } from '@/utils/safe-next'

export default function LoginPage(props: {
  searchParams: Promise<{
    error?: string
    error_code?: string
    error_description?: string
    email?: string
    next?: string
  }>
}) {
  const searchParams = use(props.searchParams)
  const authError = searchParams.error
    ? {
        error: searchParams.error,
        errorCode: searchParams.error_code,
        errorDescription: searchParams.error_description,
      }
    : undefined

  const recommendedEmail = searchParams.email || undefined
  // /sso sends people here to sign in and then resume the handoff to Trace.
  const next = safeNext(searchParams.next)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <AuthModal
        isOpen={true}
        authError={authError}
        recommendedEmail={recommendedEmail}
        next={next}
      />
    </div>
  )
}
