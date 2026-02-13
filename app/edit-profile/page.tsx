import { createServerSupabaseClient } from '@/db/supabase-server'
import { getUser, getProfileById } from '@/db/profile'
import { EditProfileForm } from './edit-profile-form'
import AuthModal from '@/components/auth/AuthModal'
import { redirect } from 'next/navigation'
import { SUPABASE_URL, SUPABASE_ENV } from '@/db/env'
import { ProfileHeader } from '../[usernameSlug]/profile-header'

export const revalidate = 60

export default async function Page(props: {
  searchParams: Promise<{
    code?: string
    recovery?: string
    redirectTo?: string
    error?: string
    error_code?: string
    error_description?: string
  }>
}) {
  const searchParams = await props.searchParams
  // some redirect error, likely from password reset
  if (searchParams.error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <AuthModal
          isOpen={true}
          authError={{
            error: searchParams.error,
            errorCode: searchParams.error_code,
            errorDescription: searchParams.error_description,
          }}
        />
      </div>
    )
  }

  // successful password reset redirect
  if (searchParams.recovery === 'true') {
    const params = new URLSearchParams()
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })

    params.set('next', '/edit-profile/reset-password')
    redirect(`/password-reset?${params.toString()}`)
  }

  const supabase = await createServerSupabaseClient()
  const user = await getUser(supabase)

  // normal case but user isn't logged in
  if (!user) {
    return <AuthModal isOpen={true} />
  }

  const profile = await getProfileById(supabase, user?.id)

  // this shouldn't really happen
  if (!profile) {
    return <div>No profile found.</div>
  }

  return (
    <div className="flex flex-col gap-8 p-3 sm:p-5">
      <ProfileHeader profile={profile} isOwnProfile={true} email={user.email} />
      <EditProfileForm profile={profile} />
    </div>
  )
}
