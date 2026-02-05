'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/layout/card'
import { Col } from '@/components/layout/col'
import { Row } from '@/components/layout/row'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { useSupabase } from '@/db/supabase-provider'
import { createMercuryRecipient, getMercuryRecipient, BankAccountInfo } from './actions'
import { CheckCircleIcon } from '@heroicons/react/20/solid'

export default function WithdrawMercuryPage() {
  const { session } = useSupabase()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [existingRecipient, setExistingRecipient] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const [bankInfo, setBankInfo] = useState<BankAccountInfo>({
    accountNumber: '',
    routingNumber: '',
    accountType: 'checking',
    bankName: '',
  })

  useEffect(() => {
    if (!session?.user?.id) {
      router.push('/login')
      return
    }

    loadExistingRecipient()
  }, [session])

  const loadExistingRecipient = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    try {
      const recipient = await getMercuryRecipient(session.user.id)
      if (recipient) {
        setExistingRecipient(recipient)
      }
    } catch (err) {
      console.error('Error loading recipient:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!session?.user?.id) {
      setError('You must be logged in to continue')
      return
    }

    if (!bankInfo.accountNumber || !bankInfo.routingNumber || !bankInfo.bankName) {
      setError('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const result = await createMercuryRecipient(session.user.id, bankInfo)

      if (result.success) {
        await loadExistingRecipient()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Error creating recipient:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Col className="mx-auto max-w-2xl p-6">
        <Card className="p-8">
          <div className="text-center text-gray-500">Loading...</div>
        </Card>
      </Col>
    )
  }

  if (existingRecipient) {
    return (
      <Col className="mx-auto max-w-2xl p-6">
        <Card className="p-8">
          <Col className="gap-6">
            <div className="text-center">
              <CheckCircleIcon className="mx-auto h-12 w-12 text-emerald-500" />
              <h1 className="mt-4 text-2xl font-bold">Bank Account Connected</h1>
              <p className="mt-2 text-gray-600">
                Your bank account is already connected for withdrawals.
              </p>
            </div>

            <Col className="gap-4 rounded-lg bg-gray-50 p-6">
              <h2 className="font-semibold text-gray-900">Account Information</h2>
              <div className="space-y-2 text-sm">
                <Row className="justify-between">
                  <span className="text-gray-600">Account Name:</span>
                  <span className="font-medium">{existingRecipient.name}</span>
                </Row>
                <Row className="justify-between">
                  <span className="text-gray-600">Account Type:</span>
                  <span className="font-medium capitalize">{existingRecipient.bankAccountType || 'Checking'}</span>
                </Row>
                <Row className="justify-between">
                  <span className="text-gray-600">Account Number:</span>
                  <span className="font-medium">****{existingRecipient.accountLastFour}</span>
                </Row>
              </div>
            </Col>

            <div className="text-center text-sm text-gray-500">
              To update your bank information, please contact support.
            </div>
          </Col>
        </Card>
      </Col>
    )
  }

  return (
    <Col className="mx-auto max-w-2xl p-6">
      <Card className="p-8">
        <form onSubmit={handleSubmit}>
          <Col className="gap-6">
            <div>
              <h1 className="text-2xl font-bold">Connect Your Bank Account</h1>
              <p className="mt-2 text-gray-600">
                Enter your US bank account information to enable withdrawals.
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-rose-50 p-4 text-sm text-rose-800">
                {error}
              </div>
            )}

            <Col className="gap-4">
              <div>
                <label htmlFor="bankName" className="mb-1 block text-sm font-medium text-gray-700">
                  Bank Name *
                </label>
                <Input
                  id="bankName"
                  type="text"
                  placeholder="e.g., Chase Bank"
                  value={bankInfo.bankName}
                  onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                  disabled={submitting}
                  required
                />
              </div>

              <div>
                <label htmlFor="routingNumber" className="mb-1 block text-sm font-medium text-gray-700">
                  Routing Number *
                </label>
                <Input
                  id="routingNumber"
                  type="text"
                  placeholder="9 digits"
                  maxLength={9}
                  pattern="[0-9]{9}"
                  value={bankInfo.routingNumber}
                  onChange={(e) => setBankInfo({ ...bankInfo, routingNumber: e.target.value.replace(/\D/g, '') })}
                  disabled={submitting}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  The 9-digit routing number for your bank
                </p>
              </div>

              <div>
                <label htmlFor="accountNumber" className="mb-1 block text-sm font-medium text-gray-700">
                  Account Number *
                </label>
                <Input
                  id="accountNumber"
                  type="text"
                  placeholder="Your account number"
                  value={bankInfo.accountNumber}
                  onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value.replace(/\D/g, '') })}
                  disabled={submitting}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Account Type *
                </label>
                <Row className="gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="accountType"
                      value="checking"
                      checked={bankInfo.accountType === 'checking'}
                      onChange={(e) => setBankInfo({ ...bankInfo, accountType: e.target.value as 'checking' | 'savings' })}
                      className="mr-2"
                      disabled={submitting}
                    />
                    <span className="text-sm">Checking</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="accountType"
                      value="savings"
                      checked={bankInfo.accountType === 'savings'}
                      onChange={(e) => setBankInfo({ ...bankInfo, accountType: e.target.value as 'checking' | 'savings' })}
                      className="mr-2"
                      disabled={submitting}
                    />
                    <span className="text-sm">Savings</span>
                  </label>
                </Row>
              </div>
            </Col>

            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
              <p className="font-semibold">Important:</p>
              <ul className="mt-1 list-inside list-disc space-y-1">
                <li>Only US bank accounts are currently supported</li>
                <li>Your information is securely transmitted and stored</li>
                <li>Bank verification may take 1-2 business days</li>
              </ul>
            </div>

            <Button
              type="submit"
              size="lg"
              color="orange"
              className="w-full"
              disabled={submitting}
              loading={submitting}
            >
              {submitting ? 'Connecting...' : 'Connect Bank Account'}
            </Button>
          </Col>
        </form>
      </Card>
    </Col>
  )
}