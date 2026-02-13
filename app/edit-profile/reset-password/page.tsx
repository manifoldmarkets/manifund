'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UpdatePasswordForm } from '../update-password-form'
import { Col } from '@/components/layout/col'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSuccess = () => {
    setIsSuccess(true)
    // Redirect to profile page after successful password update
    setTimeout(() => {
      router.push('/edit-profile')
    }, 2000)
  }

  return (
    <div className="mt-10 flex justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
        {isSuccess ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Password Updated Successfully
            </h2>
            <p className="text-gray-600">
              Your password has been updated. Redirecting to your profile...
            </p>
          </div>
        ) : (
          <UpdatePasswordForm onSuccess={handleSuccess} stayOpen={true} title="Reset Password" />
        )}
      </div>
    </div>
  )
}
