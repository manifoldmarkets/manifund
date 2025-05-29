'use client'

import { useState } from 'react'
import { useSupabase } from '@/db/supabase-provider'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Col } from '@/components/layout/col'
import { RequiredStar } from '@/components/tags'

interface PasswordResetSectionProps {
  isRecoveryMode?: boolean
  onPasswordResetSuccess?: () => void
}

export function PasswordResetSection({
  isRecoveryMode = false,
  onPasswordResetSuccess,
}: PasswordResetSectionProps) {
  const { supabase } = useSupabase()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(isRecoveryMode)

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

        if (onPasswordResetSuccess) {
          onPasswordResetSuccess()
        }
      }
    } catch (error) {
      setPasswordError('An unexpected error occurred')
    } finally {
      setPasswordSubmitting(false)
    }
  }

  if (isRecoveryMode && showPasswordForm) {
    // Full-screen recovery mode (when user clicks email link)
    return (
      <Col className="mx-auto max-w-md gap-4 p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handlePasswordReset} className="space-y-4">
          <Col className="gap-1">
            <label htmlFor="new-password">
              New Password
              <RequiredStar />
            </label>
            <Input
              id="new-password"
              name="new-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </Col>

          <Col className="gap-1">
            <label htmlFor="confirm-new-password">
              Confirm New Password
              <RequiredStar />
            </label>
            <Input
              id="confirm-new-password"
              name="confirm-new-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </Col>

          {passwordError && (
            <div className="text-center text-sm text-red-600">
              {passwordError}
            </div>
          )}

          <Button
            type="submit"
            disabled={passwordSubmitting}
            loading={passwordSubmitting}
            className="w-full"
          >
            {passwordSubmitting ? 'Updating...' : 'Update password'}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowPasswordForm(false)}
            className="text-sm text-orange-600 hover:text-orange-500"
          >
            Skip password reset and continue to profile
          </button>
        </div>
      </Col>
    )
  }

  // Regular password section within profile form
  return (
    <Col className="gap-4">
      <div className="border-t pt-4">
        <h3 className="mb-4 text-lg font-medium text-gray-900">
          Change Password
        </h3>

        {!showPasswordForm ? (
          <Button
            type="button"
            onClick={() => setShowPasswordForm(true)}
            className="mb-4"
            color="orange-outline"
          >
            Change Password
          </Button>
        ) : (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <Col className="gap-1">
              <label htmlFor="current-password">
                New Password
                <RequiredStar />
              </label>
              <Input
                id="current-password"
                name="current-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </Col>

            <Col className="gap-1">
              <label htmlFor="confirm-current-password">
                Confirm New Password
                <RequiredStar />
              </label>
              <Input
                id="confirm-current-password"
                name="confirm-current-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </Col>

            {passwordError && (
              <div className="text-sm text-red-600">{passwordError}</div>
            )}

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={passwordSubmitting}
                loading={passwordSubmitting}
              >
                {passwordSubmitting ? 'Updating...' : 'Update Password'}
              </Button>
              <Button
                type="button"
                color="gray-outline"
                onClick={() => {
                  setShowPasswordForm(false)
                  setPassword('')
                  setConfirmPassword('')
                  setPasswordError('')
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </Col>
  )
}
