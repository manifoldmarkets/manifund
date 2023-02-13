'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '../../components/supabase-provider'

import type { Database } from '@/utils/database.types'

type Post = Database['public']['Tables']['posts']['Row']

export default function Posts({ serverPosts }: { serverPosts: Post[] }) {
  const [posts, setPosts] = useState(serverPosts)
  const { supabase } = useSupabase()

  useEffect(() => {
    setPosts(serverPosts)
  }, [serverPosts])

  useEffect(() => {
    const channel = supabase
      .channel('*')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => setPosts((posts) => [...posts, payload.new as Post])
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, setPosts, posts])

  return <pre>{JSON.stringify(posts, null, 2)}</pre>
}
