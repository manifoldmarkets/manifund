'use client'

import AuthModal from '@/components/auth/AuthModal'

export default function LoginPage({
  searchParams,
}: {
  searchParams: {
    error?: string
    error_code?: string
    error_description?: string
    email?: string
  }
}) {
  const authError = searchParams.error
    ? {
        error: searchParams.error,
        errorCode: searchParams.error_code,
        errorDescription: searchParams.error_description,
      }
    : undefined

  const recommendedEmail = searchParams.email || undefined

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <AuthModal
        isOpen={true}
        authError={authError}
        recommendedEmail={recommendedEmail}
      />
    </div>
  )
}
