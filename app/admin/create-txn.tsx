'use client'
import { Button } from '@/components/button'
import { AmountInput, Input } from '@/components/input'
import { Row } from '@/components/layout/row'
import { useState } from 'react'
import { useSupabase } from '@/db/supabase-provider'
import { SupabaseClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export function CreateTxn() {
  const [fromUsername, setFromUsername] = useState('')
  const [toUsername, setToUsername] = useState('')
  const [amount, setAmount] = useState<number>()
  const [projectSlug, setProjectSlug] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { supabase } = useSupabase()
  return (
    <Row className="justify-between">
      <Input
        value={fromUsername}
        onChange={(event) => setFromUsername(event.target.value)}
        placeholder="From username"
      />
      <Input
        value={toUsername}
        onChange={(event) => setToUsername(event.target.value)}
        placeholder="To username"
      />
      <AmountInput
        amount={amount}
        onChangeAmount={setAmount}
        placeholder="amount (USD)"
      />
      <Input
        value={projectSlug}
        onChange={(event) => setProjectSlug(event.target.value)}
        placeholder="Project slug"
      />
      <Button
        disabled={!fromUsername || !toUsername || !amount}
        loading={isSubmitting}
        onClick={async () => {
          setIsSubmitting(true)
          const [fromId, toId, projectId] = await Promise.all([
            getProfileIdFromUsername(supabase, fromUsername),
            getProfileIdFromUsername(supabase, toUsername),
            getProjectIdFromUsername(supabase, projectSlug),
          ])
          const res = await fetch('/api/transfer-money', {
            method: 'POST',
            body: JSON.stringify({
              fromId,
              toId,
              amount,
              projectId,
            }),
          })
          console.log(await res.json())
          router.refresh()
          setIsSubmitting(false)
        }}
      >
        Create txn
      </Button>
    </Row>
  )
}

async function getProfileIdFromUsername(
  supabase: SupabaseClient,
  username: string
) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()
  if (error) {
    console.error('Getting profile', error)
  } else {
    return data.id
  }
}

async function getProjectIdFromUsername(
  supabase: SupabaseClient,
  slug: string
) {
  const { data, error } = await supabase
    .from('projects')
    .select('id')
    .eq('slug', slug)
    .single()
  if (error) {
    console.error('Getting project', error)
  } else {
    return data.id
  }
}
