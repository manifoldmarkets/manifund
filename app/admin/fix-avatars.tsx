'use client'
import { Button } from '@/components/button'
import { createAdminClient } from '@/pages/api/_db'
import { SupabaseClient } from '@supabase/supabase-js'

export function FixAvatars() {
  const supabaseAdmin = createAdminClient()
  return (
    <Button
      onClick={async () => {
        await setAvatarUrls(
          supabaseAdmin,
          await getCurrentAvatars(supabaseAdmin)
        )
      }}
      disabled
    >
      Fix Avatars
    </Button>
  )
}

async function getCurrentAvatars(supabase: SupabaseClient) {
  const { data, error } = await supabase.storage.from('avatars').list()
  if (error) {
    throw error
  }
  console.log(data)
  return data.map((file) => file.name)
}

async function setAvatarUrls(supabase: SupabaseClient, userIds: string[]) {
  userIds.forEach(async (userId) => {
    await setAvatarUrl(supabase, userId)
    console.log('set avatar for', userId)
  })
}

async function setAvatarUrl(supabase: SupabaseClient, userId: string) {
  console.log('in setAvatarUrl for', userId)
  const { error } = await supabase
    .from('profiles')
    .update({
      avatar_url: `https://fkousziwzbnkdkldjper.supabase.co/storage/v1/object/public/avatars/${userId}/avatar`,
    })
    .eq('id', userId)
  if (error) {
    console.error('saveText', error)
  }
}
