'use client'

import { useState } from 'react'
import { useSupabase } from '@/db/supabase-provider'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Col } from '@/components/layout/col'

interface UpdatePasswordFormProps {
  onSuccess?: () => void
  stayOpen?: boolean
  title?: string
}

export function UpdatePasswordForm({
  onSuccess,
  stayOpen = false,
  title,
}: UpdatePasswordFormProps) {
  const { supabase } = useSupabase()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(stayOpen)

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }

    setPasswordSubmitting(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        setPasswordError(error.message)
      } else {
        setPassword('')
        setConfirmPassword('')
        setShowPasswordForm(false)
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (error) {
      setPasswordError('An unexpected error occurred')
    } finally {
      setPasswordSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 p-6 shadow-sm transition-all duration-200 hover:shadow-md">
      {title && (
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
            <svg
              className="h-5 w-5 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        </div>
      )}

      {!showPasswordForm ? (
        <div className="text-center">
          <Button
            type="button"
            onClick={() => setShowPasswordForm(true)}
            className="group relative overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            <span className="relative flex items-center gap-2">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              {title || 'Update Password'}
            </span>
          </Button>
        </div>
      ) : (
        <form onSubmit={handlePasswordReset} className="space-y-6">
          <div className="space-y-4">
            <Col className="gap-2">
              <label
                htmlFor="current-password"
                className="text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <div className="relative">
                <Input
                  id="current-password"
                  name="current-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pl-10 transition-all duration-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
            </Col>

            <Col className="gap-2">
              <label
                htmlFor="confirm-current-password"
                className="text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  id="confirm-current-password"
                  name="confirm-current-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="pl-10 transition-all duration-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </Col>
          </div>

          {passwordError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <svg
                className="h-4 w-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {passwordError}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={passwordSubmitting}
              loading={passwordSubmitting}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 font-medium text-white shadow-lg transition-all duration-200 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              {passwordSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4"
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
                  Update Password
                </span>
              )}
            </Button>
            {!stayOpen && (
              <Button
                type="button"
                color="gray-outline"
                onClick={() => {
                  setShowPasswordForm(false)
                  setPassword('')
                  setConfirmPassword('')
                  setPasswordError('')
                }}
                className="border-gray-300 bg-white text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
