'use server'

import { getUser } from '@/db/profile'
import { createServerSupabaseClient } from '@/db/supabase-server'
import { revalidatePath } from 'next/cache'
import { getTxnAndProjectsByUser } from '@/db/txn'
import { getBidsByUser } from '@/db/bid'
import { calculateCashBalance } from '@/utils/math'

export type ElectronicAccountType =
  | 'businessChecking'
  | 'businessSavings'
  | 'personalChecking'
  | 'personalSavings'

export type BankAccountInfo = {
  accountNumber: string
  routingNumber: string
  electronicAccountType: ElectronicAccountType
  address: {
    address1: string
    address2?: string
    city: string
    region: string
    postalCode: string
    country: string
  }
}

export type CreateRecipientResult =
  | { success: true; recipientId: string }
  | { success: false; error: string }

export async function createMercuryRecipient(
  // userId: string,
  bankInfo: BankAccountInfo
): Promise<CreateRecipientResult> {
  const supabase = await createServerSupabaseClient()
  const user = await getUser(supabase)
  const email = user?.email
  console.log('email', email)
  if (!user || !user.id || !user.email) {
    return { success: false, error: 'User, or id, or email not found' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, mercury_recipient_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { success: false, error: 'Profile not found' }
  }

  if (profile.mercury_recipient_id) {
    return {
      success: false,
      error: 'Mercury recipient already exists for this user',
    }
  }

  const apiKey = process.env.MERCURY_API_KEY
  if (!apiKey) {
    return { success: false, error: 'Mercury API key not configured' }
  }

  try {
    const response = await fetch('https://api.mercury.com/api/v1/recipients', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: profile.full_name,
        // electronicRoutingInfo: {
        //   accountNumber: bankInfo.accountNumber,
        //   routingNumber: bankInfo.routingNumber,
        //   electronicAccountType: bankInfo.electronicAccountType,
        //   address: {
        //     address1: bankInfo.address.address1,
        //     address2: bankInfo.address.address2 || null,
        //     city: bankInfo.address.city,
        //     region: bankInfo.address.region,
        //     postalCode: bankInfo.address.postalCode,
        //     country: bankInfo.address.country,
        //   },
        // },
        electronicRoutingInfo: bankInfo,
        contactEmail: email,
        emails: [email],
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Mercury API error:', errorData)
      return {
        success: false,
        error: `Mercury API error: ${response.status} ${errorData}`,
      }
    }

    const data = await response.json()
    const recipientId = data.id

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ mercury_recipient_id: recipientId })
      .eq('id', user.id)

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
    .select('mercury_recipient_id, accreditation_status')
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
          Authorization: `Bearer ${apiKey}`,
        },
      }
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    // Also calculate the user's withdrawable balance
    const txns = await getTxnAndProjectsByUser(supabase, userId)
    const bids = await getBidsByUser(supabase, userId)
    const withdrawBalance = calculateCashBalance(
      txns,
      bids,
      userId,
      profile.accreditation_status
    )

    return {
      id: data.id,
      name: data.name,
      accountLastFour: data.electronicRoutingInfo?.accountNumber?.slice(-4),
      electronicAccountType: data.electronicRoutingInfo?.electronicAccountType,
      withdrawBalance,
    }
  } catch (error) {
    console.error('Error fetching Mercury recipient:', error)
    return null
  }
}

export type WithdrawResult =
  | { success: true; transactionId: string }
  | { success: false; error: string }

export async function withdrawViaMercury(
  amount: number
): Promise<WithdrawResult> {
  const supabase = await createServerSupabaseClient()
  const user = await getUser(supabase)

  if (!user || !user.id) {
    return { success: false, error: 'User not found' }
  }

  // Get user's Mercury recipient ID and profile info
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('mercury_recipient_id, full_name, accreditation_status')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || !profile.mercury_recipient_id) {
    return {
      success: false,
      error:
        'No Mercury recipient found. Please connect your bank account first.',
    }
  }

  // Get user's balance using the same logic as stripe-connect-withdraw
  const txns = await getTxnAndProjectsByUser(supabase, user.id)
  const bids = await getBidsByUser(supabase, user.id)
  const withdrawBalance = calculateCashBalance(
    txns,
    bids,
    user.id,
    profile.accreditation_status
  )

  if (amount > withdrawBalance) {
    return { success: false, error: `Insufficient balance. Available balance: $${withdrawBalance.toFixed(2)}` }
  }

  const apiKey = process.env.MERCURY_API_KEY
  const accountId = process.env.MERCURY_ACCOUNT_ID

  if (!apiKey || !accountId) {
    return { success: false, error: 'Mercury configuration missing' }
  }

  // Create transaction ID
  const txnId = crypto.randomUUID()

  try {
    // Create transaction record first
    const { error: insertError } = await supabase.from('txns').insert({
      id: txnId,
      from_id: user.id,
      to_id: process.env.NEXT_PUBLIC_PROD_BANK_ID ?? 'bank',
      amount: amount,
      token: 'USD',
      type: 'withdraw',
      project: null,
    })

    if (insertError) {
      console.error('Failed to create transaction:', insertError)
      return { success: false, error: 'Failed to create transaction record' }
    }

    // Send money via Mercury API
    const response = await fetch(
      'https://api.mercury.com/api/v1/account/request-send-money',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: accountId,
          recipientId: profile.mercury_recipient_id,
          amount: amount * 100, // Mercury expects amount in cents
          paymentMethod: 'ach',
          note: `Withdrawal for ${profile.full_name} - ${txnId}`,
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Mercury API error:', errorData)

      // Rollback transaction on error
      await supabase.from('txns').delete().eq('id', txnId)

      return { success: false, error: `Mercury API error: ${response.status}` }
    }

    const data = await response.json()

    // Store Mercury transaction ID
    await supabase
      .from('stripe_txns') // Reusing this table for now, could create mercury_txns later
      .insert({
        session_id: data.id || data.transactionId || 'mercury_' + txnId,
        customer_id: user.id,
        amount: amount,
        txn_id: txnId,
      })

    revalidatePath('/withdraw-mercury')
    return { success: true, transactionId: txnId }
  } catch (error) {
    console.error('Error processing withdrawal:', error)

    // Attempt to rollback transaction
    await supabase.from('txns').delete().eq('id', txnId)

    return { success: false, error: 'Failed to process withdrawal' }
  }
}
