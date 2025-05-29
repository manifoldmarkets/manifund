'use client'

import { useState, useTransition } from 'react'
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  resetPassword,
  AuthResult,
} from '@/lib/auth-actions'

interface AuthError {
  error: string
  errorCode?: string
  errorDescription?: string
}

interface AuthModalProps {
  isOpen: boolean
  onClose?: () => void
  authError?: AuthError
}

type AuthMode = 'signin' | 'signup' | 'forgot-password'

export default function AuthModal({
  isOpen,
  onClose,
  authError,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<AuthResult | null>(null)

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      setMessage(null)

      try {
        let result
        if (mode === 'signin') {
          result = await signInWithEmail(formData)
        } else if (mode === 'signup') {
          result = await signUpWithEmail(formData)
        } else {
          result = await resetPassword(formData)
        }

        if (result) {
          setMessage(result)
        } else if (mode === 'signin') {
          onClose?.()
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'An unexpected error occurred' })
      }
    })
  }

  const handleGoogleSignIn = () => {
    startTransition(async () => {
      const result = await signInWithGoogle()
      if (result) {
        setMessage(result)
      }
    })
  }

  if (!isOpen) return null

  const googleButton = (
    <button
      onClick={handleGoogleSignIn}
      disabled={isPending}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 px-4 py-2.5 font-medium transition hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Continue with Google
    </button>
  )

  const emailPwLoginForm = (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Email address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
          placeholder="Enter your email"
        />
      </div>

      {mode !== 'forgot-password' && (
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
            placeholder="Enter your password"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-orange-600 px-4 py-2.5 font-medium text-white transition hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? 'Loading...'
          : mode === 'signin'
          ? 'Sign in'
          : mode === 'signup'
          ? 'Create account'
          : 'Send reset link'}
      </button>
    </form>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'signin'
              ? 'Welcome back'
              : mode === 'signup'
              ? 'Create account'
              : 'Reset password'}
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-xl text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>

        {message && (
          <div
            className={`mb-4 rounded-lg p-4 ${
              message.type === 'error'
                ? 'border border-red-200 bg-red-50 text-red-700'
                : 'border border-green-200 bg-green-50 text-green-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {authError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="mb-2 font-medium">
              {authError.error === 'access_denied' &&
              authError.errorCode === 'otp_expired'
                ? 'Email Link Expired'
                : 'Authentication Error'}
            </div>
            <div className="mb-3 text-sm">
              {authError.errorDescription ||
                (authError.error === 'access_denied' &&
                authError.errorCode === 'otp_expired'
                  ? 'The email link you clicked has expired. Please request a new password reset email.'
                  : `Error: ${authError.error}`)}
            </div>
            <button
              type="button"
              onClick={() => setMode('forgot-password')}
              className="text-sm font-medium text-orange-600 underline hover:text-orange-700"
            >
              Request new password reset email
            </button>
          </div>
        )}

        {mode !== 'forgot-password' && (
          <>
            {googleButton}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>
          </>
        )}
        {emailPwLoginForm}

        <div className="mt-6 space-y-2 text-center">
          {mode === 'signin' ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setMode('forgot-password')}
                className="text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                Forgot your password?
              </button>
              <div className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="font-medium text-orange-600 hover:text-orange-700"
                >
                  Sign up
                </button>
              </div>
            </div>
          ) : mode === 'signup' ? (
            <div className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-medium text-orange-600 hover:text-orange-700"
              >
                Sign in
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
