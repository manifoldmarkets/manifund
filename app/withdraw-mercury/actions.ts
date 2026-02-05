'use server'

import { createServerSupabaseClient } from '@/db/supabase-server'
import { revalidatePath } from 'next/cache'

export type BankAccountInfo = {
  accountNumber: string
  routingNumber: string
  accountType: 'checking' | 'savings'
  bankName: string
}

export type CreateRecipientResult =
  | { success: true; recipientId: string }
  | { success: false; error: string }

export async function createMercuryRecipient(
  userId: string,
  bankInfo: BankAccountInfo
): Promise<CreateRecipientResult> {
  const supabase = await createServerSupabaseClient()

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, mercury_recipient_id')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    return { success: false, error: 'Profile not found' }
  }

  if (profile.mercury_recipient_id) {
    return { success: false, error: 'Mercury recipient already exists for this user' }
  }

  const apiKey = process.env.MERCURY_API_KEY
  if (!apiKey) {
    return { success: false, error: 'Mercury API key not configured' }
  }

  try {
    const response = await fetch('https://api.mercury.com/api/v1/recipients', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: profile.full_name,
        electronicRoutingInfo: {
          accountNumber: bankInfo.accountNumber,
          routingNumber: bankInfo.routingNumber,
          bankAccountType: bankInfo.accountType,
          electronicAccountType: 'businessChecking',
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Mercury API error:', errorData)
      return { success: false, error: `Mercury API error: ${response.status}` }
    }

    const data = await response.json()
    const recipientId = data.id

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ mercury_recipient_id: recipientId })
      .eq('id', userId)

    if (updateError) {
      console.error('Failed to update profile with recipient ID:', updateError)
      return { success: false, error: 'Failed to save recipient ID' }
    }

    revalidatePath('/withdraw-mercury')
    return { success: true, recipientId }
  } catch (error) {
    console.error('Error creating Mercury recipient:', error)
    return { success: false, error: 'Failed to create Mercury recipient' }
  }
}

export async function getMercuryRecipient(userId: string) {
  const supabase = await createServerSupabaseClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('mercury_recipient_id')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    return null
  }

  if (!profile.mercury_recipient_id) {
    return null
  }

  const apiKey = process.env.MERCURY_API_KEY
  if (!apiKey) {
    return null
  }

  try {
    const response = await fetch(
      `https://api.mercury.com/api/v1/recipients/${profile.mercury_recipient_id}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return {
      id: data.id,
      name: data.name,
      accountLastFour: data.electronicRoutingInfo?.accountNumber?.slice(-4),
      bankAccountType: data.electronicRoutingInfo?.bankAccountType,
    }
  } catch (error) {
    console.error('Error fetching Mercury recipient:', error)
    return null
  }
}