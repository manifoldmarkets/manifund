'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSupabase } from '@/db/supabase-provider'

export default function PasswordResetPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { supabase } = useSupabase()
  const [status, setStatus] = useState('processing')

  useEffect(() => {
    const next = searchParams?.get('next') || '/edit-profile'

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStatus('success')

        // Small delay to ensure session is fully established
        setTimeout(() => {
          router.push(next)
        }, 500)
      } else if (event === 'SIGNED_IN' && session) {
        setStatus('success')

        setTimeout(() => {
          router.push(next)
        }, 500)
      } else if (event === 'SIGNED_OUT') {
        setStatus('error')
        router.push('/login?error=auth_session_lost')
      }
    })

    // Also check current session immediately
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (session && !error) {
        setStatus('success')
        setTimeout(() => {
          router.push(next)
        }, 500)
      } else if (error) {
        setStatus('error')
        router.push('/login?error=session_error')
      }
    }

    void checkSession()

    // Set a timeout in case no auth events come
    const timeoutId = setTimeout(() => {
      setStatus((currentStatus) => {
        if (currentStatus === 'processing') {
          router.push('/login?error=auth_timeout')
          return 'error'
        }
        return currentStatus
      })
    }, 10000) // 10 second timeout

    // Cleanup function
    return () => {
      subscription.unsubscribe()
      clearTimeout(timeoutId)
    }
  }, [searchParams, supabase, router])

  const getStatusMessage = () => {
    switch (status) {
      case 'processing':
        return 'Processing password reset...'
      case 'success':
        return 'Password reset successful! Redirecting...'
      case 'error':
        return 'Password reset failed. Redirecting to login...'
      default:
        return 'Processing...'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="flex h-[70vh] w-full items-center justify-center">
      <div className="text-center">
        <div className="relative mx-auto mb-4 flex h-20 w-20 animate-spin flex-col items-center justify-center rounded-full bg-orange-200">
          <div className="absolute right-0 top-0 h-10 w-10 rounded-tr-full bg-orange-500" />
          <div className="z-10 h-16 w-16 rounded-full bg-gray-50" />
        </div>
        <p className={getStatusColor()}>{getStatusMessage()}</p>
      </div>
    </div>
  )
}
